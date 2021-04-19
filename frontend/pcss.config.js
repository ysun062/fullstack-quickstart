const plugins = [
	require("autoprefixer"),
	require("postcss-import"),
	require("postcss-nested"),
];

module.exports = {
	input: 'pcss/main.pcss',
	output: '../server/web-folder/css/app-bundle.css',
	watchPath: 'pcss/**/*.pcss',
	plugins
}