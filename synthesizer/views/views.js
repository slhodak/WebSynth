import Template from './templates.js';
import netConfig from '../config/netConfig.js';

/*  _  _  __  ____  _  _  ____ 
*  / )( \(  )(  __)/ )( \/ ___)
*  \ \/ / )(  ) _) \ /\ /\___ \
*   \__/ (__)(____)(_/\_)(____/
*/

//  Visual feedback of what is going on with the models
//  Oscillators, Filters, Routing Table

const SynthView = {
  createControls() {
    return '<button class="polyButton on" type="button">Poly</button>' +
      Template.slider('masterGainSlider', 'Volume', 0, 1, 1, 0.001) +
      Template.slider('attackSlider', 'Attack', 0.001, 1, 0.1, 0.001) +
      Template.slider('releaseSlider', 'Release', 0.1, 1, 0.1, 0.001) +
      Template.slider('portaSlider', 'Porta', 0.001, 1, 0.05, 0.001);
  },
  addControls() {
    let ControlsDiv = document.getElementsByClassName('globalControls')[0];
    let controls = document.createElement('div');
    controls.innerHTML = SynthController.controls();
    ControlsDiv.append(controls);
  },
  toggleDarkMode(darkMode) {
    let newMode, oldMode;
      if (darkMode === true) {
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
  }
}

const FormView = {
  updatePolyButton(poly) {
    const polyButton = document.getElementsByClassName('polyButton')[0];
    polyButton.setAttribute('class', `polyButton ${poly ? 'on' : 'off'}`);
  },
  updateOverwriteButton(overwrite, button) {
    if (overwrite === false) {
      button.classList.replace('false', 'true');
    } else {
      button.classList.replace('true', 'false');
    }
  },
  populatePresetSelector() {
    let presetSelector = document.getElementsByClassName('presetSelector')[0];
    fetch(`${netConfig.host}/presetNames`)
      .then(response => response.json())
      .then(data => {
        presetSelector.innerHTML = '';
        let option = document.createElement('option');
        option.innerText = '-- Preset Name --';
        presetSelector.append(option);
        data.names.forEach(name => {
          option = document.createElement('option');
          option.innerText = name;
          presetSelector.append(option);
        });
      })
      .catch(err => console.error(err));
  }
};

const RouterView = {
  updateTable(table) {
    const routerTable = document.getElementsByClassName('routingTable')[0];
    routerTable.innerHTML = Template.routingTable(table);
  }
};

const OscView = {
  createControls(id) {
    let header = `<h3>Oscillator ${id}</h3>`;
    let volSlider = Template.slider('volumeSlider', 'Volume', 0, 1, 0.75, 0.001);
    let semitoneSlider = Template.slider('semitoneSlider', 'Semitone', -24, 24, 0, 1);
    let fineDetuneSlider = Template.slider('fineDetuneSlider', 'Detune', -50, 50, 0, 1);
    let waveSelector = Template.selector('waveSelector', 'Wave', ['sine', 'sawtooth', 'square', 'triangle'], ['Sine', 'Sawtooth', 'Square', 'Triangle']);
    return `<div id=${1000 + id}>` + /*header + */ volSlider + semitoneSlider + fineDetuneSlider + waveSelector + '</div>';
  },
  addControls(id) {
    let oscControlsDiv = document.getElementsByClassName('oscillatorControls')[0];
    let newControls = document.createElement('div');
    newControls.innerHTML = OscController.controls(id);
    oscControlsDiv.append(newControls);
  }
};

export {
  OscView,
  SynthView,
  FormView,
  RouterView
}