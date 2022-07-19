
export function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function getLocalGraphData() {
    let localGraphData = JSON.parse(localStorage.getItem('graphs'));
    if (!localGraphData) localGraphData = {};
    return localGraphData;
}

export function addToLocalGraphData(id, graphJSON) {
    const localGraphData = getLocalGraphData();
    localGraphData[id] =  {
        graphJSON: graphJSON,
        lastModified: new Date()
    }
    localStorage.setItem('graphs', JSON.stringify(localGraphData));
}

export function generateGraphID() {
    let localGraphData = JSON.parse(localStorage.getItem('graphs'));
    if (!localGraphData) localGraphData = {};
    const available = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
    let id = Array.from({length: 5}, (v, i) => randomFromArray(available)).join('');
    while (id in localGraphData) id = Array.from({length: 5}, (v, i) => randomFromArray(available)).join('');
    return id;
  }