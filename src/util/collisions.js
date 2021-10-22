export function findSmallestCell(cells) {
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

export function contains(bbox, otherbbox) {
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
        //console.log("bbox contains otherbbox", bbox, otherbbox);
        return true;
    } else {
        return false;
    }
}

export function overlapsCells(target, cells) {
    let cell_collisions = []
    for (const cell of cells) {
        if (target.id === cell.id) continue;
        if (intersects(target.getBoundingBox(), cell.getBoundingBox())) {
            cell_collisions.push(cell);
        }
    }
    return cell_collisions;
}

export function intersects(mainbbox, otherbbox) {
    if (contains(mainbbox, otherbbox) || contains(otherbbox, mainbbox)) {
        return true;
    }

    // check if bounding boxes overlap one another
    
    //check if either bbox is completely above the other
    //      bbox.y          is the top edge
    //      bbox.y + height is the bottom edge
    //check if some bottom edge is < some top edge
    if (mainbbox.y + mainbbox.height < otherbbox.y || otherbbox.y + otherbbox.height < mainbbox.y) {
        //one of the bbox is completely above the other
        return false;
    }
    //check if either bbox is completely to the left of the other
    //      bbox.x          is the left edge 
    //      bbox.x + width  is the right edge
    // check if some right edge < other left edge
    if (mainbbox.x + mainbbox.width < otherbbox.x || otherbbox.x + otherbbox.width < mainbbox.x) {
        //one of the bbox is completely to the left of the other
        return false;
    }

    return true;
}

/*
    move_vector: {
        start: {
            x: int,
            y: int
        },
        target: {
            x: int,
            y: int
        }
    }
*/

//Not used right now.... but it may need to be at some point.... DO NOT REMOVE!
//checks to make sure that you dont create parent/child relationships by moving cells
export function safeMove(main, move_target) {
    let move_vector = {
        start: { 
            x: main.attributes.position.x,
            y: main.attributes.position.y
        },
        target: {
            x: move_target.x,
            y: move_target.y
        }
    }
    let mainbbox = main.getBoundingBox();
    let new_bbox = {
        x: move_vector.target.x,
        y: move_vector.target.y,
        width: mainbbox.width,
        height: mainbbox.height
    }
    //check if moving a cell somewhere would either contain a new cell or be contained by another cell
    let cells = main.sheet.getCellsByLevel(0);
    for (const invader of cells) {
        if (invader.id === main.id) continue;
        if (contains(new_bbox, invader.getBoundingBox()) || contains(invader.getBoundingBox(), new_bbox)) {
            //moving cell would contain invader or invader would contain cell
            //move the invader out
            let diff_y = move_vector.target.y - move_vector.start.y;
            let diff_x = move_vector.target.x - move_vector.start.x
            if (diff_x === 0) {
                if (diff_y < 0) {
                    //if main is being pushed up, push invader up also
                    pushTop(main, invader);
                } else if (diff_y > 0) {
                    //if the main cell is being moved down, move the invader down too
                    pushBottom(main, invader);
                } else {
                    alert("Error in safeMove, diff_y === 0 for vertical movement");
                }
            } else if (diff_y === 0) {
                if (diff_x < 0) {
                    pushLeft(main, invader);
                } else if (diff_x > 0) {
                    pushRight(main, invader);
                } else {
                    alert("Error in safeMove, diff_x === 0 for horizontal movement");
                }
            }
        }
    }
    main.position(move_vector.target.x, move_vector.target.y)
}

function pushTop(main, invader) {
    let move_target = {
        x: invader.attributes.position.x,
        y: invader.attributes.position.y - Math.abs(main.sheet.spacing + (invader.attributes.position.y + invader.attributes.attrs.rect.height) - (main.attributes.position.y))
    }
    safeMove(invader, move_target);
}

function pushBottom(main, invader) {
    let move_target = {
        x: invader.attributes.position.x,
        y: invader.attributes.position.y + Math.abs(main.sheet.spacing + (invader.attributes.position.y + invader.attributes.attrs.rect.height) - (main.attributes.position.y))
    }
    safeMove(invader, move_target);
}

function pushLeft(main, invader) {
    let move_target = {
        x: invader.attributes.position.x - Math.abs(main.sheet.spacing + (invader.attributes.position.x + invader.attributes.attrs.rect.width) - (main.attributes.position.x)),
        y: invader.attributes.position.y
    }
    safeMove(invader, move_target);
}

function pushRight(main, invader) {
    let move_target = {
        x: invader.attributes.position.x + Math.abs(main.sheet.spacing + (invader.attributes.position.x + invader.attributes.attrs.rect.width) - (main.attributes.position.x)),
        y: invader.attributes.position.y
    }
    safeMove(invader, move_target);
}

export function getCellsBoundingBox(cells) {
    let min_x = cells[0].attributes.position.x
    let max_x = cells[0].attributes.attrs.rect.width + min_x
    let min_y = cells[0].attributes.position.y
    let max_y = cells[0].attributes.attrs.rect.height + min_y
    for (let i = 1; i < cells.length; i++) {
        let cell = cells[i];
        let cellbbox = cell.getBoundingBox();
        if (cellbbox.x < min_x) min_x = cellbbox.x;
        if (cellbbox.y < min_y) min_y = cellbbox.y;
        if (cellbbox.x + cellbbox.width > max_x) max_x = cellbbox.x + cellbbox.width;
        if (cellbbox.y + cellbbox.height > max_y) max_y = cellbbox.y + cellbbox.height; 
    }
    return {
        x: min_x,
        y: min_y,
        width: max_x - min_x,
        height: max_y - min_y
    }
}