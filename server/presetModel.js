const fs = require('fs');
const path = require('path');

module.exports = {
  create(synthData, overwrite, callback) {
    if (overwrite === 'false' && fs.existsSync(path.resolve(__dirname, `./presets/${synthData.name || 'default'}.websynth.json`))) {
      callback('exists');
    } else {
      fs.writeFile(path.resolve(__dirname, `./presets/${synthData.name || 'default'}.websynth.json`), JSON.stringify(synthData), (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null, 'Preset saved');
        }
      });
    }
  },
  getAllNames(callback) {
    fs.readdir(path.resolve(__dirname, './presets'), (err, files) => {
      if (!err) {
        callback(null, files.map(name => name.split('.')[0]));
      } else {
        callback(err);
      }
    });
  },
  getOnePreset(filename, callback) {
    fs.open(path.resolve(__dirname, `./presets/${filename}.websynth.json`), 'r', (err, fd) => {
      if (!err) {
        fs.readFile(fd, (err, data) => {
          if (!err) {
            callback(null, data);
          } else {
            callback(err);
          }
        });
      } else {
        callback(err);
      }
    });
  }
};