/*  _  _   __  ____  ____  __    ____ 
*  ( \/ ) /  \(    \(  __)(  )  / ___)
*  / \/ \(  O )) D ( ) _) / (_/\\___ \
*  \_)(_/ \__/(____/(____)\____/(____/
*/
//  - models must have defined interfaces for the controllers to interact with

//  - Global Parameters keep new oscillators in step with existing ones
let synthesizer = null;

//  - Synthesizer
class Synthesizer {
  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.globals = {
      porta: 0.05,
      attack: 0.01,
      release: 0.1,
      type: 'sine'
    };
    this.mono = {
      note: null,
      notesList: [],
      notesObj: {},
      voices: {}
    };
    this.poly = true;
    this.oscillators = [];
    this.filters = [];
    SynthController.createListeners();
    this.playNote = this.playNote.bind(this);
    this.endNote = this.endNote.bind(this);
    this.findNextNote = this.findNextNote.bind(this);
    this.findFrequencyFromNote = this.findFrequencyFromNote.bind(this);
  }

  playNote(midiMessage) {
    if (this.poly) {
      this.oscillators.forEach(osc => {
        osc.addVoice(midiMessage);
      });
    } else {
      if (!this.mono.note) {
        this.oscillators.forEach(osc => {
          this.mono.voices[midiMessage.data[1]] = new Voice(
            synthesizer.context, 
            {
              frequency: synthesizer.findFrequencyFromNote(midiMessage.data[1]),
              type: osc.type,
              detune: osc.fineDetune
            }, 
            osc);
          });
        this.mono.notesObj[midiMessage.data[1]] = true;
        this.mono.notesList.push(midiMessage.data[1]);
        this.mono.note = midiMessage.data[1];
      } else {
        for (let voice in this.mono.voices) {
          this.mono.voices[voice].setFrequency(midiMessage.data[1]);
          this.mono.notesObj[midiMessage.data[1]] = true;
          this.mono.notesList.push(midiMessage.data[1]);
          this.mono.note = midiMessage.data[1];
        }
      }
    }
  }

  endNote(midiMessage) {
    if (this.poly) {
      this.oscillators.forEach(osc => {
        osc.removeVoice(midiMessage);
      });
    } else {
      delete this.mono.notesObj[midiMessage.data[1]];
      this.findNextNote();
    }
  }

  findNextNote() {
    if (this.mono.notesList.length) {
      if (this.mono.notesObj[this.mono.notesList[this.mono.notesList.length - 1]]) {
        this.mono.note = this.mono.notesList[this.mono.notesList.length - 1];
        for (let voice in this.mono.voices) {
          this.mono.voices[voice].setFrequency(this.mono.note);
        }
      } else {
        this.mono.notesList.pop();
        this.findNextNote();
      }
    } else {
      for (let voice in this.mono.voices) {
        this.mono.voices[voice].off();
      }
      this.mono.note = null;
    }
  }

  findFrequencyFromNote(note) {
    return Math.pow(2, (note - 49)/12) * 440;
  }

  //  deal with global controls changes...
}

//  - Voice
class Voice extends OscillatorNode {
  constructor(context, options, parent) {
    super(context, options);

    this.parent = parent;
    this.gainNode = synthesizer.context.createGain();
    this.gainNode.gain.value = 0;
    this.connect(this.gainNode);
    this.gainNode.connect(parent.output);
    this.start();
    this.gainNode.gain.setTargetAtTime(parent.volume, synthesizer.context.currentTime, parent.attack);

    this.setFrequency = this.setFrequency.bind(this);
    this.off = this.off.bind(this);
  }

  setFrequency(note) {
    this.frequency.setTargetAtTime(synthesizer.findFrequencyFromNote(note), synthesizer.context.currentTime, this.parent.porta);
  }

  off() {
    this.gainNode.gain.setTargetAtTime(0, synthesizer.context.currentTime, this.parent.release / 10);
    this.stop(synthesizer.context.currentTime + this.parent.release);
  }
}

