import path from 'path';
import { createCodeFrame } from 'simple-code-frame';
import { resolveAlias } from '../lib/aliasing.js';
import { isFile } from '../lib/fs-utils.js';

/** @type {import('less') | undefined} */
let less;

const lessFileLoader = (resolve, root) =>
	class LessPluginWmr {
		static install(less, pluginManager) {
			class LessFileManagerWmr extends less.FileManager {
				async loadFile(filename, currentDirectory, options, environment) {
					let file = filename;
					if (!file.endsWith('.less')) file = file + '.less';

					if (!path.isAbsolute(currentDirectory)) {
						currentDirectory = path.join(root, currentDirectory);
					}

					let resolvedId;
					const maybeRelative = path.join(currentDirectory, file);
					if (await isFile(maybeRelative)) {
						resolvedId = maybeRelative;
					} else {
						// Supply fake importer for relative resolution
						const importer = path.join(currentDirectory, 'fake.less');
						const resolved = await resolve(file, importer, { skipSelf: true });

						resolvedId = resolved ? resolved.id : file;
					}

					// Support bare imports: `@import "bar"`
					if (!path.isAbsolute(resolvedId)) {
						resolvedId = path.join(currentDirectory, filename);
					}

					// Pass loading to less
					return less.FileManager.prototype.loadFile.call(this, resolvedId, '', options, environment);
				}
			}
			pluginManager.addFileManager(new LessFileManagerWmr());
		}
	};

/**
 * @param {string} code
 * @param {{id: string, resolve: any, sourcemap: boolean }} options
 * @returns {Promise<{ css: string, map?: string, imports: string[] }>}
 */
export async function renderLess(code, { id, resolve, sourcemap }) {
	if (!less) {
		if (process.env.DISABLE_LESS !== 'true') {
			const mod = await import('less');
			less = mod.default || mod;
		}

		if (!less) {
			throw new Error(`Please install less to compile "*.less" files:\n    npm i -D less`);
		}
	}

	const lessOptions = {
		filename: id,
		plugins: [lessFileLoader(resolve, path.dirname(id))]
	};
	if (sourcemap) lessOptions.sourceMap = {};

	try {
		return await less.render(code, lessOptions);
	} catch (err) {
		if (err.extract && 'line' in err && 'column' in err) {
			const code = err.extract.filter(l => l !== undefined).join('\n');
			err.codeFrame = createCodeFrame(code, err.line - 1, err.column);
		}

		throw err;
	}
}

/**
 * @param {object} options
 * @param {boolean} options.sourcemap
 * @param {Set<string>} options.mergedAssets
 * @param {Record<string, string>} options.alias
 * @returns {import('rollup').Plugin}
 */
export function lessPlugin({ sourcemap, mergedAssets, alias }) {
	/** @type {Map<string, Set<string>>} */
	const fileToBundles = new Map();

	return {
		name: 'less',
		async transform(code, id) {
			if (!/\.less$/.test(id)) return;

			// Use absolute file paths, otherwise nested alias resolution
			// fails in less
			const file = resolveAlias(alias, id);
			const result = await renderLess(code, { resolve: this.resolve.bind(this), sourcemap, id: file });

			for (let file of result.imports) {
				mergedAssets.add(file);

				if (!fileToBundles.has(file)) {
					fileToBundles.set(file, new Set());
				}
				this.addWatchFile(file);
				// @ts-ignore
				fileToBundles.get(file).add(id);
			}

			return {
				code: result.css,
				map: result.map || null
			};
		},
		watchChange(id) {
			const bundle = fileToBundles.get(id);
			if (bundle) return Array.from(bundle);
		}
	};
}
