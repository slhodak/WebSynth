let MIDIKeyboard = {
  connect() {
    window.navigator.requestMIDIAccess()
      .then(midiAccess => {
        console.log(midiAccess);
        MIDIKeyboard.create(midiAccess);
        console.log(midiAccess);
      })
      .catch(error => {
        console.log(error);
      });
  },
  create(midiAccess) {
    MIDIKeyboard.midiAccess = midiAccess;
    MIDIKeyboard.midiAccess.onstatechange = (connection) => {
      MIDIKeyboard.connection = connection;
      MIDIKeyboard.connection.port.onmidimessage = (message) => {
        if (synthesizer) {
          if (message.data[0] === 144) {
            console.log('byte length ' + message.data.buffer.byteLength);
            console.log('byte offset ' + message.data.byteOffset);
            console.log(message);
            synthesizer.playNote(message);
          } else if (message.data[0] === 128) {
            synthesizer.endNote(message);
          }
        }
        MIDIKeyboard.midiAccess.onstatechange = null;
      }
    };
  }
};

MIDIKeyboard.connect();