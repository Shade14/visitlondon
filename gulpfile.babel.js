import gulp                 from 'gulp';
import sass                 from 'gulp-sass';
import browserify           from 'gulp-browserify';
import browserSync          from 'browser-sync';
import injectPartials       from 'gulp-inject-partials';
import del                  from 'del';
import prefixer             from 'gulp-autoprefixer';
import babel                from 'gulp-babel';
import babelify             from 'babelify';

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

// gulp.task('sass', function(){
//   return gulp.src(SOURCEPATHS.sassApp)
//     .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
//     .pipe(gulp.dest(APPPATH.css))
// });

const server = browserSync.create();

const cleanHTML = () => del(APPPATH.root + '/*.html')

function copyHTML(){
  return gulp.src(SOURCEPATHS.htmlSource)
    .pipe(injectPartials())
    .pipe(gulp.dest(APPPATH.root));
}

function styles(){
  return gulp.src(SOURCEPATHS.sassApp)
    .pipe(prefixer())
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(gulp.dest(APPPATH.css));
}

function stylesLib(){
  return gulp.src(SOURCEPATHS.cssLibSources)
    .pipe(gulp.dest(APPPATH.css));
}

function scripts(){
  return gulp.src(SOURCEPATHS.jsSource, {sourcemaps: true, allowEmpty: true})
    .pipe(babel())
    //.pipe(concat('app.min.js'))
    .pipe(browserify({transform:['babelify']}))
    .pipe(gulp.dest(APPPATH.js));
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

const watchHTML = () => gulp.watch([SOURCEPATHS.htmlSource, SOURCEPATHS.htmlPartialsSource], gulp.series(cleanHTML, copyHTML, reload));
const watchCss  = () => gulp.watch(SOURCEPATHS.sassSource, gulp.series(styles, stylesLib, reload));
const watchJs   = () => gulp.watch(SOURCEPATHS.jsSource, gulp.series(scripts, reload));


const watcher = gulp.parallel(watchHTML, watchCss, watchJs);

//gulp.task('default', ['sass']);
const dev = gulp.series(copyHTML, styles, serve, watcher);

export default dev;
