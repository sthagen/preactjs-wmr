import htmPlugin from '../plugins/htm-plugin.js';
import sucrasePlugin from '../plugins/sucrase-plugin.js';
import wmrPlugin from '../plugins/wmr/plugin.js';
import wmrStylesPlugin from '../plugins/wmr/styles/styles-plugin.js';
import sassPlugin from '../plugins/sass-plugin.js';
import npmPlugin from '../plugins/npm-plugin/index.js';
import publicPathPlugin from '../plugins/public-path-plugin.js';
import minifyCssPlugin from '../plugins/minify-css-plugin.js';
import htmlEntriesPlugin from '../plugins/html-entries-plugin.js';
import aliasPlugin from '../plugins/aliases-plugin.js';
import processGlobalPlugin from '../plugins/process-global-plugin.js';
import urlPlugin from '../plugins/url-plugin.js';
import resolveExtensionsPlugin from '../plugins/resolve-extensions-plugin.js';
import fastCjsPlugin from '../plugins/fast-cjs-plugin.js';
import bundlePlugin from '../plugins/bundle-plugin.js';
import jsonPlugin from '../plugins/json-plugin.js';
import optimizeGraphPlugin from '../plugins/optimize-graph-plugin.js';
import externalUrlsPlugin from '../plugins/external-urls-plugin.js';
import copyAssetsPlugin from '../plugins/copy-assets-plugin.js';
import nodeBuiltinsPlugin from '../plugins/node-builtins-plugin.js';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import visualizer from 'rollup-plugin-visualizer';
import { defaultLoaders } from './default-loaders.js';
import { importAssertionPlugin } from '../plugins/import-assertion.js';
import { acornDefaultPlugins } from './acorn-default-plugins.js';
import { prefreshPlugin } from '../plugins/preact/prefresh.js';

/**
 * @param {import("wmr").Options} options
 * @returns {import("wmr").Plugin[]}
 */
export function getPlugins(options) {
	const { plugins, publicPath, alias, root, env, minify, mode, sourcemap, features, visualize } = options;

	// Plugins are pre-sorted
	let split = plugins.findIndex(p => p.enforce === 'post');
	if (split === -1) split = plugins.length;

	const production = mode === 'build';

	return [
		acornDefaultPlugins(),
		...plugins.slice(0, split),
		features.preact && !production && prefreshPlugin({ sourcemap }),
		production && htmlEntriesPlugin({ root, publicPath }),
		externalUrlsPlugin(),
		nodeBuiltinsPlugin({ production }),
		urlPlugin({ inline: !production, root, alias }),
		jsonPlugin({ root }),
		bundlePlugin({ inline: !production, cwd: root }),
		aliasPlugin({ alias }),
		sucrasePlugin({
			typescript: true,
			sourcemap,
			production
		}),
		// Transpile import assertion syntax to WMR prefixes
		importAssertionPlugin({ sourcemap }),
		production &&
			(dynamicImportVars.default || dynamicImportVars)({
				include: /\.(m?jsx?|tsx?)$/,
				exclude: /\/node_modules\//
			}),
		production && publicPathPlugin({ publicPath }),
		sassPlugin({ production, sourcemap, root }),
		wmrStylesPlugin({ hot: !production, root, production, alias, sourcemap }),
		processGlobalPlugin({
			sourcemap,
			env,
			NODE_ENV: production ? 'production' : 'development'
		}),
		htmPlugin({ production, sourcemap: options.sourcemap }),
		wmrPlugin({ hot: !production, sourcemap: options.sourcemap }),
		fastCjsPlugin({
			// Only transpile CommonJS in node_modules and explicit .cjs files:
			include: /(^npm\/|[/\\]node_modules[/\\]|\.cjs$)/
		}),
		production && npmPlugin({ external: false }),
		resolveExtensionsPlugin({
			extensions: ['.ts', '.tsx', '.js', '.cjs'],
			index: true
		}),

		...plugins.slice(split),

		// Apply default loaders to unprefixed paths
		defaultLoaders(),

		production && optimizeGraphPlugin({ publicPath }),
		minify && minifyCssPlugin({ sourcemap }),
		production && copyAssetsPlugin({ root }),
		production && visualize && visualizer({ open: true, gzipSize: true, brotliSize: true })
	].filter(Boolean);
}
