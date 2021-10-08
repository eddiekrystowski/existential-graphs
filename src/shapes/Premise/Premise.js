import * as joint from 'jointjs'
import _ from 'lodash'
import './Premise.css'
import Pop from '../../sounds/pop.wav'
// class for premises (letters)

const PREMISE_DEFAULTS = {
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
      class: 'premise_rect',
      width: 40, 
      height: 40, 
      fill: '#ffffff00', 
      stroke: 'black', 
      strokeWidth: 0
    },
    text: {
      class: 'premise_text',
      text: 'P',
      fontSize: 50,
      'ref-x': 0.5,
      'ref-y': 0.5,
      ref: 'rect',
      'x-alignment': 'middle',
      'y-alignment': 'middle'
    }
  },
  graph: {}
}

export class Premise extends joint.dia.Element {
    defaults() {
        return {
            ...super.defaults,
            type: "dia.Element.Premise",
            attrs: {
                rect: PREMISE_DEFAULTS.attrs.rect,
                text: PREMISE_DEFAULTS.attrs.text
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
        console.log("GRAPH: ", sheet)
        const options = _.cloneDeep(PREMISE_DEFAULTS);

        if (config) {
          options.position = Object.assign(options.position, config.position);
          options.size = Object.assign(options.size, config.size);
          options.attrs.rect = Object.assign(options.attrs.rect, config.attrs && config.attrs.rect);
          options.attrs.text = Object.assign(options.attrs.text, config.attrs && config.attrs.text);
        }
        options.sheet = sheet;

        const premise = new Premise({
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
              level: 0
          },
          // set custom attributes here:
        });

        //have to set this out here since we actually do want a reference to this object, not a copy
        premise.sheet = options.sheet;

        console.log(premise);
        premise.addTo(premise.sheet.graph)
        //add tools (some events events also)
        this.addTools(premise)

        // Play pop sound
        let pop = new Audio(Pop); 
        pop.play();
        return premise;
    }

    destroy() {
      this.remove();
    }
  
    active() {
      return;
    }

    inactive(){
      return;
    }

    getBoundingBox() {
      return  {
                width: this.attributes.attrs.rect.width,
                height: this.attributes.attrs.rect.height,
                x: this.attributes.position.x,
                y: this.attributes.position.y
              }
    }

    //TODO: see Cut.addTools()
    addTools(element) {
      console.log(element)
      //element view is in charge of rendering the elements on the paper
      let elementView = element.findView(element.sheet.paper.jpaper);
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
      // element.on("change:position", function (eventView) {
      //     element.toFront();
      // });
      // --- end of paper events -----
  }

}

Object.assign(joint.shapes, {
    "dia.Element": {
        Premise
    }
})

