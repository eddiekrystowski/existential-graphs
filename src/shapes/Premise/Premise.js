import * as joint from 'jointjs'
import _ from 'lodash'
import './Premise.css'
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
    create(config, sheet, fast) {
        const options = _.cloneDeep(PREMISE_DEFAULTS);

        if (config) {
          options.position = Object.assign(options.position, config.position);
          options.size = Object.assign(options.size, config.size);
          options.attrs.rect = Object.assign(options.attrs.rect, config.attrs && config.attrs.rect);
          options.attrs.text = Object.assign(options.attrs.text, config.attrs && config.attrs.text);
        }
        options.sheet = sheet;

        const premise = new Premise({
          markup: '<g class="rotatable"><rect/><text/></g>',
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

        premise.addTo(premise.sheet.graph)
      
        //add tools (some events events also)
        if(!fast) this.addTools(premise);

        return premise;
    }

    changeSize(size, time = 500) {
      this.addTransition('attrs/rect/width', size.width, time);
      this.addTransition('attrs/rect/height', size.height, time);
    }

    changePosition(position, time = 500) {
      this.addTransition('position/x', position.x, time);
      this.addTransition('position/y', position.y, time);
    }

    addTransition(path, value, time, timeFunc = joint.util.timing.linear, valueFunc = joint.util.interpolate.number, delay = 100) {
      this.transition(path, value, {
        delay: 0,
        duration: time,
        timingFunction: timeFunc,
        valueFunction: valueFunc
      });
    }

    destroy() {
      this.remove();
      this.sheet.paper.handleDeleteCell();
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

    getArea() {
      return this.attributes.attrs.rect.width * this.attributes.attrs.rect.height;
    }
        
    // move(position, timestep = 1000, frames = 500) {
    //   let difference = {
    //     x: position.x - this.attributes.position.x,
    //     y: position.y - this.attributes.position.y
    //   }
    //   let step = {
    //     x: difference.x / frames,
    //     y: difference.y / frames
    //   }
    //   for (let i = 0; i < frames; i++) {
    //     this.position(this.attributes.position.x + step.x, this.attributes.position.y + step.y);
    //     this.sleep(timestep);
    //   }
    //   console.log("move over!");
    // }

    // sleep(ms) {
    //   return new Promise(resolve => setTimeout(resolve, ms));
    // }
    

    //TODO: see Cut.addTools()
    addTools(element) {
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

