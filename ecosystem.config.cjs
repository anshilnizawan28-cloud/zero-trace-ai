module.exports = {
  apps: [
    {
      name: "zerovault",
      cwd: "/root/zero-trace-ai",
      script: ".output/server/index.mjs",
      interpreter: "node",

      env: {
        NODE_ENV: "production",
        PORT: 8080,
      },

      node_args: "-r dotenv/config",
      env_file: ".env",

      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      time: true
    }
  ]
};
