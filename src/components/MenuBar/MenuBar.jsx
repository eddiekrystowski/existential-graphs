import React from 'react';
import MenuItem from './MenuItem.js';
import './MenuBar.css';
import { cellInArray } from '../../util/otherUtil.js';

export default function MenuBar(props) {
  //have to have menu items inside Menu Bar here since some buttons (such as the mute button) are responsible
  //for updating the state of other components, so their on click event handlers will come through props
  const MenuItems = {
    //menu items that float left on the menu bar
    left: [
      {
        text: '',
        img: './MenuIcons/logo.png',
        onClick: function(){
          window.open('https://github.com/eddiekrystowski/existential-graphs')
        },
        custom_style: {
          marginLeft: '0vw'
        }
      },
      {
        text: 'Existential Graphs',
        img: '',
        onClick: function(){
          return;
        },
        custom_style: {
          marginLeft: '1vw'
        }
      },
      {
        text: 'Import',
        img: './MenuIcons/import.png',
        onClick: props.importMainGraph,
        custom_style: {
          marginLeft: '10vw'
        }
      },
      {
        text: 'Export',
        img: './MenuIcons/export.png',
        onClick: props.exportMainGraph,
        custom_style: {
          marginLeft: '5vw'
        }
      },
    ],

    //menu items that float right on the menu bar
    right: [
      {
        text: 'Unmute',
        label: 'Toggle Sound',
        classString: 'mute-active',
        img: './MenuIcons/export.png',
        onClick: props.handleMuteToggle,
        custom_style: {
          marginLeft: '5vw'
        }
      },
      {
        text: 'Settings',
        img: './MenuIcons/export.png',
        onClick: () => {},
        custom_style: {
          marginLeft: '5vw'
        }
      }
    ]
  }
  
    //Funtions for the above MenuItems
  //TODO: MAKE IMPORT/EXPORT WORK FOR NEW MULTI-GRAPH SYSTEM
  //    - have importEG return a new graph?
  //      ex. Paper.graph = importEG();
  // function exportEG() {
  //   console.log('func: ', props.getGraphForExport.toString());
  //   console.log('Exporting...', props.getGraphForExport());
  //   const graph = props.getGraphForExport();
  //   // delete graph.changed;
  //   let graphJSON = graph.toJSON();
  //   for(let i = 0; i < graphJSON.cells.length; i++) {
  //     delete graphJSON.cells[i].sheet;
  //   }

  //   console.log(graphJSON);
  //   const file = new Blob([JSON.stringify(graphJSON, null, 2)], { type: 'application/json'});
  //     const a = document.createElement("a");
  //     let url = URL.createObjectURL(file);
  //     a.href = url;
  //     a.download = 'graph.json';
  //     document.body.appendChild(a);
  //     a.click();
  //     setTimeout(function () {
  //         document.body.removeChild(a);
  //         window.URL.revokeObjectURL(url);
  //     }, 0);
  // }
  
  // // FIXME: graph arg is here just so linter is happy, see above TODO about fixing this
  // // for multi graph system
  // // We also have to consider... should this function make a paper? or just set graph of of existing paper...
  // // return Graph class (components/Paper/Graph/Graph.js)
  // function importEG() {
  //   console.log('Importing...');
  //   const input = document.createElement("input");
  //     input.type = "file";
  //     // choosing the file
  //     input.onchange = function (ev) {
  //         const file = ev.target.files[0];
  //         if (file.type !== "application/json") {
  //             alert("File must be of .JSON type");
  //             return;
  //         }
  //         // read the file
  //         const reader = new FileReader();
  //         reader.readAsText(file, 'UTF-8');
  //         reader.onload = function (readerEvent) {
  //             const content = readerEvent.target.result;
  //             const erase = window.confirm("Erase your current workspace and import graph?");
  //             if (erase) {
  //                 // graph.clear();
  //                 // const dataObj = JSON.parse(content);
  //                 // graph.fromJSON(dataObj);
  //                 //props.setGraphDataOnImport(content);

  //                 const dataObj = JSON.parse(content);
  //                 parseJSON(dataObj.cells);

  //             }
  //         };
  //     };
  //     input.click();
  // }

  // function parseJSON(cells) {
  //   console.log("CELLS:", cells)
  //   const ids = {};
  //   let i = 0;
  //   while (i < cells.length) {
  //     const type = cells[i].type;

  //     if (cells[i].parent && !ids.hasOwnProperty(cells[i].parent)) {
  //       console.log('has parent, skipping for now...')
  //       i++;
  //       continue;
  //     }

  //     if (type === "dia.Element.Cut") {

  //     }
  //     else if (type === "dia.Element.Premise") {
        
  //     }
  //     i++;
  //   }
  // }
  
  return (
    <div className="header-bar">
      <div className="header-bar-left">
        {MenuItems.left.map(menu_item => <MenuItem 
                                    text={menu_item.text} 
                                    img={menu_item.img}
                                    classString={menu_item.classString} 
                                    onClick={menu_item.onClick} 
                                    custom_style={menu_item.custom_style} 
                                    label={menu_item.label}
                                    key={menu_item.text}
                                  />)}
      </div>
      <div className="header-bar-right">
        {MenuItems.right.map(menu_item => <MenuItem 
                                    text={menu_item.text} 
                                    img={menu_item.img} 
                                    classString={menu_item.classString} 
                                    onClick={menu_item.onClick} 
                                    custom_style={menu_item.custom_style} 
                                    label={menu_item.label}
                                    key={menu_item.text}
                                  />)}
      </div>
    </div>
  )
}