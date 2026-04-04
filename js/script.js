// ── State ──
const cardUuArray = [];
let allCardData = []; // { el, tagName, name, trlNames, uu, hasTranslation }
let allCollapsed = false;
let selectedTypes = new Set(); // empty = all selected
let elementFieldsMap = {}; // uu -> { tagName, name, fields: [{key, value, reference, referenceKey}] }

// ── Parent-child hierarchy (known iDempiere relationships) ──
// Keys and values are already normalized (no underscores, lowercase)
const CHILD_TO_PARENT = {
  'adcolumn':        'adtable',
  'adfield':         'adtab',
  'adtab':           'adwindow',
  'adwindow':        'admenu',
  'adreflist':       'adreference',
  'adreferencelist': 'adreference',
  'adprocesspara':   'adprocess',
  'adprocessparam':  'adprocess',
};

function normalizeTag(tag) {
  return tag.replace(/[_\s]/g, '').toLowerCase();
}

// Reverse lookup: normalized tag -> display name
const PARENT_DISPLAY_NAMES = {
  'adtable':     'AD_Table',
  'adtab':       'AD_Tab',
  'adwindow':    'AD_Window',
  'admenu':      'AD_Menu',
  'adreference': 'AD_Reference',
  'adprocess':   'AD_Process',
};

function denormalizeTag(normTag) {
  return PARENT_DISPLAY_NAMES[normTag] || normTag;
}

function guessParentTag(children) {
  if (!children.length) return '?';
  const childNorm = normalizeTag(children[0].tagName);
  const parentNorm = CHILD_TO_PARENT[childNorm];
  return parentNorm ? denormalizeTag(parentNorm) : children[0].tagName;
}

// ── File input ──
document.getElementById('fileInput').addEventListener('change', function() {
  const label = document.querySelector('.upload-label');
  const text = document.getElementById('uploadText');
  const btn = document.getElementById('btnAnalyze');
  if (this.files.length) {
    label.classList.add('has-file');
    text.textContent = this.files[0].name;
    btn.disabled = false;
  } else {
    label.classList.remove('has-file');
    text.textContent = 'Carica file ZIP';
    btn.disabled = true;
  }
  hideBtnDraw();
});

// Close multiselect when clicking outside
document.addEventListener('click', function(e) {
  const ms = document.getElementById('typeMultiselect');
  if (ms && !ms.contains(e.target)) {
    document.getElementById('multiselect-dropdown').classList.remove('open');
  }
});

// Escape key closes overlays
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('detailOverlay').style.display !== 'none') closeDetail();
    else if (document.getElementById('hierarchyOverlay').style.display !== 'none') closeHierarchy();
  }
});

// ── Parse ZIP ──
async function parseFile() {
  const f = document.getElementById('fileInput').files[0];
  if (!f) return;

  const btn = document.getElementById('btnAnalyze');
  btn.disabled = true;
  btn.textContent = 'Analisi...';

  try {
    const zipContent = await f.arrayBuffer();
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(zipContent);

    const zipName = f.name.replace(/\.zip$/i, '');
    const dictPath = `${zipName}/dict/`;
    let xmlFile = null;

    for (let file in loadedZip.files) {
      if (file.startsWith(dictPath) && file.endsWith('.xml')) {
        xmlFile = loadedZip.files[file];
        break;
      }
    }

    if (!xmlFile) {
      alert(`Nessun file XML trovato in ${dictPath}`);
      return;
    }

    const xmlContent = await xmlFile.async('string');
    const xml = new DOMParser().parseFromString(xmlContent, 'application/xml');

    if (xml.getElementsByTagName('parsererror').length > 0) {
      alert('Errore nel parsing del file XML');
      return;
    }

    buildCards(xml);
  } catch (error) {
    alert('Errore nell\'elaborazione del file ZIP: ' + error.message);
    console.error(error);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Analizza';
  }
}

