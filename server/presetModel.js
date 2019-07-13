const fs = require('fs');
const path = require('path');

module.exports = {
  create(synthData, callback) {
    if (synthData.overwrite === false && fs.existsSync(path.resolve(__dirname, `./presets/${synthData.name || 'default'}.websynth.json`))) {
      callback('exists');
    } else {
      fs.writeFile(path.resolve(__dirname, `./presets/${synthData.name || 'default'}.websynth.json`), JSON.stringify(synthData.synthesizer), (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null, 'Preset saved');
        }
      });
    }
  },
  getAllNames(callback) {
    callback(null, 'getting names!');
  }
};