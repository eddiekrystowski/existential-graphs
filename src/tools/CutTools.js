import * as joint from "jointjs"
import { paper } from "../index.js"
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
        cursor: "nw_resize"
    }));
    let NEresizeTool = new joint.elementTools.Button(createResizeTool({
        x: "100%",
        y:"0%",
        cursor: "ne_resize"
    }));
    let SWresizeTool = new joint.elementTools.Button(createResizeTool({
        x: "0%",
        y:"100%",
        cursor: "sw_resize"
    }));
    let SEresizeTool = new joint.elementTools.Button(createResizeTool({
        x: "100%",
        y:"100%",
        cursor: "se_resize"
    }));

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
