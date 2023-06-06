import commonjs from '@rollup/plugin-commonjs';
import dsv from '@rollup/plugin-dsv';
import json from "@rollup/plugin-json";
import resolve from '@rollup/plugin-node-resolve';
import replace from "@rollup/plugin-replace";
import css from 'rollup-plugin-css-only';
import copy from 'rollup-plugin-copy-merge';
import del from 'rollup-plugin-delete';
import livereload from 'rollup-plugin-livereload';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';

import config from './config.json';

const production = !process.env.ROLLUP_WATCH;
const cssFile = config.theme === 'ns' ? "ns" : 'gd';

export default {
	input: 'src/main.js',
	output: {
		sourcemap: !production,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		production && del({ targets: 'public/build/*' }),

		copy({
			targets: [
			  { src: ['src/css/global-base.css', 'src/css/global-' + cssFile + '.css'], file: 'public/global.css' },
			]
		}),
		// Allow for importing csv files as modules
		dsv(),
		// And importing json files
		json({
			compact: true
		}),

		svelte({
			// enable run-time checks when not in production
			compilerOptions: {
				dev: !production,
				hydratable: config.hydrate
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		replace({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		commonjs(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()

	],
	watch: {
		clearScreen: false
	}
};

function serve() {
	if (process.platform == "win32") {
		let started = false;
		return {
		writeBundle() {
			if (!started) {
			started = true;
			require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});
			}
		}
		};
	} else {
		let server;
	
		function toExit() {
			if (server) {
				try {
					require('child_process').spawn("kill", ["--", `-${server.pid}`]);
				} catch (error) {
					console.log(error.message);
					server.kill();
				}
			}
		}
	
		return {
			writeBundle() {
				if (server) return;
		
				server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				detached: true,
				});
		
				
				process.on('SIGINT', toExit);
				process.on('SIGTERM', toExit);
				process.on('exit', toExit);
			},
			closeWatcher: toExit,
		};
	}
}
