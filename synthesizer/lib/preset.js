import { Manager } from '../main.js';

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
        type: osc.type
      }
    });
    synthesizer.filters.forEach((filt, index) => {
      synthData.synthesizer.filters[index] = {
        id: filt.id,
        type: filt.type,
        frequency: filt.frequency.value,
        gain: filt.gain.value,
        Q: filt.Q.value
      }
    });
    return synthData;
  },
  load(synthData) {
    console.log('loading preset...');

    //  create a synth from data provided by preset object
    //  then call constructors and add nodes, 
    //    set settings -- move sliders to correct values too!

    //  warn user that this is going to overwrite all synth settings!

    Manager.synthesizer = null;
    Manager.createSynthesizerIfNoneExists({
      porta: 0.01,
      attack: 0.05,
      release: 0.6,
      poly: true
    });

    //  replace all current oscillators with preset oscillators
    //    move corresponding slider to value
    Manager.synthesizer.oscillators = [];
    synthData.synthesizer.oscillators.forEach(osc => {
      Manager.synthesizer.addOscillator({
        semitoneOffset: osc.semitoneOffset,
        fineDetune: osc.fineDetune,
        volume: osc.volume,
        type: osc.type
      });
    });
    
    //  replace all current filters with preset filters
    //    move corresponding slider to value
    Manager.synthesizer.filters = [];
    synthData.synthesizer.filters.forEach(filt => {
      Manager.synthesizer.addFilter({
        type: filt.type,
        frequency: filt.frequency,
        gain: filt.gain,
        Q: filt.Q
      });
    });

    //  route all routes in routing table by ID or 'main out'
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
  }
};

export default Preset;
