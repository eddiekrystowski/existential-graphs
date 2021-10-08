/**
 * Downloads the provided data to the users computer.
 *
 * @param {Blob} data The data to be downloaded.
 * @param {string} file_name The name the downloaded file will have. Must explicitly state the file type.
 */
 exports.save = function save(data, file_name) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(data);  

    a.href = url;
    a.download = file_name;

    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

/**
 * Downloads the current graph as a JSON file.
 *
 * @param {object} graph The graph to be downloaded.
 */
 exports.saveGraphAsJSON = function saveGraphAsJSON(graph) {
    const file = new Blob([JSON.stringify(graph.toJSON(), null, ' ')], { type: 'application/json'});
    exports.save(file , 'graph.json');
}

/**
 * Prompts user for file and replaces the passed graph with the user provided JSON.
 *
 * @param {object} graph The joint graph to be replaced.
 */
exports.loadGraphFromJSON = function loadGraphFromFile(graph) {
    const input = document.createElement("input");
    input.type = "file";
    
    input.onchange = function (ev) {
        const file = ev.target.files[0];
        if (file.type !== "application/json") {
            alert("File must be of .JSON type");
            return;
        }
        
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = function (readerEvent) {
            const content = readerEvent.target.result;
            const erase = window.confirm("Erase your current workspace and import graph?");
            if (erase) {
                graph.clear();
                const dataObj = JSON.parse(content);
                graph.fromJSON(dataObj);
                
            }
        };
    };
    input.click();
}
