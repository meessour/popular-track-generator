const {src, dest, series} = require('gulp');
const minifyCSS = require('gulp-csso');
const imagemin = require('gulp-imagemin');
const cleanCss = require('gulp-clean-css');
const terser = require('gulp-terser');
const svgmin = require('gulp-svgmin');

function moveAssets() {
    return src("./public/*")
        .pipe(dest("build/"));
}

function css() {
    return src('./public/css/*.css')
        .pipe(cleanCss())
        .pipe(minifyCSS())
        .pipe(dest('build/css'));
}

function cssSvg() {
    return src('./public/css/*.svg')
        .pipe(svgmin())
        .pipe(dest('build/css'));
}

function js() {
    return src('./public/js/*.js')
        .pipe(terser())
        .pipe(dest('build/js'));
}

function rootJs() {
    return src('./public/*.js')
        .pipe(terser())
        .pipe(dest('build/'));
}

function img() {
    return src('./public/icons/*.png')
        .pipe(imagemin())
        .pipe(dest('build/icons'));
}

function svg() {
    return src('./public/icons/*.svg')
        .pipe(svgmin())
        .pipe(dest('build/icons'));
}

exports.moveAssets = moveAssets;
exports.css = css;
exports.cssSvg = cssSvg;
exports.js = js;
exports.rootJs = rootJs;
exports.img = img;
exports.svg = svg;
exports.default = series(moveAssets, css, cssSvg, js, rootJs, img, svg);