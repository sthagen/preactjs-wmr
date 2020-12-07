// Declarations used by plugins and WMR itself

declare module "wmr" {
	import { Plugin, OutputOptions } from 'rollup';
	import { Middleware } from 'polka';

	export type Mode = 'start' | 'serve' | 'build';

	export { Middleware };

	export type OutputOption = OutputOptions | ((opts: OutputOptions) => OutputOptions);

	export interface Options {
		prod: boolean;
		minify: boolean;
		mode: Mode;
		cwd: string;
		public: string;
		root: string;
		out: string;
		overlayDir: string;
		aliases: Record<string, string>;
		env: Record<string, string>;
		middleware: Middleware[];
		plugins: Plugin[];
		output: OutputOption[];
	}
}

// Declarations used by WMR-based applications

declare interface ImportMeta {
	hot?: {
		accept(module: ({ module: ImportMeta }) => void): void;
		invalidate(): void;
		reject(): void;
	}
}

declare interface NodeModule {
	hot?: ImportMeta['hot'] | void;
}
declare var module: NodeModule;

/** Maps authored classNames to their CSS Modules -suffixed generated classNames. */
type Mapping = Record<string, string>;
declare module '*.module.css' { const mapping: Mapping; export default mapping; }
declare module '*.module.scss' { const mapping: Mapping; export default mapping; }
declare module '*.module.sass' { const mapping: Mapping; export default mapping; }
declare module '*.module.styl' { const mapping: Mapping; export default mapping; }

declare module '*.css' { const url: string; export default url; }
declare module '*.scss' { const url: string; export default url; }
declare module '*.sass' { const url: string; export default url; }
declare module '*.styl' { const url: string; export default url; }

// Import Prefixes
declare module 'json:';
declare module 'css:';
declare module 'url:' { const url: string; export default url; }
declare module 'bundle:' { const url: string; export default url; }

// Implicit URL Imports (see url-plugin)
declare module '*.png' { const url: string; export default url; }
declare module '*.jpg' { const url: string; export default url; }
declare module '*.jpeg' { const url: string; export default url; }
declare module '*.gif' { const url: string; export default url; }
declare module '*.webp' { const url: string; export default url; }
declare module '*.svg' { const url: string; export default url; }
declare module '*.mp4' { const url: string; export default url; }
declare module '*.ogg' { const url: string; export default url; }
declare module '*.mp3' { const url: string; export default url; }
declare module '*.wav' { const url: string; export default url; }
declare module '*.flac' { const url: string; export default url; }
declare module '*.aac' { const url: string; export default url; }
declare module '*.woff' { const url: string; export default url; }
declare module '*.woff2' { const url: string; export default url; }
declare module '*.eot' { const url: string; export default url; }
declare module '*.ttf' { const url: string; export default url; }
declare module '*.otf' { const url: string; export default url; }
