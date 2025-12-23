const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const middleware = createProxyMiddleware({
    target: 'http://127.0.0.1:5000',
    changeOrigin: true,
  });

  app.use('/api', middleware);

  // Use setupMiddlewares instead of deprecated options
  app.setupMiddlewares = (middlewares, devServer) => {
    if (!devServer) {
      throw new Error('webpack-dev-server is not defined');
    }
    
    return middlewares;
  };
};