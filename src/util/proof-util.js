import { Cut } from "../shapes/Cut/Cut"
import  { handleCollisions} from './collisions.js'
import E from '../EventController.js'



export const inferenceInsertion = function(sheet, model, mousePosition) {
  console.log('ARGS', arguments);
  if(model.__proto__.constructor.name == "Cut" && (model.attributes.level) % 2 === 0) return;
  console.log('opening modal...')
  const paper = sheet.paper;
  paper.props.handleOpenModal(mousePosition);
}

export const inferenceErasure = function(sheet, model) {
  console.log(model.attributes.attrs.level)
  if(model.attributes.attrs.level % 2 === 0) {
    const children = model.getEmbeddedCells({deep: true});
    const parent = sheet.graph.getCell(model.attributes.parent);

    model.destroy();
    for (let i = 0; i < children.length; i++){
      children[i].destroy();
    }

    if(parent) {
      sheet.handleCollisions(parent);
    }
  }
}

export const insertDoubleCut = function(sheet, model, mousePosition={}) {
    let position = {};
    let size = {}
    if (!model && mousePosition) {
        position = mousePosition;
        size = { width: 80, height: 80 }
    }
    else if (model){
        position = model.get('position');
        size = { width: model.attr('rect/width'), height: model.attr('rect/height') }
    }
    else {
        throw new Error('Bad arguments');
    }
    const multipliers = [0.8, 0.25];
    for(let i = 0; i < multipliers.length; i++) { 
        sheet.addCut({
            position:  {
              x: position.x - (size.width * multipliers[i]/2),
              y: position.y - (size.height * multipliers[i]/2)
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

  const premise_text = model.attributes.attrs.text.text;
  const premise_id = model.id;

  if(model.__proto__.constructor.name === "Premise") {

    let ancestor = model;

    while(ancestor.attributes.parent) {

      //  Iterate up to parent
      ancestor = sheet.graph.getCell(ancestor.attributes.parent);

      //  Parent must be of type cut, however we check for redundancy
      if(ancestor.__proto__.constructor.name !== "Cut") {
        console.error("Parent is of type " + ancestor.__proto__.constructor.name + ". Expected Cut. Contact administrator." );
        return;
      }

      //  Now, recursivly check all premises in the cut and look for a matching premise
      let children = ancestor.attributes.embeds

      children?.forEach(element => {

        let child = sheet.graph.getCell(element);

        if(child?.__proto__.constructor.name === "Premise") {

          //Check if premise text is the same and if premise id is dissimilar
          if(child.attributes.attrs.text.text === premise_text &&
              child.id !== premise_id) {
            //  Remove desired element and return
            model.destroy()
            return;
          }
        }
      });
    }

    //  Finally, check sheet of assertion becuase of Joey's "Multi-tree" theory...

    let all_models = sheet.graph.attributes.cells.models;

    all_models?.forEach(child => {
      if(child?.attributes.attrs.level === 0 && 
         child?.__proto__.constructor.name === "Premise" &&
         child?.attributes.attrs.text.text === premise_text &&
         child?.id !== premise_id) {
          //  Remove desired element and return
          model.destroy()
          return;
         }
    });


  } 

}