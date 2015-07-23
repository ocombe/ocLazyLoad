var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    newVer;

gulp.task('karma', function(done) {
    var karma = require('karma').server;
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done);
});

gulp.task('clean', function() {
    var clean = require('gulp-clean');

    return gulp.src('dist')
        .pipe(clean());
});

gulp.task('build-minify', ['build-files-require'], function() {
    var rename = require('gulp-rename'),
        uglify = require('gulp-uglify'),
        header = require('gulp-header'),
        pkg = require('./package.json'),
        banner = ['/**',
            ' * <%= pkg.name %> - <%= pkg.description %>',
            ' * @version v' + (newVer ? newVer : '<%= pkg.version %>'),
            ' * @link <%= pkg.homepage %>',
            ' * @license <%= pkg.license %>',
            ' * @author <%= pkg.author %>',
            ' */',
            ''].join('\n');

    return gulp.src([
            'dist/ocLazyLoad.js',
            'dist/ocLazyLoad.require.js'
        ])
        .pipe(uglify())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist'));

});

gulp.task('build-files-require', ['build-files'], function() {
    var rename = require('gulp-rename'),
        uglify = require('gulp-uglify'),
        header = require('gulp-header'),
        babel = require('gulp-babel'),
        ngAnnotate = require('gulp-ng-annotate'),
        pkg = require('./package.json'),
        concat = require('gulp-concat'),
        banner = ['/**',
            ' * <%= pkg.name %> - <%= pkg.description %>',
            ' * @version v' + (newVer ? newVer : '<%= pkg.version %>'),
            ' * @link <%= pkg.homepage %>',
            ' * @license <%= pkg.license %>',
            ' * @author <%= pkg.author %>',
            ' */',
            ''].join('\n');

    return gulp.src([
            'src/ocLazyLoad.core.js',
            'src/ocLazyLoad.directive.js',
            'src/ocLazyLoad.loaders.common.js',
            'src/ocLazyLoad.loaders.core.js',
            'src/ocLazyLoad.loaders.cssLoader.js',
            'src/ocLazyLoad.loaders.requireJSLoader.js',
            'src/ocLazyLoad.loaders.templatesLoader.js',
            'src/ocLazyLoad.polyfill.ie8.js'
        ])
        .pipe(babel({ blacklist: ["strict"] }))
        .pipe(ngAnnotate())
        .pipe(gulp.dest('dist/modules'))
        .pipe(concat('ocLazyLoad.require.js'))
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-files', ['clean'], function() {
    var rename = require('gulp-rename'),
        uglify = require('gulp-uglify'),
        header = require('gulp-header'),
        babel = require('gulp-babel'),
        ngAnnotate = require('gulp-ng-annotate'),
        pkg = require('./package.json'),
        concat = require('gulp-concat'),
        banner = ['/**',
            ' * <%= pkg.name %> - <%= pkg.description %>',
            ' * @version v' + (newVer ? newVer : '<%= pkg.version %>'),
            ' * @link <%= pkg.homepage %>',
            ' * @license <%= pkg.license %>',
            ' * @author <%= pkg.author %>',
            ' */',
            ''].join('\n');

    return gulp.src([
            'src/ocLazyLoad.core.js',
            'src/ocLazyLoad.directive.js',
            'src/ocLazyLoad.loaders.common.js',
            'src/ocLazyLoad.loaders.core.js',
            'src/ocLazyLoad.loaders.cssLoader.js',
            'src/ocLazyLoad.loaders.jsLoader.js',
            'src/ocLazyLoad.loaders.templatesLoader.js',
            'src/ocLazyLoad.polyfill.ie8.js'
        ])
        .pipe(babel({ blacklist: ["strict"] }))
        .pipe(ngAnnotate())
        .pipe(gulp.dest('dist/modules'))
        .pipe(concat('ocLazyLoad.js'))
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', function(done) {
    runSequence('karma', 'build-files', done);
});

gulp.task('promptBump', function() {
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
            if(res.bump.match(/^patch/)) {
                newVer = semver.inc(pkg.version, 'patch');
            } else if(res.bump.match(/^minor/)) {
                newVer = semver.inc(pkg.version, 'minor');
            } else if(res.bump.match(/^major/)) {
                newVer = semver.inc(pkg.version, 'major');
            }
        }));
});


gulp.task('changelog', function() {
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
});

gulp.task('updatePackage', function() {
    var jeditor = require("gulp-json-editor");

    return gulp.src('package.json')
        .pipe(jeditor({
            'version': newVer
        }))
        .pipe(gulp.dest("./"))
});

gulp.task('updateBower', function() {
    var jeditor = require("gulp-json-editor");

    return gulp.src('bower.json')
        .pipe(jeditor({
            'version': newVer
        }))
        .pipe(gulp.dest("./"));
});

gulp.task('release', ['karma'], function(done) {
    runSequence('promptBump', 'updatePackage', 'updateBower', 'changelog', 'build-minify', done);
});
