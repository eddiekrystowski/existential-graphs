import ReactDOM from 'react-dom';
import * as joint from 'jointjs';
import App from './App';
import { Premise } from './shapes/Premise';
import { Cut } from './shapes/Cut.js'
import  _  from 'lodash'
import  { handleCollisions } from './collisions.js'

console.log("Starting...");


ReactDOM.render(
    <App/>,
    document.getElementById('root')
);

let selected_premise = undefined;

export let graph = new joint.dia.Graph();

const PAPER_SIZE = { width: 4000, height: 4000 };

export let paper = new joint.dia.Paper({
    el: document.getElementById("paper-container"),
    model: graph,
    height: PAPER_SIZE.height,
    width: PAPER_SIZE.width,
    preventContextMenu: false,
    clickThreshold: 1,
});

let rect = new Premise().create()
console.log(rect)
rect.position(100, 30);

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
    let key = event.key
    if (event.keyCode >= 65 && event.keyCode <= 90) {
        let config = {
            text: key,
            x: mousePosition.x - paperContainer.getBoundingClientRect().left - 20,
            y: mousePosition.y - paperContainer.getBoundingClientRect().top - 20
        }
        let new_rect = new Premise().create(config)
    }
    if (event.keyCode === 13) {
        let config = {
            x: mousePosition.x - paperContainer.getBoundingClientRect().left - 20,
            y: mousePosition.y - paperContainer.getBoundingClientRect().top - 20
        }
        if (selected_premise) {
            console.log("premise selected for cut")
            config["child"] = selected_premise
            let new_cut = new Cut().create(config)
            new_cut.toBack()
        } else {
            console.log("creating empty cut")
            let new_cut = new Cut().create(config)
            new_cut.toBack()
            event.preventDefault();
        }
    }
    event.preventDefault()
  });

// paper events
paper.on("element:mouseenter", function( cellView, evt){
    let model = cellView.model
    let modelView = model.findView(paper);
    modelView.showTools()
    model.attr("rect/stroke", "red")
    model.attr("text/fill", "red")
    selected_premise = model
})

paper.on("element:mouseleave", function( cellView, evt){
    let model = cellView.model
    let modelView = model.findView(paper);
    modelView.hideTools()
    model.attr("rect/stroke", "black")
    model.attr("text/fill", "black")
    selected_premise = undefined;
})

// First, unembed the cell that has just been grabbed by the user.
paper.on('cell:pointerdown', function(cellView, evt, x, y) {
    
    let cell = cellView.model;

    if (!cell.get('embeds') || cell.get('embeds').length === 0) {
        // Show the dragged element above all the other cells (except when the
        // element is a parent).
        cell.toFront();
    }
    
    if (cell.get('parent')) {
        graph.getCell(cell.get('parent')).unembed(cell);
    }
});

// When the dragged cell is dropped over another cell, let it become a child of the
// element below.
paper.on('cell:pointerup', function(cellView, evt, x, y) {

    let cell = cellView.model;
    
    handleCollisions(cell)

});