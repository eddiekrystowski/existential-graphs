import ReactDOM from 'react-dom';
import * as joint from 'jointjs';
import App from './App';
import { Premise } from './Premise';

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

let rect = new Premise().create()
console.log(rect)
rect.position(100, 30);
rect.resize(100, 40);

document.addEventListener('keyup', function(event){
    console.log(event)
    if (event.key === "Enter") {
        let new_rect = new Premise().create()
        console.log(new_rect)
    }
  });

// paper events
paper.on("element:mouseenter", function( cellView, evt){
    let model = cellView.model
    model.attr("text/fill", "red")
})

paper.on("element:mouseleave", function( cellView, evt){
    let model = cellView.model
    model.attr("text/fill", "black")
})