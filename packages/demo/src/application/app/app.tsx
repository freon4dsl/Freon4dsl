import * as React from "react";
import * as ReactDOM from "react-dom";
import { createBrowserHistory } from "history";
import { Provider } from "mobx-react";
import { Router, Route, Switch } from "react-router";
import { Root } from "./containers/Root/index";
import { MainProjectionalEditor } from "./MainProjectionalEditor";
import { RouterStore } from "./stores/index";
import { STORE_ROUTER } from "./constants/stores";

// prepare MobX stores
const history = createBrowserHistory();
const routerStore = new RouterStore(history);
const rootStores = {
  [STORE_ROUTER]: routerStore
};

// render react DOM
ReactDOM.render(
  <Provider {...rootStores}>
    <Root>
      <Router history={history}>
        <Switch>
          <Route path="/" component={MainProjectionalEditor} />
        </Switch>
      </Router>
    </Root>
  </Provider>,
  document.getElementById("root")
);
