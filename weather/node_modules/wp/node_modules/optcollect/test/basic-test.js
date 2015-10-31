var buster     = require('buster'),
    OptCollect = require(__dirname + '/..');

buster.testCase('optcollect', {
	'gets true option list': function () {
		var opts = new OptCollect(['-sv', '-x']);
		assert.equals(opts.options, ['s', 'v', 'x']);
	},
	'checks true': function () {
		var opts = new OptCollect(['-svx']);
		assert(opts.isTrue('s'));
	},
	'checks false': function () {
		var opts = new OptCollect(['-svx']);
		assert(!opts.isTrue('a'));
	},
	'gets value': function () {
		var opts = new OptCollect(['-s', 'hogehoge']);

		assert(opts.value('s') == 'hogehoge');
	},
	'groups options': function () {
		var opts = new OptCollect(['--safari']);
		opts.group(['s', 'safari']);

		assert(opts.isTrue('s'));
	}
});