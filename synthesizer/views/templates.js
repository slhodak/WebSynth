import { Manager } from '../main.js';
import Helpers from '../lib/helpers.js';

const Template = {
  selector(name, title, options, optionTitles) {
    let template = 
      `<div class="selector">
      <label for="${name}">${title}: </label>
      <select class="${name}" name="${title.toLowerCase()}">`;
    for (let i = 0; i < options.length; i++) {
      template += `<option name="${options[i]}" value="${options[i]}">${optionTitles ? optionTitles[i] : options[i]}</option>`;
    }
    template += '</select></div>';
    return template;
  },
  slider(name, title, min, max, value, step) {
    return (
      `<div class="slider row">
        <label for="${name}">${title}: </label>
        <input class="${name}" name="${title.toLowerCase()}" type="range" min="${min}" max="${max}" value="${value}" step="${step}">
        <div class="${name}Display">${value}</div>
      </div>`
    );
  },
  routingTable(table) {
    let sources = '';
    let destinations = '<div class="destinations column">';
    Object.keys(table).map(id => table[id].node).forEach((src, index) => {
      destinations += `<div class="row ${index > 0 ? 'borderTop' : ''}" data-id=${src.id}>`;
      sources += `<div class="routerCell ${index > 0 ? 'borderTop' : ''}">${src.constructor.name} ${src.id % 1000}</div>`;
      let destNodes = Object.keys(Manager.synthesizer.router.table).filter(id => id >= 2000).map(notOscId => Manager.synthesizer.router.table[notOscId].node);
      destNodes.concat(Manager.synthesizer.masterGain).forEach(dest => {
        destinations += `<div class="routerCell destination ${Helpers.getRouteRelationship(src, dest)}" data-id=${dest.id === undefined ? 'mainout' : dest.id}>${dest.constructor.name === 'GainNode' ? 'Main Out' : dest.constructor.name} ${dest.id === undefined ? '' : dest.id % 1000}</div>`;
      });
      destinations += "</div>";
    });
    destinations += "</div>";
    return(`
      <div class="row">
        <div class="sources column">
          ${sources}
        </div>
        ${destinations}
      </div>
    `);
  }
}

export default Template;
