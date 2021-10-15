import React from 'react';
import importIcon from './MenuIcons/import.png';
import exportIcon from './MenuIcons/export.png';
import logoIcon from './MenuIcons/logo.png';

import './MenuBar.css'

export default function MenuItem(props) {


  const styling = `
    .cls-1{
      fill:#ed6b4d;
      stroke:#e2f3f7;
      stroke-miterlimit:10;
      stroke-width:12px;
    }
    .cls-2 {
      fill:#e2f3f7;
    }
  `;

  //get SVG path of icon to include instead of PNG because unless we make the PNGs the correct size to begin with,
  //it will cause weird scaling issues when it tries to fix the aspect ratio
  const SVGS = {
    './MenuIcons/logo.png': <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.23 762.74" width="8vh" height="8vh"><defs><style>{styling}</style></defs><path class="cls-1" d="M1022,769v96.74q0,19.28-3.79,30.81a49,49,0,0,1-13.94,20.83q-10.17,9.28-26,17.9Q932.46,960,890.12,971.41t-92.27,11.36q-58.17,0-106-17.91t-81.58-52q-33.75-34.08-51.81-82.62Q543.75,790.83,541,743.9c-1,0-1.92,0-2.9,0H256.29q-33.87,0-48.71-15t-14.84-48.54V295.58q0-22.33,6.63-36.49a41.18,41.18,0,0,1,20.78-20.6Q234.3,232,256.29,232H530.06q24.78,0,36.84,11t12,28.81q0,18.15-12,29.15t-36.84,11H296.45V437.7h215.1q23.74,0,35.44,10.65t11.7,28.11q0,17.48-11.52,28.46t-35.62,11H296.45V661.53H538.09q3.76,0,7.26.27a287.88,287.88,0,0,1,12.56-47.73q17.55-48.89,51.64-83t83-52.15q48.88-18.07,110.85-18.08,51,0,90.2,13.6t63.69,34.25q24.43,20.67,36.83,43.73t12.39,41q0,19.29-14.28,32.88a47.94,47.94,0,0,1-34.26,13.6,46.05,46.05,0,0,1-21.17-5.17,48,48,0,0,1-17-14.46q-18.93-29.6-32-44.75T852.42,550q-22.2-10.34-56.63-10.33-35.46,0-63.34,12.22a130.87,130.87,0,0,0-47.68,35.46q-19.8,23.24-30.3,57T644,719.07q0,88.81,40.8,136.67t113.77,47.85a231.88,231.88,0,0,0,66.62-9.3,337.73,337.73,0,0,0,63.17-26.51V785.85H849.15q-28.57,0-43.21-8.61T791.31,748q0-16.86,12.22-27.88t33.22-11h116q21.35,0,36.15,3.79a40.81,40.81,0,0,1,23.92,16.87Q1022,742.82,1022,769Z" transform="translate(-186.74 -226.03)"/></svg>
    ,'./MenuIcons/export.png': <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.24 898.25" width="4vh" height="4vh"><defs><style>{styling}</style></defs><path class="cls-2" d="M1020.62,789.78v249a40.18,40.18,0,0,1-40.18,40.17H219.56a40.18,40.18,0,0,1-40.18-40.17v-249a40.18,40.18,0,0,1,40.18-40.18h58.25A40.18,40.18,0,0,1,318,789.78V940.34H882V789.78a40.18,40.18,0,0,1,40.17-40.18h58.25A40.18,40.18,0,0,1,1020.62,789.78Z" transform="translate(-179.38 -180.69)"/><path class="cls-2" d="M384.19,390.1,533.64,240.66l48.21-48.21a38.5,38.5,0,0,1,55.4,0l48.22,48.22L834.9,390.1a40.17,40.17,0,0,1,0,56.81L793.71,488.1a40.17,40.17,0,0,1-56.81,0L679,430.18V751.79A40.18,40.18,0,0,1,638.81,792H580.55a40.18,40.18,0,0,1-40.17-40.17V429.91L482.19,488.1a40.17,40.17,0,0,1-56.81,0l-41.19-41.19A40.17,40.17,0,0,1,384.19,390.1Z" transform="translate(-179.38 -180.69)"/><path class="cls-2" d="M665.69,620.82a40.39,40.39,0,0,1-5.61,7L618.9,669a40.08,40.08,0,0,1-29.11,11.76A40,40,0,0,0,617.48,669Z" transform="translate(-179.38 -180.69)"/><path class="cls-2" d="M589.79,680.79A40,40,0,0,1,560.67,669l-41.19-41.19a40.14,40.14,0,0,1-5.62-7L562.08,669A40,40,0,0,0,589.79,680.79Z" transform="translate(-179.38 -180.69)"/></svg>
    ,'./MenuIcons/import.png': <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.24 898.26" width="4vh" height="4vh"><defs><style>{styling}</style></defs><path class="cls-2" d="M1020.62,789.78v249a40.18,40.18,0,0,1-40.18,40.17H219.56a40.18,40.18,0,0,1-40.18-40.17v-249a40.18,40.18,0,0,1,40.18-40.18h58.25A40.18,40.18,0,0,1,318,789.78V940.34H882V789.78a40.18,40.18,0,0,1,40.17-40.18h58.25A40.18,40.18,0,0,1,1020.62,789.78Z" transform="translate(-179.38 -180.68)"/><path class="cls-2" d="M834.91,582.54,685.46,732l-48.21,48.21a38.5,38.5,0,0,1-55.4,0L533.63,732,384.2,582.54a40.17,40.17,0,0,1,0-56.81l41.19-41.19a40.17,40.17,0,0,1,56.81,0l57.92,57.92V220.85a40.18,40.18,0,0,1,40.17-40.17h58.26a40.18,40.18,0,0,1,40.17,40.17V542.73l58.19-58.19a40.17,40.17,0,0,1,56.81,0l41.19,41.19A40.17,40.17,0,0,1,834.91,582.54Z" transform="translate(-179.38 -180.68)"/><path class="cls-2" d="M665.69,620.82a40.39,40.39,0,0,1-5.61,7L618.9,669a40.08,40.08,0,0,1-29.11,11.76A40,40,0,0,0,617.48,669Z" transform="translate(-179.38 -180.68)"/><path class="cls-2" d="M589.79,680.79A40,40,0,0,1,560.67,669l-41.19-41.19a40.14,40.14,0,0,1-5.62-7L562.08,669A40,40,0,0,0,589.79,680.79Z" transform="translate(-179.38 -180.68)"/></svg>
  }
  let size = props.text==='' ? '100%' : '70%';
  let text = props.img==='' ? "100%" : "70%";
  let img_vis = props.img==='' ? "hidden" : "visable";

  const style = props.custom_style;

  return (
    <div style={style} className="menu-item" onClick={props.onClick} aria-label={props.label}>
      {SVGS[props.img]}
      {/* <img style={{visibility:img_vis}} src={props.img} alt={props.text} width={size+""} height={size+""}/> */}
      <h4 style={{fontSize: text}}>{props.text}</h4>
    </div>
  )
}

