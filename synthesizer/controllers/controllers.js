import { Manager } from '../main.js';
import Preset from '../lib/preset.js';
import Helpers from '../lib/helpers.js';
import Template from '../views/templates.js';
import netConfig from '../config/netConfig.js';

//  figure out what to import, how to manage synth/osc/filt API to controllers

/*  ___  __   __ _  ____  ____   __   __    __    ____  ____  ____ 
*  / __)/  \ (  ( \(_  _)(  _ \ /  \ (  )  (  )  (  __)(  _ \/ ___)
* ( (__(  O )/    /  )(   )   /(  O )/ (_/\/ (_/\ ) _)  )   /\___ \
*  \___)\__/ \_)__) (__) (__\_) \__/ \____/\____/(____)(__\_)(____/
*/

//  General controls

const Controls = {
  79: () => {
    Manager.synthesizer.addOscillator();
  },
  70: () => {
    Manager.synthesizer.addFilter();
  },
  32: () => {
    if (Manager.synthesizer.globals.demoTone === false) {
      Manager.synthesizer.playNote({ data: [127, 44, 65] });
    } else {
      Manager.synthesizer.endNote({ data: [127, 44, 65] })
    }
    Manager.synthesizer.globals.demoTone = !Manager.synthesizer.globals.demoTone;
  }
};

window.addEventListener('keydown', (e) => {
  if (e.target.type !== 'text') {
    if (!Manager.synthesizer) {
      Manager.createSynthesizerIfNoneExists();
      if (Controls[e.keyCode] && e.keyCode !== 32) {
        Controls[e.keyCode]();
      }
    } else if (Controls[e.keyCode]) {
      Controls[e.keyCode]();
    }
  }
});

//  Save, Load, and DarkMode Buttons
const FormController = {
  initializeSavePresetModule() {
    FormController.initializeSaveButton();
    FormController.initializeOverwriteButton();
  },
  initializeSaveButton() {
    document.getElementsByClassName('savePreset')[0].addEventListener('submit', (e) => {
      e.preventDefault();
      console.log(e);
      if (Manager.synthesizer) {
        fetch(`${netConfig.host}/preset`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(Preset.save(Manager.synthesizer, e.srcElement[0].value, Manager.overwrite))
        })
          .then(response => response.json())
          .then(body => {
            if (body.error === 'exists') {
              window.alert('A preset already exists with that name.\nPlease choose another name or select the "overwrite" option.');
            } else {
              document.getElementsByClassName('save')[0].setAttribute('class', 'module save confirmation');
              setTimeout(() => {
                document.getElementsByClassName('save')[0].setAttribute('class', 'module save');
              }, 1000);
            }
          })
          .catch(err => {
            console.log(err);
          });
      }
    });
  },
  initializeOverwriteButton() {
    let overwrite = document.getElementsByClassName('overwrite')[0];
    overwrite.addEventListener('mousedown', (e) => {
      if (Manager.overwrite === false) {
        overwrite.classList.replace('false', 'true');
      } else {
        overwrite.classList.replace('true', 'false');
      }
      Manager.overwrite = !Manager.overwrite;
    });
  },
  initializeLoadPresetModule() {
    FormController.initializeLoadPresetSelector();
    FormController.initializeLoadPresetButton();
  },
  initializeLoadPresetSelector() {
    //  populate selector with all preset names (on selector click)
    let presetSelector = document.getElementsByClassName('presetSelector')[0];
    presetSelector.addEventListener('mousedown', (e) => {
      fetch(`${netConfig.host}/presetNames`)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          // let option = document.createElement('option');
          // option.innerText = 'new option';
          // selector.append(option);
        })
        .catch(err => console.log(err));
    })
  },
  initializeLoadPresetButton() {
    //  get selected preset by name
  },
  initializeDarkModeButton() {
    document.getElementsByClassName('darkMode')[0].addEventListener('mousedown', (e) => {
      let newMode, oldMode;
      if (Manager.darkMode === true) {
        oldMode = 'dark';
        newMode = 'light';
      } else {
        oldMode = 'light';
        newMode = 'dark';
      }
      Array.from(document.getElementsByClassName(oldMode)).forEach(element => {
        let classes = Array.from(element.classList).filter(name => name !== oldMode);
        classes.push(newMode);
        element.setAttribute('class', classes.join(' '));
      });
      document.body.setAttribute('class', `${newMode}Body`);
      document.getElementsByClassName('title')[0].setAttribute('class', `title module row ${newMode}Title`);
      e.target.innerText = `${oldMode} mode`;
      Manager.darkMode = !Manager.darkMode;
    });
  }
}

