import React from 'react';

import './MenuBar.css'

export default function MenuItem(props) {
  return (
    <div className="menu-item" onClick={props.onClick}>
      <img src={props.img} alt={props.text} width="50vw" height="50vh"/>
      <h3>{props.text}</h3>
    </div>
  )
}