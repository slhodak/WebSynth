const fs = require('fs');
const path = require('path');

module.exports = {
  create(synthData, callback) {
    fs.writeFile(path.resolve(__dirname, './presets/data.json'), JSON.stringify(synthData), (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }
};