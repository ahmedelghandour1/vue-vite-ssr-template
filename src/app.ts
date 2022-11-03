import { createApp as createVueApp } from "vue";

import App from "./App.vue";
import { createRouter } from "./router";

import "./assets/main.css";
import { createPinia, getPiniaInitialState } from "./stores";
import { useCounterStore } from "./stores/counter";

export function createApp() {
  const app = createVueApp(App);
  const pinia = createPinia();
  const router = createRouter();
  const initialStateForReset = getPiniaInitialState();
  console.log(initialStateForReset);

  app.use(pinia);
  app.use(router);

  const counterStore = useCounterStore(pinia);
  console.log(counterStore.count);

  return { app, router, pinia, initialStateForReset };
}
