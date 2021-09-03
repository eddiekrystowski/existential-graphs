import ReactDOM from 'react-dom';
import * as joint from 'jointjs';
import App from './App';
import { Premise } from './shapes/Premise';

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

let mousePosition = {
    x: 0,
    y: 0
}

const paperContainer = document.getElementById('paper-container');


document.addEventListener("mousemove", function(evt){
    mousePosition = {
        x: evt.clientX,
        y: evt.clientY
    }
})

document.addEventListener('keyup', function(event){
    console.log("lolccopter")
    let key = event.key
    if (event.keyCode >= 65 && event.keyCode <= 90) {
        console.log("hi how are ya")
        let config = {
            text: key,
            x: mousePosition.x - paperContainer.getBoundingClientRect().left - 20,
            y: mousePosition.y - paperContainer.getBoundingClientRect().top - 20
        }
        let new_rect = new Premise().create(config)
    }
    if (event.keycode === "32") {
        return;
    }
    event.preventDefault()
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