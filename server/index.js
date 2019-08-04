const express = require('express');
const path = require('path');
const Preset = require('./presetModel');
const wss = require('./dawSocket');

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

//  Serving /preset

app.get('/preset', (req, res) => {
  Preset.getOnePreset(req.query.name, (error, synthData) => {
    if (error) {
      res.status(500).send({ error });
    } else {
      res.status(200).send(synthData);
    }
  });
});

app.post('/preset', (req, res) => {
  Preset.create(req.body, req.query.overwrite, (error, success) => {
    if (error) {
      res.status(500).send({ error });
    } else {
      if (req.query.oldName) {
        wss.dawSocket.sendNameUpdate(req.query.oldName, req.query.newName);
      }
      res.status(200).send({ success });
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

//  Serving /synths

app.get('/synths', (req, res) => {
  if (req.query.name) {
    Preset.getOneActive(req.query.name, (error, synthData) => {
      if (error) {
        res.status(500).send({ error });
      } else {
        res.status(200).send(synthData);
      }
    });
  } else if (req.query.dawLastVisible) {
    Preset.checkForUpdates(req.query.dawLastVisible, (error, synthsToUpdate) => {
      if (error) {
        res.status(500).send({ error });
      } else if (synthsToUpdate.length) {
        res.status(200).send({ synthsToUpdate });
      } else {
        res.status(200).send({ message: 'No synths to update.' });
      }
    });
  }
});

app.post('/synths/active', (req, res) => {
  console.log("save to actives with name", req.body.name);
  Preset.createActive(req.body, (error, success) => {
    if (error) {
      res.status(500).send({ error });
    } else {
      res.status(200).send({ success });
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
