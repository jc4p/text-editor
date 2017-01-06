# React Prototype
hey waddup fam

So this is kinda a mess rn but quick overview wise it's a base Electron app powered by React. When run in dev mode, it sets up a local web server that does nothing but always compile the app's real logic bundle (the React part) every time a file is changed which the Electron base reads.

The React parts are mostly contained in `app/`. The only real Electron stuff rn is `main.js` and `index.html` in the root folder.

# Getting Started

Before you start, make sure you have a version of `node` & `npm` installed. 

1) Clone this repo. Open up a terminal to the cloned folder path, and use [yarn](https://yarnpkg.com/), an `npm` alternative. `npm install yarn -g` if you don't have it. Then, just `yarn` to fetch all dependencies.

2) To run the app you have two options:

  - `npm start` will compile the React bundle then open up the Electron app.

  - `npm run dev` will start the live-update server mentioned above and open up the Electron app. This will live reload any local source code changes you make. You don't need to run this if you're not working on the app itself.
