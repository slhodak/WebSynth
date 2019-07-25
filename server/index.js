const express = require('express');
const path = require('path');
const Preset = require('./presetModel');

const port = 3000;
const app = express();

app.use(express.static(path.resolve(__dirname, '../dist')));
app.use('/synthesizer', express.static(path.resolve(__dirname, '../synthesizer')));
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/preset', (req, res) => {
  Preset.create(req.body, req.query.overwrite, (error, success) => {
    if (error) {
      res.status(500).send({ error });
    } else {
      res.status(200).send({ success });
    }
  });
});

app.post('/synths/active', (req, res) => {
  Preset.createActive(req.body, (error, success) => {
    if (error) {
      res.status(500).send({ error });
    } else {
      res.status(200).send({ success });
    }
  });
});

app.get('/preset', (req, res) => {
  Preset.getOnePreset(req.query.name, (error, synthData) => {
    if (error) {
      res.status(500).send({ error });
    } else {
      res.status(200).send(synthData);
    }
  });
});

app.get('/presetNames', (req, res) => {
  Preset.getAllNames((error, names) => {
    if (error) {
      res.status(500).send({ error });
    } else {
      res.status(200).send({ names });
    }
  });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
