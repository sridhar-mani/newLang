export async function initWebGPU(canvas: HTMLCanvasElement) {
  const adapter = await navigator.gpu?.requestAdapter()
  if (!adapter) throw new Error('WebGPU not supported')
  
  const device = await adapter.requestDevice()
  const context = canvas.getContext('webgpu')
  if (!context) throw new Error('Cannot get WebGPU context')

  return { device, context, adapter }
}
