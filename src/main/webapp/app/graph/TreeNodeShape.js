/*
 Defines a custom shape for the tree node that includes the
 upper half of the outgoing edge(s).
 */
function TreeNodeShape() {
};

TreeNodeShape.prototype = new mxImageShape();
TreeNodeShape.prototype.constructor = TreeNodeShape;

// Defines the length of the upper edge segment.
TreeNodeShape.prototype.segment = 20;

// Needs access to the cell state for rendering
TreeNodeShape.prototype.apply = function(state) {
	mxImageShape.prototype.apply.apply(this, arguments);
	this.state = state;
};

mxCellRenderer.prototype.defaultShapes['treenode'] = TreeNodeShape;

