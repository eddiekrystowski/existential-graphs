import ReactDOM from 'react-dom';
import * as joint from 'jointjs';

import App from './App';

console.log("Starting...");


ReactDOM.render(
    <App/>,
    document.getElementById('root')
);

export let graph = new joint.dia.Graph();

const PAPER_SIZE = { width: 4000, height: 4000 };

export let paper = new joint.dia.Paper({
    el: document.getElementById("paper-container"),
    model: graph,
    height: PAPER_SIZE.height,
    width: PAPER_SIZE.width,
    gridSize: 10,
    drawGrid: true,
    preventContextMenu: false,
    clickThreshold: 1,
});