let midiKeyboard = null;
window.navigator.requestMIDIAccess()
  .then(resolve => {
    midiKeyboard = new MidiKeyboard(resolve);
  })
  .catch(reject => {
    console.log(reject);
  });

class MidiKeyboard {
  constructor(parent) {
    this.midiAccess = parent;
    this.midiAccess.onstatechange = (connection) => { 
      this.connection = connection;
      this.connection.port.onmidimessage = (msg) => {
        console.log(msg);
        synthesizer.playNote(msg.data[1]);
      }
    };
  }
}