const Preset = {
  save(synthesizer) {
    let synthData = {
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

    console.log(synthData);
  },
  load(synthData) {

  }
};
