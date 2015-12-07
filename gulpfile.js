var gulp = require('gulp');
var connect = require('gulp-connect');
var less = require('gulp-less');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var del = require('del');

// for unstop the piped stream and continue watch
var plumber = require('gulp-plumber');
var tap        = require('gulp-tap');
var gulpif     = require('gulp-if');
var streamify  = require('gulp-streamify');

// requires browserify and vinyl-source-stream
var browserify = require('browserify');
var source = require('vinyl-source-stream');

// plugins for minify css
var LessPluginCleanCSS = require('less-plugin-clean-css'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    cleancss = new LessPluginCleanCSS({ advanced: true }),
    autoprefix= new LessPluginAutoPrefix({ browsers: ["last 2 versions"] });

var args   = require('yargs').argv;

gulp.task('connect', function () {
    connect.server({
        root: 'public',
        port: 4000
    });
});

var isProduction = args.env === 'production';

// bundles all js file to main.js
gulp.task('browserify', function() {
    // clean the prevoius js version
    del(['public/js/*.js']);
    return browserify('app/app.js')
        .bundle()
        .on('error', function (err) {
            gutil.log(
                gutil.colors.red('Browserify compile error:'),
                err.message
            );
            gutil.beep();
            // Ends the task
            this.emit('end');
        })
        .pipe(source('main.js'))
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('less', function () {
    // delete previous css
    del(['public/css/main.css']);
    var l = less({});
    if (isProduction) {
        l = less({plugins: [autoprefix, cleancss]});
    }
    return gulp.src('public/css/*.less')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }}))
        .pipe(l)
        .on('error', gutil.log)
        .pipe(gulp.dest('public/css/'));
});

gulp.task('clean', function() {
    del(['public/js/*.js']);
    del(['public/css/main.css']);
});

gulp.task('watch', function(){
    // Watches for changes for js
    gulp.watch('app/**/*.js', ['browserify']);
    // Watches for changes for css
    gulp.watch('public/css/*.less', ['less']);
});

// default tasks
gulp.task('default', ['connect', 'browserify', 'less', 'watch']);
