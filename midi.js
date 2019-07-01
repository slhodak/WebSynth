// Let promise be a new Promise object and resolver be its associated resolver.
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

// If document is not allowed to use the policy-controlled feature named midi, jump to the step labeled failure below.

// Optionally, e.g. based on a previously-established user preference, for security reasons, or due to platform limitations, jump to the step labeled failure below.

// Optionally, e.g. based on a previously-established user preference, jump to the step labeled success below.

// Prompt the user in a user-agent-specific manner for permission to provide the entry script's origin with a MIDIAccess object representing control over user's MIDI devices. This prompt may be contingent upon whether system exclusive support was requested, and may allow the user to enable or disable that access.

// If permission is denied, jump to the step labeled failure below. If the user never responds, this algorithm will never progress beyond this step. If permission is granted, continue the following steps.

// success: Let access be a new MIDIAccess object. (It is possible to call requestMIDIAccess() multiple times; this may prompt the user multiple times, so it may not be best practice, and the same instance of MIDIAccess will not be returned each time.)

// Call resolver's accept(value) method with access as value argument.

// Terminate these steps.

// failure: Let error be a new DOMException. This exception's .name should be "SecurityError" if the user or their security settings denied the application from creating a MIDIAccess instance with the requested options, or if the error is the result of document not being allowed to use the feature, "AbortError" if the page is going to be closed for a user navigation, "InvalidStateError" if the underlying systems raise any errors, or otherwise it should be "NotSupportedError".