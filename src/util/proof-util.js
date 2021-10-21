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

/**
 * Returns if two subgraphs match.
 * @param {Cell} model_one - The first model.
 * @param {Cell} model_two - The second model.
 * @returns {Boolean} - If the two subgraphs match
 */
function matchingModel(model_one, model_two) {
  //  If comparing premise to a cut, return false
  if(model_one.__proto__.constructor.name !== model_two.__proto__.constructor.name) return false;

  //  If comparing a premise to a premise, return based on text
  if (model_one.__proto__.constructor.name === "Premise") {
    return model_one.attributes.attrs.text.text === model_two.attributes.attrs.text.text;
  }

  //  If comparing a cut, return based on a match to all children
  if(model_one.__proto__.constructor.name === "Cut") {
    // Get the children of each cut
    let model_one_children = model_one.attributes.embeds;
    let model_two_children = model_one.attributes.embeds;

    //  If dissimilar sizes, return false
    if(model_one_children.length !== model_two_children) return false;

    //  Match children until children array are of size zero, or all options are exaughsted
    //  Runtime : O(n^2) where n = number of children per model.
    //  To attempt optimization, search for "Graph Isomorphism Problem"
    outer:
    while(model_one_children.length > 0) {
      let child = model_one_children[0];

      //  Iterate through all children of model_two and compare to child
      for (let i = 0; i < model_two_children.length; i++) {
        if(matchingModel(child, model_one_children[i])) {
          //  Remove the elements from the arrays
          model_one_children.shift() // Removes the first index
          model_two_children.splice(i, 1) //  Removes index i
          continue outer;
         }
      }
      //  If you get here, it didn't match :(
      return false;
    }
    //  If you get here, it matched! Congrats! :)
    return true;
  }
  //  If comparing something other than a premise or cut, contact an administatior
  console.error("Can not compare models of type " + model_one.__proto__.constructor.name + ". Contact administrator");
  return false;
}