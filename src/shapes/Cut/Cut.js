// class for cuts
import * as joint from 'jointjs'
import _ from 'lodash';
import $ from 'jquery';
import Snip from '../../sounds/snip.wav'
import { color } from '../../util/color.js';


const CUT_DEFAULTS = {
    position: {
        x: 10,
        y: 10
    },
    size: {
        width: 40, 
        height: 40
    },
    attrs: {
        rect: {
            class: 'cut_rect',
            width: 40,
            height: 40,
            fill: '#ffffff99',
            stroke: 'black',
            strokeWidth: 2,
        },
        text: {
            class: 'cut_text',
            fontSize: 30,
            'ref-x': 0.5,
            'ref-y': 0.5,
            ref: 'rect',
            'y-alignment': 'middle',
            'x-alignment': 'middle',
        }
    },
    graph: {}
}

export class Cut extends joint.dia.Element {
    defaults() {
        return {
            ...super.defaults,
            type: "dia.Element.Cut",
            attrs: {
                rect: CUT_DEFAULTS.attrs.rect,
                text: CUT_DEFAULTS.attrs.text
            }
        }
    }

    markup = [{
        tagName: "rect",
        selector: "body"
    },{
        tagName: "text",
        selector: "label"
    }]

    //custom constructor for shape, should more or less always use this over the default constructor
    create(config, sheet) {
        const options = _.cloneDeep(CUT_DEFAULTS);
        if (config) {
            options.position = Object.assign(options.position, config.position);
            options.size = Object.assign(options.size, config.size);
            options.attrs.rect = Object.assign(options.attrs.rect, config.attrs && config.attrs.rect);
            options.attrs.text = Object.assign(options.attrs.text, config.attrs && config.attrs.text);
        }
        options.sheet = sheet;

        // adjust size / position if cut was created with a child
        // in order for undo/redo to function properly
        if (config.child) {
            const child = config.child;
            options.attrs.rect.width = child.attributes.attrs.rect.width + options.attrs.rect.width;
            options.attrs.rect.height = child.attributes.attrs.rect.height + options.attrs.rect.height;
            options.position = {
                x: child.attributes.position.x - (options.attrs.rect.width - child.attributes.attrs.rect.width) / 2,
                y: child.attributes.position.y - (options.attrs.rect.height - child.attributes.attrs.rect.height) / 2,
            }
        }
       
        const cut = new Cut({
            markup: '<rect/><text/>',
            position: {
                ...options.position
            },
            size: {
                ...options.size
            },
            attrs: {
                rect: {
                    ...options.attrs.rect
                },
                text: {
                    ...options.attrs.text
                },
                level: 0
            },
            // set custom attributes here:
            sheet: options.sheet
        });

        //have to set this out here since we actually do want a reference to this object, not a copy
        cut.sheet = options.sheet;

        cut.addTo(cut.sheet.graph);
        //add tools (some events events also)
        this.addTools(cut);
        let audio = new Audio(Snip);
        audio.play();
        //check for children
        if (config && config.child) {
            let child = config.child;
            let hasparent = false;
            if (child.get("parent")) {
                let parent = cut.sheet.graph.getCell(child.get("parent"));
                parent.unembed(child);
                parent.embed(cut)
                parent.toBack()
                hasparent = true;
            }
            cut.embed(child)
            if (hasparent) {
                cut.sheet.treeResize(cut, cut.attributes.attrs.rect.width / 2);
            }
        }
        console.log(cut);
        return cut;
    }

    destroy() {
        //check if cut has parents or children, if so children become new children of parent;
        let parent = this.getParentCell();
        let children = this.getEmbeddedCells()
        for (const child of children) {
            this.unembed(child)
        }
        this.remove();
        if (parent) {
            this.sheet.handleCollisions(parent);
        }

        this.sheet.paper.handleDeleteCell();
    }

    active() {
        //cut is being interacted with (ie grabbing, dragging or moving etc)
        this.sheet.colorByLevel(this, {even:color.shapes.background.even.active, odd:color.shapes.background.odd.active, premise: color.shapes.background.default.color});
    }

    inactive() {
        //cut is not being interacted with (ie grabbing, dragging or moving etc)
        this.sheet.colorByLevel(this, {even:color.shapes.background.even.inactive, odd:color.shapes.background.odd.inactive, premise: color.shapes.background.default.color});
    }

    getBoundingBox() {
        return  {
                    width: this.attributes.attrs.rect.width,
                    height: this.attributes.attrs.rect.height,
                    x: this.attributes.position.x,
                    y: this.attributes.position.y
                }
    }

    getArea() {
        return this.attributes.attrs.rect.width * this.attributes.attrs.rect.height;
    }

    // move(position, timestep = 1000, frames = 500) {
    //     let difference = {
    //       x: position.x - this.attributes.position.x,
    //       y: position.y - this.attributes.position.y
    //     }
    //     let step = {
    //       x: difference.x / frames,
    //       y: difference.y / frames
    //     }
    //     for (let i = 0; i < frames; i++) {
    //       this.position(this.attributes.position.x + step.x, this.attributes.position.y + step.y);
    //       this.sleep(timestep);
    //     }
    //     console.log("move over!");
    //   }
  
    //   sleep(ms) {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    //   }

    //TODO: refactor function to not take in element. Instead, can we either store model/element in Cut class or access it directly?
    ///     ( i think we can? )
    addTools(element) {
        //element view is in charge of rendering the elements on the paper
        let elementView = element.findView(element.sheet.paper.jpaper);
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
        $(NWresizeTool.el).on('mousedown', resize_mousedown.bind(element));
        $(NEresizeTool.el).on('mousedown', resize_mousedown.bind(element));
        $(SWresizeTool.el).on('mousedown', resize_mousedown.bind(element));
        $(SEresizeTool.el).on('mousedown', resize_mousedown.bind(element));
    
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
}

Object.assign(joint, {
    "dia.Element": {
        Cut
    }
})




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
    const target = this.sheet.graph.getCell($(event.target).parent().attr('model-id'));
    prev_pos = {
        x: event.clientX,
        y: event.clientY
    }
    
    $(document).on('mouseup', { target }, resize_mouseup);
    $(document).on('mousemove', { target, direction: event.target.getAttribute('data-direction') },  resize_mousemove);
    event.stopPropagation();

    if (target.get('parent')) {
        this.sheet.graph.getCell(target.get('parent')).unembed(target);
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
            throw new RangeError('Invalid direction value. Expected nw, ne, sw, se. Got ' + event.data.direction);
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
    event.data.target.sheet.handleCollisions(event.data.target);
    event.data.target.sheet.paper.onGraphUpdate();
}

function createResizeTool(config) {
    let r = (config && config.r) || 7;
    let fill = (config && config.fill) || "transparent";
    let x = (config && config.x) || "0%";
    let y = (config && config.y) || "0%";
    let offset = (config && config.offset) || {x: 0, y:0};
    let cursor = (config && config.cursor) || "nw-resize";

    let ResizeTool = {
        markup: [{
            tagName: 'circle',
            selector: 'button',
            attributes: {
                'r': r,
                'fill': fill,
                'cursor': cursor,
                'data-direction': cursor.substring(0,2)
            }
        }],
        x: x,
        y: y,
        offset: offset,
        rotate: true,
    };
    return ResizeTool
}

