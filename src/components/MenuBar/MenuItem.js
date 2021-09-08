import React from 'react';

import './MenuBar.css'

export default function MenuItem(props) {

  let size = props.text==='' ? '100%' : '70%';
  let text = props.img==='' ? "150%" : "70%";
  let img_vis = props.img==='' ? "hidden" : "visable";

  return (
    <div style={{marginLeft: props.margin_left, cursor:'pointer'}} className="menu-item" onClick={props.onClick}>
      <img style={{visibility:img_vis}} src={props.img} alt={props.text} width={size+""} height={size+""}/>
      <h4 style={{fontSize: text}}>{props.text}</h4>
    </div>
  )
}