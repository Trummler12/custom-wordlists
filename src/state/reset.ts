// Clearing every stored preference and reloading — the "reset to default" the
// settings menu offers, and the way to see a changed default take effect without
// opening a fresh browser profile.
//
// Every key the app writes is under the `wordlists:` prefix (see settings.svelte
// and lang.svelte), so clearing by prefix stays correct as new keys are added and
// touches nothing another page on the origin stored. The reload is the reset's
// second half: it drops the in-memory state and lets every store re-initialize
// from the now-empty storage, which is exactly a first visit.

const PREFIX = "wordlists:";

/** Drop every stored preference and reload into the shipped defaults. */
export function resetAllToDefault(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) keys.push(k);
    }
    for (const k of keys) localStorage.removeItem(k);
  } catch {
    // localStorage throws in a few real setups (private mode, blocked storage);
    // the reload still drops the in-memory state, which is the visible half.
  }
  location.reload();
}
