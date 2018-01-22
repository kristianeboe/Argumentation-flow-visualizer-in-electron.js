/**
 * Used to customize the current page
 * @type {object}
 * @see http://electron.atom.io/docs/api/web-frame/
 */
const webFrame = require('electron').webFrame


// file system module
const fs = require('fs')

/**
 * Module used to create the graph.
 */
var cytoscape = require('cytoscape');

/**
 * Used to communicate with the main process.
 * @type {object}
 * @see http://electron.atom.io/docs/api/ipc-renderer/
 */
var ipc = require('electron').ipcRenderer;

// Context-menu controls
const { remote } = require('electron')
const { Menu, MenuItem } = remote
var menu = new Menu()

// used to access the PDF viewer DOM since it's inside an iframe.
window.viewerIframe = document.getElementById('viewer').contentWindow;

// prevent zooming the app
webFrame.setZoomLevelLimits(1, 1)

// clear localStorage
window.localStorage.clear();

// event handler for when a PDF document is opened.
ipc.on('file-selected', (evt, filename) => {
    window.viewerIframe.RENDER_OPTIONS.documentId = filename[0];
    window.viewerIframe.render();
})

window.isDebug = (require('electron').remote.process.argv[2] === 'debug');

// Creates tags in the context-menu after loading an argumentation file
function createContextMenu (elmTypes, relTypes) {
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

function createGraphContext(types) {
    var select = document.getElementById("select");
    while (select.options.length > 0) {
        select.remove(0);
    }
    for (var i = 0; i < types.length; i++) {
        var option = document.createElement("option");
        option.text = option.value = types[i];
        if (i === 0) {
            option.selected = true;
        }
        select.add(option);
    }
    
}

//When the content of the pdf-viewer changes, add the context-menu to the PDFViewer.
window.sourceLoaded = function () {
  window.viewerIframe.removeEventListener('contextmenu', null)
  window.viewerIframe.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    menu.popup(remote.getCurrentWindow())
  }, false)
}

