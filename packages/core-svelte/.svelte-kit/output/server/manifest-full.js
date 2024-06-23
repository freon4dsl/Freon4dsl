export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.CO2sUbwX.js","app":"_app/immutable/entry/app.vEebXPEW.js","imports":["_app/immutable/entry/start.CO2sUbwX.js","_app/immutable/chunks/entry.DoilO8n6.js","_app/immutable/chunks/scheduler.BgUxPr7R.js","_app/immutable/entry/app.vEebXPEW.js","_app/immutable/chunks/scheduler.BgUxPr7R.js","_app/immutable/chunks/index.irzl9eKB.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
