

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.tBBmQFes.js","_app/immutable/chunks/scheduler.BgUxPr7R.js","_app/immutable/chunks/index.irzl9eKB.js"];
export const stylesheets = ["_app/immutable/assets/2.CZKbOlQ2.css"];
export const fonts = [];
