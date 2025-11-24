function parseFile(){
  const f = document.getElementById('fileInput').files[0];
  if(!f){ alert('Seleziona un file XML'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const xml = new DOMParser().parseFromString(e.target.result, 'application/xml');
    buildCards(xml);
  };
  reader.readAsText(f);
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
    title.textContent = tagName + ' ['+elementName.textContent+']';

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
