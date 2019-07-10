const fs = require('fs');
const path = require('path');

module.exports = {
  create(synthData, callback) {
    fs.writeFile(path.resolve(__dirname, `./presets/${synthData.name}.websynth.json`), JSON.stringify(synthData.synthesizer), (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }
};