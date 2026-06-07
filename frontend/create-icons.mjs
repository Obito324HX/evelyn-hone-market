import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

function createIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, size, size)
  
  ctx.fillStyle = '#e94560'
  ctx.beginPath()
  ctx.roundRect(size*0.1, size*0.1, size*0.8, size*0.8, size*0.15)
  ctx.fill()
  
  ctx.fillStyle = 'white'
  ctx.font = `bold ${size*0.45}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('EHM', size/2, size/2)
  
  return canvas.toBuffer('image/png')
}

writeFileSync('public/icons/icon-192.png', createIcon(192))
writeFileSync('public/icons/icon-512.png', createIcon(512))
console.log('Icons created!')
