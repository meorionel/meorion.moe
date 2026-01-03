module.exports = {
        apps: [
                {
                        name: "Meorion.moe",
                        port: "3002",
                        exec_mode: "cluster",
                        instances: "max",
                        script: "./.output/server/index.mjs",
                },
        ],
};
