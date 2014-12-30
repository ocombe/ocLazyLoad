var gulp = require('gulp');

gulp.task('karma', function(callback) {
	var conf = require('./karma.conf.js').conf;
	conf.browsers = ['Chrome'];
	return require('karma-as-promised').server.start(conf);
});

var build = function(newVer) {
	var rename = require('gulp-rename'),
		uglify = require('gulp-uglify'),
		header = require('gulp-header'),
		pkg = require('./package.json'),
		banner = ['/**',
			' * <%= pkg.name %> - <%= pkg.description %>',
			' * @version v<%= pkg.version %>',
			' * @link <%= pkg.homepage %>',
			' * @license <%= pkg.license %>',
			' * @author <%= pkg.author %>',
			' */',
			''].join('\n');

	return gulp.src('src/ocLazyLoad.js')
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest('dist'))
		.pipe(uglify())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist'));
}

gulp.task('build', ['karma'], function() {
	return build();
});

var promptBump = function(callback) {
	var prompt = require('gulp-prompt'),
		semver = require('semver'),
		pkg = require('./package.json');

	return gulp.src('')
		.pipe(prompt.prompt({
			type: 'list',
			name: 'bump',
			message: 'What type of version bump would you like to do ? (current version is ' + pkg.version + ')',
			choices: [
				'patch (' + pkg.version + ' --> ' + semver.inc(pkg.version, 'patch') + ')',
				'minor (' + pkg.version + ' --> ' + semver.inc(pkg.version, 'minor') + ')',
				'major (' + pkg.version + ' --> ' + semver.inc(pkg.version, 'major') + ')',
				'none (exit)'
			]
		}, function(res) {
			var newVer;
			if(res.bump.match(/^patch/)) {
				newVer = semver.inc(pkg.version, 'patch');
			} else if(res.bump.match(/^minor/)) {
				newVer = semver.inc(pkg.version, 'minor');
			} else if(res.bump.match(/^major/)) {
				newVer = semver.inc(pkg.version, 'major');
			}
			if(newVer && typeof callback === 'function') {
				return callback(newVer);
			} else {
				return;
			}
		}));
}

var makeChangelog = function(newVer) {
	var streamqueue = require('streamqueue'),
		stream = streamqueue({objectMode: true}),
		exec = require('gulp-exec'),
		concat = require('gulp-concat'),
		clean = require('gulp-clean');

	stream.queue(gulp.src('').pipe(exec('node ./changelog.js ' + newVer, {pipeStdout: true})));
	stream.queue(gulp.src('CHANGELOG.md').pipe(clean()));

	return stream.done()
		.pipe(concat('CHANGELOG.md'))
		.pipe(gulp.dest('./'));
}

// Make changelog
gulp.task('changelog', function(event) {
	return promptBump(makeChangelog);
})

gulp.task('release', ['karma'], function() {
	var jeditor = require("gulp-json-editor");

	return promptBump(function(newVer) {
		var streamqueue = require('streamqueue');
		var stream = streamqueue({objectMode: true});

		// make the changelog
		stream.queue(makeChangelog(newVer));

		// update the main project version number
		stream.queue(
			gulp.src('package.json')
				.pipe(jeditor({
					'version': newVer
				}))
				.pipe(gulp.dest("./"))
		);

		stream.queue(
			gulp.src('bower.json')
				.pipe(jeditor({
					'version': newVer
				}))
				.pipe(gulp.dest("./"))
		);

		stream.queue(build(newVer));

		return stream.done();
	});
})

