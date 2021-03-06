const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const babel = require('gulp-babel');
const prefix = require( 'gulp-autoprefixer');
const changed = require( 'gulp-changed');
const concat = require( 'gulp-concat');
const imagemin = require( 'gulp-imagemin');
const notify = require( "gulp-notify");
const plumber = require( 'gulp-plumber');
const size = require( 'gulp-size');
const sourcemaps = require( 'gulp-sourcemaps');
const uglify = require( 'gulp-uglify');
const del = require('del');
const pngquant = require('pngquant');
var gutil = require('gulp-util');

//SET THE BASE DIRECTORY
const basedir = 'app';

gulp.task('browserSync', function(){
  browserSync.init({
    server: {
      baseDir: basedir
    }
  })
});

const plumberErrorNotify = {
	errorHandler: notify.onError("Error: <%= error.message %>")
};


gulp.task('clean', () => del(['static']));

gulp.task('babel', () => {
	return gulp.src([
		'!app/js/vendor/*.js',
		'app/js/**/*.js'
	])
		.pipe(plumber(plumberErrorNotify))
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(concat('main.js')) /*build single file*/
		.pipe(uglify({
			mangle: false,
			compress: true,
			output: { beautify: false }
		}))
    .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
		.pipe(sourcemaps.write())
		.pipe(size({
			"title": "Scripts size of"
		}))
		.pipe(gulp.dest('app/static/js'))
		.pipe(notify({
			"title": "JS",
			"message": "scripts compiled!",
			"onLast": true
		}))
		.pipe((browserSync.reload({
      stream: true
    })
  ));
});

gulp.task('sass', () => {
	return gulp.src([
		basedir+'/scss/**/*.scss'
	])
		.pipe(plumber(plumberErrorNotify))
		.pipe(changed(basedir+'/static/css'))
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.pipe(prefix({
			browsers: ['ie 8', 'opera 12', 'ff 15', 'chrome 25', 'last 2 version']
		}))
		.pipe(sourcemaps.write())
		.pipe(concat('main.css'))
		.pipe(size({
			"title": "Styles size of"
		}))
		.pipe(gulp.dest(basedir+'/static/css'))
		.pipe(notify({
			"title": "Styles",
			"message": "css compiled!!",
			"onLast": true
		}))
		.pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('images', () => {
	return gulp.src([
		basedir+'/img/**/*'
	])
		.pipe(plumber(plumberErrorNotify))
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      pngquant(),
      imagemin.svgo({
        plugins: [
          {removeViewBox: false},
          {removeTitle: true},
          {removeDesc: true},
          {removeComments: true}
        ]
      })
    ]))
		.pipe(gulp.dest(basedir+'/static/img'))
		.pipe(notify({
			"title": "Images",
			"message": "images compiled!",
			"onLast": true
		}))
		.pipe(browserSync.reload({
			stream: true
		}))
});

gulp.task('serve', ['clean', 'sass', 'babel', 'images', 'browserSync'], function(){
  gulp.watch(basedir+'/scss/**/*.scss', ['sass']);
  gulp.watch(basedir+'/*.html', browserSync.reload);
  gulp.watch(basedir+'/img', browserSync.reload);
  gulp.watch(basedir+'/js/**/*.js', [browserSync.reload, 'babel']);
});
