let midiKeyboard = {};
window.navigator.requestMIDIAccess()
  .then(midiAccess => {
    extendKeyboard(midiAccess);
  })
  .catch(error => {
    console.log(error);
  });


function extendKeyboard(midiAccess) {
  midiKeyboard.midiAccess = midiAccess;
  midiKeyboard.midiAccess.onstatechange = (connection) => { 
    midiKeyboard.connection = connection;
    midiKeyboard.connection.port.onmidimessage = (message) => {
      if (message.data[0] === 144) {
        synthesizer.playNote(message.data[1]);
      } else if (message.data[0] === 128) {
        synthesizer.endNote(message.data[1]);
      }
    }
  };
}
