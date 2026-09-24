import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function WindLayer({ windSpeed = 12, windDirectionDeg = 45, visible = true }) {
  const map = useMap();
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    // Create canvas element overlay
    const canvas = L.DomUtil.create('canvas', 'wind-canvas-layer');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '400';
    map.getPanes().overlayPane.appendChild(canvas);
    canvasRef.current = canvas;

    const resizeCanvas = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(canvas, topLeft);
    };

    resizeCanvas();
    map.on('moveend resize', resizeCanvas);

    const ctx = canvas.getContext('2d');

    // Particle system
    const numParticles = 120;
    const particles = [];
    const rad = ((windDirectionDeg + 180) % 360) * (Math.PI / 180);
    const speed = Math.max(1.2, Math.min(6, windSpeed / 4));

    const vx = Math.cos(rad) * speed;
    const vy = Math.sin(rad) * speed;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 18 + 12,
        life: Math.random() * 80 + 20,
        maxLife: 100,
        opacity: Math.random() * 0.7 + 0.3
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';

      for (let p of particles) {
        p.x += vx;
        p.y += vy;
        p.life--;

        // Reset if offscreen or expired
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height || p.life <= 0) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.life = Math.random() * 80 + 40;
        }

        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * p.opacity;
        
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - vx * 4, p.y - vy * 4);
        ctx.stroke();

        // Arrow head for leading particles
        if (p.life > 70) {
          ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      map.off('moveend resize', resizeCanvas);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, windSpeed, windDirectionDeg, visible]);

  return null;
}
