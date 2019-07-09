const Template = {
  selector(id, name, title, options, optionTitles) {
    let template = 
      `<div class="selector">
      <label for="${name}">${title}: </label>
      <select class="${name}" data-id=${id}>`;
    for (let i = 0; i < options.length; i++) {
      template += `<option name="${options[i]}" value="${options[i]}">${optionTitles ? optionTitles[i] : options[i]}</option>`;
    }
    template += '</select></div>';
    return template;
  },
  slider(id, name, title, min, max, value, step) {
    return (
      `<div class="slider">
      <label for="${name}">${title}: </label>
      <input class="${name}" type="range" min="${min}" max="${max}" value="${value}" step="${step}">
      </div>`
    );
  },
  routingTable(table) {
    let sources = '';
    let destinations = '<div class="destinations matrix">';
    Object.keys(table).map(id => table[id].node).forEach(src => {
      destinations += `<div class="row" data-id=${src.id}>`;
      sources += `<div class="routerCell">${src.constructor.name} ${src.id % 1000}</div>`;
      let destNodes = Object.keys(synthesizer.router.table).filter(id => id >= 2000).map(notOscId => synthesizer.router.table[notOscId].node);
      destNodes.concat(synthesizer.masterGain).forEach(dest => {
        destinations += `<div class="routerCell destination ${Helpers.getRouteRelationship(src, dest)}" data-id=${dest.id === undefined ? 'mainout' : dest.id}>${dest.constructor.name === 'GainNode' ? 'Main Out' : dest.constructor.name} ${dest.id === undefined ? '' : dest.id % 1000}</div>`;
      });
      destinations += "</div>";
    });
    destinations += "</div>";
    return(`
      <div class="router module">
      <h3>Router</h3>
        <div class="row">
          <div class="connected icon">Connected</div>
          <div class="eligible icon">Eligible</div>
          <div class="ineligible icon">Ineligible</div>
        </div>
        <div class="routerTable">
          <div class="row">
            <div class="sources column">
              ${sources}
            </div>
            ${destinations}
          </div>
        </div>
      </div>
    `);
  }
}
