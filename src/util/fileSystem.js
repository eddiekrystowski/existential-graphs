/**
 * Downloads the given data to the users computer
 *
 * @param {Array} data The Blob data to be downloaded.
 * @param {string} file_name The name of the file to be downloaded.
 * @param {string} file_type The type of the file to be downloaded.
 * @return {number} Returns 1 if it downloaded successfully, and -1 if the download fails
 */
function save(data,file_name,file_type) {
  console.log('Downloading...');
  const file = new Blob(data, { type: file_type});
    const a = document.createElement("a");
    let url = URL.createObjectURL(file);  
    a.href = url;
    a.download = file_name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

// function importEG() {
//   console.log('Importing...');
//   const input = document.createElement("input");
//     input.type = "file";
//     // choosing the file
//     input.onchange = function (ev) {
//         const file = ev.target.files[0];
//         if (file.type !== "application/json") {
//             alert("File must be of .JSON type");
//             return;
//         }
//         // read the file
//         const reader = new FileReader();
//         reader.readAsText(file, 'UTF-8');
//         reader.onload = function (readerEvent) {
//             const content = readerEvent.target.result;
//             const erase = window.confirm("Erase your current workspace and import graph?");
//             if (erase) {
//                 graph.clear();
//                 const dataObj = JSON.parse(content);
//                 graph.fromJSON(dataObj);
                
//             }
//         };
//     };
//     input.click();
// }

const fileSystem = {
  'download' : save,
};

export default fileSystem;
