var gulp = require('gulp');
var uglify = require('gulp-uglify');
var del = require('del');
var cleanCSS = require('gulp-clean-css');
var cache = require('gulp-cache');
var imagemin = require('gulp-imagemin');
var filter = require('gulp-filter');
var useref = require('gulp-useref');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var zip = require('gulp-zip');

gulp.task('clean',function(cb){
	return del(['dist/**/*','!dist/Mobile/fonts','!dist/Mobile/fonts/**/*'],cb);
});

gulp.task('copy-font',function(cb){
	return gulp.src('fonts/**/*')
		.pipe(gulp.dest('dist/Mobile/fonts'));
});

gulp.task('copy-android',function(cb){
	return gulp.src('Android/**/*')
		.pipe(gulp.dest('dist/Mobile/Android'));
});

gulp.task('copy-html',function(cb){
	return gulp.src('html/**/*')
		.pipe(gulp.dest('dist/Mobile/html'));
});

gulp.task('copy-download',function(cb){
	return gulp.src('download/**/*')
		.pipe(gulp.dest('dist/Mobile/download'));
});

gulp.task('copy-json',function(cb){
	return gulp.src('config.json')
		.pipe(gulp.dest('dist/Mobile'));
});

gulp.task('copy-nginx',function(cb){
	return gulp.src('*.conf')
		.pipe(gulp.dest('dist/Mobile'));
});
gulp.task('compress-image',function(cb){
	return gulp.src('images/**/*.{jpg,png,gif,ico}')
		.pipe(imagemin({
			optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
			progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
			interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
			multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
		}))
		.pipe(gulp.dest('dist/Mobile/images'));
});

var allExcludeJs = filter(['**/*.js'], {restore: true});
var allExcludeCss = filter(['**/*.css'], {restore: true});
gulp.task('min-merge',function(cb){
	return gulp.src('index.html')
		.pipe(useref())
		.pipe(allExcludeJs)
		.pipe(uglify())
		// .pipe(rev())
		.pipe(allExcludeJs.restore)
		.pipe(allExcludeCss)
		.pipe(cleanCSS({compatibility: 'ie8'}))
		// .pipe(rev())
		.pipe(allExcludeCss.restore)
		// .pipe(revReplace())
		.pipe(gulp.dest('dist/Mobile'))
});

gulp.task('zip',function(cb){
	return gulp.src('dist/**/*')
		.pipe(zip('Mobile.zip'))
		.pipe(gulp.dest('dist'));
});

gulp.task('build',gulp.series('clean','copy-html','copy-json','copy-nginx','copy-download','copy-android',
	'copy-font','compress-image','min-merge','zip'));
