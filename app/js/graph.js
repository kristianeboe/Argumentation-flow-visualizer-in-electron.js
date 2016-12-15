var cytoscape = require('cytoscape');
var edgehandles = require('cytoscape-edgehandles');
var edgehandles_defaults = require('./edgehandles');
var example_graph = require('./test_node_structures/example_graph');
var graph_io = require('./graph_io');
edgehandles(cytoscape); // register extension

var elements = {
    nodes: []
};

document.addEventListener('DOMContentLoaded', function () {
    var cy = window.cy = cytoscape({
        container: document.getElementById('cy'),
        elements: [], //getExampleGraph(),
        layout: {
            name: 'breadthfirst',
            padding: 150
        },
        style: [{
            selector: 'node',
            style: {
                'label': 'data(name)',
                'shape': 'rectangle'
            }
        }, {
            selector: '.claim',
            css: {
                'background-color': 'orange',
            }
        }, {
            selector: '.context',
            css: {
                'background-color': 'blue',
            }
        }, {
            selector: '.evidence',
            css: {
                'background-color': 'green',
            }
        }, {
            selector: '.hasCollapsed',
            css: {
                'background-color': 'red'
            }
        }, {
            selector: 'edge',
            style: {
                'label': 'data(name)'
            }
        }, {
            selector: 'edge',
            css: {
                'curve-style': 'bezier',
                'source-arrow-shape': 'triangle',
                'font-size': '10px',
                'edge-text-rotation': 'autorotate'
            }
        }, {
            selector: '.edgehandles-hover',
            css: {
                'background-color': 'red'
            }
        }, {
            selector: '.edgehandles-source',
            css: {
                'border-width': 2,
                'border-color': 'red'
            }
        }, {
            selector: '.edgehandles-target',
            css: {
                'border-width': 2,
                'border-color': 'red'
            }
        }, {
            selector: '.edgehandles-preview, .edgehandles-ghost-edge',
            css: {
                'line-color': 'red',
                'target-arrow-color': 'red',
                'source-arrow-color': 'red'
            }
        }],
    })

    cy.ready(() => {
        /*
        window.nr_of_claims = 0
        window.nr_of_evidence = 0
        window.nr_of_contexts = 0
        */

        var eles = cy.nodes();

        for (var i = 0; i < eles.length; i++) {
            if (window.elements[eles[i].data('tagType')] != null)
                window['nr_of_' + eles[i].data('tagType')]++;
            /*
            if (ele.data('tagType') === 'claim') window.nr_of_claims++
                if (ele.data('tagType') === 'evidence') window.nr_of_evidence++
                    if (ele.data('tagType') === 'context') window.nr_of_contexts++
            */
        }

    })
    cy.edgehandles(getEdgeHandlesDefaults());


});


var counter = 4
var rel_counter = 3

var expandButton = document.getElementById('expandButton');
expandButton.addEventListener('click', function () {
    var bfs = cy.elements().bfs({
        roots: ':selected',
        visit: function (i, depth) {
            console.log('visit ' + this.data('name'));
            if (i > 0) {
                this.show()
            }
            // example of finding desired node

        },
        directed: true
    });

});

var collapseButton = document.getElementById('collapseButton');
collapseButton.addEventListener('click', function () {
    var bfs = cy.elements().bfs({
        roots: ':selected',
        visit: function (i, depth) {
            console.log('visit ' + this.data('name'));
            if (i > 0) {
                this.hide()
            }

            // example of finding desired node

        },
        directed: true
    });

});

