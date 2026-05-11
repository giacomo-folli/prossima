export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.CmldYSN5.js",app:"_app/immutable/entry/app.PmkMu2bK.js",imports:["_app/immutable/entry/start.CmldYSN5.js","_app/immutable/chunks/Dkq1lYUU.js","_app/immutable/chunks/CIDlchoV.js","_app/immutable/chunks/wHwLhdH7.js","_app/immutable/entry/app.PmkMu2bK.js","_app/immutable/chunks/CIDlchoV.js","_app/immutable/chunks/CHncfsjL.js","_app/immutable/chunks/D1hYfEew.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/exercise/[id]",
				pattern: /^\/exercise\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
