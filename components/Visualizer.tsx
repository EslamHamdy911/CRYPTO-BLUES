import React, { useEffect, useRef } from 'react';
import { Particle } from '../types';

interface VisualizerProps {
  activeNotes: string[];
}

export const Visualizer: React.FC<VisualizerProps> = ({ activeNotes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>(0);

  // Spawn digital particles when notes are active
  useEffect(() => {
    if (activeNotes.length > 0) {
      const colors = ['#10b981', '#06b6d4', '#34d399', '#22d3ee'];
      // Spawn slightly more particles for digital rain effect
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          id: Math.random(),
          x: Math.random() * window.innerWidth, // Random X across screen
          y: window.innerHeight, // Start from bottom
          color: colors[Math.floor(Math.random() * colors.length)],
          velocity: {
            x: 0, // Straight up
            y: - (Math.random() * 5 + 2), // Fast upward speed
          },
          life: 1.0,
          size: Math.random() * 12 + 8,
          char: Math.random() > 0.5 ? '1' : '0' // Binary
        });
      }
    }
  }, [activeNotes]);

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with slight fade for trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current.forEach((p, index) => {
      p.x += p.velocity.x;
      p.y += p.velocity.y;
      p.life -= 0.01;
      
      if (p.life <= 0) {
        particlesRef.current.splice(index, 1);
        return;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.font = `${p.size}px monospace`;
      
      // Draw binary character or hash block
      if (p.char) {
        ctx.fillText(p.char, p.x, p.y);
      } else {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      
      ctx.globalAlpha = 1;
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    requestRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40"
    />
  );
};