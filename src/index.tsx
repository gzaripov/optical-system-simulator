import { init } from "@rematch/core";
import rematchPersist from "@rematch/persist";
import "flexboxgrid2/flexboxgrid2.css";
import "normalize.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import models from "./models";
import registerServiceWorker from "./registerServiceWorker";

const persistPlugin = rematchPersist({
  throttle: 500
});

const store = init({
  models,
  plugins: [persistPlugin]
});

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.render(<Root />, document.getElementById("root"));
registerServiceWorker();
