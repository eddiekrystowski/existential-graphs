import { Cut } from "../shapes/Cut/Cut"
import { graph } from "../index.js"
import  { handleCollisions} from './collisions.js'




export const inferenceInsertion = function(model) {
    // if(window.mode != 'create') return;
    // console.log(event.which);
    // //a-z for creating premise
    // if (event.keyCode >= 65 && event.keyCode <= 90) {
    //     let config = {
    //         //use capital letters by default, can press shift to make lowercase
    //         attrs:{
    //             text: {
    //                 text:event.shiftKey ? key.toLocaleLowerCase() : key.toLocaleUpperCase()
    //             }
    //         },
    //         position: {
    //             x: mousePosition.x - paperContainer.getBoundingClientRect().left - 20,
    //             y: mousePosition.y - paperContainer.getBoundingClientRect().top - 20
    //         }
    //     }
    //     //eslint-disable-next-line
    //     let new_rect = new Premise().create(config)
    // }
}

export const inferenceErasure = function(model) {
  console.log(model.attributes.attrs.level)
  if(model.attributes.attrs.level%2 === 0) {
    const children = model.attributes.attrs.embeds;
    model.destroy();
    if(model.attributes.parent) {
      handleCollisions(graph.getCell(model.attributes.parent));
    }
    else {
      children?.forEach(element => {
          if(graph.getCell(element).__proto__.constructor.name == "Cut") {
            handleCollisions(graph.getCell(element))
          }
      });
    }  
  }
}

export const insertDoubleCut = function(model, mousePosition={}) {
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
        const cut = new Cut().create({
            position: position,
            attrs: {
                rect: {
                    width: size.width * (1 + multipliers[i]),
                    height: size.height * (1 + multipliers[i])
                }
            }
        });
        cut.set('position', {
            x: cut.get('position').x - (size.width * multipliers[i]/2),
            y: cut.get('position').y - (size.height * multipliers[i]/2)
        });
        handleCollisions(cut);
    }  
}

export const deleteDoubleCut = function(model) {
    console.log("MODEL: ", model);
    if(model.__proto__.constructor.name == "Cut" && model.attributes.embeds?.length == 1 && 
        graph.getCell(model.attributes.embeds[0]).__proto__.constructor.name == "Cut") {
          const children = graph.getCell(model.attributes.embeds[0]).attributes.embeds;
          graph.getCell(model.attributes.embeds[0]).destroy();
          model.destroy();
          if(model.attributes.parent) {
            handleCollisions(graph.getCell(model.attributes.parent));
          }
          else {
            children?.forEach(element => {
                if(graph.getCell(element).__proto__.constructor.name == "Cut") {
                  handleCollisions(graph.getCell(element))
                }
            });
          }
    }
}

export const iteration = function(model) {
}

export const deiteration = function(model) {
}