module.exports = {
	mode: 'development',
	devServer: {
		contentBase: './dist',
	},
	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
		}
	}
}