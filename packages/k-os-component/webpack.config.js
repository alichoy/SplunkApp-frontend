const path = require('path');
const { merge: webpackMerge } = require('webpack-merge');
const baseComponentConfig = require('@splunk/webpack-configs/component.config').default;

module.exports = webpackMerge(baseComponentConfig, {
    entry: {
        KOsComponent: path.join(__dirname, 'src/KOsComponent.jsx'),
    },
    output: {
        path: path.join(__dirname),
    },
});
