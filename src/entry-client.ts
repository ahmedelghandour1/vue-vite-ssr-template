import { createApp } from "./app";
import type { StateTree } from "pinia";

declare const window: Window & { INITIAL_DATA: Record<string, StateTree> };

const { app, router, pinia } = createApp();
const storeInitialState = window.INITIAL_DATA;
if (storeInitialState) pinia.state.value = storeInitialState;

// wait until router is ready before mounting to ensure hydration match
router.isReady().then(() => {
  app.mount("#app");
});
