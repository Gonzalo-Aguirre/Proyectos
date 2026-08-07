/** Soft navigate + fallback duro si Next se queda a medias. */
export function redirectTo(path: string, routerReplace: (href: string) => void) {
  routerReplace(path);

  if (typeof window === "undefined") return;

  window.setTimeout(() => {
    if (window.location.pathname !== path) {
      window.location.assign(path);
    }
  }, 600);
}
