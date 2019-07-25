import { Manager } from '../main.js';
import Helpers from '../lib/helpers.js';

const Preset = {
  save(synthesizer, name) {
    let synthData = {
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
    synthData.synthesizer.settings.globals.volume = synthesizer.masterGain.gain.value;
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
        wave: osc.wave
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
      porta: synthData.synthesizer.settings.globals.porta,
      attack: synthData.synthesizer.settings.globals.attack,
      release: synthData.synthesizer.settings.globals.release,
      poly: synthData.synthesizer.settings.poly
    });

    Manager.synthesizer.oscillators = [];
    synthData.synthesizer.oscillators.forEach(osc => {
      Manager.synthesizer.addOscillator({
        semitoneOffset: osc.semitoneOffset,
        fineDetune: osc.fineDetune,
        volume: osc.volume,
        wave: osc.wave
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


    const synthParamControlDict = {
      'Volume': 'volume',
      'Attack': 'attack',
      'Release': 'release',
      'Porta': 'porta'
    };
    
    Array.from(document.getElementsByClassName('globalControls')[0].firstChild.children).forEach(child => {
      //  deal with poly button
      document.getElementsByClassName('polyButton')[0].setAttribute('class', `${synthData.synthesizer.settings.poly ? 'polyButton on' : 'polyButton off'}`);
      const classes = Array.from(child.classList);
      if (Helpers.indexOf(classes, 'slider') >= 0) {
        child.children[1].value = synthData.synthesizer.settings.globals[synthParamControlDict[child.children[1].name]];
        child.children[2].innerText = Number(synthData.synthesizer.settings.globals[synthParamControlDict[child.children[1].name]]).toFixed(3);
      }
    });

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

    const filtParamControlDict = {
      'Frequency': 'frequency',
      'Gain': 'gain',
      'Q': 'q',
      'Filter Type': 'type'
    };

    synthData.synthesizer.filters.forEach(filt => {
      Array.from(document.getElementById(`${filt.id}`).children).forEach(child => {
        const classes = Array.from(child.classList);
        if (Helpers.indexOf(classes, 'slider') >= 0) {
          child.children[1].value = filt[filtParamControlDict[child.children[1].name]];
          child.children[2].innerText = Number(filt[filtParamControlDict[child.children[1].name]]).toFixed(3);
        } else if (Helpers.indexOf(classes, 'selector') >= 0) {
          child.children[1].value = filt[filtParamControlDict[child.children[1].name]];
        }
      });
    });
  }
};

export default Preset;
