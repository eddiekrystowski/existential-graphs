// class for cuts
import * as joint from 'jointjs'
import { graph } from '../index.js'
import { addCutTools } from '../tools/CutTools.js'

export class Cut extends joint.dia.Element {
    defaults() {
        return {
            ...super.defaults,
            type: "dia.Element.Cut",
            attrs: {
                rect: { class:"cut", width: 0, height: 0, fill: "white", stroke: "black", strokeWidth: 1},//, width: 100, height: 100 },
                text: { class:"cut",
                  "font-size": 30,
                  "ref-x": 0.5,
                  "ref-y": 0.5,
                  ref: "rect",
                  "y-alignment": "middle",
                  "x-alignment": "middle"
                }
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
        //class
        let type = (config && config.type) || "cut"

        //initial position
        let x = (config && config.x) || 10
        let y = (config && config.y) || 10

        //initial size
        let width = (config && config.width) || 40 
        console.log(width)
        let height = (config && config.height) || 40
        console.log(height)

        //set initial rect values
        let rect_class = (config && config.shape_class) || type + "_rect"
        let rect_stroke = (config && config.stroke) || "black"
        let strokeWidth = (config && config.strokeWidth) || 2
        let rect_fill = (config && config.rect_fill) || "#ffffff00"

        //set intial text values
        let text_class = (config && config.text) || type + "_text"
        let text = (config && config.text) || ""
        let text_fill = (config && config.text_fill) || "black"
        let font_size = (config && config.font_size) || 30
        let ref = (config && config.ref) || "rect"
        let ref_x = (config && config.ref_x) || 0.5
        let ref_y = (config && config.ref_y) || 0.5
        let x_alignment = (config && config.x_alignment) || "middle"
        let y_alignment = (config && config.y_alignment) || "middle" 
        
        let cut = new Cut({
            position: {
                x: x,
                y: y,
              },
              attrs: {
                rect: {
                    width: width,
                    height: height,
                    class: rect_class,
                    fill: rect_fill,
                    stroke: rect_stroke,
                    strokeWidth: strokeWidth
                },
                  //class: config.type+"-rect",
                text: {
                  class: text_class,
                  text: text,
                  fill: text_fill,
                  ref: ref,
                  "ref-x": ref_x,
                  "ref-y": ref_y,
                  "x-alignment": x_alignment,
                  "y-alignment": y_alignment,
                  "font-size": font_size
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
            console.log(cut)
            cut.attr("rect/width", child.attributes.attrs.rect.width + cut.attributes.attrs.rect.width)
            cut.attr("rect/height", child.attributes.attrs.rect.height + cut.attributes.attrs.rect.height)
            cut.set("position", {
                x: child.attributes.position.x - (cut.attributes.attrs.rect.width - child.attributes.attrs.rect.width) / 2,
                y: child.attributes.position.y - (cut.attributes.attrs.rect.height - child.attributes.attrs.rect.height) / 2,
            })
;        }

        return cut;
        
    }
}

Object.assign(joint.shapes, {
    "dia.Element": {
        Cut
    }
})