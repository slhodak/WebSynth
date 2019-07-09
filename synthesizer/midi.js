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
    MIDIKeyboard.midiAccess.onstatechange = (connection) => {
      MIDIKeyboard.connection = connection;
      MIDIKeyboard.connection.port.onmidimessage = (message) => {
        if (synthesizer) {
          if (message.data[0] === 144) {
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
