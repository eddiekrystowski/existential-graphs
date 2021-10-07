import { treeMove } from './treeUtil.js';
import { handleCollisions } from './collisions.js';
import _ from 'lodash'

// export function addSubgraph(subgraph, position) {

//     let root = subgraph[Object.keys(subgraph)[0]];
//     let root_clone = root.clone();
//     let new_root = subgraphToGraph(root, root_clone, subgraph)
//     treeMove(new_root, position);
//     handleCollisions(new_root);
// }

// export function subgraphToGraph(node, clone, subgraph, parent=null) {
//     clone.addTo(graph);
//     if (parent != null) {
//         parent.embed(clone);
//     }
//     let embeds = node.get('embeds');
//     if (embeds){
//         for (const embed of embeds) {
//             let child = findCellInSubgraph(embed, subgraph);
//             subgraphToGraph(child, child.clone(), subgraph, clone);
//         }
//     }
//     return clone;
// }

// function findCellInSubgraph(id, subgraph) {
//     let keys = Object.keys(subgraph);
//     for (const key of keys) {
//         let cell = subgraph[key];
//         if (cell.id === id) {
//             return cell;
//         }
//     }
//     alert("find subgraph failed!");
//     return null
// }