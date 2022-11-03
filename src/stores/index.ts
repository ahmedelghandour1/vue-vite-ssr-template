import { createPinia as crPinia } from "pinia";
import type { Pinia } from "pinia";
import { resetState, state } from "./plugins/reset-store";

// class GlobalPinia {
//   pinia!: Pinia;
//   createPinia() {
//     this.pinia = crPinia();
//     console.log(this.pinia);

//     this.pinia.use(resetState);
//     return this.pinia;
//   }
//   getPiniaInitialState() {
//     return state;
//   }
// }

// const pinia = new GlobalPinia();

let pinia: Pinia;

export const usePinia = (): Pinia => pinia;

export const createPinia = () => {
  pinia = crPinia();
  pinia.use(resetState);
  return pinia;
};

export const getPiniaInitialState = () => state;
