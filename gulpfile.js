var gulp = require('gulp');

gulp.task('build', function() {
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
		.pipe(header(banner, { pkg : pkg } ))
		.pipe(gulp.dest('dist'))
		.pipe(gulp.dest('examples/example1/js/'))
		.pipe(gulp.dest('examples/example2/js/'))
		.pipe(uglify())
		.pipe(header(banner, { pkg : pkg } ))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist'));
});