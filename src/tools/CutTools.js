import * as joint from "jointjs"
import $ from 'jquery';
import { graph, paper } from "../index.js"
import { handleCollisions } from "../util/collisions.js";
import { createResizeTool } from "./ResizeTool.js" 


export function addCutTools(element) {
    //element view is in charge of rendering the elements on the paper
    let elementView = element.findView(paper);
    //clear any old tools
    elementView.removeTools();
    // boundary tool shows boundaries of element
    let boundaryTool = new joint.elementTools.Boundary();

    let NWresizeTool = new joint.elementTools.Button(createResizeTool({
        x: "0%",
        y:"0%",
        cursor: "nw-resize"
    }));
    let NEresizeTool = new joint.elementTools.Button(createResizeTool({
        x: "100%",
        y:"0%",
        cursor: "ne-resize"
    }));
    let SWresizeTool = new joint.elementTools.Button(createResizeTool({
        x: "0%",
        y:"100%",
        cursor: "sw-resize"
    }));
    let SEresizeTool = new joint.elementTools.Button(createResizeTool({
        x: "100%",
        y:"100%",
        cursor: "se-resize"
    }));

    //add event handlers to tools for resizing
    $(NWresizeTool.el).on('mousedown', resize_mousedown);
    $(NEresizeTool.el).on('mousedown', resize_mousedown);
    $(SWresizeTool.el).on('mousedown', resize_mousedown);
    $(SEresizeTool.el).on('mousedown', resize_mousedown);

    let rect_tools = [boundaryTool, NWresizeTool, NEresizeTool, SEresizeTool, SWresizeTool];

    let toolsView = new joint.dia.ToolsView({
        tools: rect_tools
    });

    elementView.addTools(toolsView);
    //start with tools hidden
    elementView.hideTools();
    // element.on("change:position", function (eventView) {
    //     element.toFront();
    // });
    // --- end of paper events -----
}


//global objects for cut resizing
let prev_pos = {
    x: 0,
    y: 0
}

let current_pos = {
    x: 0,
    y: 0
}

//TODO: THIS NEEDS TO CHANGE BASED ON HOW MANY THINGS ARE IN THE
//CUT AND WHERE THEY ARE
const MIN_SIZE = {
    width: 40,
    height: 40
}

/**
 * Event handler that sets up resizing when the user first puts their mouse down
 * on a resize tool.
 * @param {MouseEvent} event
 */
function resize_mousedown(event) {
    const target = graph.getCell($(event.target).parent().attr('model-id'));
    console.log('target model', target);
    prev_pos = {
        x: event.clientX,
        y: event.clientY
    }
    
    $(document).on('mouseup', { target }, resize_mouseup);
    $(document).on('mousemove', { target, direction: event.target.getAttribute('data-direction') },  resize_mousemove);
    event.stopPropagation();

    if (target.get('parent')) {
        graph.getCell(target.get('parent')).unembed(target);
    }
}

/**
 * Performs different resizing algorithms based on the direction of resizing
 * @param {MouseEvent} event `event.data` has the following data:
 *          * target: Cut object representing what Cut the tool belongs to
 */
function resize_mousemove(event) {
    //update current pos to mouse position
    current_pos = {
        x: event.clientX,
        y: event.clientY
    }

    //extract copy of size from target Cut 
    const size = {
        width: event.data.target.attributes.attrs.rect.width,
        height: event.data.target.attributes.attrs.rect.height
    };

    //extract copy of position from target Cut
    const position = {
        x: event.data.target.attributes.position.x,
        y: event.data.target.attributes.position.y
    }

    //calclulate change in mouse position
    const delta = {
        x: current_pos.x - prev_pos.x,
        y: current_pos.y - prev_pos.y
    }

    //define modifiers to determine how
    //size/position should respond to the deltas
    const modifiers = {
        size_x: 1,
        size_y: 1,
        pos_x: 0,
        pos_y: 0
    }

    //set the modifiers based on the direction we are resizing
    switch (event.data.direction) {
        case 'nw':
            modifiers.size_x = -1;
            modifiers.size_y = -1;
            modifiers.pos_x = 1;
            modifiers.pos_y = 1;
            break;
        case 'ne':
            modifiers.size_x = 1;
            modifiers.size_y = -1;
            modifiers.pos_x = 0;
            modifiers.pos_y = 1;
            break;
        case 'sw':
            modifiers.size_x = -1;
            modifiers.size_y = 1;
            modifiers.pos_x = 1;
            modifiers.pos_y = 0;
            break;
        case 'se':
            modifiers.size_x = 1;
            modifiers.size_y = 1;
            modifiers.pos_x = 0;
            modifiers.pos_y = 0;
            break;
        default:
            throw new RangeError('Invalid direction value. Expected nw, ne, sw, se. Got ' + event.data.irection);
    }
    
    //if the resize will put us at under MIN_SIZE, then set respective delta to 0 to cancel resize
    if (size.width + modifiers.size_x * delta.x < MIN_SIZE.width) delta.x = 0;
    if (size.height + modifiers.size_y * delta.y < MIN_SIZE.height) delta.y = 0;

    //set size based on modifiers and deltas
    event.data.target.attr('rect/width',  size.width + modifiers.size_x * delta.x);
    event.data.target.attr('rect/height', size.height + modifiers.size_y * delta.y);

    //adjust position to offset size changes in certain directions
    event.data.target.set('position',  { x: position.x + modifiers.pos_x * delta.x, y: position.y + modifiers.pos_y * delta.y});
    
    //copy current_pos to prev_pos
    prev_pos = Object.assign({}, current_pos);
}

/**
 * Cleans up resize event
 * @param {MouseEvent} event `event.data` has the following data:
 *          * target: Cut object representing what Cut the tool belongs to
 */
function resize_mouseup (event) {
    $(document).off('mouseup', resize_mouseup);
    $(document).off('mousemove', resize_mousemove);
    handleCollisions(event.data.target);
}