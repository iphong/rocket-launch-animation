void function () {
	let canvas = document.querySelector('#canvas')
	let rocket = document.querySelector('#rocket')

	let mouseX = window.innerWidth / 2
	let ctx = canvas.getContext('2d')

	const cloudAnim = new Tween(3000, 0, 1, 'linear')
	const rocketAnim = new Tween(5000, 200, 0, 'easeOutElastic')
	const smokeAnim = new Tween(7000, 0, -canvas.height * 5, 'easeOutExpo')
	// const smokeAnim = new Tween(7000, 0, -canvas.height * 5, 'linear')
	// const smokeAnim = new Tween(7000, 0, -canvas.height * 5, 'easeOutQuad')

	canvas.width = window.innerWidth
	canvas.height = window.innerHeight

	let rocketY = canvas.height - 200

	let cloud = new Emitter(canvas, canvas.width / 2, canvas.height - 20, {
		size: 75,
		count: 2,
		rate: 40,
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

	function drawParticle(p) {
		if (p.pos.y - p.size > canvas.height || p.pos.y + p.size <= 0) return this
		ctx.beginPath()
		ctx.arc(Math.round(p.pos.x), Math.round(p.pos.y), Math.round(p.radius), 0, 360)
		ctx.fillStyle = 'rgba(255,255,255,1)'
		ctx.fill()
	}
	function draw() {
		let cloudTween = cloudAnim.value
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		smoke.y = rocketY + smokeAnim.value + rocketAnim.value
		smoke.x = smoke.x * 0.97 + mouseX * 0.03
		cloud.x = cloud.x * 0.97 + mouseX * 0.03

		cloud.prop({
			size: 60 + cloudTween * 250,
			speed: 4 + cloudTween * 4,
			rate: 70 + cloudTween * 70
		})

		cloud.loop()
		smoke.loop()
		
		let tilt = (mouseX - smoke.x) / canvas.width * 45
		
		rocket.style.top = smoke.y + 'px'
		rocket.style.left = smoke.x + 'px'
		rocket.style.transform = `rotate3d(0, 0, 1, ${tilt}deg) translate3d(-50%, -110%, 0)`

		requestAnimationFrame(draw)
	}
	
	new Sequence({
		0: () => draw(),
		190: () => rocketAnim.start(),
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
		cloud.y = canvas.height - 20
		rocketY = canvas.height - 180
		mouseX = canvas.width / 4 + canvas.width / 2

		// welcome[0].style.height = wHeight * 0.45 - 60 + 'px';
	}
	window.ontouchmove = function (e) {
		mouseX = canvas.width / 4 + e.pageX / 2
	}
	window.onmousemove = function (e) {
		mouseX = canvas.width / 4 + e.pageX / 2
	}
}()
