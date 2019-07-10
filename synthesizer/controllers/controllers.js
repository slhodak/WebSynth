import { Manager } from '../index.js';
import Preset from '../lib/preset.js';
import Helpers from '../lib/helpers.js';
import Template from '../views/templates.js';

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
      Manager.synthesizer.playNote({data: [127, 44, 65]});
    } else {
      Manager.synthesizer.endNote({data: [127, 44, 65]})
    }
    Manager.synthesizer.globals.demoTone = !Manager.synthesizer.globals.demoTone;
  }
};

window.addEventListener('keydown', (e) => {
  if (e.target.type !== 'text') {
    if (!Manager.synthesizer) {
      Manager.createSynthesizer();
      if (Controls[e.keyCode] && e.keyCode !== 32) {
        Controls[e.keyCode]();
      }
    } else if (Controls[e.keyCode]) {
      Controls[e.keyCode]();
    }
  }
});


//  Save and Download Buttons
//  - TODO: Provide some non-obtrusive (visual) user feedback that communicates that the preset was saved (the router model flashes green with an animation called "saved"?))
(() => {
  document.getElementsByClassName('savePreset')[0].addEventListener('submit', (e) => {
    e.preventDefault();
    fetch('http://localhost:3000/preset', {
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
  });
})();

(() => {
  let overwrite = document.getElementsByClassName('overwrite')[0];
  overwrite.addEventListener('mousedown', (e) => {
    if (Manager.overwrite === false) {
      overwrite.classList.replace('false', 'true');
    } else {
      overwrite.classList.replace('true', 'false');
    }
    Manager.overwrite = !Manager.overwrite;
  });
})();

//  Global Oscillator Parameters
const SynthController = {
  createListeners() {
    let polyButton = document.getElementsByClassName('polyButton')[0];
    polyButton.addEventListener('mousedown', (e) => {
      Manager.synthesizer.poly = !Manager.synthesizer.poly;
      //  view
      FormViews.updatePolyButton(Manager.synthesizer.poly);
    });
    let masterGainSlider = document.getElementsByClassName('masterGainSlider')[0];
    masterGainSlider.addEventListener('input', (e) => {
      Manager.synthesizer.masterGain.gain.setTargetAtTime(Number(e.target.value), Manager.synthesizer.context.currentTime, 0);
    });
    let noteSlider = document.getElementsByClassName('noteSlider')[0];
    noteSlider.addEventListener('input', (e) => {
      Manager.synthesizer.globals.note = Number(e.target.value);
      Manager.synthesizer.updateOscFrequencies();
    });
    let attackSlider = document.getElementsByClassName('attackSlider')[0];
    attackSlider.addEventListener('input', (e) => {
      Manager.synthesizer.oscillators.forEach(osc => {
        osc.setAttack(e.target.value);
      });
      Manager.synthesizer.globals.attack = e.target.value;
    });
    let releaseSlider = document.getElementsByClassName('releaseSlider')[0];
    releaseSlider.addEventListener('input', (e) => {
      Manager.synthesizer.oscillators.forEach(osc => {
        osc.setRelease(Number(e.target.value));
      });
      Manager.synthesizer.globals.release = e.target.value;
    });
    let portaSlider = document.getElementsByClassName('portaSlider')[0];
    portaSlider.addEventListener('input', (e) => {
      Manager.synthesizer.oscillators.forEach(osc => {
        osc.setPorta(e.target.value);
      });
      Manager.synthesizer.globals.porta = e.target.value;
    });
  }
}

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
    let volSlider = Template.slider(id, 'volumeSlider', 'Volume', 0, 1, 0.75, 0.001);
    let semitoneSlider = Template.slider(id, 'semitoneSlider', 'Semitone', -24, 24, 0, 1);
    let fineDetuneSlider = Template.slider(id, 'fineDetuneSlider', 'Detune', -50, 50, 0, 0.001);
    let waveSelector = Template.selector(id, 'waveSelector', 'Wave', ['sine', 'sawtooth', 'square', 'triangle'], ['Sine', 'Sawtooth', 'Square', 'Triangle']);
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
    volumeSlider.addEventListener('input', (e) => {
      Manager.synthesizer.oscillators[id].setVolume(e.target.value);
    });
    let semitoneSlider = document.getElementsByClassName('semitoneSlider')[id];
    semitoneSlider.addEventListener('input', (e) => {
      Manager.synthesizer.oscillators[id].setSemitoneOffset(Number(e.target.value));
    });
    let fineDetuneSlider = document.getElementsByClassName('fineDetuneSlider')[id];
    fineDetuneSlider.addEventListener('input', (e) => {
      Manager.synthesizer.oscillators[id].setFineDetune(e.target.value);
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
    let qSlider = Template.slider(id, 'qSlider', 'Q', 0, 6, 0.001, 0.001);
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
    frequencySlider.addEventListener('input', (e) => {
      Manager.synthesizer.filters[id].setFrequency(e.target.value);
    });
    let gainSlider = document.getElementsByClassName('gainSlider')[id];
    gainSlider.addEventListener('input', (e) => {
      Manager.synthesizer.filters[id].setGain(e.target.value);
    });
    let qSlider = document.getElementsByClassName('qSlider')[id];
    qSlider.addEventListener('input', (e) => {
      Manager.synthesizer.filters[id].setQ(e.target.value);
    });
  }
}

export {
  SynthController,
  RouterController,
  OscController,
  FilterController
}
