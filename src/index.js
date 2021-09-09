import ReactDOM from 'react-dom';
import * as joint from 'jointjs';
import App from './components/App/App';
import { Premise } from './shapes/Premise/Premise';
import { Cut } from './shapes/Cut/Cut.js'
import $ from 'jquery'
import  _  from 'lodash'
import  { handleCollisions } from './util/collisions.js'

console.log("Starting...");
window.joint = joint

const NSPremise = joint.dia.Element.define('nameSpace.Premise',Premise);
const NSCut = joint.dia.Element.define('nameSpace.Cut',Cut);

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);

let selected_premise = undefined;

export let graph = new joint.dia.Graph({},{cellNamespace: 
    {
    nameSpace: { Premise: NSPremise,
                 Cut: NSCut }
  }
});

const PAPER_SIZE = { width: 4000, height: 4000 };

export let paper = new joint.dia.Paper({
    el: document.getElementById("paper-container"),
    model: graph,
    height: PAPER_SIZE.height,
    width: PAPER_SIZE.width,
    preventContextMenu: false,
    clickThreshold: 1,
},
{cellViewNamespace: 
    {
    nameSpace: { Premise: NSPremise,
                 Cut: NSCut }
  }});

console.log(joint)
let rect = new Premise().create()
console.log(rect)
rect.position(100, 30);

let mousePosition = {
    x: 0,
    y: 0
}

const paperContainer = document.getElementById('paper-container');


const keys = [];
let mouse_down = false;
let temp_cut = undefined;
let initial_cut_pos = {}

$(document).on('keydown', function(event) {
    keys[event.which] = true;
    if (keys[16]) {
        paper.setInteractivity(false);
    }
});

document.addEventListener("mousemove", function(evt){
    mousePosition = {
        x: evt.clientX,
        y: evt.clientY
    }

    if (mouse_down && keys[16] && temp_cut) {
        const mouse_adjusted = {
            x: mousePosition.x - paperContainer.getBoundingClientRect().left,
            y: mousePosition.y - paperContainer.getBoundingClientRect().top
        };
        temp_cut.set('position', {
            x: Math.min(mouse_adjusted.x, initial_cut_pos.x),
            y: Math.min(mouse_adjusted.y, initial_cut_pos.y)
        })
        temp_cut.attr('rect/width', Math.abs(mouse_adjusted.x - initial_cut_pos.x));
        temp_cut.attr('rect/height', Math.abs(mouse_adjusted.y - initial_cut_pos.y));
    }
})

$(document).on('mousedown', function(event) {
    mouse_down = true;
    if (keys[16]) {

        initial_cut_pos = Object.assign({}, mousePosition);
        console.log(initial_cut_pos);
        initial_cut_pos.x -= paperContainer.getBoundingClientRect().left;
        initial_cut_pos.y -= paperContainer.getBoundingClientRect().top;
        let config  = {
            position: Object.assign({}, initial_cut_pos),
            size: {width: 0, height: 0}
        }
        temp_cut = new Cut().create(config);
        event.preventDefault();
    }
});

$(document).on('mouseup', function(event) {
    mouse_down = false;
    if (temp_cut) {
        const position = _.clone(temp_cut.get('position'));
        console.log(position);
        const size = _.clone({width: temp_cut.attr('rect/width'), height: temp_cut.attr('rect/height')});
        console.log(size);
        const config = {
            position: position,
            attrs:{
                rect: {
                    ...size
                }
            }
        }
        //eslint-disable-next-line
        let new_rect = new Cut().create(config);
        temp_cut.remove();
    }

    paper.setInteractivity(true);
    temp_cut = undefined;
});

$(document).on('keyup', function(event){
    console.log(event.which);
    keys[event.which] = false;
    let key = event.key
    //backspace (delete premise or cut)
    if (event.keyCode === 8 ) {
        if (selected_premise) {
            console.log("removing shape")
            if (selected_premise.attributes.type === "dia.Element.Premise") {
                console.log("destroying premise")
                selected_premise.destroy()
            } else if (selected_premise.attributes.type === "dia.Element.Cut") {
                console.log("destroying cut")
                selected_premise.destroy();
            } else {
                console.error("attempted to delete shape of unknown type: " + selected_premise.attributes.type)
            }
        }
    }
    //a-z for creating premise
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
        //eslint-disable-next-line
        let new_rect = new Premise().create(config)
    }
    //ENTER
    // new cut
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
        } else {
            console.log("creating empty cut")
            let new_cut = new Cut().create(config)
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