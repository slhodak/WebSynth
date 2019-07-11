import Template from './templates.js';

/*  _  _  __  ____  _  _  ____ 
*  / )( \(  )(  __)/ )( \/ ___)
*  \ \/ / )(  ) _) \ /\ /\___ \
*   \__/ (__)(____)(_/\_)(____/
*/

//  Visual feedback of what is going on with the models
//  Oscillators, Filters, Routing Table

const FormViews = {
  updatePolyButton(poly) {
    const polyButton = document.getElementsByClassName('polyButton')[0];
    polyButton.setAttribute('class', `polyButton ${poly ? 'on' : 'off'}`);
  }
};

const RouterViews = {
  updateTable(table) {
    const routerTable = document.getElementsByClassName('routingTable')[0];
    routerTable.innerHTML = Template.routingTable(table);
  }
};

export {
  FormViews,
  RouterViews
}