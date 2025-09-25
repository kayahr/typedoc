# @kayahr/typedoc

[GitHub] | [NPM]

A drop-in replacement for [typedoc], bundling typedoc and its dependencies into a single module.

This package is primarily for my own use as a single dev dependency across my projects, to centralize the review of updates for the dependencies that typedoc brings along, and to reduce the threat of a supply-chain attack. Use at your own risk.

## Usage

Install as development dependency:

```
npm install -DE @kayahr/typedoc
```

Usage is the same as with the original [typedoc], so check upstream documentation for more info.

## Plugins

This bundle includes the following two plugins:

* [typedoc-github-theme]
* [typedoc-plugin-mdn-links]

The bundled plugins can be loaded like this in `typedoc.json`:

```json
{
    "plugin": [
        "@kayahr/typedoc/github-theme",
        "@kayahr/typedoc/mdn-links"
    ]
}
```

Other plugins require the bundle to be referenced as a forked dependency and override in `package.json`. Example:

```json
{
    "overrides": {
        "typedoc": "npm:@kayahr/typedoc@0.28.13-bundle.1"
    },
    "devDependencies": {
        "typedoc": "npm:@kayahr/typedoc@0.28.13-bundle.1"
    }
}
```

[GitHub]: https://github.com/kayahr/typedoc
[NPM]: https://www.npmjs.com/package/@kayahr/typedoc
[typedoc]: https://www.npmjs.com/package/typedoc
[typedoc-github-theme]: https://www.npmjs.com/package/typedoc-github-theme
[typedoc-plugin-mdn-links]: https://www.npmjs.com/package/typedoc-plugin-mdn-links
