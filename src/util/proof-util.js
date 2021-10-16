import { Cut } from "../shapes/Cut/Cut"
import  { handleCollisions} from './collisions.js'
import E from '../EventController.js'



export const inferenceInsertion = function(sheet, model, mousePosition) {
  console.log('ARGS', arguments);
  if(model.__proto__.constructor.name == "Cut" && model.attributes.embeds?.length == 1) return;
  const paper = sheet.paper;
  paper.props.handleOpenModal(mousePosition);
}

export const inferenceErasure = function(sheet, model) {
  console.log(model.attributes.attrs.level)
  if(model.attributes.attrs.level%2 === 0) {
    const children = model.attributes.attrs.embeds;
    model.destroy();
    if(model.attributes.parent) {
      sheet.handleCollisions(sheet.graph.getCell(model.attributes.parent));
    }
    else {
      children?.forEach(element => {
          if(sheet.graph.getCell(element).__proto__.constructor.name === "Cut") {
            sheet.handleCollisions(sheet.graph.getCell(element))
          }
      });
    }  
  }
}

export const insertDoubleCut = function(sheet, model, mousePosition={}) {
    let position = {};
    let size = {}
    if (!model && mousePosition) {
        position = mousePosition;
        size = { width: 40, height: 40 }
    }
    else if (model){
        position = model.get('position');
        size = { width: model.attr('rect/width'), height: model.attr('rect/height') }
    }
    else {
        throw new Error('Bad arguments');
    }
    const multipliers = [0.5, 0.25];
    for(let i = 0; i < multipliers.length; i++) { 
        sheet.addCut({
            position:  {
              x: model.get('position').x - (size.width * multipliers[i]/2),
              y: model.get('position').y - (size.height * multipliers[i]/2)
            },
            attrs: {
                rect: {
                    width: size.width * (1 + multipliers[i]),
                    height: size.height * (1 + multipliers[i])
                }
            }
        });
    }  
}

export const deleteDoubleCut = function(sheet, model) {
    console.log("MODEL: ", model);
    const graph = sheet.graph;
    if(model.__proto__.constructor.name === "Cut" && model.attributes.embeds?.length === 1 && 
        graph.getCell(model.attributes.embeds[0]).__proto__.constructor.name === "Cut") {
        const children = graph.getCell(model.attributes.embeds[0]).attributes.embeds;
        graph.getCell(model.attributes.embeds[0]).destroy();
        model.destroy();
        if(model.attributes.parent) {
          sheet.handleCollisions(graph.getCell(model.attributes.parent));
        }
        else {
          children?.forEach(element => {
              if(graph.getCell(element).__proto__.constructor.name === "Cut") {
                sheet.handleCollisions(graph.getCell(element))
              }
          });
        }
    }
}

export const iteration = function(sheet, model) {
}

export const deiteration = function(sheet, model) {
}