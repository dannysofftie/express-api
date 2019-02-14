var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

const settings = {
    watch: {
        files: ['src/**/*.ts'],
    },
    base: './',
};

gulp.task('default', function() {
    return tsProject
        .src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('dist'));
});
