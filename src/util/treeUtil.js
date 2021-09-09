

export function treeResize(root, resize_value = 20, center_nodes = true) {
    console.log("resize_value",resize_value)
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