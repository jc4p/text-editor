import 'babel-polyfill'; // generators
import React from 'react'; // react stuff
import { render } from 'react-dom';

import App from './src'; // app stuff

const renderView = (Component) => {
  render(<Component />, document.getElementById('root'));
};

// sets up live reloading of the main component
if (module.hot) {
  module.hot.accept('./src', function() {
    let newApp = require('./src').default;
    renderView(newApp);
  });
}

renderView(App);