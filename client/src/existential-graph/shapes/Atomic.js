import * as joint from 'jointjs'
import _ from 'lodash';

const ATOMIC_DEFAULTS = {
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
        class: 'atomic_rect',
        width: 40, 
        height: 40, 
        fill: '#ffffff00', 
        stroke: 'black', 
        strokeWidth: 0
      },
      text: {
        class: 'atomic_text',
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

export default class Atomic extends joint.dia.Element {
    defaults() {
        return {
            ...super.defaults,
            type: "dia.Element.Atomic",
            attrs: {
                rect: ATOMIC_DEFAULTS.attrs.rect,
                text: ATOMIC_DEFAULTS.attrs.text,
                locked: false
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
    create(config, graphController, fast) {
        const options = _.cloneDeep(ATOMIC_DEFAULTS);

        if (config) {
          options.position = Object.assign(options.position, config.position);
          options.size = Object.assign(options.size, config.size);
          options.attrs.rect = Object.assign(options.attrs.rect, config.attrs && config.attrs.rect);
          options.attrs.text = Object.assign(options.attrs.text, config.attrs && config.attrs.text);
        }
        options.graphController = graphController;

        const premise = new Atomic({
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
        premise.graphController = options.graphController;

        premise.addTo(premise.graphController.graph)
        console.log('added ?')
      
        //add tools (some events events also)
        if(!fast) this.addTools(premise);

        return premise;
    }


    destroy() {
      if (this.isLocked()) return;
        
      this.remove();
      //this.sheet.paper.handleDeleteCell();
    }
  
    obliterate() {
      this.destroy();
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

    enableTools() {
        let elementView = this.findView(this.graphController.paper.paper);
        elementView.showTools();
    }
    
    disableTools() {
        let elementView = this.findView(this.graphController.paper.paper);
        elementView.hideTools();
    }

    lock() {
      this.attr('locked', true)
      this.disableTools()
    }

    unlock () {
      this.attr('locked', false)
      this.enableTools()
    }

    isLocked() {
      return this.attr("locked")
    }

    setColor(color) {
      this.attr("rect/fill", color)
    }
  
    //TODO: see Cut.addTools()
    addTools(element) {
      //element view is in charge of rendering the elements on the paper
      let elementView = element.findView(element.graphController.existential_graph.paper);
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
        Atomic
    }
})