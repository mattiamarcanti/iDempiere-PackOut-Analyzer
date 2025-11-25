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

  const tables = xml.querySelectorAll('[type="table"]');

  tables.forEach(table => {
    const card = document.createElement('div');
    card.className = 'card p-3 mb-4';

    const tagName = table.tagName;
    const uuNode = table.querySelector(tagName + '_UU');
    const elementName = table.querySelector('Name');
    const uu = uuNode ? uuNode.textContent.trim() : '(nessun UU)';

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

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control query-box';
        input.value = query;
        input.readOnly = true;

        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-secondary';
        btn.textContent = 'Copia';
        btn.onclick = () => navigator.clipboard.writeText(query);

        group.appendChild(input);
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
    return `SELECT * FROM ${refKey} WHERE ${refKey}_ID = ${value}`;
  }
  if(refType === 'uuid'){
    return `SELECT * FROM ${refKey} WHERE ${refKey}_UU = '${value}'`;
  }
  return '-- reference non gestito --';
}
