function Sequence(actions) {
	Object.entries(actions).forEach(([delay, action]) => {
		setTimeout(action, parseInt(delay))
	})
}
class Tween {
	constructor(duration = 1000, from = 0, to = 1, easing = 'linear') {
		this.from = from
		this.to = to
		this.duration = duration
		this.easing = easing
	}
	start() {
		this.time = Date.now()
	}
	get value() {
		if (!this.time) return this.from
		var now = Date.now()
		var lapsed = Math.min(now - this.time, this.duration)
		return this.from + Easing[this.easing](lapsed / this.duration) * (this.to - this.from)
	}
}

class Vector {
	static deg2rad(deg) {
		return deg * (Math.PI / 180)
	}
	static rad2deg(rad) {
		return rad * (180 / Math.PI)
	}
	static fromAngle() {
		var deg = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0]
		var radius = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1]
		return new Vector(radius * Math.cos(this.deg2rad(deg)), radius * Math.sin(this.deg2rad(deg)))
	}
	static randomRange(from, to) {
		return from + Math.random() * (to - from)
	}

	constructor(x, y) {
		this.x = x || 0
		this.y = y || 0
	}
	add(v) {
		if (v instanceof Vector) {
			this.x += v.x
			this.y += v.y
		} else {
			this.x += v
			this.y += v
		}
		return this
	}
	subtract(v) {
		if (v instanceof Vector) {
			this.x -= v.x
			this.y -= v.y
		} else {
			this.x -= v
			this.y -= v
		}
		return this
	}
	multiply(v) {
		if (v instanceof Vector) {
			this.x *= v.x
			this.y *= v.y
		} else {
			this.x *= v
			this.y *= v
		}
		return this
	}
	divide(v) {
		if (v instanceof Vector) {
			this.x /= v.x
			this.y /= v.y
		} else {
			this.x /= v
			this.y /= v
		}
		return this
	}
	clone() {
		return new Vector(this.x, this.y, this.z)
	}
}

class Particle {
	constructor(canvas = window.canvas, x = 0, y = 0, props = {}) {
		this.props = props
		this.canvas = canvas
		this.life = 1
		this.size = Vector.randomRange(props.size / 2, props.size)
		this.angle = Vector.randomRange(props.angle - props.spread / 2, props.angle + props.spread / 2)
		this.speed = Vector.randomRange(props.speed * 1.1, props.speed / 1.1)
		this.pos = new Vector(x, y)
		this.acc = new Vector()
		this.vel = Vector.fromAngle(this.angle, this.speed)
	}
	setForce(force) {
		this.acc = force
	}
	loop() {
		this.life = Math.max(0, this.life - this.props.fade / 1000)
		this.radius = this.size * (this.props.invert ? (1.05 - this.life) * 0.95 : this.life)
		this.vel.add(this.acc)
		if (this.pos.x > this.canvas.width || this.pos.x <= 0) this.vel.x *= this.props.bounceX || 0
		if (this.pos.y > this.canvas.height || this.pos.y <= 0) this.vel.y *= this.props.bounceY || 0
		this.pos.add(this.vel)
		if (this.pos.x - this.size > this.canvas.width || this.pos.x + this.size <= 0) this.life = 0
		if (this.pos.y - this.size > this.canvas.height) this.life = 0
	}
}

class Emitter {
	/**
	 * 
	 * @param {Number} initial X position
	 * @param {Number} initial Y position
	 * @param {Object} emitter properties
	 * @param {Function} particle render function
	 */
	constructor(canvas, x = 0, y = 0, props = {}, render = () => {}) {
		if (canvas instanceof HTMLCanvasElement === false) throw "param must be HTML canvas element"
		if (typeof render != 'function') throw "render param must be a function"
		this.props = {
			size: 200, // initial size of the particle
			count: 4, // Number of particles to generate per shoot out
			rate: 50, // milliseconds to shot out particles, lower is faster
			speed: 4, // initial speed of the particle, higher is faster
			fade: 3, // lifespan of the particles
			invert: 1,
			angle: -90, // shooting angle if the particles
			spread: 15, // spread angle of the particles from the shooting angle
			bounceX: 1, // Multiplier factor when particle hits horizontal wall
			bounceY: 1, // Multiplier factor when particle hits verticle wall
			windAngle: 90, // Wind affector angle 0=right 90=down 180=left 270=up
			windSpeed: 0.03, // Multiplier factor for wind speed
			...props
		}
		this.pos = new Vector(x, y)
		this.canvas = canvas
		this.particles = []
		this.lastTime = 0
		this.emitting = true
		this.render = render
	}
	prop(key, val) {
		switch (true) {
			case typeof key == 'object':
				for (let k in key) {
					this.prop(k, key[k])
				}
				break
			default:
				this.props[key] = val
		}
		return this
	}
	add() {
		this.particles.push(new Particle(this.canvas, this.pos.x, this.pos.y, this.props))
		return this
	}
	loop() {
		this.particles = this.particles.filter(p => {
			p.setForce(Vector.fromAngle(this.props.windAngle, this.props.windSpeed))
			p.loop()
			this.render(p)
			return p.life > 0
		})
		if (!this.emitting) return this
		if (Date.now() - this.lastTime > this.props.rate) {
			for (var i = 0; i < this.props.count; i++) {
				this.add()
			}
			this.lastTime = Date.now()
		}
		return this
	}
	start() {
		this.emitting = true
		return this
	}
	stop() {
		this.emitting = false
		return this
	}
	get x() {
		return this.pos.x
	}
	set x(value) {
		return this.pos.x = value
	}
	get y() {
		return this.pos.y
	}
	set y(value) {
		return this.pos.y = value
	}
}

var Easing = function () {
	var easings = {
		linear: function linear(p) {
			return p
		}
	}
	var baseEasings = {};
	['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'].forEach(function (name, i) {
		baseEasings[name] = function (p) {
			return Math.pow(p, i + 2)
		}
	})
	Object.assign(baseEasings, {
		Sine: function Sine(p) {
			return 1 - Math.cos(p * Math.PI / 2)
		},
		Circ: function Circ(p) {
			return 1 - Math.sqrt(1 - p * p)
		},
		Elastic: function Elastic(p) {
			return p === 0 || p === 1 ? p : -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15)
		},
		Back: function Back(p) {
			return p * p * (3 * p - 2)
		},
		Bounce: function Bounce(p) {
			var pow2, bounce = 4
			while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {
			}
			return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2)
		}
	})
	Object.keys(baseEasings).forEach(function (name) {
		var easeIn = baseEasings[name]
		easings['easeIn' + name] = easeIn
		easings['easeOut' + name] = function (p) {
			return 1 - easeIn(1 - p)
		}
		easings['easeInOut' + name] = function (p) {
			return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn(p * -2 + 2) / 2
		}
	})
	return easings
}()