FormController.initializeLoadPresetModule();
FormController.initializeSavePresetModule();
FormController.initializeDarkModeButton();

//  Global Synth Parameters
const SynthController = {
  controls() {
    let polyButton = '<button class="polyButton on" type="button">Poly</button>';
    let masterGainSlider = Template.slider('masterGainSlider', 'Volume', 0, 1, 0.75, 0.001);
    let attackSlider = Template.slider('attackSlider', 'Attack', 0.001, 1, 0.1, 0.001);
    let releaseSlider = Template.slider('releaseSlider', 'Release', 0.1, 1, 0.1, 0.001);
    let portaSlider = Template.slider('portaSlider', 'Porta', 0.001, 1, 0.05, 0.001);
    return polyButton + masterGainSlider + attackSlider + releaseSlider + portaSlider;
  },
  createControls() {
    let ControlsDiv = document.getElementsByClassName('globalControls')[0];
    let controls = document.createElement('div');
    controls.innerHTML = SynthController.controls();
    ControlsDiv.append(controls);
  },
  createListeners() {
    let polyButton = document.getElementsByClassName('polyButton')[0];
    polyButton.addEventListener('mousedown', (e) => {
      Manager.synthesizer.togglePoly();
    });
    let masterGainSlider = document.getElementsByClassName('masterGainSlider')[0];
    let masterGainSliderDisplay = document.getElementsByClassName('masterGainSliderDisplay')[0];
    masterGainSlider.addEventListener('input', (e) => {
      Manager.synthesizer.setGain(Number(e.target.value));
      masterGainSliderDisplay.innerText = e.target.value;
    });
    let attackSlider = document.getElementsByClassName('attackSlider')[0];
    let attackSliderDisplay = document.getElementsByClassName('attackSliderDisplay')[0];
    attackSlider.addEventListener('input', (e) => {
      Manager.synthesizer.setAttack(Number(e.target.value));
      attackSliderDisplay.innerText = e.target.value;
    });
    let releaseSlider = document.getElementsByClassName('releaseSlider')[0];
    let releaseSliderDisplay = document.getElementsByClassName('releaseSliderDisplay')[0];
    releaseSlider.addEventListener('input', (e) => {
      Manager.synthesizer.setRelease(Number(e.target.value));
      releaseSliderDisplay.innerText = e.target.value;
    });
    let portaSlider = document.getElementsByClassName('portaSlider')[0];
    let portaSliderDisplay = document.getElementsByClassName('portaSliderDisplay')[0];
    portaSlider.addEventListener('input', (e) => {
      Manager.synthesizer.setPorta(Number(e.target.value));
      portaSliderDisplay.innerText = e.target.value;
    });
  }
}

SynthController.createControls();
document.getElementsByClassName('globalControls')[0].addEventListener('mousedown', Manager.createSynthesizerIfNoneExists);


//  Router Controller
const RouterController = {
  updateRouterClickHandlers() {
    const destinations = document.getElementsByClassName('destination');
    Array.from(destinations).forEach(destination => {
      destination.addEventListener('mousedown', (e) => {
        if (destination.dataset.id === 'mainout') {
          Manager.synthesizer.router.setRoute(Manager.synthesizer.router.table[destination.parentNode.dataset.id].node, Manager.synthesizer.masterGain);
        } else if (Helpers.indexOf(Manager.synthesizer.router.table[destination.parentNode.dataset.id].eligibleDestinations, Manager.synthesizer.router.table[destination.dataset.id].node) >= 0) {
          Manager.synthesizer.router.setRoute(Manager.synthesizer.router.table[destination.parentNode.dataset.id].node, Manager.synthesizer.router.table[destination.dataset.id].node);
        } else {
          console.log('Ineligible route!');
        }
      });
    });
  }
};

