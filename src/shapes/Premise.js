import * as joint from 'jointjs'
import { graph } from '../index.js'
import { addPremiseTools } from '../tools/PremiseTools.js'
import '../css/Premise.css'
import { handleCollisions } from '../collisions.js'
// class for premises (letters)

export class Premise extends joint.dia.Element {
    defaults() {
        return {
            ...super.defaults,
            type: "dia.Element.Premise",
            attrs: {
                rect: { class:"premise", width: 40, height: 40, fill: "white", stroke: "black", strokeWidth: 0},//, width: 100, height: 100 },
                text: { class:"premise",
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
        let type = (config && config.type) || "premise"

        //initial position
        let x = (config && config.x) || 10
        let y = (config && config.y) || 10

        //initial size
        let width = (config && config.width) || 40
        let height = (config && config.height) || 40

        //set initial rect values
        let rect_class = (config && config.shape_class) || type + "_rect"
        let rect_stroke = (config && config.stroke) || "black"
        let strokeWidth = (config && config.strokeWidth) || 0
        let rect_fill = (config && config.rect_fill) || "#ffffff00"

        //set intial text values
        let text_class = (config && config.text) || type + "_text"
        let text = (config && config.text) || "P"
        let text_fill = (config && config.text_fill) || "black"
        let font_size = (config && config.font_size) || 30
        let ref = (config && config.ref) || "rect"
        let ref_x = (config && config.ref_x) || 0.5
        let ref_y = (config && config.ref_y) || 0.5
        let x_alignment = (config && config.x_alignment) || "middle"
        let y_alignment = (config && config.y_alignment) || "middle" 
        
        let premise = new Premise({
            position: {
                x: x,
                y: y,
              },
              size: {
                width: width,
                height: height
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
        premise.addTo(graph)
        //add tools (some events events also)
        addPremiseTools(premise)
        handleCollisions(premise)
        return premise;
        
    }
}

Object.assign(joint.shapes, {
    "dia.Element": {
        Premise
    }
})

