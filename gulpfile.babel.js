import babel           from 'gulp-babel';
import babelify        from 'babelify';
import browserify      from 'gulp-browserify';
import browserSync     from 'browser-sync';
import concat          from 'gulp-concat';
import cssmin          from 'gulp-cssmin';
import del             from 'del';
import gulp            from 'gulp';
import htmlmin         from 'gulp-htmlmin';
import imagemin        from 'gulp-imagemin';
import injectPartials  from 'gulp-inject-partials';
import newer           from 'gulp-newer';
import prefixer        from 'gulp-autoprefixer';
import rename          from 'gulp-rename';
import sass            from 'gulp-sass';
import uglify          from 'gulp-uglify';

const SOURCEPATHS = {
  htmlSource: 'src/*.html',
  htmlPartialsSource: 'src/partials/*.html',
  sassApp: 'src/scss/app.scss',
  sassSource: 'src/scss/*.scss',
  cssLibSources: 'src/cssLib/*.css',
  jsSource: 'src/js/pages/*.js',
  imgSource: 'src/img/**/*'
};

const APPPATH = {
  root: 'app/',
  css: 'app/css',
  js: 'app/js',
  fonts: 'app/fonts',
  img: 'app/img'
};

const server = browserSync.create();

const cleanHTML = () => del(APPPATH.root + '/*.html')
const cleanImages = () => del(APPPATH.img + '/**');

function copyHTML(){
  return gulp.src(SOURCEPATHS.htmlSource)
    .pipe(injectPartials())
    .pipe(gulp.dest(APPPATH.root));
}

function prodHTML() {
  return gulp.src(SOURCEPATHS.htmlSource)
    .pipe(injectPartials())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(APPPATH.root));
}

function styles(){
  return gulp.src(SOURCEPATHS.sassApp)
    .pipe(prefixer())
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(concat('app.css'))
    .pipe(gulp.dest(APPPATH.css));
}

function stylesLib(){
  return gulp.src(SOURCEPATHS.cssLibSources)
    .pipe(gulp.dest(APPPATH.css));
}

function prodStyles() {
  return gulp.src(SOURCEPATHS.sassApp)
    .pipe(prefixer())
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(concat('app.css'))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(APPPATH.css));
}

function copyBootstrap(){
  var bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.min.css');
  return bootstrapCSS
    .pipe(gulp.dest(APPPATH.css));
}

function copyFontAwesome(){
  var fontSource = gulp.src('./node_modules/font-awesome/fonts/*.{eot,svg,ttf,woff,woff2,otf}');
  return fontSource
    .pipe(gulp.dest(APPPATH.fonts));
}

function fontAwesomeCss(){
  var fontCss = gulp.src('./node_modules/font-awesome/css/font-awesome.min.css');
  return fontCss
    .pipe(gulp.dest(APPPATH.css));
}

const fontAwesome = gulp.series(copyFontAwesome, fontAwesomeCss);

function scripts(){
  return gulp.src(SOURCEPATHS.jsSource, {sourcemaps: true, allowEmpty: true})
    .pipe(babel())
    //.pipe(concat('app.min.js'))
    .pipe(browserify({transform:['babelify']}))
    .pipe(gulp.dest(APPPATH.js));
}

function prodScripts(){
  return gulp.src(SOURCEPATHS.jsSource, {sourcemaps: true, allowEmpty: true})
    .pipe(babel())
    .pipe(concat('app.min.js'))
    .pipe(browserify())
    .pipe(uglify())
    .pipe(gulp.dest(APPPATH.js));
}

function images(){
  return gulp.src(SOURCEPATHS.imgSource)
    .pipe(newer(APPPATH.img))
    .pipe(imagemin())
    .pipe(gulp.dest(APPPATH.img));
}

function reload(done){
  server.reload();
  done();
}

function serve(done){
  server.init([APPPATH.css + '/*.css', APPPATH.root + '/*.html', APPPATH.js + '/*.js'], {
    server: {
      baseDir: APPPATH.root
    }
  });
  done();
}

const watchHTML   = () => gulp.watch([SOURCEPATHS.htmlSource, SOURCEPATHS.htmlPartialsSource], gulp.series(cleanHTML, copyHTML, reload));
const watchCss    = () => gulp.watch(SOURCEPATHS.sassSource, gulp.series(styles, stylesLib, reload));
const watchJs     = () => gulp.watch(SOURCEPATHS.jsSource, gulp.series(scripts, reload));
const watchImages = () => gulp.watch(SOURCEPATHS.imgSource, gulp.series(images, reload));

const watcher = gulp.parallel(watchHTML, watchCss, watchJs, watchImages);
const cleaner = gulp.series(cleanHTML, cleanImages);

const dev = gulp.series(cleaner, fontAwesome, copyBootstrap, copyHTML, styles, stylesLib, scripts, images, serve, watcher);
const prod = gulp.series(cleaner, fontAwesome, copyBootstrap, prodHTML, prodStyles, stylesLib,prodScripts, images);

export default dev;
