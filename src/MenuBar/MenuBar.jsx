import React from 'react';
import MenuItem from './MenuItem.js';
import MenuItems from './MenuItems.js';
import './MenuBar.css';

export default function MenuBar() {
  return (
    <div className="header-bar">
      {MenuItems.map(menu_item => <MenuItem text={menu_item.text} img={menu_item.img} onClick={menu_item.onClick} margin_left={menu_item.margin_left}/>)}
    </div>
  )
}