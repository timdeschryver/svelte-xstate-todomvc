import { readable } from "svelte/store";

export function useHashChange() {
  return readable(window.location.hash, set => {
    const onHashChange = () => {
      set(window.location.hash);
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  });
}
