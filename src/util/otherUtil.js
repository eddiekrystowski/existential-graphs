export function cellInArray(cell, arr) {
    for (const e of arr) {
        if (cell.id === e.id) {
            return true;
        }
    }
    return false;
} 