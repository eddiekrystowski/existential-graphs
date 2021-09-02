import * as joint from "jointjs"
import { paper } from "../index.js"

export let selected_element;

export function addRectTools(element) {
    //element view is in charge of rendering the elements on the paper
    let elementView = element.findView(paper);
    //clear any old tools
    elementView.removeTools();
    // boundary tool shows boundaries of element
    let boundaryTool = new joint.elementTools.Boundary();

    let rect_tools = [boundaryTool];

    let toolsView = new joint.dia.ToolsView({
        tools: rect_tools
    });

    elementView.addTools(toolsView);
    //start with tools hidden
    elementView.hideTools();
    element.on("change:position", function (eventView) {
        element.toFront();
    });
    // --- end of paper events -----
}