//  Individual Oscillator Parameters
const OscController = {
  controls(id) {
    let header = `<h3>Oscillator ${id}</h3>`;
    let volSlider = Template.slider('volumeSlider', 'Volume', 0, 1, 0.75, 0.001);
    let semitoneSlider = Template.slider('semitoneSlider', 'Semitone', -24, 24, 0, 1);
    let fineDetuneSlider = Template.slider('fineDetuneSlider', 'Detune', -50, 50, 0, 1);
    let waveSelector = Template.selector('waveSelector', 'Wave', ['sine', 'sawtooth', 'square', 'triangle'], ['Sine', 'Sawtooth', 'Square', 'Triangle']);
    return header + volSlider + semitoneSlider + fineDetuneSlider + waveSelector;
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
      Manager.synthesizer.oscillators[id].setType(e.target.value);
      if (Manager.synthesizer.mono) {
        for (let voice in Manager.synthesizer.mono.voices) {
          Manager.synthesizer.mono.voices[voice].type = e.target.value;
        }
      }
    });
    let volumeSlider = document.getElementsByClassName('volumeSlider')[id];
    let volumeSliderDisplay = document.getElementsByClassName('volumeSliderDisplay')[id];
    volumeSlider.addEventListener('input', (e) => {
      Manager.synthesizer.oscillators[id].setVolume(e.target.value);
      volumeSliderDisplay.innerText = e.target.value;
    });
    let semitoneSlider = document.getElementsByClassName('semitoneSlider')[id];
    let semitoneSliderDisplay = document.getElementsByClassName('semitoneSliderDisplay')[id];
    semitoneSlider.addEventListener('input', (e) => {
      Manager.synthesizer.oscillators[id].setSemitoneOffset(Number(e.target.value));
      semitoneSliderDisplay.innerText = e.target.value;
    });
    let fineDetuneSlider = document.getElementsByClassName('fineDetuneSlider')[id];
    let fineDetuneSliderDisplay = document.getElementsByClassName('fineDetuneSliderDisplay')[id];
    fineDetuneSlider.addEventListener('input', (e) => {
      Manager.synthesizer.oscillators[id].setFineDetune(e.target.value);
      fineDetuneSliderDisplay.innerText = e.target.value;
    });
  }
};

//  Individual Filter Parameters
const FilterController = {
  controls(id) {
    let header = `<h3>Filter ${id}</h3>`;
    let selector = Template.selector('filterTypeSelector', 'Filter Type', ['lowpass', 'highpass', 'bandpass', 'allpass', 'lowshelf', 'highshelf', 'peaking', 'notch'], ['Lowpass', 'Highpass', 'Bandpass', 'Allpass', 'Lowshelf', 'Highshelf', 'Peaking', 'Notch']);
    let freqSlider = Template.slider('frequencySlider', 'Frequency', 20, 10000, 10000, 0.001);
    let gainSlider = Template.slider('gainSlider', 'Gain', 0, 1, 0, 0.001);
    let qSlider = Template.slider('qSlider', 'Q', 0, 6, 0.001, 0.001);
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
      Manager.synthesizer.filters[id].setType(e.target.value);
    });
    let frequencySlider = document.getElementsByClassName('frequencySlider')[id];
    let frequencySliderDisplay = document.getElementsByClassName('frequencySliderDisplay')[id];
    frequencySlider.addEventListener('input', (e) => {
      Manager.synthesizer.filters[id].setFrequency(e.target.value);
      frequencySliderDisplay.innerText = e.target.value;
    });
    let gainSlider = document.getElementsByClassName('gainSlider')[id];
    let gainSliderDisplay = document.getElementsByClassName('gainSliderDisplay')[id];
    gainSlider.addEventListener('input', (e) => {
      Manager.synthesizer.filters[id].setGain(e.target.value);
      gainSliderDisplay.innerText = e.target.value;
    });
    let qSlider = document.getElementsByClassName('qSlider')[id];
    let qSliderDisplay = document.getElementsByClassName('qSliderDisplay')[id];
    qSlider.addEventListener('input', (e) => {
      Manager.synthesizer.filters[id].setQ(e.target.value);
      qSliderDisplay.innerText = e.target.value;
    });
  }
}

export {
  FormController,
  SynthController,
  RouterController,
  OscController,
  FilterController
}
