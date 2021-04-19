import { exec, spawn } from 'child_process';
import chokidar from 'chokidar';
import execa, { ExecaChildProcess } from 'execa';
import { readFile } from 'fs-extra-plus';
import debounce from 'lodash.debounce';
import { isEmpty, wait } from 'utils-min';


// from - https://github.com/smallyard/webhere/blob/master/src/server.js
// Had to override it to allow opening on a specific file
export function openBrowser(url: string) {
	try {
		switch (process.platform) {
			case "darwin":
				exec("open " + url);
				break;
			case "win32":
				exec("start " + url);
				break;
			default:
				spawn("xdg-open", [url]);
		}
	} catch (e) {
		console.log("Can't open browser, cause by: " + e)
	}
}


/**
 * Extra processing on top of rollup/typescript2 allowing to restart compilation when new ts files are added or removed.
 */
export async function watchRollupTs() {
	const { stdout, stderr } = process;

	let buildjsExeca: ExecaChildProcess | undefined;
	// files that have been added but still empty, so need to wait on change
	const pendingEditFiles = new Set<string>();

	// restart function
	async function startBuildWatch() {
		let jsPro: Promise<any>;
		if (buildjsExeca) {
			buildjsExeca.kill();
			await wait(200);
		}

		pendingEditFiles.clear(); // some non-critical unhandled corner cases (some files might still be empty)
		buildjsExeca = execa('npm', ['run', 'build-js', '--', '-w'], { stdout, stderr });

		buildjsExeca.catch(ex => { // to avoid unhandled exception
			console.log('npm run build-js terminated');
		});
	}

	// start the initial build and watch
	await startBuildWatch();

	const startBuildWatchDebounced = debounce(startBuildWatch, 300);

	const codeWatch = chokidar.watch('src/**/*.ts', { depth: 99, ignoreInitial: true, persistent: true });
	async function handleChange(action: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', file: string,) {

		// FILE ADDED - build only if new file is not empty, otherwise, add to watch pendingEditFiles list.
		if (action === 'add') {
			const content = await readFile(file, 'utf-8');
			if (!isEmpty(content)) {
				startBuildWatchDebounced();
			} else {
				pendingEditFiles.add(file);
			}
		}
		// FILE CHANGED - restart watch session only if file changed was in the pending list.
		else if (action === 'change' && pendingEditFiles.has(file)) {
			const content = await readFile(file, 'utf-8');
			if (!isEmpty(content)) {
				startBuildWatchDebounced();
			}
		}
		// Note: rollup-typescript2 watch handle if existing file (with content) change, so nothing to do. 
	}

	codeWatch.on('all', handleChange);
}

