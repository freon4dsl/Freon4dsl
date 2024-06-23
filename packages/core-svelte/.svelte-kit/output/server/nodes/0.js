

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.BopIt6fK.js","_app/immutable/chunks/scheduler.BgUxPr7R.js","_app/immutable/chunks/index.irzl9eKB.js"];
export const stylesheets = [];
export const fonts = [];
