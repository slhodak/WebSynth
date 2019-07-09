const express = require('express');
const path = require('path');
const presets = require('./presets');

const port = 3000;
const app = express();

app.use(express.static(path.resolve(__dirname, '../dist')));
app.use('/synthesizer', express.static(path.resolve(__dirname, '../synthesizer')));
app.use(express.json());

app.post('/preset', (req, res) => {
  console.log(req.body);
  res.status(200).send('heard ya!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
