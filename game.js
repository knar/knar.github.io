const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const canvasOffsetLeft = canvas.offsetLeft
const canvasOffsetTop = canvas.offsetTop

const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 420
const MAX_TARGET_RADIUS = 50
const TARGET_GROWTH_TIME = 2000

const GameState = {
    CLEAR: 0,
    PLAY: 1,
    DONE: 2
}

const TargetState = {
    GROWING: 0,
    SHRINKING: 1
}

let state = {
    gameState: GameState.CLEAR,
    startTime: -1,
    last: 0,
    lives: 3,
    score: 0,
    nextSpawnTime: 1000,
    targets: [],
}

let frameId

canvas.addEventListener('click', clickHandler, false)

function clickHandler(event) {
    if (state.gameState === GameState.CLEAR) {
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        state.startTime = Date.now()
        state.targets = []
        state.lives = 3
        state.score = 0
        state.nextSpawnTime = 1000,
        state.gameState = GameState.PLAY
        frameId = requestAnimationFrame(gameLoop)
    }
    else if (state.gameState === GameState.PLAY) {
        const x = event.pageX - canvasOffsetLeft
        const y = event.pageY - canvasOffsetTop
        for (let i = 0; i < state.targets.length; i++) {
            const t = state.targets[i]
            if (distance(x, y, t.x, t.y) <= t.radius) {
                state.score++
                state.targets.splice(i, 1)
                break
            }
        }
    }
    else if (state.gameState === GameState.DONE) {
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "white"
        ctx.font = '40px Consolas'
        ctx.fillText('Score: ' + state.score, 100, 200)
        state.gameState = GameState.CLEAR
    }
}

function gameLoop(now) {
    const dt = now - state.last

    update(dt, now)
    draw()

    state.last = now
    if (state.gameState === GameState.PLAY) {
        frameId = requestAnimationFrame(gameLoop)
    }
}

function update(dt, now) {
    updateTargets(dt, now)

    if (state.lives == 0) {
        state.gameState = GameState.DONE
        cancelAnimationFrame(frameId)
    }

    if (now > state.nextSpawnTime) {
        spawnTarget(now)
        state.nextSpawnTime += 500
    }
}

function updateTargets(dt) {
    for (let i = 0; i < state.targets.length; i++) {
        const t = state.targets[i]

        dr = (dt * MAX_TARGET_RADIUS / TARGET_GROWTH_TIME)
        if (t.state === TargetState.GROWING) {
            t.radius += dr
            t.radius = Math.min(t.radius, MAX_TARGET_RADIUS)
        }
        else if (t.state === TargetState.SHRINKING) {
            t.radius -= dr
        }

        if (t.radius == MAX_TARGET_RADIUS) {
            t.state = TargetState.SHRINKING
        }
        else if (t.radius < 0) {
            state.targets.splice(i, 1)
            state.lives--
        }
    }
}

function spawnTarget(now) {
    state.targets.push({
        x: (CANVAS_WIDTH - 2 * MAX_TARGET_RADIUS) * Math.random() + MAX_TARGET_RADIUS,
        y: (CANVAS_HEIGHT - 2 * MAX_TARGET_RADIUS) * Math.random() + MAX_TARGET_RADIUS,
        radius: 0,
        spawnTime: now,
        state: TargetState.GROWING
    })
}

function draw() {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "yellow"
    ctx.lineWidth = 3
    state.targets.forEach(t => {
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.radius, 0, 2 * Math.PI)
        ctx.stroke()
    })
}

function distance(x1, y1, x2, y2) {
    const dx = x1 - x2
    const dy = y1 - y2
    return Math.sqrt(dx * dx + dy * dy)
}