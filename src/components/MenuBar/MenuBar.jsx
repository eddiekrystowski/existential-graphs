import React from 'react';
import MenuItem from './MenuItem.js';
import MenuItems from './MenuItems.js';
import './MenuBar.css';

export default function MenuBar() {
  return (
    <div className="header-bar">
      <div className="header-bar-left">
        {MenuItems.left.map(menu_item => <MenuItem 
                                    text={menu_item.text} 
                                    img={menu_item.img} 
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
                                    onClick={menu_item.onClick} 
                                    custom_style={menu_item.custom_style} 
                                    label={menu_item.label}
                                    key={menu_item.text}
                                  />)}
      </div>
    </div>
  )
}