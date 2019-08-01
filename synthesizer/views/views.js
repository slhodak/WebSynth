import Template from './templates.js';
import netConfig from '../config/netConfig.js';

/*  _  _  __  ____  _  _  ____ 
*  / )( \(  )(  __)/ )( \/ ___)
*  \ \/ / )(  ) _) \ /\ /\___ \
*   \__/ (__)(____)(_/\_)(____/
*/

//  Visual feedback of what is going on with the models
//  Oscillators, Filters, Routing Table

const SynthViews = {
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

const FormViews = {
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

const RouterViews = {
  updateTable(table) {
    const routerTable = document.getElementsByClassName('routingTable')[0];
    routerTable.innerHTML = Template.routingTable(table);
  }
};

export {
  SynthViews,
  FormViews,
  RouterViews
}