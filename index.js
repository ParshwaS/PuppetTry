(async () => {
	const puppeteer = require('puppeteer');
	const bodyparser = require('body-parser')
	const express = require('express')
	const app = express()
	const browser = await puppeteer.launch({
		args: ['--no-sandbox']
	});
	var pages = {}

	app.use(bodyparser.json())
	var pages = {}
	var contexts = {}

	app.get('/start', (req, res) => {
		(async () => {
			const context = await browser.createIncognitoBrowserContext()
			const page = await context.newPage()
			await page.goto('https://facebook.com')
			var index = Date.now().toString()
			pages[index] = page
			contexts[index] = context
			res.json({ index })
		})();
	})

	app.post('/login', (req, res) => {
		(async () => {
			const page = pages[req.body.index]
			if (page == null) {
				res.json({ error: "Page doesn't exist" })
			} else {
				let username = req.body.username;
				let user_pass = req.body.password;
				await page.waitForSelector('#email')
				await page.type('#email', username)
				await page.type('#pass', user_pass)
				await page.click('#loginbutton')
				res.json({ message: "Logged In" })
			}
		})();
	})

	app.post('/ss', (req, res) => {
		(async () => {
			const page = pages[req.body.index]
			if (page == null) {
				res.json({ error: "Page doesn't exist" })
			} else {
				await page.screenshot({ path: 'try.png' })
				res.json({ message: "Taken" })
			}
		})();
	})

	app.post('/pn', (req, res) => {
		(async () => {
			const page = pages[req.body.index]
			if (page == null) {
				res.json({ error: "Page doesn't exist" })
			} else {
				const element = await page.$("._1vp5")
				const name = await page.evaluate(element => element.textContent, element)
				res.json({ message: name })
			}
		})();
	})

	app.post('/close', (req, res) => {
		(async () => {
			const context = contexts[req.body.index]
			const page = pages[req.body.index]
			if (page == null) {
				res.json({ error: "Page don't exists" })
			} else {
				await page.close()
				await context.close()
				delete pages[req.body.index]
				delete contexts[req.body.index]
				res.json({ message: "Closed" })
			}
		})();
	})

	app.listen(5000)
})();
