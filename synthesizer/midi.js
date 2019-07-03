let midiKeyboard = {};
window.navigator.requestMIDIAccess()
  .then(resolve => {
    extendKeyboard(resolve);
  })
  .catch(reject => {
    console.log(reject);
  });


function extendKeyboard(baseObject) {
  midiKeyboard.midiAccess = baseObject;
  midiKeyboard.midiAccess.onstatechange = (connection) => { 
    midiKeyboard.connection = connection;
    midiKeyboard.connection.port.onmidimessage = (msg) => {
      console.log(msg);
      synthesizer.playNote(msg.data[1]);
    }
  };
}

