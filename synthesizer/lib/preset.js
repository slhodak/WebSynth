import { Manager } from '../main.js';
import Helpers from '../lib/helpers.js';

const Preset = {
  save(synthesizer, name, overwrite) {
    let synthData = {
      overwrite,
      name,
      synthesizer: {
        router: {},
        settings: {
          globals: {}
        },
        oscillators: [],
        filters: []
      }
    };
    for (let route in synthesizer.router.table) {
      synthData.synthesizer.router[route] = synthesizer.router.table[route].node.dest.id || 'main out';
    }
    synthData.synthesizer.settings.poly = synthesizer.poly;
    synthData.synthesizer.settings.globals.porta = synthesizer.globals.porta;
    synthData.synthesizer.settings.globals.attack = synthesizer.globals.attack;
    synthData.synthesizer.settings.globals.release = synthesizer.globals.release;
    synthesizer.oscillators.forEach((osc, index) => {
      synthData.synthesizer.oscillators[index] = {
        id: osc.id,
        semitoneOffset: osc.semitoneOffset,
        fineDetune: osc.fineDetune,
        volume: osc.volume,
        wave: osc.type
      }
    });
    synthesizer.filters.forEach((filt, index) => {
      synthData.synthesizer.filters[index] = {
        id: filt.id,
        type: filt.type,
        frequency: filt.frequency.value,
        gain: filt.gain.value,
        q: filt.Q.value
      }
    });
    return synthData;
  },
  load(synthData) {
    //  warn user that this is going to overwrite all synth settings? annoying?

    //  Remove old Control Views
    const oscillatorsModule = document.getElementsByClassName('oscillatorControls')[0];
    while(oscillatorsModule.children[2]) {
      oscillatorsModule.removeChild(oscillatorsModule.lastChild);
    }
    const filtersModule = document.getElementsByClassName('filterControls')[0];
    while(filtersModule.children[2]) {
      filtersModule.removeChild(filtersModule.lastChild);
    }

    Manager.synthesizer = null;
    Manager.createSynthesizerIfNoneExists({
      porta: 0.01,
      attack: 0.05,
      release: 0.6,
      poly: true
    });

    Manager.synthesizer.oscillators = [];
    synthData.synthesizer.oscillators.forEach(osc => {
      Manager.synthesizer.addOscillator({
        semitoneOffset: osc.semitoneOffset,
        fineDetune: osc.fineDetune,
        volume: osc.volume,
        type: osc.type
      });
    });
    
    Manager.synthesizer.filters = [];
    synthData.synthesizer.filters.forEach(filt => {
      Manager.synthesizer.addFilter({
        type: filt.type,
        frequency: filt.frequency,
        gain: filt.gain,
        Q: filt.Q
      });
    });

    for (let route in synthData.synthesizer.router) {
      let destination;
      if (synthData.synthesizer.router[route] === 'main out') {
        destination = Manager.synthesizer.masterGain;
      } else {
        destination = Manager.synthesizer.router.table[synthData.synthesizer.router[route]].node;
      }

      Manager.synthesizer.router.setRoute(
        Manager.synthesizer.router.table[route].node,
        destination
      );
    }

    // Update new Control Views
    const oscParamControlDict = {
      'Volume': 'volume',
      'Semitone': 'semitoneOffset',
      'Detune': 'fineDetune',
      'Wave': 'wave'
    };
    
    synthData.synthesizer.oscillators.forEach(osc => {
      Array.from(document.getElementById(`${osc.id}`).children).forEach(child => {
        const classes = Array.from(child.classList);
        if (Helpers.indexOf(classes, 'slider') >= 0) {
          child.children[1].value = osc[oscParamControlDict[child.children[1].name]];
          child.children[2].innerText = osc[oscParamControlDict[child.children[1].name]];
        } else if (Helpers.indexOf(classes, 'selector' >= 0)) {
          child.children[1].value = osc[oscParamControlDict[child.children[1].name]];
        }
      });
    });

  }
};

export default Preset;
