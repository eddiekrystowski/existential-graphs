// class for cuts
import * as joint from 'jointjs'
import { graph } from '../index.js'
import { addCutTools } from '../tools/CutTools.js'
import _ from 'lodash';


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
            markup: '<g class="rotatable"><g class="scalable"><rect/></g><text/></g>',
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
            },
            // set custom attributes here:
        })
        cut.addTo(graph);
        //add tools (some events events also)
        addCutTools(cut);

        //check for children
        if (config && config.child) {
            let child = config.child
            cut.embed(child)
            cut.attr("rect/width", child.attributes.attrs.rect.width + cut.attributes.attrs.rect.width)
            cut.attr("rect/height", child.attributes.attrs.rect.height + cut.attributes.attrs.rect.height)
            cut.set("position", {
                x: child.attributes.position.x - (cut.attributes.attrs.rect.width - child.attributes.attrs.rect.width) / 2,
                y: child.attributes.position.y - (cut.attributes.attrs.rect.height - child.attributes.attrs.rect.height) / 2,
            })
        }
        console.log(cut)
        return cut;
    }
}

Object.assign(joint, {
    "dia.Element": {
        Cut
    }
})