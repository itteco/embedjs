module.exports = function(env) {
    const environment = env.production ? 'production' : 'development';
    return require(`./conf/webpack.${environment}.js`);
};
