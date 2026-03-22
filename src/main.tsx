import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App.tsx";
import AxiosAuthSync from "./AxiosAuthSync.tsx";
import "./index.css";
import { persistor, store } from "./store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AxiosAuthSync />
        <App />
        <ToastContainer position="top-right" autoClose={2500} newestOnTop />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