var leafNodeCheckButton = document.getElementById('leafNodeCheckButton');
leafNodeCheckButton.addEventListener('click', function () {
    var nodes = cy.nodes();
    if (nodes.length === 0) {
        window.alert('There are no nodes');
        return;
    }
    var legalStructure = true;

    var alertMsg = 'Illegal argument structure';
    var cantBeLeaf = '\nFollowing nodes cannot be leaf: ';
    var mustBeLeaf = '\nFollowing nodes must be leaf: ';
    nodes.forEach(function (node, index, arr) {
        if (node.data('canBeLeafNode') == 0 && node.successors().length == 0) {
            node.select();
            console.log(node.data('name'));
            cantBeLeaf = cantBeLeaf + node.data('name') + ', ';
            legalStructure = false;
        }
        if (node.data('canBeLeafNode') == 2 && node.successors().length != 0) {
            node.select();
            console.log(node.data('name'));
            mustBeLeaf = mustBeLeaf + node.data('name') + ', ';
            legalStructure = false;
        }
    });
    if (!legalStructure) {
        if (cantBeLeaf.length === 33)
            cantBeLeaf = '';
        if (mustBeLeaf.length == 31)
            mustBeLeaf = '';
        window.alert(alertMsg + cantBeLeaf + mustBeLeaf);
    } else
        window.alert('All nodes comply with their "can be leaf node" flags');

});


window.addNode = function (annotation) {
    // console.log(annotation)
    nr = ++window['nr_of_' + annotation.tagType];
    /*
    if (annotation.tagType.toLowerCase() === 'claim') nr = ++window.nr_of_claims;
    if (annotation.tagType.toLowerCase() === 'evidence') nr = ++window.nr_of_evidence;
    if (annotation.tagType.toLowerCase() === 'context') nr = ++window.nr_of_contexts;
    */
    annotation.name = annotation.tagType + '_' + nr;
    annotation.visited = 0;
    annotation.documentId = window.viewerIframe.RENDER_OPTIONS.documentId.split('/').slice(-1)[0];

    node = {
        group: 'nodes',
        data: annotation,
        classes: annotation.tagType.toLowerCase()
    }
    cy.add(node)

    cy.layout({
        name: 'breadthfirst'
    })
}
window.addRelation = function (annotation) {
    nr = ++window['nr_of_' + annotation.tagType];

    targetNode = window.relation.sourceNode
    sourceNode = window.relation.targetNode
    sourceId = sourceNode.id
    targetId = targetNode.id

    annotation.name = annotation.tagType + '_' + nr;
    annotation.documentId = window.viewerIframe.RENDER_OPTIONS.documentId.split('/').slice(-1)[0]
    annotation.source = sourceId
    annotation.target = targetId

    edge = {
        group: 'edges',
        data: annotation,
        classes: annotation.tagType.toLowerCase()
    }

    cy.add(edge)

    window.relation = {}

}



function getEdgeHandlesDefaults() {
    return edgehandles_defaults
}


function getExampleGraph() {
    return example_graph.example_graph
}

var save_btn = document.getElementById('save_btn');
save_btn.addEventListener('click', () => {
    graph_object = cy.json()
    var document = window.viewerIframe.RENDER_OPTIONS.documentId;
    // can't save graph if there's no document loaded.
    if (document != "") {
        graph_object.pdfDocument = document;
    } else {
        alert('No document loaded');
        return;
    }
    content = JSON.stringify(graph_object);
    graph_io.write_to_file(content)
})

var save_btn_png = document.getElementById('save_btn_png');
save_btn_png.addEventListener('click', () => {
    graph_object = cy.png({
        full: true
    })
    var document = window.viewerIframe.RENDER_OPTIONS.documentId;
    // can't save graph if there's no document loaded.
    if (document != "") {
        graph_object.pdfDocument = document;
    } else {
        alert('No document loaded');
        return;
    }
    content = graph_object
    graph_io.write_graph_image_to_file(content)
})

var load_graph_btn = document.getElementById('load_graph_btn');
load_graph_btn.addEventListener('click', () => {
    graph_io.load_graph_from_file()

})

var removeNodeButton = document.getElementById('removeNodeButton');
removeNodeButton.addEventListener('click', () => {
    selected = cy.$(':selected')
    for (node in selected) {
        // pdf.removeAnnotation(node.id)
    }
    selected.remove()
})

var checkConnectednessButton = document.getElementById('checkConnectednessButton');
checkConnectednessButton.addEventListener('click', () => {
    nr_of_roots = cy.nodes().roots()
    if (nr_of_roots.length == 1) {
        alert("The graph is fully connected")
    } else {
        alert("There are " + nr_of_roots.length + " unconnected trees")
    }
});