import { graph } from '../../index.js';

const fs = require('../../util/file-system')

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
function exportEG() {
  fs.saveGraphAsJSON(graph)
}

// FIXME: graph arg is here just so linter is happy, see above TODO about fixing this
// for multi graph system
// We also have to consider... should this function make a paper? or just set graph of of existing paper...
// return Graph class (components/Paper/Graph/Graph.js)

//Funtions for the above MenuItems. Created to avoid error of not initialized graph.


function importEG() {
  fs.loadGraphFromJSON(graph)
}

export default MenuItems;