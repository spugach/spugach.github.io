var gulp = require('gulp');
var config = require('./gulp-settings.json');
var clean = require('del');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var pngmin = require('gulp-pngmin');
var copy = require('gulp-contrib-copy');
var gcmq = require('gulp-group-css-media-queries');


var postCssPlugins = [
    autoprefixer({ browsers: ['last 4 version', 'Android 4'] })
];

gulp.task('clean:prod', function() {
    return clean([
        config.cssDir + "**/*.map",
        config.cssMainFileDir + config.cssMainFileName + ".css.map",
        config.imgDir + "*.*"
    ]);
});

gulp.task('imagemin', function() {
    return gulp.src(config.imgSourceDir+'*.{jpg,gif}')
        .pipe(newer(config.imgDir))
        .pipe(imagemin())
        .pipe(gulp.dest(config.imgDir));
});

gulp.task('pngmin', function() {
  gulp.src(config.imgSourceDir+'*.png')
    .pipe(newer(config.imgDir))
    .pipe(pngmin())
    .pipe(gulp.dest(config.imgDir));
});

// compiling for development (sourcemaps=true)
gulp.task('sass:dev', function() {
    return gulp.src(config.sassDir + './**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(postCssPlugins))
        .pipe(sourcemaps.write('./', {includeContent:false, sourceRoot:'./'}))
        .pipe(gulp.dest('./' + config.cssDir));
});

// compiling for production (sourcemaps=false)
gulp.task('sass:prod', function() {
    return gulp.src(config.sassDir + './**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gcmq())
        .pipe(postcss(postCssPlugins))
        .pipe(gulp.dest('./' + config.cssDir));
});

gulp.task('copy', function() {
  gulp.src(config.imgSourceDir+'*')
    .pipe(newer(config.imgDir))
    .pipe(copy())
    .pipe(gulp.dest(config.imgDir));
});

// Static Server + watching html/scss/js files
gulp.task('serve', ['sass:dev'], function() {
    browserSync.init({
        server: "./"
    });
    // without browserReload
    gulp.watch(config.sassDir + "**/*.scss", ['sass:dev']);
    gulp.watch(config.imgSourceDir+'**/*.{jpg,gif}', ['imagemin']);
    gulp.watch(config.imgSourceDir+'**/*.png', ['pngmin']);
    gulp.watch(config.imgSourceDir+'**/*.svg', ['copy']);

    // with browserReload
    gulp.watch(config.cssDir + "**/*.css").on('change', browserSync.reload);
    gulp.watch("./*.html").on('change', browserSync.reload);
    gulp.watch("./"+config.jsDir+"*.js").on('change', browserSync.reload);
    gulp.watch(config.imgDir+'**').on('change', browserSync.reload);
});


gulp.task('default', ['serve']);
gulp.task('dist', ['clean:prod', 'sass:prod', 'copy', 'imagemin', 'pngmin']);
