var isHostname = function (value) {
	return value.match(/^[^\/]+\.(com|jp|it|net|org|tv|uk|info|biz)/);
};

module.exports = isHostname;