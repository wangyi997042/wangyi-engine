import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/engine", component: "engine" },
  ],
  npmClient: 'pnpm',
  // request: {
  //   dataField: 'data'
  // },
});
