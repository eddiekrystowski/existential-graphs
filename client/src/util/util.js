

/**
 * @param {Array} array Array to pick random element from
 * @returns Random element from given array
 */
export function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Retrieves local graph data from localStorage
 * @returns Parsed graph data from localStorage
 */
export function getLocalGraphData() {
    let localGraphData = JSON.parse(localStorage.getItem('graphs'));
    if (!localGraphData) localGraphData = {};
    return localGraphData;
}

/**
 * Retrieves a specific graph from localStorage
 * @returns an object containing info about the graph (see `addToLocalGraphData` to see current model)
 */
export function getLocalGraphByID(graph_id) {
    const localGraphData = getLocalGraphData();
    return localGraphData[graph_id];
}


/**
 * Adds a graph with a given ID to localStorage
 * `TODO`: Need to add a function that "saves", so if graph is named A and then someone changed it to B
 * and saves, A should no longer exist (should probably just either save new state immediately after renaming
 * or copy old state into B and wait for explicit save to put new state)
 */
export function addToLocalGraphData(id, graphJSON, graphName) {
    const localGraphData = getLocalGraphData();
    localGraphData[id] =  {
        graphJSON: graphJSON,
        lastModified: new Date(),
        name: graphName
    }
    localStorage.setItem('graphs', JSON.stringify(localGraphData));
}

/**
 * Generates a random ID to be used for newly created Graphs.
 * 
 * `TODO`: Add support for getting ID from server if signed in. (using axios)
 *       This function is 'async' so that way we can have something like
 * 
 *         const graphID = await axios.getGraphIDFromServer()
 * 
 * and then this function can also be called using await.
 * @returns 5 character random string consisting of lowercase and uppercase letters and numbers
 */
export async function generateGraphID() {
    let localGraphData = JSON.parse(localStorage.getItem('graphs'));
    if (!localGraphData) localGraphData = {};
    const available = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
    let id = Array.from({length: 5}, (v, i) => randomFromArray(available)).join('');
    while (id in localGraphData) id = Array.from({length: 5}, (v, i) => randomFromArray(available)).join('');
    return id;
}


