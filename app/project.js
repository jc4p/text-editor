import 'babel-polyfill'; // generators
import React from 'react';
import { render as renderReact } from 'react-dom';

let App = require('./src/project').default;

const render = (Component) => {
  renderReact(<Component />, document.getElementById('root'));
};

// sets up live reloading of the main component
if (module.hot) {
  module.hot.accept('./src/project', function() {
    let newApp = require('./src/project').default;
    render(newApp);
  });
}

render(App);