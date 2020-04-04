import * as React from "react";
import * as ReactDOM from "react-dom";
import { createBrowserHistory } from "history";
import { Provider } from "mobx-react";
import { RouterStore } from "./app/stores";
// change used editor here:
import { MainProjectionalEditor } from "../demo/editor";

const STORE_ROUTER = "router";
// prepare MobX stores
const history = createBrowserHistory();
const routerStore = new RouterStore(history);
const rootStores = {
    [STORE_ROUTER]: routerStore
};

// render react DOM
// ReactDOM.render(
//     <Provider {...rootStores}>
//         <Root>
//             <Router history={history}>
//                 <Switch>
//                     <Route path="/" component={MainProjectionalEditor} />
//                 </Switch>
//             </Router>
//         </Root>
//     </Provider>,
//     document.getElementById("root")
// );
ReactDOM.render(
    <Provider {...rootStores}>
        <MainProjectionalEditor />
    </Provider>,
    document.getElementById("root")
);
