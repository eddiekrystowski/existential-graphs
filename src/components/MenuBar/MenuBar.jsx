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
    //all were moved... keeping comment here for now in case we add more
    // later we can put them here

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