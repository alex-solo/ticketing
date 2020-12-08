module.exports = {
	webpackDevMiddleware: config => { // config is created by default by Next js and it will run this middleware function with it
		config.watchOptions.poll = 300 // we are changing one property on there that tells webpack to poll files every 300ms to detect any changes instead of doing it automatically
		return config
	}
}