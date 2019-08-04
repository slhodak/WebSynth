import Preset from './preset.js';
import netConfig from '../config/netConfig.js';

const Active = {
  update(synthesizer) {
    fetch(`${netConfig.host}/synths/active`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Preset.save(synthesizer))
    })
      .catch(error => {
        console.error(`Fetch error: ${error}`);
      });
  },
  retrieve(search) {
    fetch(`${netConfig.host}/synths${search}`)
    .then(response => response.json())
    .then(synthData => {
      Preset.load(synthData)
    })
    .catch(err => {
      console.error(err);
    });
  }
};

export default Active;