//  - Oscillator abstraction controlling multiple voiced oscillator nodes
class Oscillator {
  constructor() {
    this.voices = {};
    this.addVoice = this.addVoice.bind(this);
    this.removeVoice = this.removeVoice.bind(this);

    this.id = synthesizer.oscillators.length;
    OscController.createControls(this.id);
    OscController.createListeners(this.id);
    this.semitoneOffset = 0;
    this.fineDetune = 0;
    this.volume = 0.75;
    this.type = 'sine';
    this.porta = synthesizer.globals.porta;
    this.attack = synthesizer.globals.attack;
    this.release = synthesizer.globals.release;

    this.output = synthesizer.context.createGain();
    this.output.gain.value = this.volume;
    this.output.connect(synthesizer.context.destination);
    
    this.connectToFilter = this.connectToFilter.bind(this);
    this.connectToMaster = this.connectToMaster.bind(this);

    this.setVolume = this.setVolume.bind(this);
    this.setPorta = this.setPorta.bind(this);
    this.setType = this.setType.bind(this);
    this.setSemitoneOffset = this.setSemitoneOffset.bind(this);
    this.setFineDetune = this.setFineDetune.bind(this);
  }

  addVoice(midiMessage) {
    let voice = new Voice(synthesizer.context, {
      frequency: synthesizer.findFrequencyFromNote(midiMessage.data[1] + this.semitoneOffset, synthesizer.context.currentTime, 0),
      type: this.type,
      detune: this.fineDetune
    }, this);
    voice.onended = (e) => {
      voice.disconnect();
      voice.gainNode.disconnect();
      delete this.voices[midiMessage.data[1]];
    };
    this.voices[midiMessage.data[1]] = voice;
    return voice;
  }
  
  removeVoice(midiMessage) {
    const voice = this.voices[midiMessage.data[1]];
    voice.gainNode.gain.setTargetAtTime(0, synthesizer.context.currentTime, this.release / 10);
    voice.stop(synthesizer.context.currentTime + this.release);
  }

  connectToFilter(id) {
    this.output.disconnect();
    this.output.connect(synthesizer.filters[id]);
  }

  connectToMaster() {
    this.output.gainNode.disconnect();
    this.output.connect(synthesizer.masterGain);
  }

  setVolume(volume) {
    this.volume = volume;
    for (let voice in this.voices) {
      this.voices[voice].gainNode.value = volume;
    }
  }

  setType(type) {
    this.type = type;
    for (let voice in this.voices) {
      this.voices[voice].type = type;
    }
  }

  setSemitoneOffset(semitoneOffset) {
    this.semitoneOffset = Number(semitoneOffset);
    for (let voice in this.voices) {
      this.voices[voice].frequency.setTargetAtTime(synthesizer.findFrequencyFromNote(Number(voice) + this.semitoneOffset), synthesizer.context.currentTime, 0);
    }
  }

  setFineDetune(detune) {
    this.fineDetune = detune;
    for (let voice in this.voices) {
      this.voices[voice].detune.setTargetAtTime(detune, synthesizer.context.currentTime, 0);
    }
  }

  setPorta(porta) {
    this.porta = porta;
  }

  setAttack(attack) {
    this.attack = attack;
  }
  
  setRelease(release) {
    this.release = release;
  }
}

//  - Filters
class Filter extends BiquadFilterNode {
  constructor(props) {
    super(props.context);

    this.id = synthesizer.filters.length;
    FilterController.createControls(this.id);
    OscViews.updateOscillatorFilters(this.id);
    this.type = 'lowpass';
    this.frequency.setTargetAtTime(20000, this.context.currentTime, 0);
    this.gain.setTargetAtTime(0, this.context.currentTime, 0);
    FilterController.createListeners(this.id);
    this.connect(synthesizer.masterGain);
    this.setType = this.setType.bind(this);
    this.setFrequency = this.setFrequency.bind(this);
    this.setGain = this.setGain.bind(this);
  }

  setType(type) {
    this.type = type;
  }

  setFrequency(freq) {
    this.frequency.setTargetAtTime(freq, this.context.currentTime, 0);
  }

  setGain(gain) {
    this.gain.setTargetAtTime(gain, this.context.currentTime, 0);
  }

  setQ(q) {
    this.Q.setTargetAtTime(q, this.context.currentTime, 0);
  }
}

/*  ___  __   __ _  ____  ____   __   __    __    ____  ____  ____ 
*  / __)/  \ (  ( \(_  _)(  _ \ /  \ (  )  (  )  (  __)(  _ \/ ___)
* ( (__(  O )/    /  )(   )   /(  O )/ (_/\/ (_/\ ) _)  )   /\___ \
*  \___)\__/ \_)__) (__) (__\_) \__/ \____/\____/(____)(__\_)(____/
*/

