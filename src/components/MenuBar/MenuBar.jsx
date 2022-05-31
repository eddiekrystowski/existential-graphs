import React from 'react';
import MenuItem from './MenuItem.js';
import './MenuBar.css';

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
        onClick: importEG,
        custom_style: {
          marginLeft: '10vw'
        }
      },
      {
        text: 'Export',
        img: './MenuIcons/export.png',
        onClick: exportEG,
        custom_style: {
          marginLeft: '5vw'
        }
      },
    ],

    //menu items that float right on the menu bar
    right: [
      {
        text: props.muted  ? 'Muted' : 'Unmuted',
        label: 'Toggle Sound',
        classString: props.muted  ? 'muted' : 'unmuted',
        img: props.muted  ? 'muted' : 'unmuted',
        onClick: props.handleMuteToggle,
        custom_style: {
          marginLeft: '5vw'
        }
      },
      {
        text: 'Settings',
        img: 'settings',
        onClick: () => {},
        custom_style: {
          marginLeft: '5vw',
          height: '4vw',
          width: '4vw',
        }
      }
    ]
  }
  
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