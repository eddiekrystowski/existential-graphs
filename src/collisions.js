import { graph } from './index.js'
// When the dragged cell is dropped over another cell, let it become a child of the
// element below.
export function handleCollisions(cell) {

    let cellbbox = {
        width: cell.attributes.attrs.rect.width,
        height: cell.attributes.attrs.rect.height,
        x: cell.attributes.position.x,
        y: cell.attributes.position.y
    }

    let potential_parents = findPotentialParents(cellbbox);
    console.log("potential_parents", potential_parents)
    let parent = findSmallestCell(potential_parents);

    console.log("parent",parent)

    if (parent) {
        let children = filterChildren(parent, cellbbox)
        //embed cell into parent
        parent.embed(cell);

        //reroot children
        for (const child of children) {
            parent.unembed(child);
            cell.embed(child)
        }
        treeToFront(parent)
    } else {
        let elements_inside = findElementsInside(cellbbox)
        for (const element of elements_inside) {
            if (element.get("parent") || element.id === cell.id) {
                continue;
            }
            cell.embed(element)
        }
        treeToFront(cell)
    }
}

function findElementsInside(bbox, cells=graph.getCells()) {
    let elements = []
    for (const cell of cells) {
        let otherbbox = {
            width: cell.attributes.attrs.rect.width,
            height: cell.attributes.attrs.rect.height,
            x: cell.attributes.position.x,
            y: cell.attributes.position.y
        }
        if (contains(bbox, otherbbox)) {
            elements.push(cell)
        }
    }
    return elements
}

function findPotentialParents(targetbbox) {
    let cells = graph.getCells()
    let potential_parents = []
    for (const cell of cells) {
        let otherbbox = {
            width: cell.attributes.attrs.rect.width,
            height: cell.attributes.attrs.rect.height,
            x: cell.attributes.position.x,
            y: cell.attributes.position.y
        }
        //find cells who contain target cell
        if (contains(otherbbox, targetbbox)) {
            console.log("potential parent found")
            potential_parents.push(cell)
        }
    }

    return potential_parents
}

function findSmallestCell(cells) {
    if (cells.length === 0) { return undefined }
    let smallest_area = cells[0].attributes.attrs.rect.width * cells[0].attributes.attrs.rect.height;
    let smallest_cell = cells[0];
    for (const cell of cells) {
        let width = cell.attributes.attrs.rect.width;
        let height = cell.attributes.attrs.rect.height;
        let area = width * height;
        if (area < smallest_area) {
            smallest_area = area;
            smallest_cell = cell;
        }
    }
    return smallest_cell
}

function filterChildren(parent, new_child_bbox) {
    //function returns array of children who fit inside new child
    let potential_children = parent.getEmbeddedCells()
    let children = findElementsInside(new_child_bbox, potential_children)
    return children;
}

function contains(bbox, otherbbox) {
    let bbox_info = {
        left_x: bbox.x,
        right_x: bbox.x + bbox.width,
        top_y: bbox.y,
        bottom_y: bbox.y + bbox.height
    }
    let otherbbox_info = {
        left_x: otherbbox.x,
        right_x: otherbbox.x + otherbbox.width,
        top_y: otherbbox.y,
        bottom_y: otherbbox.y + otherbbox.height
    }
    if (bbox_info.left_x < otherbbox_info.left_x && bbox_info.right_x > otherbbox_info.right_x && bbox_info.top_y < otherbbox_info.top_y && bbox_info.bottom_y > otherbbox_info.bottom_y) {
        console.log("bbox contains otherbbox", bbox, otherbbox);
        return true;
    } else {
        console.log("nop")
        return false;
    }
}

function treeToFront(root) {
    let current = [root]
    let next = []
    while (current.length > 0) {
        for (const node of current) {
            node.toFront();
            let children = node.getEmbeddedCells();
            next.push(...children);
        }
        current = next
        next = []
    }
}