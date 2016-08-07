hey waddup fam

So this is kinda a mess rn but quick overview wise it's a base Electron app powered by React. When run in dev mode, it sets up a local web server that does nothing but always compile the app's real logic bundle (the React part) every time a file is changed which the Electron base reads.

The React parts are mostly contained in `app/`. The only real Electron stuff rn is `main.js` and `index.html` in the root folder.

To run this locally, you first need to have node/npm installed, I use `nvm` to manage them but you can use whatevver you want.

Once you have node/npm installed, check out this repo then run `npm install` in the checked out folder to download all dependencies.

To actually run the app you can do either `npm start` or `npm run dev`.

`npm start` will compile the React bundle then open up the Electron app.
`npm dev` will start the live-update server mentioned above and open up the Electron app.

If you start the app with `npm run dev` any changes you make to any files in `app/` will automatically be live-reloaded.