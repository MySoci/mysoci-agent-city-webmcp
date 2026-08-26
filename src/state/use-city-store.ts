import { useSyncExternalStore } from "react";
import { cityStore } from "./city-store";

export const useCityStore = () =>
  useSyncExternalStore(cityStore.subscribe, cityStore.getSnapshot, cityStore.getSnapshot);
