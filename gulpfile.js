var gulp = require('gulp')
var connect = require('gulp-connect')
var less = require('gulp-less')
var gutil = require('gulp-util')
var uglify = require('gulp-uglify')
var del = require('del'); // rm -rf

// for unstop the piped stream and continue watch
var plumber = require('gulp-plumber')
var tap        = require('gulp-tap')
var gulpif     = require('gulp-if')
var streamify  = require('gulp-streamify')

// requires browserify and vinyl-source-stream
var browserify = require('browserify')
var source = require('vinyl-source-stream')

// plugins for minify css
var LessPluginCleanCSS = require('less-plugin-clean-css'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    cleancss = new LessPluginCleanCSS({ advanced: true }),
    autoprefix= new LessPluginAutoPrefix({ browsers: ["last 2 versions"] });

gulp.task('connect', function () {
    connect.server({
        root: 'public',
        port: 4000
    })
})

gulp.task('clean', function() {
    return del(['output']);
})

var isDebug = false;

// bundles all js file to main.js
gulp.task('browserify', ['clean'], function() {
    //return gulp.src("app/app.js")
    //    .pipe(plumber())
    //    .pipe(tap(
    //        function (file)
    //        {
    //            var d = require('domain').create();
    //            d.on("error",
    //                function (err) {
    //                    gutil.log(gutil.colors.red("Browserify compile error:"), err.message, "\n",
    //                        gutil.colors.cyan("in file"), err.toString());
    //                    gutil.beep();
    //                }
    //            );
    //            d.run(function () {
    //                file.contents = browserify({
    //                    entries: [file.path],
    //                    debug: isDebug
    //                }).bundle();
    //            });
    //        }
    //    ))
    //    .pipe(gulpif(!isDebug, streamify(uglify({
    //        compress: true
    //    }))))
    //    .pipe(gulp.dest('./public/js/'))

    return browserify('app/app.js')
        .bundle()
        .on('error', function (err) {
            //console.log(err.toString());
            //this.emit("end");
            gutil.log(
                gutil.colors.red('Browserify compile error:'),
                err.message
            );
            gutil.beep();
            this.emit('end'); // Ends the task
        })
        .pipe(source('main.js'))
        // saves it the public/js/ directory
        .pipe(gulp.dest('./public/js/'));

})

gulp.task('watch', function(){
    // Watches for changes for js
    gulp.watch('app/**/*.js', ['browserify'])
    // Watches for changes for css
    gulp.watch('public/css/*.less', ['less'])
})

gulp.task('less', ['clean'], function () {
    var l = less({
        plugins: [autoprefix, cleancss]
    });
    //l.on('error',function(e){
    //    gutil.log(e);
    //    l.end();
    //});
    return gulp.src('public/css/*.less')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }}))
        .pipe(l)
        .on('error', gutil.log)
        .pipe(gulp.dest('public/css/'))
        ;
});

// default tasks
gulp.task('default', ['connect', 'watch'])
