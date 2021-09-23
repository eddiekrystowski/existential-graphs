import { graph } from '../index.js'
import { treeMove } from './treeUtil.js';
import { handleCollisions } from './collisions.js';

export function addSubgraph(subgraph, position) {

    let root = subgraph[Object.keys(subgraph)[0]];

    let new_root = subgraphToGraph(root, root.clone(), subgraph)
    console.log("new root", new_root);
    handleCollisions(new_root);
    treeMove(new_root, position);
}

export function subgraphToGraph(node, clone, subgraph, parent=null) {
    clone.addTo(graph);
    if (parent) {
        parent.embed(clone);
    }
    let embeds = node.get('embeds');
    if (embeds){
        for (const embed of embeds) {
            let child = findCellInSubgraph(embed, subgraph);
            subgraphToGraph(child, child.clone(), subgraph, clone);
        }
    }
    return clone;
}

function findCellInSubgraph(id, subgraph) {
    let keys = Object.keys(subgraph);
    for (const key of keys) {
        let cell = subgraph[key];
        if (cell.id === id) {
            return cell;
        }
    }
    alert("find subgraph failed!");
    return null
}