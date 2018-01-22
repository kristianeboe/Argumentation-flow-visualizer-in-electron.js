const fs = require('fs') // Load the File System to execute our common tasks (CRUD)
var app = require('electron').remote;
var dialog = app.dialog;

function write_to_file(content) {
    var filepath = undefined; // You need to save the filepath when you open the file to update without using the filechooser dialog again
    //if filepath exists, then update the file!
    if (filepath != undefined || filepath != null) {
        fs.writeFile(filepath, content, function (err) {
            if (err) {
                alert("An error ocurred updating the file" + err.message);
                console.log(err);
                return;
            }
            alert("The file has been succesfully saved");
        });
    }
    //in case the filepath doesn't exist, the system should prompt for filename and directory'
    else {
        dialog.showSaveDialog({
            filters: [{
                name: 'json',
                extensions: ['json']
            }]
        },function (fileName) {
            fs.writeFile(fileName, content, function (err) {
                if (err) {
                    alert("An error ocurred updating the file" + err.message);
                    return;
                }
                alert("The file has been succesfully saved");
            });

        })
    }
}

function write_graph_image_to_file(content) {
    content = content.replace(/^data:image\/\w+;base64,/, '');
    var filepath = undefined; // You need to save the filepath when you open the file to update without using the filechooser dialog again
    //if filepath exists, then update the file!
    if (filepath != undefined || filepath != null) {
        fs.writeFile(filepath, content, 'base64', function (err) {
            if (err) {
                alert("An error ocurred updating the file" + err.message);
                console.log(err);
                return;
            }
            alert("The file has been succesfully saved");
        });
    }
    //in case the filepath doesn't exist, the system should prompt for filename and directory'
    else {
        dialog.showSaveDialog({
            filters: [{
                name: 'png',
                extensions: ['png']
            }]
        },function (fileName) {
            fs.writeFile(fileName, content, 'base64', function (err) {
                if (err) {
                    alert("An error ocurred updating the file" + err.message);
                    return;
                }
                alert("The file has been succesfully saved");
            });

        })
    }
}

function load_graph_from_file() {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{
            name: 'json',
            extensions: ['json']
        }]
    }, (filename) => {
        // mainWindow.webContents.send('file-selected', filename)
        graph_string = fs.readFileSync(filename[0]).toString();
        graph = JSON.parse(graph_string)
        window.cy.json(graph)
        
        var eles = cy.nodes();
        ele = eles[0]
        documentId = ele.data('documentId')
        if(window.viewerIframe.RENDER_OPTIONS.documentId) {
            if (window.viewerIframe.RENDER_OPTIONS.documentId.split('/').slice(-1)[0] != documentId) {
                alert('Graph documentId does not match current pdf document')
                return
            }
        }


        // build a new array with the annotations from the graph file.
        elements = graph.elements.nodes.concat(graph.elements.edges)
        console.log(elements)
        var documentAnnotations = elements.map(function (annObj) {
           return annObj.data;
        });
        window.localStorage.clear();
        // puts the annotations loaded from the graph on localstorage
        window.localStorage.setItem(window.viewerIframe.RENDER_OPTIONS.documentId + '/annotations', JSON.stringify(documentAnnotations));
        // render the document.
        window.viewerIframe.render();
    });
}

module.exports.write_to_file = write_to_file
module.exports.write_graph_image_to_file = write_graph_image_to_file
module.exports.load_graph_from_file = load_graph_from_file
