import ReactDOM from 'react-dom';
import * as joint from 'jointjs';
import App from './App';
import { Premise } from './shapes/Premise';
import { Cut } from './shapes/Cut.js'
import $ from 'jquery'
import { initial } from 'underscore';

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
rect.resize(100, 40);

let mousePosition = {
    x: 0,
    y: 0
}

const paperContainer = document.getElementById('paper-container');


const keys = [];
let mouse_down = false;
let temp_cut;
let initial_cut_pos = {}

$(document).on('keydown', function(event) {
    keys[event.which] = true;
});

document.addEventListener("mousemove", function(evt){
    mousePosition = {
        x: evt.clientX,
        y: evt.clientY
    }

    if (mouse_down && keys[16]) {

    }
})

$(document).on('mousedown', function(event) {
    mouse_down = true;
    if (keys[16]) {

        let config  = {
            position: Object.assign({}, mousePosition),
            size: {width: 0, height: 0}
        }
    }
});

$(document).on('mouseup', function(event) {
    mouse_down = false;
});

$(document).on('keyup', function(event){
    console.log(event.which);
    keys[event.which] = false;
    let key = event.key
    if (event.keyCode >= 65 && event.keyCode <= 90) {
        let config = {
            //use capital letters by default, can press shift to make lowercase
            attrs:{
                text: {
                    text:event.shiftKey ? key.toLocaleLowerCase() : key.toLocaleUpperCase()
                }
            },
            position: {
                x: mousePosition.x - paperContainer.getBoundingClientRect().left - 20,
                y: mousePosition.y - paperContainer.getBoundingClientRect().top - 20
            }
        }
        let new_rect = new Premise().create(config)
    }
    //ENTER
    if (event.keyCode === 13) {
        let config = {
            position: {
                x: mousePosition.x - paperContainer.getBoundingClientRect().left - 20,
                y: mousePosition.y - paperContainer.getBoundingClientRect().top - 20
            }
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
            console.log("cut", new_cut)
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