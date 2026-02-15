module.exports = {
	apps: [
		{
			name: "Meorion.moe",
			port: "3002",
			exec_mode: "cluster",
			instances: "max",
			script: "node_modules/next/dist/bin/next",
			args: "start",
			env: {
				NODE_ENV: "production",
				PORT: 3002,
			},
		},
	],
};
