import React from 'react';

import './MenuBar.css'

export default function MenuItem(props) {

  let size = props.text==='' ? '60' : '40';
  let text = props.img==='' ? "175%" : "100%";
  let img_vis = props.img==='' ? "hidden" : "visable";

  return (
    <div style={{marginLeft: props.margin_left, cursor:'pointer'}} className="menu-item" onClick={props.onClick}>
      <img style={{visibility:img_vis}} src={props.img} alt={props.text} width={size+"vw"} height={size+"vh"}/>
      <h4 style={{fontSize: text}}>{props.text}</h4>
    </div>
  )
}