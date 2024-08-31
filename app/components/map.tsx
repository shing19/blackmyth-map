"use client";
import React, { useState, useEffect, useRef } from "react";

interface MapProps {
  data: any;
}

const Map: React.FC<MapProps> = ({ data }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });

  const [icons, setIcons] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    if (data) {
      // 预加载所有图标
      const iconPromises = data.map((geomark: any) => {
        const category = Object.keys(geomark)[0];
        return new Promise<[string, HTMLImageElement]>((resolve, reject) => {
          const img = new Image();
          img.src = `/markers/${category}.png`;
          img.onload = () => resolve([category, img]);
          img.onerror = reject;
        });
      });

      Promise.all(iconPromises)
        .then((loadedIcons) => {
          const iconMap = Object.fromEntries(loadedIcons);
          setIcons(iconMap);
        })
        .catch((error) => console.error("Error loading icons:", error));
    }
  }, [data]);

  useEffect(() => {
    if (Object.keys(icons).length > 0) {
      redrawCanvas();
    }
  }, [icons]);

  useEffect(() => {
    if (data) {
      redrawCanvas();
    }
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = "/map.png";
    img.onload = () => {
      imgRef.current = img;
      resizeCanvas();
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    redrawCanvas();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx || !imgRef.current) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImage(ctx, imgRef.current);
    drawLandmarks(ctx);
  };

  useEffect(() => {
    redrawCanvas();
  }, [scale, position, data]);

  const drawImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    ctx.save();
    ctx.translate(centerX + position.x, centerY + position.y);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    const imgAspectRatio = img.width / img.height;
    const canvasAspectRatio = ctx.canvas.width / ctx.canvas.height;

    let drawWidth, drawHeight, x, y;

    if (canvasAspectRatio > imgAspectRatio) {
      drawHeight = ctx.canvas.height;
      drawWidth = drawHeight * imgAspectRatio;
      x = (ctx.canvas.width - drawWidth) / 2;
      y = 0;
    } else {
      drawWidth = ctx.canvas.width;
      drawHeight = drawWidth / imgAspectRatio;
      x = 0;
      y = (ctx.canvas.height - drawHeight) / 2;
    }

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
    ctx.restore();
  };

  const drawLandmarks = (ctx: CanvasRenderingContext2D) => {
    if (!data || Object.keys(icons).length === 0) return;

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    ctx.save();
    ctx.translate(centerX + position.x, centerY + position.y);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    data.forEach((geomark: any) => {
      const category = Object.keys(geomark)[0];
      const landmarks = geomark[category].landmarks;

      landmarks.forEach((landmark: any) => {
        const scaleY = 1.34;
        const scaleX = 1.21;
        const correctionX = 1.48;
        const correctionY = 0.44;
        const x =
          (((landmark.x + correctionX) * ctx.canvas.width) / 2) * scaleX +
          correctionX;
        const y =
          (((1 - landmark.y + correctionY) * ctx.canvas.height) / 2) * scaleY +
          correctionY;

        // 使用预加载的图标
        const icon = icons[category];
        if (icon) {
          const iconSize = 20;
          ctx.drawImage(
            icon,
            x - iconSize / 2,
            y - iconSize,
            iconSize,
            iconSize,
          );
        }
      });
    });

    ctx.restore();
  };

  const handleZoom = (factor: number) => {
    setScale((prevScale) => {
      const newScale = prevScale * factor;
      return Math.max(0.1, Math.min(newScale, 5));
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - lastPositionRef.current.x;
    const dy = e.clientY - lastPositionRef.current.y;

    setPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    lastPositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

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
        <button
          onClick={() => handleZoom(1.1)}
          className="bg-white text-black px-3 py-1 rounded"
        >
          +
        </button>
        <button
          onClick={() => handleZoom(0.9)}
          className="bg-white text-black px-3 py-1 rounded"
        >
          -
        </button>
      </div>
    </div>
  );
};

export default Map;
