const autoprefixer = require('autoprefixer'),
  cleanCSS = require('gulp-clean-css'),
  concat = require('gulp-concat'),
  count = require('gulp-count'),
  flatten = require('gulp-flatten'),
  flexfix = require('postcss-flexbugs-fixes'),
  gulp = require('gulp'),
  ifcond = require('gulp-if'),
  util = require('gulp-util'),
  plumber = require('gulp-plumber'),
  postcss = require('gulp-postcss'),
  rename = require('gulp-rename'),
  replace = require('gulp-replace'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  merge = require('merge-stream');

config = {
  css: [
    { // bootstrap
        name: 'bootstrap',
        base: '.',
        in: 'scss/vendor/bootstrap.scss',
        out: 'css',
        compile: true,
        prefix: true,
    },
    { // fontawesome
        name: 'fontawesome',
        base: '.',
        in: 'scss/vendor/fontawesome.scss',
        out: 'css',
        compile: true,
        prefix: true,
    },
    { // owlcarousel2
        name: 'owlcarousel2',
        base: '.',
        in: 'scss/vendor/owlcarousel2.scss',
        out: 'css',
        compile: true,
        prefix: true,
    },
    { // whiteboard
        name: 'whiteboard',
        base: '.',
        in: 'scss/whiteboard.scss',
        out: 'css',
        compile: true,
        prefix: true,
    }
  ],
  js: [
    {
      name: 'bootstrap',
      base: '.',
      in: [
        'node_modules/bootstrap/dist/js/bootstrap.js',
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
      ],
      out: 'js',
      flatten: true,
    },
    {
      name: 'owlcarousel2',
      base: '.',
      in: [
        'node_modules/owl.carousel/dist/owl.carousel.js',
        'node_modules/owl.carousel/dist/owl.carousel.min.js',
      ],
      out: 'js',
      flatten: true,
    },
    {
      name: 'particles',
      base: '.',
      in: [
        'node_modules/particles.js/particles.js',
      ],
      out: 'js',
      minify: true,
    },
    {
      name: 'popper',
      base: '.',
      in: [
        'node_modules/popper.js/dist/umd/popper.js',
        'node_modules/popper.js/dist/umd/popper.min.js',
        'node_modules/popper.js/dist/umd/popper.min.js.map',
        'node_modules/popper.js/dist/umd/popper-utils.js',
        'node_modules/popper.js/dist/umd/popper-utils.min.js',
        'node_modules/popper.js/dist/umd/popper-utils.min.js.map',
      ],
      out: 'js',
      flatten: true,
    },
    {
      name: 'stackblur',
      base: '.',
      in: [
        'node_modules/stackblur-canvas/dist/stackblur.js',
        'node_modules/stackblur-canvas/dist/stackblur.min.js',
      ],
      out: 'js',
      flatten: true,
    },
    {
      name: 'tooltip',
      base: '.',
      in: [
        'node_modules/tooltip.js/dist/tooltip.js',
        'node_modules/tooltip.js/dist/tooltip.min.js',
        'node_modules/tooltip.js/dist/tooltip.min.js.map',
      ],
      out: 'js',
      flatten: true,
    },
    {
      name: 'typed',
      base: '.',
      in: [
        'node_modules/typed.js/lib/typed.js',
        'node_modules/typed.js/lib/typed.min.js',
        'node_modules/typed.js/lib/typed.min.js.map',
      ],
      out: 'js',
      flatten: true,
    }
  ],
  fonts: [
    {
      name: 'fontawesome',
      base: 'node_modules/font-awesome/fonts/',
      in: 'node_modules/font-awesome/fonts/*',
      out: 'fonts'
    }
  ],
};

supportedBrowsers = [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 35',
  'Edge >= 12',
  'Explorer >= 10',
  'Firefox >= 38',
  'iOS >= 8',
  'Opera >= 12',
  'Safari >= 8'
];

gulp.task('clean', function () {
  console.log("Clean all files in build folder");

  return gulp.src("build/*", { read: false })
    .pipe(clean());
});

gulp.task('css', function () {
  const streams = [];
  config.css.forEach(function (css) {
    streams.push(
      gulp.src(css.in, {base: css.base})
        .on('end', function () {
          util.log(util.colors.green('√'), 'Saved CSS – ' + css.name);
        })
        .on('error', util.log)
        .pipe(plumber()) // make sure ready
        .pipe(sourcemaps.init())
        .pipe(count('found ## pages', {logFiles: true}))
        .pipe(ifcond(css.compile, sass().on('error', sass.logError))) // is the path able to compile?
        .pipe(ifcond(css.prefix,
          postcss([
            autoprefixer({
              browsers: supportedBrowsers,
              cascade: false
            }),
            flexfix
          ])
        )) // is the path able to minify?
        .pipe(rename(css.name + '.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(css.out))
        .pipe(rename(css.name + '.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest(css.out))
    );
  });
  return merge(streams);
});

gulp.task('fonts', function () {
  config.fonts.forEach(function (fonts) {
    gulp.src(fonts.in, {base: fonts.base})
      .on('end', function () {
        util.log(util.colors.green('√'), 'Saved Fonts – ' + fonts.name);
      })
      .on('error', util.log)
      .pipe(gulp.dest(fonts.out))
  });
});

gulp.task('js', function () {
  config.js.forEach(function (js) {
    return gulp
      .src(js.in, {base: js.base})
      .on('end', function () {
        util.log(util.colors.green('√'), 'Saved JS – ' + js.name);
      })
      .on('error', util.log)
      .pipe(plumber())
      .pipe(ifcond(js.minify, sourcemaps.init()))
      .pipe(ifcond(js.minify, flatten()))
      .pipe(ifcond(js.minify, gulp.dest(js.out)))
      .pipe(ifcond(js.minify, rename(js.name + '.min.js')))
      .pipe(ifcond(js.minify, uglify().on('error', util.log))) // is the path able to minify?
      .pipe(ifcond(js.minify, sourcemaps.write('.')))
      .pipe(ifcond(js.minify, gulp.dest(js.out)))
      .pipe(ifcond(js.flatten, flatten()))
      .pipe(ifcond(js.flatten, gulp.dest(js.out)))
  });
});

gulp.task('css:watch', function () {
  gulp.watch('scss/**/*.scss', ['css']);
});

// Batch Gulp Tasks
gulp.task('default', ['css', 'fonts', 'js']);