import { Cut } from "../shapes/Cut/Cut"
import { graph } from "../index.js"
import  { handleCollisions} from './collisions.js'

export const inferenceInsertion = function(model) {
}

export const inferenceErasure = function(model) {
}

export const insertDoubleCut = function(model) {
        const multipliers = [0.5, 0.25];
        const size = { width: model.attr('rect/width'), height: model.attr('rect/height') }
        for(let i = 0; i < multipliers.length; i++) { 
            const cut = new Cut().create({
                position: model.get('position'),
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
        // //const size = { width: model.attr('rect/width'), height: model.attr('rect/height') }
        // const cut1 = new Cut().create({
        //     position: model.get('position'),
        //     attrs: {
        //         rect: {
        //             width: size.width * (1 + multipliers[0]),
        //             height: size.height * (1 + multipliers[0])
        //         }
        //     }
        // });
        // cut1.set('position', {
        //     x: cut1.get('position').x - (size.width * multipliers[0]/2),
        //     y: cut1.get('position').y - (size.height * multipliers[0]/2)
        // })
        // const cut2 = new Cut().create({
        //     position: model.get('position'),
        //     attrs: {
        //         rect: {
        //             width: size.width * (1 + multipliers[1]), 
        //             height: size.height * (1 + multipliers[1])
        //         }
        //     }
        // });
        // cut2.set('position', {
        //     x: cut2.get('position').x - (size.width * multipliers[1]/2),
        //     y: cut2.get('position').y - (size.height * multipliers[1]/2)
        // })
        // handleCollisions(cut2);
        // handleCollisions(cut1);

    
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