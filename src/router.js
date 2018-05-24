import Vue from "vue";
import Router from "vue-router";
import api from "./api";
import store from "./store";
import hydrateStore from "./hydrate";
import Collections from "./routes/collections.vue";
import ItemListing from "./routes/item-listing.vue";
import Edit from "./routes/edit.vue";
import Login from "./routes/login.vue";
import NotFound from "./routes/not-found.vue";
import Interfaces from "./routes/interfaces.vue";
import InterfaceDebugger from "./routes/interface-debugger.vue";
import Debug from "./routes/debug.vue";
import Settings from "./routes/settings.vue";
import SettingsGlobal from "./routes/settings-global.vue";

import ModalDebug from "./routes/modal-debug.vue";

import NProgress from "nprogress";

Vue.use(Router);

const router = new Router({
  mode: "history",
  routes: [
    {
      path: "/modals",
      component: ModalDebug
    },
    {
      path: "/",
      redirect: "/collections"
    },
    {
      path: "/collections",
      component: Collections
    },
    {
      path: "/collections/:collection",
      props: true,
      component: ItemListing
    },
    {
      path: "/collections/:collection/:primaryKey",
      props: true,
      component: Edit
    },
    {
      path: "/collections/directus_files",
      component: ItemListing,
      alias: "/files"
    },
    {
      path: "/collections/directus_files/:primaryKey",
      component: Edit,
      alias: "/files/:primaryKey"
    },
    {
      path: "/collections/directus_users",
      component: ItemListing,
      alias: "/users"
    },
    {
      path: "/collections/directus_users/:primaryKey",
      component: Edit,
      alias: "/users/:primaryKey"
    },
    {
      path: "/collections/directus_activity",
      component: ItemListing,
      alias: "/activity"
    },
    {
      path: "/debug",
      component: Debug
    },
    {
      path: "/settings",
      component: Settings
    },
    {
      path: "/settings/global",
      component: SettingsGlobal
    },
    {
      path: "/interfaces",
      component: Interfaces
    },
    {
      path: "/interfaces/:id",
      component: InterfaceDebugger,
      props: true
    },
    {
      path: "/login",
      component: Login,
      meta: {
        publicRoute: true
      },
      beforeEnter(to, from, next) {
        if (api.loggedIn) return next(false);
        return next();
      }
    },
    {
      path: "/logout",
      beforeEnter(to, from, next) {
        store.dispatch("logout");
        next("/login");
      }
      // redirect: '/login',
    },
    {
      path: "*",
      component: NotFound
    }
  ]
});

router.beforeEach((to, from, next) => {
  NProgress.start();

  const { loggedIn } = store.getters;
  const publicRoute = to.matched.some(record => record.meta.publicRoute);

  if (loggedIn === false) {
    if (publicRoute) {
      return next();
    }

    if (from.fullPath === "/") {
      return next({ path: "/login" });
    }

    return next({
      path: "/login",
      query: { redirect: to.fullPath }
    });
  }

  if (store.state.hydrated === false) {
    return hydrateStore().then(() => {
      /**
       * TODO: Clean this up.
       *
       * I'm not too happy about the way it checks for the editing state now..
       *
       * Maybe it should just be a confirm that fires from the main app.vue instead. Lets wait for #320
       */
      const editing = store.getters.editing;

      if (editing && publicRoute === false) {
        const { collection, primaryKey } = store.state.edits;
        const path = `/collections/${collection}/${primaryKey}`;

        if (path !== to.fullPath) {
          if (
            to.query.collection !== collection ||
            to.query.primaryKey !== primaryKey ||
            to.query.editing !== true
          ) {
            return next({
              path: to.path,
              query: {
                collection,
                primaryKey,
                editing: true
              }
            });
          }
        }
      }
      return next();
    });
  }

  return next();
});

router.afterEach((to, from) => {
  NProgress.done();

  if (store.state.hydrating === false && from.path !== "/logout") {
    store.dispatch("track", { page: to.path });
  }
});

export default router;
