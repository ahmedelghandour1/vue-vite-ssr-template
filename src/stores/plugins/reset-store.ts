import type { PiniaPluginContext, StateTree, Store, _ActionsTree, _GettersTree } from "pinia";

declare const window: Window & {
  INITIAL_STATE_FOR_RESET: Record<string, StateTree>;
};

type _Store = Store<string, StateTree, _GettersTree<StateTree>, _ActionsTree>;
export const state: Record<string, StateTree> = {};
export const stores: Record<string, _Store> = {};

if (!import.meta.env.SSR) {
  Object.assign(state, window.INITIAL_STATE_FOR_RESET);
}

/**
 * @description reset all registered stores in pinia.
 * @returns void
 */
export function resetAll(): void {
  Object.keys(stores).forEach((storeName) => {
    stores[storeName].$patch(state[storeName]);
  });
}

export function resetState({ store }: PiniaPluginContext): void {
  if (import.meta.env.SSR) {
    const initialState = JSON.parse(JSON.stringify(store.$state));
    state[store.$id] = initialState;
    stores[store.$id] = store;
    store.$reset = () => store.$patch(JSON.parse(JSON.stringify(initialState)));
    store.$resetAll = resetAll;
  } else {
    stores[store.$id] = store;
    store.$reset = () => store.$patch(state[store.$id] || JSON.parse(JSON.stringify(store.$state)));
    store.$resetAll = resetAll;
  }
}
