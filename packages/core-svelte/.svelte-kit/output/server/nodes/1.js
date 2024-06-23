

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.BbvMmCIK.js","_app/immutable/chunks/scheduler.BgUxPr7R.js","_app/immutable/chunks/index.irzl9eKB.js","_app/immutable/chunks/entry.D5JRS_GY.js"];
export const stylesheets = [];
export const fonts = [];
