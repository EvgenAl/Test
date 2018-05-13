var gulp      = require('gulp'), // Подключаем Gulp
    sass        = require('gulp-sass'), //Подключаем Sass пакет,
    browserSync = require('browser-sync'), // Подключаем Browser Sync
    concat      = require('gulp-concat'),//конкатенция файлов
    cssnano     = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    rename      = require('gulp-rename'), // Подключаем библиотеку для переименования файлов 
    uglify      = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    del					=require('del'),//удаление ненужных файлов
    imagemin    = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant    = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
     autoprefixer = require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического добавления префиксов
     plumber = require('gulp-plumber');
     notify = require('gulp-notify');
     rigger = require('gulp-rigger');


     /*============Пишем таски=================*/

gulp.task('mytask',function(){//таски - название и сама функция
return gulp.src('source files')//базовая команда, которая берет файлы из выборки
.pipe(plugin())//вызов подключенного плагина для изменения файла
.pipe(gulp.dest('folder'))//вывод результата в нужную папку
});

/*=======Выборка файлов=========*/


//return gulp.src('app/sass/*.scss') - выбирает все файлы с расширением scss
//все файлы scss с нижним подчеркиванием не компилируются отдельно
//return gulp.src('app/sass/**/*.scss') - все файлы в любом количестве вложенных директорий
//return gulp.src('app/sass/*.+(scss|sass)') - все файлы указанных расширений




/*============Запуск локального сервера=====================*/

gulp.task('browser-sync', function(){//запускает локальный сервер, liveReload
	browserSync({
		server:{
			baseDir:'app'
		},
		notify:false
	});
});

/*=====================Сборка скриптов и стилей======================*/

gulp.task('sass', function(){
	gulp.src('app/sass/*.scss')
	                .pipe(plumber({ // plumber - плагин для отловли ошибок.
            errorHandler: notify.onError(function(err) { // nofity - представление ошибок в удобном для вас виде.
                return {
                    title: 'Styles',
                    message: err.message
                }
            })
        }))
	        .pipe(sass())
	        .pipe(autoprefixer(['last 15 versions','> 1%','ie 8','ie 7'],{cascade:true}))
	        .pipe(gulp.dest('app/css/'))
	        .pipe(browserSync.reload({
	        	stream:true
	        }))
	      });


gulp.task('sass-libs', function(){
	return gulp.src('app/libs/*.scss')
	.pipe(sass())
	.pipe(cssnano())
	.pipe(gulp.dest('app/css/'))
	.pipe(browserSync.reload({
		stream:true
	}))
});



gulp.task('scripts', function(){
	return gulp.src([
		'app/js/*.js',
		])
	.pipe(rigger())
	.pipe(concat('scripts.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'));
});



/*=============================Очистка dist==================================*/

gulp.task('clean',function(){
	return del.sync('dist');
});

/*===================Наблюдение за изменениями в файлах=======================*/

gulp.task('watch',['browser-sync','scripts','sass-libs'] ,function(){//также можно выполнять другие таски до запуска данного
 gulp.watch('app/sass/*.scss', ['sass']);//выбираем отслеживаемый файл и пишем массив запускаемых тасков при изменениях
 gulp.watch('app/libs/*.scss', ['sass'], browserSync.reload);
 gulp.watch('app/*.html', browserSync.reload)
 gulp.watch('app/js/custom.js', browserSync.reload)
});


/*==========================оптимизация изображений=====================================*/

gulp.task('img', function() {
	return gulp.src('app/img/**/*') // Берем все изображения из app
		.pipe(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
	});

/*=========================Подготовка к production====================================*/


gulp.task('build', ['clean', 'sass', 'sass-libs', 'scripts', 'img'], function() {

	var buildCss = gulp.src([ // Переносим библиотеки в продакшен
		'app/css/style.css',
		'app/css/libs.css',
		])
	.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
	.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src([
		'app/js/scripts.min.js',
		'app/js/custom.js'
		]) // Переносим скрипты в продакшен
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
	.pipe(gulp.dest('dist'));

});


gulp.task('default', ['watch']);