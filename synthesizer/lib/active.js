import Preset from './preset.js';
import netConfig from '../config/netConfig.js';

const Active = {
  update(synthesizer) {
    fetch(`${netConfig.host}/synths/active`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Preset.save(synthesizer, synthesizer.name))
    })
      .catch(error => {
        console.error(`Fetch error: ${error}`);
      });
  },
  load(url) {
    fetch(`${netConfig.host}/synths/${url.search}`)
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
