void function () {
	const ROCKET_HOVERING_HEIGHT = 200

	const canvas = document.querySelector('#canvas')
	const rocket = document.querySelector('#rocket')

	let ctx = canvas.getContext('2d')
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight

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
	let cloud = new Emitter(canvas, canvas.width / 2, canvas.height, {
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
	let smoke = new Emitter(canvas, canvas.width / 2, canvas.height / 2, {
		size: 120,
		count: 2,
		rate: 30,
		speed: 6,
		fade: 7,
		angle: 90,
		spread: 15,
		bounceX: 1,
		bounceY: 1,
		windAngle: 90,
		windSpeed: 0,
		invert: 1
	}, drawParticle).stop()

	// Draw particles
	function drawParticle(p) {
		if (p.pos.y - p.size > canvas.height || p.pos.y + p.size <= 0) return this
		ctx.beginPath()
		ctx.arc(Math.round(p.pos.x), Math.round(p.pos.y), Math.round(p.radius), 0, 360)
		ctx.fillStyle = 'rgba(255,255,255,1)'
		ctx.fill()
	}

	// Main render loop, fires every screen refresh
	function loop() {
		if (!PAUSED) {
			ctx.clearRect(0, 0, canvas.width, canvas.height)

			// Set the y position of the smoke and cloud particles source
			smoke.y = rocketY + smokeAnim.value + rocketAnim.value

			// Set the x position of the smoke and cloud particles source
			smoke.x = smoke.x * 0.97 + mouseX * 0.03
			cloud.x = cloud.x * 0.97 + mouseX * 0.03


			// Set the position for the rocket and it's tilt angle
			let tilt = (mouseX - smoke.x) / canvas.width * 45
			rocket.style.top = smoke.y + 'px'
			rocket.style.left = smoke.x + 'px'
			rocket.style.transform = `rotate3d(0, 0, 1, ${tilt}deg) translate3d(-50%, -110%, 0)`

			// When the cloud animation starts at rocket launch
			// value of each particles scale up quickly to fill the screen
			// This does nothing when rocket is hovering
			cloud.prop({
				size: 60 + cloudAnim.value * 250,
				speed: 4 + cloudAnim.value * 4,
				rate: 70 + cloudAnim.value * 70
			})

			cloud.loop()
			smoke.loop()
		}

		requestAnimationFrame(loop)
	}

	new Sequence({
		0: () => loop(),
		100: () => rocketAnim.start(),
		200: () => smoke.start(),
		300: () => cloud.start(),
	})

	let launched = false
	window.onclick = function (e) {
		if (launched) return
		launched = true
		new Sequence({
			0: () => {
				smoke.prop({
					size: 250,
					spread: 45,
					count: 8,
					speed: 7
				})
			},
			900: () => {
				cloud.prop({
					windSpeed: 0.4,
					bounceY: -0.1
				})
			},
			1000: () => {
				smoke.prop({
					size: 100,
					rate: 20,
					spread: 8,
					speed: 5,
					count: 5
				})
				cloud.prop({
					windSpeed: 0.05,
					bounceY: -0.6,
					fade: 5
				})
			},
			1010: () => smokeAnim.start(),
			1160: () => cloudAnim.start(),
			1100: () => {
				cloud.prop({
					spread: 180,
					fade: 1
				})
				canvas.classList.add('faded')
			},
		})
	}
	window.onresize = function (e) {
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight
		cloud.y = canvas.height
		rocketY = canvas.height - ROCKET_HOVERING_HEIGHT
		mouseX = canvas.width / 4 + canvas.width / 2
	}
	window.ontouchmove = function (e) {
		mouseX = canvas.width / 4 + e.pageX / 2
	}
	window.onmousemove = function (e) {
		mouseX = canvas.width / 4 + e.pageX / 2
	}
	addEventListener('keydown', e => {
		if (e.key === ' ') {
			PAUSED = !PAUSED
		}
	})
}()
