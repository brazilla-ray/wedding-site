var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var cssNano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var imageMin = require('gulp-imagemin');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var useref = require('gulp-useref');
var filter = require('gulp-filter');

var opt = {
    distFolder: "dist/",
    srcFolder: "src/",
    rootFolder: "./"
}

gulp.task('styles', function(){
    return gulp.src(['src/styles/**/*.css'])
        .pipe(sourcemaps.init())
        .pipe(cssNano())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/styles'))
        .pipe(browserSync.stream());
});

gulp.task('scripts', function(){
   return gulp.src(['src/scripts/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/scripts'))
        .pipe(browserSync.stream());
    gulp.src(['src/scripts/**/*.php'])
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/scripts'))
        .pipe(browserSync.stream());
});

gulp.task('templates', function(){
    var data = {};

    var options = {
        batch: ['src/templates/partials']
    }
    return gulp.src(['src/templates/**/*.hbs', '!src/templates/partials/**/*.hbs'])
        .pipe(handlebars(data, options))
        .pipe(rename(function (path) {
            path.extname = '.html'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('images', function(){
    return gulp.src(['src/img/**/*'])
        .pipe(imageMin())
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream());
});

gulp.task("revision", gulp.series(gulp.parallel("styles", "scripts", "templates")), function() {
    return gulp.src(["dist/styles/**/*.css", "dist/scripts/**/*.js"])
        .pipe(rev())
        .pipe(gulp.dest(opt.distFolder))
        .pipe(rev.manifest())
        .pipe(gulp.dest(opt.distFolder))
});

gulp.task("build", gulp.series(gulp.parallel("revision")), function() {
    var manifest = gulp.src("./" + opt.distFolder + "/rev-manifest.json");

    return gulp.src(opt.rootFolder + "/index.html")
        .pipe(revReplace({manifest: manifest}))
        .pipe(gulp.dest(opt.rootFolder));
});

gulp.task('default', gulp.series(gulp.parallel('styles', 'images', 'scripts', 'templates')), function(){
    return browserSync.init({
        server: './'
    });
    gulp.watch('src/img/**/*', ['images']);
    gulp.watch('src/styles/**/*.css', ['styles']);
    gulp.watch('src/scripts/**/*.js', ['scripts']);
    gulp.watch('src/templates/**/*.hbs', ['templates']);
    gulp.watch('*.html', browserSync.reload);
});
