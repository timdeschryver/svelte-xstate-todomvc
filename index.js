import Todos from "./Todos.svelte";

const app = new Todos({
  target: document.querySelector("#app")
});

export default app;
