// Packs the library exactly as `pnpm publish` would and checks it from a
// throwaway consumer directory:
//  - every entry in package.json "exports" resolves for import() and for
//    require() (Node >= 22.12 can require ESM), i.e. the exports map carries
//    the conditions real resolvers use;
//  - importing on the server (no window) yields the inert stub, not a boot;
//  - the shipped declarations typecheck for a strict consumer under both
//    "bundler" and "nodenext" module resolution, with skipLibCheck off so
//    the .d.ts files themselves are checked.
// Run with `pnpm test:pkg`; dist/ must be built (it is committed).
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const specifiers = Object.keys(pkg.exports).map((key) => pkg.name + key.slice(1));

// Prefer the pnpm that launched this script (a JS entry to run with node, or
// a standalone executable); fall back to the one on PATH.
const execpath = process.env.npm_execpath;
const pnpm = !execpath
	? { cmd: 'pnpm', args: [], shell: process.platform === 'win32' }
	: /\.[cm]?js$/.test(execpath)
		? { cmd: process.execPath, args: [execpath], shell: false }
		: { cmd: execpath, args: [], shell: false };

function run(cmd, args, options = {}) {
	const result = spawnSync(cmd, args, { encoding: 'utf8', stdio: 'pipe', ...options });
	if (result.status !== 0) {
		throw new Error(
			`${cmd} ${args.join(' ')} exited with ${result.status}\n${result.stdout}\n${result.stderr}`
		);
	}
	return result.stdout;
}

const tmp = mkdtempSync(join(tmpdir(), 'embedjs-pkg-'));
try {
	run(pnpm.cmd, [...pnpm.args, 'pack', '--pack-destination', tmp], {
		cwd: root,
		shell: pnpm.shell
	});
	const tarball = readdirSync(tmp).find((name) => name.endsWith('.tgz'));
	if (!tarball) {
		throw new Error('pnpm pack produced no tarball');
	}
	// Relative, forward-slash paths: GNU tar reads a drive letter's colon as a
	// remote host, and bsdtar is happy with these too.
	const pkgDir = ['node_modules', ...pkg.name.split('/')].join('/');
	mkdirSync(join(tmp, pkgDir), { recursive: true });
	run('tar', ['-xzf', tarball, '-C', pkgDir, '--strip-components=1'], { cwd: tmp });
	process.stdout.write(`packed ${tarball} and installed it into a consumer directory\n`);

	// The consumer is an ESM package so nodenext treats consumer.ts as ESM.
	writeFileSync(join(tmp, 'package.json'), JSON.stringify({ type: 'module', private: true }));

	const namespaces = specifiers.map((_, i) => 'm' + i);
	const checks = [
		`if (${namespaces[0]}.iframely !== ${namespaces[1]}.iframely) throw new Error('entries export different singletons');`,
		`const { iframely } = ${namespaces[0]};`,
		`if (typeof iframely.load !== 'function' || iframely.VERSION !== 1) throw new Error('server stub is incomplete');`,
		`if (iframely._loaded) throw new Error('library booted on the server');`
	];
	writeFileSync(
		join(tmp, 'consumer.mjs'),
		specifiers.map((s, i) => `import * as ${namespaces[i]} from '${s}';`).join('\n') +
			'\n' +
			checks.join('\n') +
			"\nconsole.log('import(): " +
			specifiers.length +
			" exports ok');\n"
	);
	writeFileSync(
		join(tmp, 'consumer.cjs'),
		specifiers.map((s, i) => `const ${namespaces[i]} = require('${s}');`).join('\n') +
			'\n' +
			checks.join('\n') +
			"\nconsole.log('require(): " +
			specifiers.length +
			" exports ok');\n"
	);
	process.stdout.write(run(process.execPath, ['consumer.mjs'], { cwd: tmp }));
	process.stdout.write(run(process.execPath, ['consumer.cjs'], { cwd: tmp }));

	writeFileSync(
		join(tmp, 'consumer.ts'),
		[
			`import { iframely } from '${specifiers[0]}';`,
			`import type { IframelyConfig, IframelyWidget, WidgetOptions } from '${specifiers[0]}';`,
			`import { iframely as withOptions } from '${specifiers[1]}';`,
			...specifiers.slice(2).map((s) => `import '${s}';`),
			'',
			"const config: IframelyConfig = { api_key: 'key', theme: 'auto', autorun: false };",
			'iframely.configure(config);',
			'iframely.load();',
			'iframely.unload(document.body);',
			"iframely.setTheme('dark');",
			"iframely.on('iframe-ready', (iframe: HTMLIFrameElement) => iframe.src);",
			"iframely.on('unload-widget', (widget: IframelyWidget) => widget.iframe);",
			"const options: WidgetOptions = { _hide: { label: 'Hide artwork', value: false } };",
			"withOptions.buildOptionsForm?.('form', document.body, options, withOptions.optionsTranslator?.('de'));",
			'export const version: number = iframely.VERSION;',
			''
		].join('\n')
	);
	for (const moduleResolution of ['bundler', 'nodenext']) {
		const tsconfig = {
			compilerOptions: {
				strict: true,
				noEmit: true,
				target: 'es2022',
				lib: ['es2022', 'dom'],
				module: moduleResolution === 'bundler' ? 'esnext' : 'nodenext',
				moduleResolution,
				skipLibCheck: false,
				types: []
			},
			files: ['consumer.ts']
		};
		writeFileSync(join(tmp, 'tsconfig.json'), JSON.stringify(tsconfig));
		run(pnpm.cmd, [...pnpm.args, 'exec', 'tsc', '-p', join(tmp, 'tsconfig.json')], {
			cwd: root,
			shell: pnpm.shell
		});
		process.stdout.write(`types ok under moduleResolution "${moduleResolution}"\n`);
	}
} finally {
	rmSync(tmp, { recursive: true, force: true });
}
