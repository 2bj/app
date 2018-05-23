import store from "./store/";
import { STORE_HYDRATED, HYDRATING_FAILED } from "./store/mutation-types";
import { startPolling } from "./polling";
import startIdleTracking from "./idle";

export default function hydrateStore() {
  return Promise.all([
    store.dispatch("latency"),
    store.dispatch("getCurrentUser"),
    store.dispatch("getCollections"),
    store.dispatch("getSettings"),
    store.dispatch("getAllExtensions"),
    store.dispatch("getBookmarks")
  ])
    .then(() => {
      // Set accent color
      const customColor = store.state.settings.color;
      if (customColor) {
        document.documentElement.style.setProperty(
          "--accent",
          `var(--${customColor}-600)`
        );
      }

      store.commit(STORE_HYDRATED, new Date());

      startPolling();
      startIdleTracking(store);
    })
    .catch(error => {
      store.commit(HYDRATING_FAILED, error);
    });
}
