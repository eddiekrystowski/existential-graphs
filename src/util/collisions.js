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

export function overlapsCells(cell, cells) {
    for (const cell of cells) {

    }
}

function intersects(cell1, cell2,) {

}