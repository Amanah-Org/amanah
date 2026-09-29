import type { NuxtApp } from "#app";

/**
 * `useAsyncData` option: while the device is offline, serve the data this page
 * loaded earlier in the session instead of refetching (which would fail and
 * blank the page). A custom getCachedData also stops Nuxt from purging that
 * data when the user navigates away, so previously visited pages stay usable.
 * Kept in memory only, never persisted, since it contains beneficiaries' personal data.
 */
export const keepWhenOffline = {
  getCachedData(key: string, nuxtApp: NuxtApp) {
    if (nuxtApp.isHydrating) return nuxtApp.payload.data[key];
    if (import.meta.client && !navigator.onLine) return nuxtApp.payload.data[key];
    return undefined;
  },
};

/**
 * For `useAsyncData` handlers: when a request fails because the server can't be
 * reached (weak signal while the browser still reports "online"), keep what the
 * page already shows instead of replacing it with an empty result.
 */
export function keepOnNetworkError<T>(nuxtApp: NuxtApp, key: string, res: { error: unknown; status: number }, fresh: T): T {
  const unreachable = !!res.error && (res.status === 0 || res.status >= 500);
  return unreachable && nuxtApp.payload.data[key] !== undefined ? (nuxtApp.payload.data[key] as T) : fresh;
}
