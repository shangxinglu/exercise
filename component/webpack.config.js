'use strict';

const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/main.js',
    output:{
        path:path.resolve(__dirname,'dist'),
        filename:'main.js',
    },
    devtool:'source-map',
    module: {
        rules: [{
            test: /\.js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: [
                        [
                            '@babel/plugin-transform-react-jsx',
                            { pragma: 'createElement' },
                        ]
                    ],
                }
            }
        }]
    },

    devServer:{
        hot:true,
        contentBase:path.resolve(__dirname,'dist'),
        port:8080,
        watchContentBase:true,
    }
    

}