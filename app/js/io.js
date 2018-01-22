const fs = require('fs') // Load the File System to execute our common tasks (CRUD)
var app = require('electron').remote;
var dialog = app.dialog;

// Context-menu controls
const {
    Menu,
    MenuItem
} = app
var menu = new Menu()


var load_pdf_btn = document.getElementById('load_pdf_btn');
load_pdf_btn.addEventListener('click', () => {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{
            name: 'PDF',
            extensions: ['pdf']
        }]
    }, (filename) => {
        window.viewerIframe.RENDER_OPTIONS.documentId = filename[0];
        window.viewerIframe.render();

        console.log(window.cy.nodes().length)
        if (window.cy.nodes().length > 0) {
            if (window.viewerIframe.RENDER_OPTIONS.documentId.split('/').slice(-1)[0] != cy.nodes()[0].data('documentId')) {
                alert('Pdf documentId does not match current graph')
            }
            graph = window.cy.json()
            elements = graph.elements.nodes.concat(graph.elements.edges)
            console.log(elements)
            documentAnnotations = elements.map(function (annObj) {
                return annObj.data;
            });

            window.localStorage.clear();
            // puts the annotations loaded from the graph on localstorage
            window.localStorage.setItem(window.viewerIframe.RENDER_OPTIONS.documentId + '/annotations', JSON.stringify(documentAnnotations));
            // render the document.
            window.viewerIframe.render();
        }

    });
})



var load_arg_model_btn = document.getElementById('load_arg_model_btn');
load_arg_model_btn.addEventListener('click', () => {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{
            name: 'TXT',
            extensions: ['txt']
        }]
    }, (filename) => {
        var elements = {};
        var relations = {};
        var isChanged = false;
        if (require('./parser.js').parseArgumentationModel(filename[0], elements,
                relations)) {
            if (window.argumentationModelFilename != elements.argModelName && elements.argModelName != null)
                isChanged = true;
            window.argumentationModelFilename = elements.argModelName;
            elements.Types.forEach(function (el, index, arr) {
                window[el + 'Object'] = elements[el];
                if (isChanged)
                    window['nr_of_' + el] = 0;
            });
            relations.Types.forEach(function (rel, index, arr) {
                window[rel + 'Object'] = relations[rel];
                if (isChanged)
                    window['nr_of_' + rel] = 0;
            });

            if (isChanged) {
                window.elements = elements.Types;
                window.relations = relations.Types;
            }
            createContextMenu(elements['Types'], relations['Types']);
            document.getElementById('argModel').innerHTML = document.getElementById('argModel').innerHTML + ' (' +
                window.argumentationModelFilename + ')';
        } else {
            window.alert(
                'Error:\n\nIllegal argumentation model: Please load a correctly defined argumentation model'
            );
        }
    });
})


// Creates tags in the context-menu after loading an argumentation file
function createContextMenu(elmTypes, relTypes) {
    menu = new Menu()
    menu.append(new MenuItem({
        label: "Element-tags",
        submenu: []
    }))
    menu.append(new MenuItem({
        label: "Relation-tags",
        submenu: []
    }))

    var types = [elmTypes, relTypes]

    for (var index = 0; index < menu.getItemCount(); index++) {
        var submenu = menu.items[index].submenu;
        for (var item = 0; item < types[index].length; item++) {
            var name = types[index][item];
            submenu.append(new MenuItem({
                label: name,
                checked: false,
                type: 'checkbox',
                click(e) {
                    for (var i = 0; i < menu.getItemCount(); i++) {
                        for (var j = 0; j < menu.items[i].submenu.getItemCount(); j += 2) {
                            if (menu.items[i].submenu.items[j].checked) {
                                menu.items[i].submenu.items[j].checked = false;
                            }
                        }
                    }
                    e.checked = true;
                    window.selectedTag = e.label;
                }
            }))
            if (item != types[index].length - 1) {
                submenu.append(new MenuItem({
                    type: 'separator'
                }))
            }
        }
    }
}

//When the content of the pdf-viewer changes, add the context-menu to the PDFViewer.
window.sourceLoaded = function () {
    window.viewerIframe.removeEventListener('contextmenu', null)
    window.viewerIframe.addEventListener('contextmenu', (e) => {
        window.viewerIframe.getSelection().empty;
        e.preventDefault()
        if (!menu.items.length) {
            window.alert('No argumentation model file loaded.')
        }
        menu.popup(app.getCurrentWindow())
    }, false)
}