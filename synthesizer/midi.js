import { Manager } from './index.js';

let MIDIKeyboard = {
  connect() {
    window.navigator.requestMIDIAccess()
      .then(midiAccess => {
        MIDIKeyboard.create(midiAccess);
      })
      .catch(error => {
        console.log(error);
      });
  },
  create(midiAccess) {
    MIDIKeyboard.midiAccess = midiAccess;
    midiAccess.inputs.forEach(port => {
      port.onmidimessage = (message) => {
        if (Manager.synthesizer) {
          MIDIKeyboard.handleInput(message);
        }
      }
    });
  },
  handleInput(message) {
    if (message.data[0] === 144) {
      Manager.synthesizer.playNote(message);
    } else if (message.data[0] === 128) {
      Manager.synthesizer.endNote(message);
    }
  }
};

MIDIKeyboard.connect();
