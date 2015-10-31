var fs = require('fs'),
    _  = require('underscore');

var bookmark = {};

bookmark.clear = function () {
	bookmark.list = {};
};

bookmark.add = function (key, param) {
	if (param) {
		return bookmark.list[key] = param;
	}

	var self = this;
	var params = key;

	_.each(params, function (param, key) {
		self.list[key] = param;
	});
};

bookmark.paramFor = function (key) {
	var param = bookmark.list[key] || {};

	while (param.alias) {
		param = bookmark.list[param.alias] || {};
	}

	return param;
};

bookmark.readFile = function (path) {
	var file = fs.readFileSync(path, 'utf8');
	var params = JSON.parse(file);

	this.clear();
	this.add(params);
};

bookmark.clear();

module.exports = bookmark;
