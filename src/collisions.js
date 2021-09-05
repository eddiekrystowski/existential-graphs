import { graph } from './index.js'
// When the dragged cell is dropped over another cell, let it become a child of the
// element below.
export function handleCollisions(cell) {

    console.log(cell)
    let cellsBelow = findModelsBelow(cell)
    console.log("cellsBelow", cellsBelow)

    //filter out collisions of shapes who already have parents
    cellsBelow = filterCollisions(cellsBelow);

    if (cellsBelow.length) {
        let cellbbox = {
            width: cell.attributes.attrs.rect.width,
            height: cell.attributes.attrs.rect.height,
            x: cell.attributes.position.x,
            y: cell.attributes.position.y
        }
        for (const cellBelow of cellsBelow) {
            let belowbbox = {
                width: cellBelow.attributes.attrs.rect.width,
                height: cellBelow.attributes.attrs.rect.height,
                x: cellBelow.attributes.position.x,
                y: cellBelow.attributes.position.y
            }
            if (cell.attributes.type === "dia.Element.Premise") {
                //need to check if cellsBelow CONTAIN cell
                //also, there should only be one cell below, and do not count other premise
                if (cellBelow.type === "dia.Element.Premise") {
                    continue;
                }
                if (contains(belowbbox, cellbbox)) {
                    console.log("cell is premise", cell)
                    cellBelow.embed(cell);
                    treeToFront(cellBelow)
                }

            } else if (cell.attributes.type === "dia.Element.Cut") {
                //check if CUT contains cellsbelow AND if cellbelow contains cut (can be either one)
                //sanity checking
                if (cellBelow.get("parent")) {
                    console.error("Error! invalid collision with parent found!", cellBelow)
                    continue;
                }
                //check if cut contains other things
                if (contains(cellbbox, belowbbox)) {
                    console.log("cell is cut", cell);
                    console.log("hi")
                    cell.embed(cellBelow)
                    treeToFront(cell)
                    continue;
                }

                //check if other cells contain this cut
                if (contains(belowbbox, cellbbox)) {
                    //if premise somehow contains a cut
                    if (cellBelow.attributes.type === "premise") { continue; }
                    cellBelow.embed(cell);
                    treeToFront(cellBelow)
                    continue;
                }

            } else {
                console.error("invalid element type !", cell.attributes.type)
            }
        }
    }
}

function findModelsBelow(element) {
    //let elementbbox = element.getBBox()
    let cells = graph.getCells()
    let collisions = []
    console.log("cells", cells)
    for (const cell of cells) {
        if (cell.id === element.id){
            continue
        }
        //let otherbbox = cell.getBBox()
        collisions.push(cell)
    }
    console.log("colisions", collisions)
    return collisions
}

function filterCollisions(collisions) {
    let new_collisions = []
    for (const collision of collisions) {
        if (!(collision.get("parent"))) {
            //does not have parent
            new_collisions.push(collision)
        } 
    }
    return new_collisions
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
    console.log(bbox_info, otherbbox_info)
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