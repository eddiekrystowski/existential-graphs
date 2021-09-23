import importIcon from './MenuIcons/import.png';
import exportIcon from './MenuIcons/export.png';
import logoIcon from './MenuIcons/logo.png';

import { graph } from '../../index.js';

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
    text: 'Existential Graphs',
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
    margin_left: '10vw',
  },
  {
    text: 'Export',
    img: exportIcon,
    onClick: exportEG,
    margin_left: '5vw',
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
  const input = document.createElement("input");
    input.type = "file";
    // choosing the file
    input.onchange = function (ev) {
        const file = ev.target.files[0];
        if (file.type !== "application/json") {
            alert("File must be of .JSON type");
            return;
        }
        // read the file
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = function (readerEvent) {
            const content = readerEvent.target.result;
            const erase = window.confirm("Erase your current workspace and import graph?");
            if (erase) {
                graph.clear();
                const dataObj = JSON.parse(content);
                graph.fromJSON(dataObj);
                
            }
        };
    };
    input.click();
}

export default MenuItems;