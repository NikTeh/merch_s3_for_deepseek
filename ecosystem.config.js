module.exports = {
  apps: [
    {
      name: "server",
      script: "./server/index.js",
      env: {
        APP_TYPE: "server",
        NODE_ENV: "production"
      },
      error_file: "/dev/null",  // Логируем только в консоль
      out_file: "/dev/null",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    },
    {
      name: "bot",
      script: "./bot/index.js",
      env: {
        APP_TYPE: "bot",
        NODE_ENV: "production"
      },
      error_file: "/dev/null",  // Логируем только в консоль
      out_file: "/dev/null",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
}