//  Keyboard controls
window.addEventListener('keydown', (e) => {
  if (!synthesizer) {
    synthesizer = new Synthesizer();
  }
  if (e.key === 'o') { 
    let newOsc = new Oscillator();
    synthesizer.oscillators.push(newOsc);
    console.log('Creating oscillator');
    OscViews.updateOscList();
  }
  if (e.key === ' ') {
    if (!synthesizer.globals.noteOn) {
      synthesizer.playNote({data: [127, 44, 65]});
      synthesizer.globals.noteOn = true;
    } else {
      synthesizer.endNote({data: [127, 44, 65]})
      synthesizer.globals.noteOn = false;
    }
  }
  if (e.key === 'f') {
    synthesizer.filters.push(new Filter(synthesizer));
    console.log('Creating filter')
  }
});

//  Global Oscillator Parameters
const SynthController = {
  createListeners() {
    let polyButton = document.getElementsByClassName('polyButton')[0];
    polyButton.addEventListener('mousedown', (e) => {
      synthesizer.poly = !synthesizer.poly;
      FormViews.updatePolyButton(synthesizer.poly);
    });
    let masterGainSlider = document.getElementsByClassName('masterGainSlider')[0];
    masterGainSlider.addEventListener('input', (e) => {
      synthesizer.masterGain.gain.setTargetAtTime(Number(e.target.value), synthesizer.context.currentTime, 0);
      OscViews.updateOscList();
    });
    let noteSlider = document.getElementsByClassName('noteSlider')[0];
    noteSlider.addEventListener('input', (e) => {
      synthesizer.globals.note = Number(e.target.value);
      synthesizer.updateOscFrequencies();
      OscViews.updateOscList();
    });
    let attackSlider = document.getElementsByClassName('attackSlider')[0];
    attackSlider.addEventListener('input', (e) => {
      synthesizer.oscillators.forEach(osc => {
        osc.setAttack(e.target.value);
      });
      OscViews.updateOscList();
    });
    let releaseSlider = document.getElementsByClassName('releaseSlider')[0];
    releaseSlider.addEventListener('input', (e) => {
      synthesizer.oscillators.forEach(osc => {
        osc.setRelease(e.target.value);
      });
      OscViews.updateOscList();
    });
    let portaSlider = document.getElementsByClassName('portaSlider')[0];
    portaSlider.addEventListener('input', (e) => {
      synthesizer.oscillators.forEach(osc => {
        osc.setPorta(e.target.value);
      });
      synthesizer.globals.porta = e.target.value;
      OscViews.updateOscList();
    });
  }
}

//  Individual Oscillator Parameters
const OscController = {
  controls(id) {
    let header = `<h3>Oscillator ${id}</h3>`;
    let volSlider = Template.slider(id, 'volumeSlider', 'Volume', 0, 1, 0.75, 0.001);
    let semitoneSlider = Template.slider(id, 'semitoneSlider', 'Semitone', 0, 24, 0, 1);
    let fineDetuneSlider = Template.slider(id, 'fineDetuneSlider', 'Detune', 0, 50, 0, 0.001);
    let waveSelector = Template.selector(id, 'waveSelector', 'Wave', ['sine', 'sawtooth', 'square', 'triangle'], ['Sine', 'Sawtooth', 'Square', 'Triangle']);
    let filterSelector = Template.selector(id, 'filterSelector', 'Filter', ['none', ...synthesizer.filters.map(filter => filter.id)]);
    return header + volSlider + semitoneSlider + fineDetuneSlider + waveSelector + filterSelector;
  },
  createControls(id) {
    let oscControlsDiv = document.getElementsByClassName('oscillatorControls')[0];
    let newControls = document.createElement('div');
    newControls.innerHTML = OscController.controls(id);
    oscControlsDiv.append(newControls);
  },
  createListeners(id) {
    let waveSelector = document.getElementsByClassName('waveSelector')[id];
    waveSelector.addEventListener('change', (e) => {
      synthesizer.oscillators[id].setType(e.target.value);
      if (synthesizer.mono) {
        for (let voice in synthesizer.mono.voices) {
          synthesizer.mono.voices[voice].type = e.target.value;
        }
      }
      OscViews.updateOscList();
    });
    let volumeSlider = document.getElementsByClassName('volumeSlider')[id];
    volumeSlider.addEventListener('input', (e) => {
      synthesizer.oscillators[id].setVolume(e.target.value);
      OscViews.updateOscList();
    });
    let semitoneSlider = document.getElementsByClassName('semitoneSlider')[id];
    semitoneSlider.addEventListener('input', (e) => {
      synthesizer.oscillators[id].setSemitoneOffset(Number(e.target.value));
      OscViews.updateOscList();
    });
    let fineDetuneSlider = document.getElementsByClassName('fineDetuneSlider')[id];
    fineDetuneSlider.addEventListener('input', (e) => {
      synthesizer.oscillators[id].setFineDetune(e.target.value);
      OscViews.updateOscList();
    });
    let filterSelector = document.getElementsByClassName('filterSelector')[id];
    filterSelector.addEventListener('change', (e) => {
      if (e.target.value === 'none') {
        synthesizer.oscillators[id].connectToMaster();
      } else {
        synthesizer.oscillators[id].connectToFilter(e.target.value);
      }
      OscViews.updateOscList();
    });
  }
}

