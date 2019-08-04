import { Manager } from '../main.js';
import Helpers from '../lib/helpers.js';
import netConfig from '../config/netConfig.js';
import { FormView } from '../views/views.js';

const Preset = {
  save(synthesizer, name) {
    let synthData = {
      name: name || synthesizer.name,
      router: {},
      globals: {},
      oscillators: [],
      filters: []
    };
    for (let route in synthesizer.router.table) {
      synthData.router[route] = synthesizer.router.table[route].node.dest.id || 'main out';
    }
    synthData.globals.volume = synthesizer.masterGain.gain.value;
    synthData.globals.poly = synthesizer.globals.poly;
    synthData.globals.porta = synthesizer.globals.porta;
    synthData.globals.attack = synthesizer.globals.attack;
    synthData.globals.release = synthesizer.globals.release;
    synthesizer.oscillators.forEach((osc, index) => {
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
    return synthData;
  },
  load(synthesizer) {
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
      name: synthesizer.name,
      poly: synthesizer.globals.poly,
      porta: synthesizer.globals.porta,
      attack: synthesizer.globals.attack,
      release: synthesizer.globals.release,
      type: synthesizer.globals.type,
      mute: synthesizer.globals.mute,
      volume: synthesizer.globals.volume
    });

    Manager.synthesizer.oscillators = [];
    synthesizer.oscillators.forEach(osc => {
      Manager.synthesizer.addOscillator({
        semitoneOffset: osc.semitoneOffset,
        fineDetune: osc.fineDetune,
        volume: osc.volume,
        type: osc.type
      });
    });

    Manager.synthesizer.filters = [];
    synthesizer.filters.forEach(filt => {
      Manager.synthesizer.addFilter({
        type: filt.type,
        frequency: filt.frequency,
        gain: filt.gain,
        Q: filt.Q
      });
    });

    for (let route in synthesizer.router) {
      let destination;
      if (synthesizer.router[route] === 'main out') {
        destination = Manager.synthesizer.masterGain;
      } else {
        destination = Manager.synthesizer.router.table[synthesizer.router[route]].node;
      }
      Manager.synthesizer.router.setRoute(
        Manager.synthesizer.router.table[route].node,
        destination
      );
    }

    const synthParamControlDict = {
      'Volume': 'volume',
      'Attack': 'attack',
      'Release': 'release',
      'Porta': 'porta'
    };
    
    Array.from(document.getElementsByClassName('globalControls')[0].firstChild.children).forEach(child => {
      document.getElementsByClassName('polyButton')[0].setAttribute('class', `${synthesizer.globals.poly ? 'polyButton on' : 'polyButton off'}`);
      const classes = Array.from(child.classList);
      if (Helpers.indexOf(classes, 'slider') >= 0) {
        child.children[1].value = synthesizer.globals[synthParamControlDict[child.children[1].name]];
        child.children[2].innerText = Number(synthesizer.globals[synthParamControlDict[child.children[1].name]]).toFixed(3);
      }
    });

    const oscParamControlDict = {
      'Volume': 'volume',
      'Semitone': 'semitoneOffset',
      'Detune': 'fineDetune',
      'Wave': 'type'
    };
    
    synthesizer.oscillators.forEach(osc => {
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

    synthesizer.filters.forEach(filt => {
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
  },
  writeOrUpdate(synthesizer, overwrite, inputName) {
    if (synthesizer) {
      let renamed = false;
      let oldName = synthesizer.name;
      if (synthesizer.name !== inputName) {
        synthesizer.name = inputName;
        history.pushState({}, 'WebSynth', `${netConfig.host}/?name=${synthesizer.name}`);
        renamed = true;
      }
      fetch(`${netConfig.host}/preset?overwrite=${overwrite}${renamed ? `&oldName=${oldName}&newName=${synthesizer.name}` : null}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Preset.save(synthesizer, inputName))
      })
        .then(response => response.json())
        .then(body => {
          if (body.error === 'exists') {
            window.alert('A preset already exists with that name.\nPlease choose another name or select the "overwrite" option.');
          } else {
            FormView.populatePresetSelector();
            document.getElementsByClassName('save')[0].setAttribute('class', 'module save confirmation');
            setTimeout(() => {
              document.getElementsByClassName('save')[0].setAttribute('class', 'module save');
            }, 1000);
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
  },
  retrieve(name) {
    fetch(`${netConfig.host}/preset/?name=${name}`)
      .then(response => response.json())
      .then(data => {
        Preset.load(data);
      })
      .catch(err => console.error(err));
  },
  getPresetNames(callback) {
    fetch(`${netConfig.host}/presetNames`)
      .then(response => response.json())
      .then(data => {
        if (data.names) {
          callback(data.names);
        } else {
          console.warn("Possible error: no presets found.");
        }
      })
      .catch(err => console.error(err));
  }
};

export default Preset;
