import { copyFileSync, readFileSync, writeFileSync } from 'fs';

const dry = /dry/.test(process.argv.join(' '));
const read = f => readFileSync(f, 'utf-8');
// eslint-disable-next-line no-console
const write = dry ? console.info : writeFileSync;
// eslint-disable-next-line no-console
const copy = dry ? (f, t) => console.info(`copy ${f} to ${t}`) : copyFileSync;

const pkg = JSON.parse(read('package.json'));
copy('package.json', '.package.json');
const {
	name,
	version,
	bin,
	type,
	author,
	contributors,
	repository,
	dependencies,
	types,
	files,
	engines,
	main,
	license,
	description
} = pkg;
const normalized = {
	name,
	version,
	bin,
	type,
	main,
	description,
	author,
	license,
	contributors,
	repository,
	dependencies,
	scripts: {
		postpack: 'mv -f .package.json package.json'
	},
	types,
	files,
	engines
};
write('package.json', JSON.stringify(normalized, null, 2) + '\n');
