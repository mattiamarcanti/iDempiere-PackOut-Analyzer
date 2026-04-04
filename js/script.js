// ── State ──
const cardUuArray = [];
let allCardData = []; // { el, tagName, name, trlNames, uu, hasTranslation }
let allCollapsed = false;
let selectedTypes = new Set(); // empty = all selected

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
});

// Close multiselect when clicking outside
document.addEventListener('click', function(e) {
  const ms = document.getElementById('typeMultiselect');
  if (ms && !ms.contains(e.target)) {
    document.getElementById('multiselect-dropdown').classList.remove('open');
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

  // Second pass: build cards
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

    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'btn-collapse';
    collapseBtn.type = 'button';
    collapseBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
    collapseBtn.setAttribute('aria-label', 'Riduci card');
    collapseBtn.onclick = () => {
      card.classList.toggle('is-collapsed');
    };

    header.appendChild(titleWrap);
    header.appendChild(collapseBtn);
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

  // "Select all / Deselect all" row
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
      // Actually we invert: selectedTypes empty = all shown. To deselect all, we'd hide everything.
      // Better approach: selectedTypes empty = all. Non-empty = only those.
      // "Deselect all" means show nothing — let's just uncheck all.
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
      // Rebuild selectedTypes from checkboxes
      rebuildSelectedTypes();
      // Update "all" checkbox
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

  // If all checked, selectedTypes = empty (means all)
  if (unchecked.length === 0) {
    selectedTypes.clear();
  } else {
    // selectedTypes = set of checked tags (only show these)
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

  // Show/hide search clear button
  document.getElementById('searchClear').style.display = searchVal ? '' : 'none';

  let visible = 0;

  allCardData.forEach(({ el, tagName, name, trlNames, uu }) => {
    let show = true;

    // Search filter: match against Name, translation Names, and UUID
    if (searchVal) {
      const allNames = [name, ...trlNames].join(' ').toLowerCase();
      const haystack = `${allNames} ${uu}`.toLowerCase();
      if (!haystack.includes(searchVal)) show = false;
    }

    // Type filter (multi-select)
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
    // Show expand icon
    btn.title = 'Espandi tutte';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
  } else {
    // Show collapse icon
    btn.title = 'Riduci tutte';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
  }
}
