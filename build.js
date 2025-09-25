import { readFile, writeFile } from "node:fs/promises";
import esbuild from "esbuild";
import esbuildPluginLicense from "esbuild-plugin-license";
import esbuildCopyStaticFiles from "esbuild-copy-static-files";

function describeAuthor(author) {
    if (author instanceof Object) {
        let description = `Author: ${author.name}`;
        if (author.email != null) {
            description += ` <${author.email}>`;
        }
        return description;
    }
    return null;
}

const banner = `#!/usr/bin/env node
import { fileURLToPath as ___fileURLToPath } from "node:url";
import { dirname as ___dirname } from "node:path";
import { createRequire as ___createRequire} from "node:module";
const __filename = ___fileURLToPath(import.meta.url);
const __dirname = ___dirname(__filename);
const require = ___createRequire(import.meta.url);`;

const shared = {
    platform: "node",
    target: "node20",
    format: "esm",
    bundle: true,
    minify: true,
    legalComments: "none",
    banner: {
        js: banner
    }
}

// Template function that can be defined to customize report output
function template(dependencies) {
    return [
        "This file lists third-party dependencies bundled with this package, along with their license information.",
        ...dependencies.map((dependency) => [
            `${dependency.packageJson.name} v${dependency.packageJson.version}`,
            describeAuthor(dependency.packageJson.author),
            `License: ${dependency.packageJson.license}`,
            "",
            dependency.licenseText.trim() || "(No LICENSE file found)",
        ].filter(a => a != null).join("\n"))
    ].join("\n\n-----\n\n");
}

// Bundle typedoc library
await esbuild.build({
    entryPoints: [ "node_modules/typedoc/dist/index.js" ],
    outfile: "lib/index.js",
    external: [
        "typescript"
    ],
    ...shared,
    plugins: [
        esbuildPluginLicense({
            thirdParty: {
                output: {
                    file: 'lib/LICENSE-THIRD-PARTY.txt',
                    template
                }
            }
        }),
        esbuildCopyStaticFiles({
            src: "node_modules/typedoc/static",
            dest: "lib/static",
            recursive: true,
        }),
        esbuildCopyStaticFiles({
            src: "node_modules/typedoc/dist/lib/internationalization/locales/",
            dest: "lib/locales",
            filter: filename => !filename.endsWith(".cts"),
            recursive: true,
        }),
        esbuildCopyStaticFiles({
            src: "node_modules/@gerrit0/mini-shiki/dist/onig.wasm",
            dest: "lib/onig.wasm",
        })
    ]
})

// Bundle typedoc cli tool
await esbuild.build({
    entryPoints: [ "node_modules/typedoc/dist/lib/cli.js" ],
    outfile: "lib/bin/cli.js",
    external: [
        "typescript",
        "../index.js"
    ],
    ...shared
});

// Bundle github-theme plugin
await esbuild.build({
    entryPoints: [ "node_modules/typedoc-github-theme/dist/index.js" ],
    outfile: "lib/plugins/github-theme/index.js",
    alias: {
        "typedoc": "@kayahr/typedoc"
    },
    external: [
        "@kayahr/typedoc"
    ],
    ...shared,
    plugins: [
        esbuildPluginLicense({
            thirdParty: {
                output: {
                    file: 'lib/plugins/github-theme/LICENSE-THIRD-PARTY.txt',
                    template
                }
            }
        }),
        esbuildCopyStaticFiles({
            src: "node_modules/typedoc-github-theme/src/assets",
            dest: "lib/plugins/github-theme/assets"
        })
    ]
});

// Bundle mdn-links plugin
await esbuild.build({
    entryPoints: [ "node_modules/typedoc-plugin-mdn-links/dist/index.js" ],
    outfile: "lib/plugins/mdn-links/index.js",
    alias: {
        "typedoc": "@kayahr/typedoc"
    },
    external: [
        "@kayahr/typedoc"
    ],
    ...shared,
    plugins: [
        esbuildPluginLicense({
            thirdParty: {
                output: {
                    file: 'lib/plugins/mdn-links/LICENSE-THIRD-PARTY.txt',
                    template
                }
            }
        }),
        esbuildCopyStaticFiles({
            src: "node_modules/typedoc-plugin-mdn-links/data",
            dest: "lib/plugins/mdn-links/data"
        })
    ]
});

async function replace(file, search, replace) {
    await writeFile(file, (await readFile(file, "utf-8")).replaceAll(search, replace), { encoding: "utf-8" });
}

// Extract required data from package.json into typedoc.json
const packageJSON = JSON.parse(await readFile("node_modules/typedoc/package.json", "utf8"));
await writeFile("lib/typedoc.json", JSON.stringify({ peerDependencies: packageJSON.peerDependencies }));

// Fix paths in bundles
await replace("lib/index.js", "../../../package.json", "../typedoc.json");
await replace("lib/index.js", "../../../../../static", "../static");
await replace("lib/plugins/github-theme/index.js", "../src/assets/", "./assets/");
await replace("lib/plugins/mdn-links/index.js", "data/web-api.json", "mdn-links/data/web-api.json");
