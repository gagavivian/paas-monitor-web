/*本文件中包含构建元模型时各个类的定义*/

function Attribute(name) {
	this.name = name;
};

Attribute.prototype.type = 'String';
Attribute.prototype.category = '';
Attribute.prototype.mapped = false;
Attribute.prototype.mapping = 'none';
Attribute.prototype.value = '';
Attribute.prototype.clone = function() {
	return mxUtils.clone(this);
};