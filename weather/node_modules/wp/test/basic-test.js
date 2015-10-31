var util   = require('util'),
    buster = require('buster'),
    Wp     = require(__dirname + '/..');

buster.testCase('wp', {
	'return command to open url': function () {
		var url = 'http://facebook.com/';

		assert.equals(
			new Wp(url).commandToOpen(),
			util.format('open "%s"', url)
		);
	},

	'set url by two ways': function () {
		var url = 'http://facebook.com/';

		var wp1 = new Wp(url);
		var wp2 = new Wp();
		wp2.url = url;

		assert.equals(
			wp1.commandToOpen(),
			wp2.commandToOpen()
		);
	},

	'load bookmark': function () {
		var url = 'http://fnobi.com';
		var application = 'safari';
		var option = 's';

		Wp.bookmark.clear();
		Wp.bookmark.add(option, {
			application: application
		});

		assert.equals(
			Wp.bookmark.paramFor(option).application,
			application
		);
	},

	'with browser': function () {
		var url = 'http://fnobi.com';
		var application = 'safari';
		var option = 's';

		Wp.bookmark.clear();
		Wp.bookmark.add(option, {
			application: application
		});

		var wp = new Wp(url);
		wp.loadBookmark(option);

		assert.equals(
			wp.commandToOpen(),
			util.format('open -a "%s" "%s"', application, url)
		);
	},

	'with place': function () {
		var url = 'http://facebook.com/';
		var key = 'fb';

		Wp.bookmark.clear();
		Wp.bookmark.add(key, {
			url: url
		});

		var wp = new Wp();
		wp.loadBookmark(key);

		assert.equals(
			wp.commandToOpen(),
			util.format('open "%s"', url)
		);
	},

	'with place and browser': function () {
		Wp.bookmark.clear();
		Wp.bookmark.add({
			's': {
				application: 'safari'
			},
			'fb': {
				url: 'http://facebook.com'
			}
		});

		var wp = new Wp();
		wp.loadBookmark('s');
		wp.loadBookmark('fb');

		assert.equals(
			wp.commandToOpen(),
			'open -a "safari" "http://facebook.com"'
		);
	},

	'alias': function () {
		Wp.bookmark.clear();
		Wp.bookmark.add({
			'safari': { application: 'safari' },
			's': { alias: 'safari' }
		});

		var wp = new Wp('http://fnobi.com');
		wp.loadBookmark('s');

		assert.equals(
			wp.commandToOpen(),
			'open -a "safari" "http://fnobi.com"'
		);
	},

	'omit "http://"': function () {
		var wp = new Wp('facebook.com');
		assert.equals(
			wp.commandToOpen(),
			'open "http://facebook.com"'
		);
	}
});