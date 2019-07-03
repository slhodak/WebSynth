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
      if (msg.data[0] === 144) {
        synthesizer.playNote(msg.data[1]);
      } else if (msg.data[0] === 128) {
        synthesizer.endNote(msg.data[1]);
      }
    }
  };
}

//  how might a note be played legato?
//  note on if not on sets gain and changes frequency
//  note on if note on changes frequency
//  note off any time sets gain