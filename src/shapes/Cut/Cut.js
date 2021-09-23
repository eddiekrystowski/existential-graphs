// class for cuts
import * as joint from 'jointjs'
import { graph } from '../../index.js'
import { addCutTools } from '../../tools/CutTools.js'
import { handleCollisions, treeToFront } from '../../util/collisions.js'
import _ from 'lodash';
import Snip from '../../sounds/snip.wav'
import { treeResize, findRoot, findLevel, colorByLevel } from '../../util/treeUtil.js';
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
    }
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
    create(config) {

        const options = _.cloneDeep(CUT_DEFAULTS);
        if (config) {
            options.position = Object.assign(options.position, config.position);
            options.size = Object.assign(options.size, config.size);
            options.attrs.rect = Object.assign(options.attrs.rect, config.attrs && config.attrs.rect);
            options.attrs.text = Object.assign(options.attrs.text, config.attrs && config.attrs.text);
        }

        console.log('options', _.cloneDeep(options));

        
        let cut = new Cut({
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
        })
        cut.addTo(graph);
        //add tools (some events events also)
        addCutTools(cut);

        //check for children
        if (config && config.child) {
            let child = config.child;
            let hasparent = false;
            if (child.get("parent")) {
                let parent = graph.getCell(child.get("parent"));
                parent.unembed(child);
                parent.embed(cut)
                parent.toBack()
                hasparent = true;
            }
            cut.embed(child)
            cut.attr("rect/width", child.attributes.attrs.rect.width + cut.attributes.attrs.rect.width)
            cut.attr("rect/height", child.attributes.attrs.rect.height + cut.attributes.attrs.rect.height)
            cut.set("position", {
                x: child.attributes.position.x - (cut.attributes.attrs.rect.width - child.attributes.attrs.rect.width) / 2,
                y: child.attributes.position.y - (cut.attributes.attrs.rect.height - child.attributes.attrs.rect.height) / 2,
            })
            if (hasparent) {
                treeResize(cut, cut.attributes.attrs.rect.width / 2);
            }
        }
        console.log(cut);
        handleCollisions(cut);

        // Play snip sound
        let snip = new Audio(Snip); 
        snip.play();
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
            handleCollisions(parent);
        }
    }

    active() {
        //cut is being interacted with (ie grabbing, dragging or moving etc)
        colorByLevel(this, {even:color.shapes.background.even.active, odd:color.shapes.background.odd.active, premise: color.shapes.background.default.color});
    }

    inactive() {
        //cut is not being interacted with (ie grabbing, dragging or moving etc)
        colorByLevel(this, {even:color.shapes.background.even.inactive, odd:color.shapes.background.odd.inactive, premise: color.shapes.background.default.color});
    }
}

Object.assign(joint, {
    "dia.Element": {
        Cut
    }
})