module.exports = function(api) {
    api.cache(false);
    
    return {
        presets: [
            'babel-preset-expo',
            '@babel/preset-react'
        ],
        plugins: [
            ['module:react-native-dotenv']
        ]
    }
}