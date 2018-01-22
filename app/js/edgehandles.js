// the default values of each option are outlined below:
var edgehandles_defaults = {
    preview: true, // whether to show added edges preview before releasing selection
    stackOrder: 4, // Controls stack order of edgehandles canvas element by setting it's z-index
    handleSize: 10, // the size of the edge handle put on nodes
    handleColor: '#ff0000', // the colour of the handle and the line drawn from it
    handleLineType: 'ghost', // can be 'ghost' for real edge, 'straight' for a straight line, or 'draw' for a draw-as-you-go line
    handleLineWidth: 1, // width of handle line in pixels
    handleIcon: false, // Pass an Image-object to use as icon on handle. Icons are resized according to zoom and centered in handle.
    handleNodes: 'node', // selector/filter function for whether edges can be made from a given node
    hoverDelay: 150, // time spend over a target node before it is considered a target selection
    cxt: false, // whether cxt events trigger edgehandles (useful on touch)
    enabled: true, // whether to start the extension in the enabled state
    toggleOffOnLeave: false, // whether an edge is cancelled by leaving a node (true), or whether you need to go over again to cancel (false; allows multiple edges in one pass)
    edgeType: function (sourceNode, targetNode) {
        // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
        // returning null/undefined means an edge can't be added between the two nodes
        return 'flat';
    },
    loopAllowed: function (node) {
        // for the specified node, return whether edges from itself to itself are allowed
        return false;
    },
    nodeLoopOffset: -50, // offset for edgeType: 'node' loops
    nodeParams: function (sourceNode, targetNode) {
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for intermediary node
        return {};
    },
    edgeParams: function (sourceNode, targetNode, i) {
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for edge
        // NB: i indicates edge index in case of edgeType: 'node'
        console.log(sourceNode)
        console.log(targetNode)
        return {
            data: {
                name: sourceNode.data('name') + "->" + targetNode.data('name'),
                source: sourceNode.id(),
                target: targetNode.id()
            }
        };
    },
    start: function (sourceNode) {

        // fired when edgehandles interaction starts (drag on handle)
    },
    complete: function (sourceNode, targetNodes, addedEntities) {
            // fired when edgehandles is done and entities are added
    },
    stop: function (sourceNode) {
        // fired when edgehandles interaction is stopped (either complete with added edges or incomplete)
    }
};


module.exports.edgehandles_defaults = edgehandles_defaults