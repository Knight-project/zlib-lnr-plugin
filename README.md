# Z-lib plugin for lnreader

Download LNReader
[LNReader](https://github.com/LNReader/lnreader).

## Installing

- Prerequisites: Nodejs >= 20

1. `npm install`

## Contributing

- [Quick start](./docs/quickstart.md)
- [Documentation](./docs/docs.md)

## Testing

#### via the testing website

1. Run `npm start` and open `localhost:3000` to test!

[Detailed tutorial for testing website](./docs/website-tutorial.md)

#### via an app

1. Plugins from GitHub
    * Run `npm run host-linux` or `npm run host-windows` (depending on your operating system)
    * Add your `https://raw.githubusercontent.com/<username>/<repo>/plugins/<tag>/.dist/plugins.min.json` to app repository
2. Plugins from localhost
    * Copy `.env.template` to `.env` and update `USER_CONTENT_BASE` according to the comment there
    * Run `npm run host-dev`
    * Add plugin listing to app repository (e.g. for android emulator `http://10.0.2.2/.dist/plugins.min.json`)

---

The developer of this application does not have any affiliation with the content providers available.
