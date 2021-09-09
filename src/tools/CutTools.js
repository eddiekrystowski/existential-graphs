import * as joint from "jointjs"
import $ from 'jquery';
import { graph, paper } from "../index.js"
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

    console.log('nw resize', NWresizeTool);

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


//$('.nw-resize').on('mousedown', resize_mousedown);

let mousedown_pos = {
    x: 0,
    y: 0
}

let current_pos = {
    x: 0,
    y: 0
}

function resize_mousedown(event) {
    const target = graph.getCell($(event.target).parent().attr('model-id'));
    console.log('target model', target);
    mousedown_pos = {
        x: event.clientX,
        y: event.clientY
    }
    
    $(document).on('mouseup', resize_mouseup);
    $(document).on('mousemove', { target, self: event.target },  resize_mousemove);
    event.stopPropagation();
}

function resize_mousemove(event) {
    current_pos = {
        x: event.clientX,
        y: event.clientY
    }

    const size = {
        width: event.data.target.attributes.attrs.rect.width,
        height: event.data.target.attributes.attrs.rect.height
    };

    console.log(event.data.target);
    console.log(size);
    const delta = {
        x: current_pos.x - mousedown_pos.x,
        y: current_pos.y - mousedown_pos.y
    }

    event.data.target.attr('rect/width', Math.max(80, size.width + delta.x));
    event.data.target.attr('rect/height', Math.max(80, size.height + delta.y));
    
    mousedown_pos = Object.assign({}, current_pos);

}

function resize_mouseup (event) {
    $(document).off('mouseup', resize_mouseup);
    $(document).off('mousemove', resize_mousemove);
}