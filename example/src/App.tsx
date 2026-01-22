import { useEffect, useRef } from 'react'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#ff6b6b'
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Shader3D Example', canvas.width / 2, canvas.height / 2)
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Shader3D Example</h1>
      <p>WebGPU shader development environment</p>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid #333', marginTop: '1rem' }}
      />
    </div>
  )
}
