module.exports = {
  apps: [
    {
      name: 'oltani-backend',
      script: 'src/server.js',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      watch: false,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      time: true
    }
  ]
};
