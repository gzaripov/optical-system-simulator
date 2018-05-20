import React from 'react';
import ReactDOM from 'react-dom';
import { init } from '@rematch/core';
import { Provider } from 'react-redux';
import 'flexboxgrid2/flexboxgrid2.css';
import 'normalize.css';
import './index.css';
import App from './App';
import models from './models/modals';
import registerServiceWorker from './registerServiceWorker';

const store = init(models);

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
