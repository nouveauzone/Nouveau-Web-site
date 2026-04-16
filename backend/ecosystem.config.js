module.exports = {
  apps: [
    {
      name: "nouveau-backend",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      max_memory_restart: "500M",
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
