const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css','public/css', 'resources/css/variable.css', 'public/css', 'resources/css/component/sidebar.css', 'public/css/component', 'resources/css/component/content.css',  'public/css/component',  [
        require('tailwindcss'),
        require('autoprefixer'),
    ]);