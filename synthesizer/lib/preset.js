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

  }
};

export default Preset;
