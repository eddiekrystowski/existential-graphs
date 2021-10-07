import importIcon from './MenuIcons/import.png';
import exportIcon from './MenuIcons/export.png';
import logoIcon from './MenuIcons/logo.png';

import { graph } from '../../index.js';

const MenuItems = [
  {
    text: '',
    img: './MenuIcons/logo.png',
    onClick: function(){
      window.open('https://github.com/eddiekrystowski/existential-graphs')
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
    img: './MenuIcons/import.png',
    onClick: importEG,
    margin_left: '10vw',
  },
  {
    text: 'Export',
    img: './MenuIcons/export.png',
    onClick: exportEG,
    margin_left: '5vw',
  },
]


  //Funtions for the above MenuItems
//TODO: MAKE IMPORT/EXPORT WORK FOR NEW MULTI-GRAPH SYSTEM
//    - have importEG return a new graph?
//      ex. Paper.graph = importEG();
function exportEG(graph) {
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

// FIXME: graph arg is here just so linter is happy, see above TODO about fixing this
// for multi graph system
// We also have to consider... should this function make a paper? or just set graph of of existing paper...
// return Graph class (components/Paper/Graph/Graph.js)
function importEG(graph) {
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