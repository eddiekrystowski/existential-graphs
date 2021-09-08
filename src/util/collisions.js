import { graph } from '../index.js'

//      CELL         -- the cell in question that we are checking
//                      collisions for (premise OR cut).
// POTENTIAL PARENTS -- potential parents are only the cells that 
//                      contain (completely) the CELL.
//   ACTUAL PARENT   -- the smallest cell (if there are any) that
//                      is a member of potential parents.
//   CHILDREN        -- If ACTUAL PARENT exists, POTENTIAL CHILDREN
//                          are cells that are contained (completely)
//                          by the CELL, AND are also currently
//                          children of ACTUAL PARENT.   
//                      Otherwise: CHILDREN are any cells that are
//                          contained (completely) inside the CELL
//                          that have NO parents.
export function handleCollisions(cell) {
    //This function takes a Cell as input and, using its position
    // makes any necessary changes to the internal representation of
    // the diagram (parent / child structure (embedding)) to reflect what the user
    // sees on the paper
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
    //takes two bbox objects as input
    //bbox objects should have the structure:
    // {
    //      width: int,
    //      height: int,
    //      x: int,
    //      y: int
    // }
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
    // POTENTIAL PARENTS -- potential parents are only the cells that 
    //                      contain (completely) the CELL.
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
    // returns the smallest cell (by area) of an array of joint.dia.Cell objects
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
    // returns true of otherbbox fits completely inside of bbox
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
    //recursively loops through a tree from its root to the leaves
    //to ensure correct z order
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