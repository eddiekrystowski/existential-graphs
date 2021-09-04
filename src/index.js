import ReactDOM from 'react-dom';
import * as joint from 'jointjs';
import App from './App';
import { Premise } from './shapes/Premise';
import { Cut } from './shapes/Cut.js'
import $ from 'jquery'
import  _  from 'lodash'

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


const keys = [];
let mouse_down = false;
let temp_cut = undefined;
let initial_cut_pos = {}

$(document).on('keydown', function(event) {
    keys[event.which] = true;
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

    temp_cut = undefined;
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
        //eslint-disable-next-line
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
    console.log(cell)
    let cellsBelow = findModelsBelow(cell)
    console.log("cellsBelow", cellsBelow)


    if (cellsBelow.length) {
        // Note that the findViewsFromPoint() returns the view for the `cell` itself.
        let cellViewBelow = _.find(cellsBelow, function(c) { return c.id !== cell.id });
        console.log("cellViewBelow", cellViewBelow)
        // Prevent recursive embedding.
        if (cellViewBelow && cellViewBelow.get('parent') !== cell.id) {
            console.log("no recursive embedding detected")
            let model = cellViewBelow
            if (cell.attributes.type === "dia.Element.Premise") {
                console.log("cell is cut", cell)
                model.embed(cell);
                cell.toFront();
            } else if (cell.attributes.type === "dia.Element.Cut") {
                console.log("cell is cut", cell);
                console.log("hi")
                model.toFront()
                cell.embed(model)
                model.toFront()
            } else {
                console.error("Invalid cell type detected!")
            }
        }
    }
});

function findModelsBelow(element) {
    let elementbbox = {
        width: element.attributes.attrs.rect.width,
        height: element.attributes.attrs.rect.height,
        x: element.attributes.position.x,
        y: element.attributes.position.y
    }
    let cells = graph.getCells()
    let collisions = []
    console.log("cells", cells)
    for (const cell of cells) {
        if (cell.id === element.id){
            continue
        }
        let otherbbox = {
            width: cell.attributes.attrs.rect.width,
            height: cell.attributes.attrs.rect.height,
            x: cell.attributes.position.x,
            y: cell.attributes.position.y
        }
        console.log("bbox", elementbbox)
        console.log("otherbbox", otherbbox)
        if (contains(elementbbox,otherbbox)) {
            console.log("contains!", cell)
            collisions.push(cell)
        }
    }
    console.log("colisions", collisions)
    return collisions
}

function contains(bbox, otherbbox) {
    let bbox_info = {
        left_x: bbox.x,
        right_x: bbox.x + bbox.width,
        top_y: bbox.y,
        bottom_y: bbox.y + bbox.height
    }
    let otherbbox_info = {
        left_x: otherbbox.x,
        right_x: otherbbox.x + otherbbox.width,
        top_y: otherbbox.y,
        bottom_y: otherbbox.y + otherbbox.height
    }
    console.log(bbox_info, otherbbox_info)
    if (bbox_info.left_x < otherbbox_info.left_x && bbox_info.right_x > otherbbox_info.right_x && bbox_info.top_y < otherbbox_info.top_y && bbox_info.bottom_y > otherbbox_info.bottom_y) {
        console.log("bbox contains otherbbox", bbox, otherbbox);
        return true;
    } else {
        console.log("nop")
        return false;
    }
}