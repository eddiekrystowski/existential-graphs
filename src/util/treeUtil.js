import { color } from "./color.js"
import { graph } from "../index.js"

export function treeResize(root, resize_value = 20, center_nodes = true) {
    //resizes all the children of a root, not including the root
    let current = root.getParentCell();
    while (current) {
        console.log("current", current)
        current.attr("rect/width", current.attributes.attrs.rect.width + resize_value);
        current.attr("rect/height", current.attributes.attrs.rect.height + resize_value);
        if (center_nodes) {
            current.set("position", {x: current.attributes.position.x - resize_value/2,
                                     y: current.attributes.position.y - resize_value/2});
        }
        current = current.getParentCell();
    }
}

export function findRoot(node) {
    while (true) {
        if (node.get("parent")) {
            node = node.getParentCell();
        } else {
            break;
        }
    }
    return node;
}

export function findLevel(node) {
    let level = 0;
    let parent = node.getParentCell();
    while (parent) {
        level++;
        parent = parent.getParentCell();
    }
    return level;
}

let default_background_colors = {
    even: color.shapes.background.even.inactive,
    odd: color.shapes.background.odd.inactive,
    premise: color.shapes.background.default.color
}

export function colorByLevel(node, color_config = default_background_colors) {
    //find root of node's tree
    let root = findRoot(node);

    if (root.attributes.type === "dia.Element.Premise") {
        root.attr('rect/fill', color_config.premise);
        return;
    }
    //otherwise its a cut root

    root.attr("level", 0);
    root.attr("rect/fill", color_config.odd)
    let level = 0;
    let children = root.getEmbeddedCells();
    while(children.length > 0) {
        level++
        //the color applies to the level contained within the cut, not the level the cut is on
        let parity = (level+1) % 2;
        let next_children = []
        for (const child of children) {
            child.attr("level", level);
            if (child.attributes.type === "dia.Element.Premise") {
                child.attr("rect/fill", color_config.premise)
                continue;
            }
            //coloring cut
            child.attributes.attrs.level = level;
            if (parity === 0) {
                child.attr("rect/fill", color_config.even) 
            } else {
                child.attr("rect/fill", color_config.odd);   
            }                                 
            next_children.push(...child.getEmbeddedCells());
        }
        children = next_children;
    }

}

export function treeMove(root, position) {
    let offset = {
        x: position.x - root.attributes.position.x,
        y: position.y - root.attributes.position.y
    }
    console.log(offset);
    let current = [];
    let next = [root];
    while (next.length > 0) {
        current = next;
        next = [];
        console.log(current);
        for (const node of current) {
            next.push(...node.getEmbeddedCells());
            node.position(node.attributes.position.x + offset.x, node.attributes.position.y + offset.y);
        }
    }

}