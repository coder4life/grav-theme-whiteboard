const autoprefixer = require('autoprefixer'),
    babel = require('gulp-babel'),
    buffer = require('gulp-buffer'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    flexfix = require('postcss-flexbugs-fixes'),
    gulp = require('gulp'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    postcss = require('gulp-postcss'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    merge = require('merge-stream');

config = {
    js: [
        {
            name: 'bootstrap',
            in: [
                'node_modules/bootstrap/js/src/util.js',
                'node_modules/bootstrap/js/src/alert.js',
                'node_modules/bootstrap/js/src/button.js',
                // 'node_modules/bootstrap/src/carousel.js',
                'node_modules/bootstrap/js/src/collapse.js',
                'node_modules/bootstrap/js/src/dropdown.js',
                'node_modules/bootstrap/js/src/modal.js',
                'node_modules/bootstrap/js/src/popover.js',
                'node_modules/bootstrap/js/src/scrollspy.js',
                'node_modules/bootstrap/js/src/tab.js',
                'node_modules/bootstrap/js/src/tooltip.js'
            ],
            out: 'js-compiled',
            compile: true,
            minify: true,
        },
        {
            name: 'owlcarousel2',
            in: [
                'node_modules/owl.carousel/src/js/owl.carousel.js',
                'node_modules/owl.carousel/src/js/owl.animate.js',
                'node_modules/owl.carousel/src/js/owl.autoheight.js',
                'node_modules/owl.carousel/src/js/owl.autoplay.js',
                'node_modules/owl.carousel/src/js/owl.autorefresh.js',
                'node_modules/owl.carousel/src/js/owl.hash.js',
                'node_modules/owl.carousel/src/js/owl.lazyload.js',
                'node_modules/owl.carousel/src/js/owl.navigation.js',
                'node_modules/owl.carousel/src/js/owl.support.js',
                'node_modules/owl.carousel/src/js/owl.support.modernizr.js',
                'node_modules/owl.carousel/src/js/owl.video.js'
            ],
            out: 'js-compiled',
            compile: false,
            minify: true,
        },
        {
            name: 'particles',
            in: [
                'node_modules/particles.js/particles.js'
            ],
            out: 'js-compiled',
            compile: false,
            minify: true,
        },
        {
            name: 'typed',
            in: [
                'node_modules/typed.js/js/typed.js'
            ],
            out: 'js-compiled',
            compile: false,
            minify: true,
        }
    ],
    css: [
        { // bootstrap
            name: 'bootstrap',
            in: 'scss/bootstrap.scss',
            out: 'css-compiled',
            compile: true,
            post: true,
        },
        { // whiteboard
            name: 'owlcarousel2',
            in: 'scss/owlcarousel2.scss',
            out: 'css-compiled',
            compile: true,
            post: true,
        },
        { // whiteboard
            name: 'whiteboard',
            in: 'scss/whiteboard.scss',
            out: 'css-compiled',
            compile: true,
            post: true,
        }
    ],
};

gulp.task('js', function() {
    config.js.forEach(function(js) {
        gulp.src(js.in, {base: "."})
            .on('end', function() {
                gutil.log(gutil.colors.green('√'), 'Saved JS – ' + js.name);
            })
            .on('error', gutil.log)
            .pipe(plumber())
            .pipe(gulpif(js.compile, sourcemaps.init()))
            .pipe(gulpif(js.compile,
                babel({
                    plugins: [
                        ['transform-es2015-modules-strip']
                    ],
                    presets: [
                        ['es2015', { 'modules': false, 'loose': true }]
                    ]
                })
            )) // is the path able to compile?
            .pipe(concat(js.name + '.js'))
            .pipe(gulp.dest(js.out))
            .pipe(gulpif(js.minify, uglify().on('error', gutil.log))) // is the path able to minify?
            .pipe(gulpif(js.compile, sourcemaps.write('.')))
            .pipe(rename(js.name + '.min.js'))
            .pipe(gulp.dest(js.out))
    });
});

gulp.task('css', function() {
    const streams = [];
    config.css.forEach(function(css) {
        streams.push(
            gulp.src(css.in, {base: "."})
                .on('end', function() {
                    gutil.log(gutil.colors.green('√'), 'Saved CSS – ' + css.name);
                })
                .on('error', gutil.log)
                .pipe(sourcemaps.init())
                .pipe(gulpif(css.compile, sass())) // is the path able to compile?
                .pipe(gulpif(css.post,
                    postcss([
                        autoprefixer({
                            browsers: [
                                'Android 2.3',
                                'Android >= 4',
                                'Chrome >= 35',
                                'Edge >= 12',
                                'Explorer >= 10',
                                'Firefox >= 38',
                                'iOS >= 8',
                                'Opera >= 12',
                                'Safari >= 8'
                            ],
                            cascade: false
                        }),
                        flexfix
                    ])
                )) // is the path able to minify?
                .pipe(sourcemaps.write('.'))
                .pipe(rename(css.name + '.css'))
                .pipe(gulp.dest(css.out))
                .pipe(cleanCSS())
                .pipe(rename(css.name + '.min.css'))
                .pipe(gulp.dest(css.out))
        );
    });

    return merge(streams);
});

gulp.task('watch', function() {

});

// Batch Gulp Tasks
gulp.task('default', ['css', 'js']);