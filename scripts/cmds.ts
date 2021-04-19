import execa from 'execa';
import * as fs from 'fs-extra-plus';
import { wait } from 'utils-min';
import { openBrowser, watchRollupTs } from './utils';
import minimist from 'minimist';
const { stdout, stderr } = process;

// list of command support by this file
const cmds: any = { watch, build };

//#region    ---------- Cli to Function Routing ---------- 
// Simple command line to function calling based on first cli argument
const argv = minimist(process.argv.slice(2));
const cmd = argv._[0];
if (cmds[cmd]) {
	cmds[cmd](argv);
} else {
	console.log(`Command ${cmd} not available. Available commands are:\n  ${Object.keys(cmds).join('\n  ')}`);
}
//#endregion ---------- /Cli to Function Routing ---------- 


async function build() {
	await fs.saferRemove('./dist/');

	//// build the frontend assets 
	//// (client side typescript and pcss files, output: server/web-folder/...)
	await execa('npm', ['install'], { cwd: './frontend', stdout, stderr });
	await execa('npm', ['run', 'build-js'], { stdout, stderr });
	await execa('npm', ['run', 'build-css'], { stdout, stderr });

	//// build the server assets 
	//// (just server typescript files compilation, output: server/dist/)
	await execa('npm', ['install'], { cwd: './server', stdout, stderr });
	await execa('../node_modules/.bin/tsc', [], { cwd: './server', stdout, stderr });
}


async function watch() {

	//// first full build
	await build();

	//// Watch the frontend
	// advanced ts/js handling to restart rollup/ts watch when adding/removing files
	watchRollupTs();
	// build and watch the css
	execa('npm', ['run', 'build-css', '--', '-w'], { stdout, stderr });

	//// Watch the server
	execa('npm', ['run', 'watch'], { cwd: './server', stdout, stderr });

	// start the live reload server which will reload the app and css on dist .js and .css changes
	execa('./node_modules/.bin/livereload', ['"server/web-folder/"', '--extraExts', 'svg', '-w', '500'], { shell: true, stdout, stderr });

	//// open the browser
	await wait(500);
	openBrowser('http://localhost:8888/');

}

