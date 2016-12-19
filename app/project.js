import 'babel-polyfill'; // generators
import React from 'react'; // react
import { render } from 'react-dom';

import ProjectManager from './src/project'; // app stuff

const renderView = (Component) => {
  render(<Component />, document.getElementById('root'));
};

// sets up live reloading of the main component
if (module.hot) {
  module.hot.accept('./src', function() {
    let newView = require('./src/project').default;
    renderView(newView);
  });
}

renderView(ProjectManager);