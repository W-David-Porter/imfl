module.exports = {
	mode: 'development',
	devServer: {
		contentBase: './dist',
	},
	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.esm.js' 
		}
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
	experiments: { 
		topLevelAwait: true
	}
}