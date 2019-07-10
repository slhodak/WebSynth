const express = require('express');
const path = require('path');
const Preset = require('./presetModel');

const port = 3000;
const app = express();

app.use(express.static(path.resolve(__dirname, '../dist')));
app.use('/synthesizer', express.static(path.resolve(__dirname, '../synthesizer')));
app.use(express.json());

app.post('/preset', (req, res) => {
  Preset.create(req.body, (err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send('Preset saved.');
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