// ── Build cards ──
function buildCards(xml) {
  const container = document.getElementById('cards');
  container.innerHTML = '';
  cardUuArray.length = 0;
  allCardData = [];
  allCollapsed = false;
  selectedTypes = new Set();
  elementFieldsMap = {};

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('toolbar').style.display = '';

  const tables = xml.querySelectorAll('[type="table"]');

  // First pass: collect all UUs
  tables.forEach(table => {
    const tagName = table.tagName;
    const uuNode = table.querySelector(tagName + '_UU');
    const uu = uuNode ? uuNode.textContent.trim() : '';
    if (uu) cardUuArray.push(uu);
  });

  const tagNameSet = new Set();

  // Second pass: build cards and store field data
  tables.forEach((table, i) => {
    const tagName = table.tagName;
    const uuNode = table.querySelector(tagName + '_UU');
    const elementName = table.querySelector('Name');
    const uu = uuNode ? uuNode.textContent.trim() : '';
    const name = elementName ? elementName.textContent.trim() : '';

    tagNameSet.add(tagName);

    // Check for translation sub-tags (*_Trl)
    const children = Array.from(table.children);
    const hasTrl = children.some(child => /_Trl$/i.test(child.tagName));

    // Collect translation Names
    const trlNames = [];
    children.forEach(child => {
      if (/_Trl$/i.test(child.tagName)) {
        const trlNameNode = child.querySelector('Name');
        if (trlNameNode) {
          const trlName = trlNameNode.textContent.trim();
          if (trlName) trlNames.push(trlName);
        }
      }
    });

    // Store all fields for detail view
    const fields = [];
    children.forEach(child => {
      if (/_Trl$/i.test(child.tagName)) return; // skip translation sub-elements
      const value = child.textContent.trim();
      fields.push({
        key: child.tagName,
        value: value,
        reference: child.getAttribute('reference') || '',
        referenceKey: child.getAttribute('reference-key') || '',
      });
    });

    if (uu) {
      elementFieldsMap[uu] = { tagName, name, fields, hasTranslation: hasTrl };
    }

    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${i * 0.03}s`;
    if (uu) card.id = `card-${uu}`;

    // Header
    const header = document.createElement('div');
    header.className = 'card-header-row';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'card-title-wrap';

    const tagEl = document.createElement('span');
    tagEl.className = 'card-tag';
    tagEl.textContent = tagName;
    titleWrap.appendChild(tagEl);

    if (name) {
      const nameEl = document.createElement('span');
      nameEl.className = 'card-name';
      nameEl.textContent = name;
      titleWrap.appendChild(nameEl);
    }

    // Translation badge
    if (hasTrl) {
      const trlBadge = document.createElement('span');
      trlBadge.className = 'badge-translated';
      trlBadge.textContent = 'Tradotto';
      titleWrap.appendChild(trlBadge);
    }

    const uuInline = document.createElement('span');
    uuInline.className = 'card-uu-inline';
    uuInline.textContent = uu || '(nessun UU)';
    titleWrap.appendChild(uuInline);

    // Right side: detail button + collapse button
    const actionsWrap = document.createElement('div');
    actionsWrap.style.cssText = 'display:flex;align-items:center;gap:6px;';

    // Detail button
    if (uu) {
      const detailBtn = document.createElement('button');
      detailBtn.className = 'btn-collapse';
      detailBtn.type = 'button';
      detailBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
      detailBtn.setAttribute('aria-label', 'Dettaglio');
      detailBtn.title = 'Dettaglio';
      detailBtn.onclick = (e) => {
        e.stopPropagation();
        openDetail(uu);
      };
      actionsWrap.appendChild(detailBtn);
    }

    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'btn-collapse';
    collapseBtn.type = 'button';
    collapseBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
    collapseBtn.setAttribute('aria-label', 'Riduci card');
    collapseBtn.onclick = () => {
      card.classList.toggle('is-collapsed');
    };
    actionsWrap.appendChild(collapseBtn);

    header.appendChild(titleWrap);
    header.appendChild(actionsWrap);
    card.appendChild(header);

    // Content
    const content = document.createElement('div');
    content.className = 'card-content';

    const subtitle = document.createElement('div');
    subtitle.className = 'card-uu-subtitle';
    subtitle.textContent = uu || '(nessun UU)';
    content.appendChild(subtitle);

    children.forEach(child => {
      if (!child.hasAttribute('reference')) return;
      const refType = child.getAttribute('reference');
      let refKey = child.getAttribute('reference-key');
      const value = child.textContent.trim();
      if (!value) return;
      if (!refKey) refKey = child.tagName.replace(/_ID$|ID$/, '');

      const query = buildQuery(refType, refKey, value);

      const block = document.createElement('div');
      block.className = 'ref-block';

      // Label
      const label = document.createElement('div');
      label.className = 'ref-label';
      label.textContent = child.tagName;

      const badge = document.createElement('span');
      badge.className = `ref-type-badge badge-${refType}`;
      badge.textContent = refType;
      label.appendChild(badge);

      // Query row
      const row = document.createElement('div');
      row.className = 'query-row';

      const queryBox = document.createElement('div');
      queryBox.className = 'query-box';

      if (refType === 'uuid') {
        const isInList = cardUuArray.includes(value);
        const pattern = `'${value}'`;
        const idx = query.indexOf(pattern);
        if (idx !== -1) {
          const before = query.slice(0, idx + 1);
          const after = query.slice(idx + 1 + value.length);
          const uuidSpan = document.createElement('span');
          uuidSpan.className = isInList ? 'uuid-in-list' : 'uuid-not-in-list';
          uuidSpan.textContent = value;
          if (isInList) {
            uuidSpan.onclick = (e) => {
              e.stopPropagation();
              scrollToCard(value);
            };
          }
          queryBox.appendChild(document.createTextNode(before));
          queryBox.appendChild(uuidSpan);
          queryBox.appendChild(document.createTextNode(after));
        } else {
          queryBox.textContent = query;
        }
      } else {
        queryBox.textContent = query;
      }

      const copyBtn = document.createElement('button');
      copyBtn.className = 'btn-copy';
      copyBtn.type = 'button';
      copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><rect x="1" y="1" width="13" height="13" rx="2" ry="2"/></svg>';
      copyBtn.setAttribute('aria-label', 'Copia query');
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(query);
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><rect x="1" y="1" width="13" height="13" rx="2" ry="2"/></svg>';
        }, 1500);
      };

      row.appendChild(queryBox);
      row.appendChild(copyBtn);

      block.appendChild(label);
      block.appendChild(row);
      content.appendChild(block);
    });

    card.appendChild(content);
    container.appendChild(card);

    allCardData.push({
      el: card,
      tagName,
      name,
      trlNames,
      uu,
      hasTranslation: hasTrl,
    });
  });

  // Populate multi-select type filter
  populateTypeMultiselect(tagNameSet);
  updateResultCount();
  updateToggleAllIcon();

  // Show hierarchy button after successful analysis
  showBtnDraw();
}

function buildQuery(refType, refKey, value) {
  if (refType === 'id') {
    return `SELECT * FROM ${refKey} WHERE ${refKey}_ID = ${value};`;
  }
  if (refType === 'uuid') {
    return `SELECT * FROM ${refKey} WHERE ${refKey}_UU = '${value}';`;
  }
  return '-- Riferimento non gestito --';
}

// ── Scroll to card ──
function scrollToCard(uu) {
  const target = document.getElementById(`card-${uu}`);
  if (!target) return;
  target.classList.remove('is-collapsed');
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target.classList.add('highlight');
  setTimeout(() => target.classList.remove('highlight'), 1500);
}

// ── Multi-select type filter ──
function populateTypeMultiselect(tagNameSet) {
  const dropdown = document.getElementById('multiselect-dropdown');
  dropdown.innerHTML = '';

  const sorted = Array.from(tagNameSet).sort();

  const allRow = document.createElement('label');
  allRow.className = 'multiselect-item multiselect-all';
  const allCb = document.createElement('input');
  allCb.type = 'checkbox';
  allCb.checked = true;
  allCb.onchange = () => {
    const checkboxes = dropdown.querySelectorAll('input[data-tag]');
    if (allCb.checked) {
      selectedTypes.clear();
      checkboxes.forEach(cb => cb.checked = true);
    } else {
      selectedTypes.clear();
      sorted.forEach(t => selectedTypes.add(t));
      checkboxes.forEach(cb => cb.checked = false);
    }
    applyFilters();
    updateMultiselectLabel();
  };
  allRow.appendChild(allCb);
  allRow.appendChild(document.createTextNode(' Tutti'));
  dropdown.appendChild(allRow);

  sorted.forEach(tag => {
    const row = document.createElement('label');
    row.className = 'multiselect-item';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = true;
    cb.dataset.tag = tag;
    cb.onchange = () => {
      rebuildSelectedTypes();
      allCb.checked = selectedTypes.size === 0;
      applyFilters();
      updateMultiselectLabel();
    };
    row.appendChild(cb);
    row.appendChild(document.createTextNode(' ' + tag));
    dropdown.appendChild(row);
  });
}

function rebuildSelectedTypes() {
  const checkboxes = document.querySelectorAll('#multiselect-dropdown input[data-tag]');
  const checked = [];
  const unchecked = [];
  checkboxes.forEach(cb => {
    if (cb.checked) checked.push(cb.dataset.tag);
    else unchecked.push(cb.dataset.tag);
  });

  if (unchecked.length === 0) {
    selectedTypes.clear();
  } else {
    selectedTypes = new Set(checked);
  }
}

function updateMultiselectLabel() {
  const label = document.getElementById('multiselect-label');
  if (selectedTypes.size === 0) {
    label.textContent = 'Tutti i tipi';
  } else if (selectedTypes.size === 1) {
    label.textContent = Array.from(selectedTypes)[0];
  } else {
    label.textContent = `${selectedTypes.size} tipi selezionati`;
  }
}

function toggleMultiselect() {
  document.getElementById('multiselect-dropdown').classList.toggle('open');
}

// ── Filters ──
function applyFilters() {
  const searchVal = document.getElementById('searchInput').value.toLowerCase();
  document.getElementById('searchClear').style.display = searchVal ? '' : 'none';

  let visible = 0;

  allCardData.forEach(({ el, tagName, name, trlNames, uu }) => {
    let show = true;

    if (searchVal) {
      const allNames = [name, ...trlNames].join(' ').toLowerCase();
      const haystack = `${allNames} ${uu}`.toLowerCase();
      if (!haystack.includes(searchVal)) show = false;
    }

    if (show && selectedTypes.size > 0 && !selectedTypes.has(tagName)) {
      show = false;
    }

    el.classList.toggle('hidden-filter', !show);
    if (show) visible++;
  });

  document.getElementById('noResults').style.display = visible === 0 ? '' : 'none';
  document.getElementById('cards').style.display = visible === 0 ? 'none' : '';

  updateResultCount(visible);
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  applyFilters();
}

function updateResultCount(visible) {
  const total = allCardData.length;
  const shown = visible !== undefined ? visible : total;
  const el = document.getElementById('resultCount');
  if (shown === total) {
    el.textContent = `${total} elementi`;
  } else {
    el.textContent = `${shown} di ${total} elementi`;
  }
}

// ── Single toggle all button ──
function toggleAllCardsBtn() {
  allCollapsed = !allCollapsed;
  allCardData.forEach(({ el }) => {
    if (!el.classList.contains('hidden-filter')) {
      el.classList.toggle('is-collapsed', allCollapsed);
    }
  });
  updateToggleAllIcon();
}

function updateToggleAllIcon() {
  const btn = document.getElementById('btnToggleAll');
  if (allCollapsed) {
    btn.title = 'Espandi tutte';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
  } else {
    btn.title = 'Riduci tutte';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
  }
}

// ── Draw button visibility ──
function showBtnDraw() {
  document.getElementById('btnDraw').style.display = '';
}

function hideBtnDraw() {
  document.getElementById('btnDraw').style.display = 'none';
}

// ══════════════════════════════════════════════
// ── Hierarchy View
// ══════════════════════════════════════════════

function showHierarchy() {
  if (allCardData.length === 0) {
    alert('Analizza prima un file ZIP');
    return;
  }

  const overlay = document.getElementById('hierarchyOverlay');
  const body = document.getElementById('hierarchyBody');
  body.innerHTML = '';
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  const elements = []; // all packout elements
  const uuToInfo = {}; // uu -> element info

  // 1. Build UU lookup
  allCardData.forEach(({ tagName, name, uu }) => {
    if (!uu) return;
    uuToInfo[uu] = { tagName, name, uu };
    elements.push({ tagName, name, uu });
  });

  // 2. Build ID lookup: (normalizedParentTag, numericId) -> uu
  //    For each packout element, its own primary key is <TagName>_ID
  const idToUu = {}; // "normalizedTag|idValue" -> uu
  allCardData.forEach(({ tagName, uu }) => {
    if (!uu || !elementFieldsMap[uu]) return;
    const fields = elementFieldsMap[uu].fields;
    const ownIdKey = tagName + '_ID';
    for (const f of fields) {
      // Match <TagName>_ID — accept with or without reference attr (own PK)
      if (f.key === ownIdKey && f.value) {
        idToUu[normalizeTag(tagName) + '|' + f.value] = uu;
        break;
      }
    }
  });

  // 3. For each child element, find its parent via UUID or ID reference
  const childParentMap = {}; // childUu -> parentUu

  allCardData.forEach(({ tagName, uu }) => {
    if (!uu || !elementFieldsMap[uu]) return;
    const normChild = normalizeTag(tagName);
    const expectedParentNorm = CHILD_TO_PARENT[normChild];
    if (!expectedParentNorm) return; // not a known child type

    const fields = elementFieldsMap[uu].fields;

    // A) Try UUID references first
    for (const f of fields) {
      if (f.reference === 'uuid' && f.value) {
        // Direct match: referenced element is in packout and is the expected parent type
        const refInfo = uuToInfo[f.value];
        if (refInfo && normalizeTag(refInfo.tagName) === expectedParentNorm) {
          childParentMap[uu] = f.value;
          return;
        }
        // Field key matches parent type (covers external parents too)
        const fieldKeyNorm = normalizeTag(f.referenceKey || f.key.replace(/_ID$|ID$|_UU$|UU$/, ''));
        if (fieldKeyNorm === expectedParentNorm) {
          childParentMap[uu] = f.value;
          return;
        }
      }
    }

    // B) Fallback: try ID references
    for (const f of fields) {
      if (f.reference === 'id' && f.value) {
        const fieldKeyNorm = normalizeTag(f.referenceKey || f.key.replace(/_ID$|ID$/, ''));
        if (fieldKeyNorm === expectedParentNorm) {
          // Look up in the ID map to find the parent's UU
          const parentUu = idToUu[expectedParentNorm + '|' + f.value];
          if (parentUu) {
            childParentMap[uu] = parentUu;
            return;
          }
          // Parent not in packout — store a synthetic key so we can still group
          // Use a placeholder: "ext-id:<parentType>:<idValue>"
          childParentMap[uu] = `ext-id:${expectedParentNorm}:${f.value}`;
          return;
        }
      }
    }
  });

  // Group children by parentUu
  // parentUu -> [childElements]
  const parentGroups = {};
  const orphans = []; // elements with no parent

  elements.forEach(el => {
    const parentUu = childParentMap[el.uu];
    if (parentUu) {
      if (!parentGroups[parentUu]) parentGroups[parentUu] = [];
      parentGroups[parentUu].push(el);
    } else {
      // Check if this element IS a parent that has children
      // (will be shown as a parent card with its children)
      // Don't add it as orphan if it has children grouped under it
      orphans.push(el);
    }
  });

  // Remove orphans that are parents (they'll show as parent cards)
  const parentUuSet = new Set(Object.keys(parentGroups));
  const trueOrphans = orphans.filter(el => !parentUuSet.has(el.uu));

  // Build sorted list of cards: first parent cards (sorted by parent type), then orphans
  const parentCards = [];

  Object.entries(parentGroups).forEach(([parentKey, children]) => {
    const isExtId = parentKey.startsWith('ext-id:');
    const parentInfo = isExtId ? null : uuToInfo[parentKey];
    let parentTagName, parentName, isInternal, parentUu;

    if (parentInfo) {
      // Parent is in the packout
      parentTagName = parentInfo.tagName;
      parentName = parentInfo.name;
      isInternal = true;
      parentUu = parentKey;
    } else if (isExtId) {
      // External parent resolved by ID: "ext-id:<normTag>:<idValue>"
      const parts = parentKey.split(':');
      const normTag = parts[1];
      const idVal = parts[2];
      // Denormalize tag for display (best effort from CHILD_TO_PARENT values)
      parentTagName = denormalizeTag(normTag);
      parentName = `ID ${idVal} (esterno)`;
      isInternal = false;
      parentUu = null;
    } else {
      // External parent resolved by UUID (not in packout)
      parentTagName = guessParentTag(children);
      parentName = '(esterno)';
      isInternal = false;
      parentUu = parentKey;
    }

    parentCards.push({
      type: 'parent',
      parentUu,
      parentTagName,
      parentName,
      isInternal,
      children: children.sort((a, b) => a.tagName.localeCompare(b.tagName) || a.name.localeCompare(b.name)),
    });
  });

  // Sort parent cards by parent type name
  parentCards.sort((a, b) => a.parentTagName.localeCompare(b.parentTagName) || a.parentName.localeCompare(b.parentName));

  // Render parent cards
  parentCards.forEach(pc => {
    const card = document.createElement('div');
    card.className = 'hier-card';

    // Parent header
    const parentHeader = document.createElement('div');
    parentHeader.className = 'hier-parent-header';

    const parentTag = document.createElement('span');
    parentTag.className = 'hier-parent-tag';
    parentTag.textContent = pc.parentTagName;

    const parentName = document.createElement('span');
    parentName.className = pc.isInternal ? 'hier-parent-name internal' : 'hier-parent-name external';
    parentName.textContent = pc.parentName;

    if (pc.isInternal) {
      parentName.style.cursor = 'pointer';
      parentName.onclick = () => {
        closeHierarchy();
        setTimeout(() => scrollToCard(pc.parentUu), 100);
      };
    }

    const statusDot = document.createElement('span');
    statusDot.className = pc.isInternal ? 'hier-status-dot internal' : 'hier-status-dot external';
    statusDot.title = pc.isInternal ? 'Nel PackOut' : 'Dipendenza esterna';

    parentHeader.appendChild(statusDot);
    parentHeader.appendChild(parentTag);
    parentHeader.appendChild(parentName);

    card.appendChild(parentHeader);

    // Children list
    const childrenList = document.createElement('div');
    childrenList.className = 'hier-children';

    pc.children.forEach(child => {
      const childRow = document.createElement('div');
      childRow.className = 'hier-child-row';

      const childTag = document.createElement('span');
      childTag.className = 'hier-child-tag';
      childTag.textContent = child.tagName;

      const childName = document.createElement('span');
      childName.className = 'hier-child-name';
      childName.textContent = child.name;
      childName.style.cursor = 'pointer';
      childName.onclick = () => {
        closeHierarchy();
        setTimeout(() => scrollToCard(child.uu), 100);
      };

      const detailBtn = document.createElement('button');
      detailBtn.className = 'hier-detail-btn';
      detailBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
      detailBtn.title = 'Dettaglio';
      detailBtn.onclick = (e) => {
        e.stopPropagation();
        openDetail(child.uu);
      };

      childRow.appendChild(childTag);
      childRow.appendChild(childName);
      childRow.appendChild(detailBtn);
      childrenList.appendChild(childRow);
    });

    card.appendChild(childrenList);
    body.appendChild(card);
  });

  // Render orphan cards
  if (trueOrphans.length > 0) {
    trueOrphans.sort((a, b) => a.tagName.localeCompare(b.tagName) || a.name.localeCompare(b.name));

    trueOrphans.forEach(el => {
      const card = document.createElement('div');
      card.className = 'hier-card hier-orphan';

      const header = document.createElement('div');
      header.className = 'hier-parent-header';

      const statusDot = document.createElement('span');
      statusDot.className = 'hier-status-dot internal';
      statusDot.title = 'Nel PackOut';

      const tag = document.createElement('span');
      tag.className = 'hier-parent-tag';
      tag.textContent = el.tagName;

      const name = document.createElement('span');
      name.className = 'hier-parent-name internal';
      name.textContent = el.name;
      name.style.cursor = 'pointer';
      name.onclick = () => {
        closeHierarchy();
        setTimeout(() => scrollToCard(el.uu), 100);
      };

      const detailBtn = document.createElement('button');
      detailBtn.className = 'hier-detail-btn';
      detailBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
      detailBtn.title = 'Dettaglio';
      detailBtn.onclick = (e) => {
        e.stopPropagation();
        openDetail(el.uu);
      };

      header.appendChild(statusDot);
      header.appendChild(tag);
      header.appendChild(name);
      header.appendChild(detailBtn);
      card.appendChild(header);
      body.appendChild(card);
    });
  }
}

function closeHierarchy() {
  document.getElementById('hierarchyOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════════
// ── Detail Overlay
// ══════════════════════════════════════════════

function openDetail(uu) {
  const data = elementFieldsMap[uu];
  if (!data) return;

  const overlay = document.getElementById('detailOverlay');
  const title = document.getElementById('detailTitle');
  const body = document.getElementById('detailBody');

  title.textContent = `${data.tagName}${data.name ? ' — ' + data.name : ''}`;
  body.innerHTML = '';
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Build fields table
  const table = document.createElement('table');
  table.className = 'detail-table';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  ['Campo', 'Valore', 'Riferimento'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  data.fields.forEach(f => {
    const tr = document.createElement('tr');

    // Key
    const tdKey = document.createElement('td');
    tdKey.className = 'detail-key';
    tdKey.textContent = f.key;
    tr.appendChild(tdKey);

    // Value
    const tdVal = document.createElement('td');
    tdVal.className = 'detail-value';
    if (f.reference === 'uuid' && f.value) {
      const isInList = cardUuArray.includes(f.value);
      const span = document.createElement('span');
      span.className = isInList ? 'uuid-in-list' : 'uuid-not-in-list';
      span.textContent = f.value;
      if (isInList) {
        span.onclick = () => {
          closeDetail();
          closeHierarchy();
          setTimeout(() => scrollToCard(f.value), 100);
        };
      }
      tdVal.appendChild(span);
    } else {
      tdVal.textContent = f.value || '—';
    }
    tr.appendChild(tdVal);

    // Reference info
    const tdRef = document.createElement('td');
    tdRef.className = 'detail-ref';
    if (f.reference) {
      const badge = document.createElement('span');
      badge.className = `ref-type-badge badge-${f.reference}`;
      badge.textContent = f.reference;
      tdRef.appendChild(badge);
      if (f.referenceKey) {
        const keySpan = document.createElement('span');
        keySpan.className = 'detail-ref-key';
        keySpan.textContent = f.referenceKey;
        tdRef.appendChild(keySpan);
      }
    }
    tr.appendChild(tdRef);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  body.appendChild(table);
}

function closeDetail() {
  document.getElementById('detailOverlay').style.display = 'none';
  // Only restore overflow if hierarchy is also closed
  if (document.getElementById('hierarchyOverlay').style.display === 'none') {
    document.body.style.overflow = '';
  }
}
