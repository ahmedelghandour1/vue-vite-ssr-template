import "pinia";

declare module "pinia" {
  export interface PiniaCustomProperties {
    $resetAll(): void;
  }
}
