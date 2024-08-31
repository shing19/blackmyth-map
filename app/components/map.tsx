'use client'
import React, { useState, useEffect, useRef } from 'react'

interface MapProps {
  data: any;
}

const Map: React.FC<MapProps> = ({ data }) => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const lastPositionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = '/map.png'
    img.onload = () => {
      imgRef.current = img
      resizeCanvas()
      drawImage(ctx, img)
    }

    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])


  const resizeCanvas = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx || !imgRef.current) return

    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    drawImage(ctx, imgRef.current)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx || !imgRef.current) return

    drawImage(ctx, imgRef.current)
  }, [scale, position])

  const drawImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.save()
    
    const centerX = ctx.canvas.width / 2
    const centerY = ctx.canvas.height / 2
    
    ctx.translate(centerX + position.x, centerY + position.y)
    ctx.scale(scale, scale)
    ctx.translate(-centerX, -centerY)
    
    const imgAspectRatio = img.width / img.height
    const canvasAspectRatio = ctx.canvas.width / ctx.canvas.height
    
    let drawWidth, drawHeight, x, y

    if (canvasAspectRatio > imgAspectRatio) {
      drawHeight = ctx.canvas.height
      drawWidth = drawHeight * imgAspectRatio
      x = (ctx.canvas.width - drawWidth) / 2
      y = 0
    } else {
      drawWidth = ctx.canvas.width
      drawHeight = drawWidth / imgAspectRatio
      x = 0
      y = (ctx.canvas.height - drawHeight) / 2
    }

    ctx.drawImage(img, x, y, drawWidth, drawHeight)
    ctx.restore()
  }

  const handleZoom = (factor: number) => {
    setScale(prevScale => {
      const newScale = prevScale * factor
      return Math.max(0.1, Math.min(newScale, 5))
    })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true
    lastPositionRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return

    const dx = e.clientX - lastPositionRef.current.x
    const dy = e.clientY - lastPositionRef.current.y

    setPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }))

    lastPositionRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx || !imgRef.current) return

    drawImage(ctx, imgRef.current)
    drawLandmarks(ctx)
  }, [scale, position, data])

  const drawLandmarks = (ctx: CanvasRenderingContext2D) => {
    if (!data) return;

    ctx.save()
    
    const centerX = ctx.canvas.width / 2
    const centerY = ctx.canvas.height / 2
    
    ctx.translate(centerX + position.x, centerY + position.y)
    ctx.scale(scale, scale)
    ctx.translate(-centerX, -centerY)

    data.forEach((geomark: any) => {
      const category = Object.keys(geomark)[0];
      const landmarks = geomark[category].landmarks;

      landmarks.forEach((landmark: any) => {
        const scaleY = 1.34
        const scaleX = 1.23
        const correctionX = 1.48
        const correctionY = 0.44
        const x = (landmark.x + correctionX) * ctx.canvas.width / 2 * scaleX + correctionX;
        const y = (1 - landmark.y + correctionY) * ctx.canvas.height / 2 * scaleY + correctionY;

        // 绘制标记点
        ctx.beginPath();
        ctx.arc(x, y, 5 / scale, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();

        // 绘制标签
        ctx.fillStyle = 'white';
        ctx.font = `${12 / scale}px Arial`;
        ctx.fillText(landmark.name, x + 8 / scale, y);
      });
    });

    ctx.restore()
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-move" 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button onClick={() => handleZoom(1.1)} className="bg-white text-black px-3 py-1 rounded">+</button>
        <button onClick={() => handleZoom(0.9)} className="bg-white text-black px-3 py-1 rounded">-</button>
      </div>
    </div>
  )
}

export default Map