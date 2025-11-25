// Array per memorizzare gli UU delle card
const cardUuArray = [];

async function parseFile(){
  const f = document.getElementById('fileInput').files[0];
  if(!f){ alert('Seleziona un file ZIP'); return; }
  
  try {
    const zipContent = await f.arrayBuffer();
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(zipContent);
    
    // Il nome dello zip senza estensione
    const zipName = f.name.replace(/\.zip$/i, '');
    
    // Cercare il file XML nel percorso: [zipName]/dict/[file.xml]
    const dictPath = `${zipName}/dict/`;
    let xmlFile = null;
    
    // Cercare il file XML nella cartella dict
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
    
    // Controllare errori di parsing
    if (xml.getElementsByTagName('parsererror').length > 0) {
      alert('Errore nel parsing del file XML');
      return;
    }
    
    buildCards(xml);
  } catch (error) {
    alert('Errore nell\'elaborazione del file ZIP: ' + error.message);
    console.error(error);
  }
}

function buildCards(xml){
  const container = document.getElementById('cards');
  container.innerHTML = '';
  cardUuArray.length = 0; // Reset array

  const tables = xml.querySelectorAll('[type="table"]');

  tables.forEach(table => {
    const card = document.createElement('div');
    card.className = 'card p-3 mb-4';

    const tagName = table.tagName;
    const uuNode = table.querySelector(tagName + '_UU');
    const elementName = table.querySelector('Name');
    const uu = uuNode ? uuNode.textContent.trim() : '(nessun UU)';

    // Salvare l'UU nell'array
    if (uu !== '(nessun UU)') {
      cardUuArray.push(uu);
    }

    // Assegnare un ID univoco alla card in base all'UU
    if (uu !== '(nessun UU)') {
      card.id = `card-${uu}`;
    }

    const title = document.createElement('h4');
    title.textContent = tagName;

    if(elementName != null){
      title.textContent += ' ['+elementName.textContent+']';
    }

    const subtitle = document.createElement('div');
    subtitle.className = 'text-muted mb-2';
    subtitle.textContent = uu;

    card.appendChild(title);
    card.appendChild(subtitle);

    const children = Array.from(table.children);

    children.forEach(child => {
      if(child.hasAttribute('reference')){
        const refType = child.getAttribute('reference');
        let refKey = child.getAttribute('reference-key');
        const value = child.textContent.trim();

        if(!value) return;

        if(!refKey){
          refKey = child.tagName.replace(/_ID$|ID$/,'');
        }

        const label = document.createElement('label');
        label.className = 'fw-bold mt-3';
        label.textContent = `${child.tagName}  (reference = ${refType})`;

        const query = buildQuery(refType, refKey, value);

        const group = document.createElement('div');
        group.className = 'input-group mb-2';

        // Creare il display della query con UUID sottolineato
        const queryDisplay = document.createElement('div');
        queryDisplay.className = 'form-control query-box d-flex align-items-center';
        
        if (refType === 'uuid') {
          // Costruire il testo con l'UUID sottolineato usando la query completa (incluso il punto e virgola)
          const isInList = cardUuArray.includes(value);
          const uuidSpan = document.createElement('span');
          uuidSpan.className = isInList ? 'uuid-in-list' : 'uuid-not-in-list';
          uuidSpan.textContent = value;

          if (isInList) {
            uuidSpan.style.cursor = 'pointer';
            uuidSpan.onclick = (e) => {
              e.stopPropagation();
              const targetCard = document.getElementById(`card-${value}`);
              if (targetCard) {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            };
          }

          // Sostituire la parte `'value'` nella query con quote + span + resto (la query contiene ora il `;` finale)
          const pattern = `'${value}'`;
          const idx = query.indexOf(pattern);
          if (idx !== -1) {
            const beforeText = query.slice(0, idx + 1); // include la virgoletta di apertura
            const afterText = query.slice(idx + 1 + value.length); // include la virgoletta di chiusura e eventuale `;`

            queryDisplay.appendChild(document.createTextNode(beforeText));
            queryDisplay.appendChild(uuidSpan);
            queryDisplay.appendChild(document.createTextNode(afterText));
          } else {
            // fallback: se non troviamo la corrispondenza, mostriamo la query intera
            queryDisplay.textContent = query;
          }
        } else {
          queryDisplay.textContent = query;
        }

        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-secondary';
        btn.type = 'button';
        // Icona copia (due quadrati sovrapposti) - mantiene la stessa funzionalità di copia
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><rect x="1" y="1" width="13" height="13" rx="2" ry="2"></rect></svg>';
        btn.setAttribute('aria-label', 'Copia query');
        btn.onclick = () => navigator.clipboard.writeText(query);

        group.appendChild(queryDisplay);
        group.appendChild(btn);

        card.appendChild(label);
        card.appendChild(group);
      }
    });

    container.appendChild(card);
  });
}

function buildQuery(refType, refKey, value){
  if(refType === 'id'){
    return `SELECT * FROM ${refKey} WHERE ${refKey}_ID = ${value};`;
  }
  if(refType === 'uuid'){
    return `SELECT * FROM ${refKey} WHERE ${refKey}_UU = '${value}';`;
  }
  return '-- reference non gestito --';
}
