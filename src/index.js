import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers";
// Load user from localStorage
let userState;
if (typeof window !== "undefined") {
  if (localStorage.getItem("user")) {
    userState = JSON.parse(localStorage.getItem("user"));
  } else {
    userState = null;
  }
}
// Initial state
const initialState = {
  user: userState,
};
// Create store with initial state
const store = createStore(rootReducer, initialState, composeWithDevTools());
ReactDOM.render(
  <Provider store={store}>
    <WalletProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WalletProvider>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
