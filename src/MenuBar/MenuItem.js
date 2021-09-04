import React from 'react';

export default function MenuItem(props) {
  return (
    <div className="menu-item" onClick={props.onClick}>
      <img src={props.img} alt={props.text}/>
      <h3>{props.text}</h3>
    </div>
  )
}