//  Individual Filter Parameters
const FilterController = {
  controls(id) {
    let header = `<h3>Filter ${id}</h3>`;
    let selector = Template.selector(id, 'filterTypeSelector', 'Filter Type', ['lowpass', 'highpass', 'bandpass', 'allpass', 'lowshelf', 'highshelf', 'peaking', 'notch'], ['Lowpass', 'Highpass', 'Bandpass', 'Allpass', 'Lowshelf', 'Highshelf', 'Peaking', 'Notch']);
    let freqSlider = Template.slider(id, 'frequencySlider', 'Frequency', 20, 10000, 10000, 0.001);
    let gainSlider = Template.slider(id, 'gainSlider', 'Gain', 0, 1, 0, 0.001);
    let qSlider = Template.slider(id, 'qSlider', 'Q', 0, 50, 0, 0.001);
    return header  + selector + freqSlider + gainSlider + qSlider;
  },
  createControls(id) {
    let filterControlsDiv = document.getElementsByClassName('filterControls')[0];
    let newControls = document.createElement('div');
    newControls.innerHTML = FilterController.controls(id);
    filterControlsDiv.append(newControls);
  },
  createListeners(id) {
    let filterTypeSelector = document.getElementsByClassName('filterTypeSelector')[id];
    filterTypeSelector.addEventListener('change', (e) => {
      synthesizer.filters[id].setType(e.target.value);
      OscViews.updateOscList();
    });
    let frequencySlider = document.getElementsByClassName('frequencySlider')[id];
    frequencySlider.addEventListener('input', (e) => {
      synthesizer.filters[id].setFrequency(e.target.value);
      OscViews.updateOscList();
    });
    let gainSlider = document.getElementsByClassName('gainSlider')[id];
    gainSlider.addEventListener('input', (e) => {
      synthesizer.filters[id].setGain(e.target.value);
      OscViews.updateOscList();
    });
    let qSlider = document.getElementsByClassName('qSlider')[id];
    qSlider.addEventListener('input', (e) => {
      synthesizer.filters[id].setQ(e.target.value);
      OscViews.updateOscList();
    });
  }
}

/*  _  _  __  ____  _  _  ____ 
*  / )( \(  )(  __)/ )( \/ ___)
*  \ \/ / )(  ) _) \ /\ /\___ \
*   \__/ (__)(____)(_/\_)(____/
*/

//  Visual feedback of what is going on with the models
//  Oscillators, Filters, Routing Table

const OscViews = {
  updateOscList() {
    let oscList = document.getElementsByClassName('oscillators')[0];
    Array.from(oscList.children).forEach(node => {
      node.remove();
    });
    synthesizer.oscillators.forEach(osc => {
      let oscListNode = document.createElement('li');
      oscListNode.innerText = JSON.stringify(osc);
      oscList.appendChild(oscListNode);
    });
  },
  updateOscillatorFilters(id) {
    Array.from(document.getElementsByClassName('filterSelector')).forEach(selector => {
      let option = document.createRange().createContextualFragment(`<option name="${id}" value="${id}">${id}</option>`);
      selector.appendChild(option);
    });
  }
};

const FilterViews = {
  updateFiltersList() {
    let filtList = document.getElementsByClassName('filters')[0];
    Array.from(filtList.children).forEach(node => {
      node.remove();
    });
    synthesizer.filters.forEach(filter => {
      let filtListNode = document.createElement('li');
      filtListNode.innerText = JSON.stringify(filter);
      filtList.appendChild(filtListNode);
    });
  }
};

const FormViews = {
  updatePolyButton(poly) {
    let polyButton = document.getElementsByClassName('polyButton')[0];
    polyButton.setAttribute('class', `polyButton ${poly ? 'on' : 'off'}`);
  }
};

const RouterView = {
  
}
