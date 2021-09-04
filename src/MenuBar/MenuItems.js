import importIcon from './MenuIcons/import.png';
import exportIcon from './MenuIcons/export.png';
import logoIcon from './MenuIcons/logo.png';

import { graph } from '../index.js';

const MenuItems = [
  {
    text: '',
    img: logoIcon,
    onClick: function(){
      return;
    },
    margin_left: '0vw',
  },
  {
    text: 'Bram Hub',
    img: '',
    onClick: function(){
      return;
    },
    margin_left: '1vw',
  },
  {
    text: 'Import',
    img: importIcon,
    onClick: importEG,
    margin_left: '7vw',
  },
  {
    text: 'Export',
    img: exportIcon,
    onClick: exportEG,
    margin_left: '3vw',
  },
]


  //Funtions for the above MenuItems
function exportEG() {
  console.log('Exporting...');
  let graphJSON = graph.toJSON();
  const file = new Blob([JSON.stringify(graphJSON)], { type: 'application/json'});
    const a = document.createElement("a");
    let url = URL.createObjectURL(file);
    a.href = url;
    a.download = 'graph.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function importEG() {
  console.log('Importing...');
}

export default MenuItems;