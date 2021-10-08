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

export function overlapsCells(target, cells) {
    let cell_collisions = []
    for (const cell of cells) {
        if (target.id === cell.id) continue;
        if (intersects(target, cell)) {
            cell_collisions.push(cell);
        }
    }
    return cell_collisions;
}

function intersects(cell1, cell2) {
    // check if bounding boxes overlap one another
    let mainbbox = cell1.getBoundingBox();
    let otherbbox = cell2.getBoundingBox();
    
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