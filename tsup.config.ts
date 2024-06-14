import { defineConfig } from 'tsup';
import { readdirSync, statSync } from 'fs';
import { join, relative, extname, basename } from 'path';

function getEntries(dir: string, baseDir = '') {
    const entries = {};
    const files = readdirSync(dir);

    files.forEach((file) => {
        const fullPath = join(dir, file);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
            // Check if the directory name is wrapped in parentheses
            if (!/^\(.*\)$/.test(file)) {
                Object.assign(entries, getEntries(fullPath, join(baseDir, file)));
            }
        } else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
            const relativePath = join(baseDir, basename(file, extname(file)));
            entries[`cli/${relativePath}`] = fullPath;
        }
    });

    return entries;
}
const cliConfig = {
    clean: true,
    shims: true,
    format: ["esm"],
    outDir: "dist",
    tsconfig: "tsconfig.cli.json",
} as Partial<Parameters<typeof defineConfig>[0]>

export default defineConfig([
    // CLI
    {
        entry: {
            "cli/cli": 'src/app/cli.ts'
        },
        ...cliConfig,
        publicDir: 'src/public',
    }, {
        entry: getEntries('src/app'),
        ...cliConfig,
    },
    // Packaging
    {
        entry: {
            "lib/index": "src/index.ts"
        },
        clean: true,
        shims: true,
        dts: true,
        format: ["esm", 'cjs'],
        tsconfig: "tsconfig.lib.json",
    }
])
