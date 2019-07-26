import { Manager } from '../main.js';
import Helpers from '../lib/helpers.js';

const Preset = {
  save(synthesizer, name) {
    let synthData = {
      name: name || synthesizer.name,
      router: {},
      settings: {
        globals: {}
      },
      oscillators: [],
      filters: []
    };
    for (let route in synthesizer.router.table) {
      synthData.router[route] = synthesizer.router.table[route].node.dest.id || 'main out';
    }
    synthData.settings.globals.volume = synthesizer.masterGain.gain.value;
    synthData.settings.poly = synthesizer.poly;
    synthData.settings.globals.porta = synthesizer.globals.porta;
    synthData.settings.globals.attack = synthesizer.globals.attack;
    synthData.settings.globals.release = synthesizer.globals.release;
    synthesizer.oscillators.forEach((osc, index) => {
      console.log('osc wave: ', osc.type);
      synthData.oscillators[index] = {
        id: osc.id,
        semitoneOffset: osc.semitoneOffset,
        fineDetune: osc.fineDetune,
        volume: osc.volume,
        type: osc.type
      }
    });
    synthesizer.filters.forEach((filt, index) => {
      synthData.filters[index] = {
        id: filt.id,
        type: filt.type,
        frequency: filt.frequency.value,
        gain: filt.gain.value,
        q: filt.Q.value
      }
    });
    console.log('saving ', synthData);
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
      name: synthData.name,
      porta: synthData.settings.globals.porta,
      attack: synthData.settings.globals.attack,
      release: synthData.settings.globals.release,
      poly: synthData.settings.poly
    });

    Manager.synthesizer.oscillators = [];
    synthData.oscillators.forEach(osc => {
      Manager.synthesizer.addOscillator({
        semitoneOffset: osc.semitoneOffset,
        fineDetune: osc.fineDetune,
        volume: osc.volume,
        type: osc.type
      });
    });
    
    Manager.synthesizer.filters = [];
    synthData.filters.forEach(filt => {
      Manager.synthesizer.addFilter({
        type: filt.type,
        frequency: filt.frequency,
        gain: filt.gain,
        Q: filt.Q
      });
    });

    for (let route in synthData.router) {
      let destination;
      if (synthData.router[route] === 'main out') {
        destination = Manager.synthesizer.masterGain;
      } else {
        destination = Manager.synthesizer.router.table[synthData.router[route]].node;
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
      document.getElementsByClassName('polyButton')[0].setAttribute('class', `${synthData.settings.poly ? 'polyButton on' : 'polyButton off'}`);
      const classes = Array.from(child.classList);
      if (Helpers.indexOf(classes, 'slider') >= 0) {
        child.children[1].value = synthData.settings.globals[synthParamControlDict[child.children[1].name]];
        child.children[2].innerText = Number(synthData.settings.globals[synthParamControlDict[child.children[1].name]]).toFixed(3);
      }
    });

    const oscParamControlDict = {
      'Volume': 'volume',
      'Semitone': 'semitoneOffset',
      'Detune': 'fineDetune',
      'Wave': 'type'
    };
    
    synthData.oscillators.forEach(osc => {
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

    synthData.filters.forEach(filt => {
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
