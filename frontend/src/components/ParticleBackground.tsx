import React, { useRef, useEffect } from 'react';

interface Particle { x: number; y: number; vx: number; vy: number; radius: number; opacity: number; }

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particleCount = Math.floor((width * height) / 18000);
    const particles: Particle[] = [];
    const connectionDistance = 120;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const handleResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${p.opacity})`; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x; const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
};

export default ParticleBackground;
