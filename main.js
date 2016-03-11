"use strict";

var domLoaded = new Promise(resolve => {
  document.addEventListener('DOMContentLoaded', resolve)
})

var imgLoaded = new Promise(resolve => {
  var img = new Image()
  img.onload = () => resolve(img)
  img.src = '/test.png'
})

Promise.all([imgLoaded, domLoaded])
  .then(function go(args) {
    var img = args[0]

    var W = 1000
    var H = W
    var center = [W / 2, H / 2]

    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')

    ctx.strokeStyle = 'black'

    canvas.width = W
    canvas.height = H

    ctx.drawImage(img, 0, 0)

    var imgData = ctx.getImageData(0, 0, W, H).data

    document.body.appendChild(canvas)

    var params = {
      step: 0.04,
      separation: 0.74,
      lineWidth: 1.2
    }

    var gui = new dat.GUI()
    gui.add(params, 'step', 0.005, 0.1)
    gui.add(params, 'separation', 0.3, 1)
    gui.add(params, 'lineWidth', 1, 5)

    gui.__controllers.forEach(function (control) {
      control.onFinishChange(update)
    })

    update()

    function update () {
      clear()
      drawSpiral(ctx, params, shouldDrawAt)
    }


    function shouldDrawAt (coord) {
      var x = ~~(coord[0])
      var y = ~~(coord[1])
      var index = (x + y * W) * 4
      return imgData[index] === 0
    }

    function clear () {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, W, H)
    }
  })
  .catch(function (err) {
    console.log('error', err)
  })


function drawSpiral (ctx, params, shouldDrawAt) {
  var center = [ctx.canvas.width / 2, ctx.canvas.height / 2]
  ctx.beginPath()
  for (var t = 0; t < Math.PI * 2 * 1000; t += params.step) {
    var rad = t * params.separation
    var coord = add(center, [
      Math.sin(t) * rad,
      Math.cos(t) * rad
    ])
    ctx[shouldDrawAt(coord) ? 'lineTo' : 'moveTo'].apply(ctx, coord)
    if (coord[0] < 0) {
      break
    }
  }
  ctx.lineWidth = params.lineWidth
  ctx.stroke()
}


// adds two points ([x, y])
function add (a, b) {
  return [
    a[0] + b[0],
    a[1] + b[1]
  ]
}

