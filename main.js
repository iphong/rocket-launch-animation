void function () {
	const ROCKET_HOVERING_HEIGHT = 200

	const canvas = document.querySelector('#canvas')
	const rocket = document.querySelector('#rocket')

	let ctx = canvas.getContext('2d')
	let windowWidth = window.innerWidth
	let windowHeight = window.innerHeight
	canvas.width = windowWidth
	canvas.height = windowHeight

	let mouseX = window.innerWidth / 2
	let rocketY = canvas.height - ROCKET_HOVERING_HEIGHT
	let PAUSED = false

	// Motion tween for rocket enters hovering state
	const rocketAnim = new Tween(5000, 200, 0, 'easeOutElastic')
	// const rocketAnim = new Tween(1000, 200, 0, 'linear')

	// Motion tween for when rocket launches away state
	const smokeAnim = new Tween(3000, 0, -(canvas.height), 'easeOutExpo')
	// const smokeAnim = new Tween(1000, 0, -(canvas.height), 'linear')

	// This motion tween scales the cloud when launches
	const cloudAnim = new Tween(1000, 0, 1, 'linear')

	// Particles emitter for white cloud at the bottom
	let cloudEmitter = new Emitter(canvas, windowWidth / 2, windowHeight, {
		size: 75,
		count: 2,
		rate: 60,
		speed: 1,
		fade: 1,
		angle: -90,
		spread: 160,
		bounceX: 1,
		bounceY: -0.3,
		windAngle: 90,
		windSpeed: 0.18,
		invert: 0
	}, drawParticle).stop()

	// Particles Emitter for shooting out at the bottom of the rocket
	let smokeEmitter = new Emitter(canvas, windowWidth / 2, windowHeight / 2, {
		size: 120,
		count: 2,
		rate: 6,
		speed: 6,
		fade: 7,
		angle: 90,
		spread: 15,
		bounceX: 1,
		bounceY: 1,
		windAngle: 0,
		windSpeed: 0,
		invert: 1
	}, drawParticle).stop()

	// Draw particles
	function drawParticle(p) {
		if (p.pos.y - p.size > canvas.height || p.pos.y + p.size <= 0) return this
		ctx.beginPath()
		ctx.arc(Math.round(p.pos.x), Math.round(p.pos.y), Math.round(p.radius), 0, 360)
		ctx.fillStyle = 'rgb(223, 235, 250, 0.9)'
		ctx.fill()
	}

	// Main render loop, fires every screen refresh
	function loop() {
		if (!PAUSED) {
			ctx.clearRect(0, 0, windowWidth, windowHeight)

			// Set the y position of the smoke and cloud particles source
			smokeEmitter.y = rocketY + smokeAnim.value + rocketAnim.value

			// Set the x position of the smoke and cloud particles source
			// Using Low Pass Filter to smooth out mouse signal
			smokeEmitter.x = smokeEmitter.x * 0.97 + mouseX * 0.03
			cloudEmitter.x = cloudEmitter.x * 0.97 + mouseX * 0.03
			// Without Low Pass Filter (LPF)
			// smokeEmitter.x = mouseX
			// cloudEmitter.x = mouseX


			// Set the position for the rocket and it's tilt angle
			let tilt = (mouseX - smokeEmitter.x) / windowWidth * 45
			rocket.style.top = smokeEmitter.y + 'px'
			rocket.style.left = smokeEmitter.x + 'px'
			rocket.style.transform = `rotate3d(0, 0, 1, ${tilt}deg) translate3d(-50%, -110%, 0)`

			// When the cloud animation starts at rocket launch
			// value of each particles scale up quickly to fill the screen
			// This does nothing when rocket is hovering
			cloudEmitter.prop({
				size: 60 + cloudAnim.value * 250,
				speed: 4 + cloudAnim.value * 4,
				rate: 70 + cloudAnim.value * 70
			})

			cloudEmitter.loop()
			smokeEmitter.loop()
		}

		requestAnimationFrame(loop)
	}

	new Sequence({
		0: () => loop(),
		100: () => rocketAnim.start(),
		110: () => smokeEmitter.start(),
		300: () => cloudEmitter.start(),	
	})

	let launched = false
	window.onclick = function (e) {
		if (launched) return
		launched = true
		new Sequence({
			0: () => {
				smokeEmitter.prop({
					size: 250,
					spread: 45,
					count: 8,
					speed: 7
				})
			},
			900: () => {
				cloudEmitter.prop({
					windSpeed: 0.4,
					bounceY: -0.1
				})
			},
			1000: () => {
				smokeEmitter.prop({
					size: 100,
					rate: 10,
					spread: 8,
					speed: 5,
					count: 5
				})
				cloudEmitter.prop({
					windSpeed: 0.05,
					bounceY: -0.6,
					fade: 5
				})
			},
			1010: () => smokeAnim.start(),
			1160: () => cloudAnim.start(),
			1100: () => {
				cloudEmitter.prop({
					spread: 180,
					fade: 1
				})
				canvas.classList.add('faded')
			},
		})
	}
	window.onresize = function (e) {
		windowWidth = window.innerWidth
		windowHeight = window.innerHeight
		canvas.width = windowWidth
		canvas.height = windowHeight
		cloudEmitter.y = windowHeight
		rocketY = windowHeight - ROCKET_HOVERING_HEIGHT
		mouseX = windowWidth / 4 + windowWidth / 2
	}
	window.ontouchmove = function (e) {
		mouseX = windowWidth / 4 + e.pageX / 2
	}
	window.onmousemove = function (e) {
		mouseX = windowWidth / 4 + e.pageX / 2
	}
	addEventListener('keydown', e => {
		if (e.key === ' ') {
			PAUSED = !PAUSED
		}
	})
}()
