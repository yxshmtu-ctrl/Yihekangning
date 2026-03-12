
import React, { useEffect, useRef, useState } from 'react';
import Logo from './Logo';

interface Particle {
  x: number; y: number; z: number;
  baseX: number; baseY: number; baseZ: number;
  size: number;
  color: string;
  type: 'core' | 'nebula' | 'orbit' | 'icon';
  brightness: number;
  phase: number;
  icon?: string;
}

const AIVisualHeader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [camera, setCamera] = useState({ 
    z: 900, 
    rotX: -0.15, 
    rotY: 0,
    targetZ: 900
  });

  const mouseRef = useRef({ x: 0, y: 0, isDown: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const init = () => {
      canvas.width = containerRef.current?.clientWidth || window.innerWidth;
      canvas.height = 320;
      particles = [];

      const nebulaRadius = 180;
      for (let i = 0; i < 3500; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = nebulaRadius * Math.pow(Math.random(), 0.5);

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        const sCurve = Math.sin(x * 0.02 + y * 0.01) * 40;
        const isYin = z > sCurve;
        
        const color = isYin 
          ? 'rgba(66, 133, 244,' 
          : 'rgba(251, 188, 5,';

        particles.push({
          x, y, z, baseX: x, baseY: y, baseZ: z,
          size: Math.random() * 2.5 + 0.5,
          color,
          type: 'nebula',
          brightness: Math.random(),
          phase: Math.random() * Math.PI * 2
        });
      }

      const medicalIcons = ['❤️', '🧬', '🩺', '💊', '🏥', '🧠'];
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const r = 280 + Math.random() * 40;
        const x = r * Math.cos(angle);
        const z = r * Math.sin(angle);
        const y = (Math.random() - 0.5) * 100;

        particles.push({
          x, y, z, baseX: x, baseY: y, baseZ: z,
          size: 15,
          color: 'rgba(255, 255, 255,',
          type: 'icon',
          icon: medicalIcons[i % medicalIcons.length],
          brightness: 1,
          phase: angle
        });
      }

      for (let i = 0; i < 800; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 350 + Math.random() * 100;
        const x = r * Math.cos(angle);
        const z = r * Math.sin(angle);
        const y = (Math.random() - 0.5) * 20;

        particles.push({
          x, y, z, baseX: x, baseY: y, baseZ: z,
          size: Math.random() * 1.5,
          color: 'rgba(52, 168, 83,',
          type: 'orbit',
          brightness: Math.random(),
          phase: Math.random() * Math.PI * 2
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'screen';

      const time = Date.now() * 0.001;

      setCamera(prev => {
        const dist = prev.targetZ - prev.z;
        const step = dist * 0.05;
        const autoRotY = mouseRef.current.isDown ? 0 : 0.002;
        return { ...prev, z: prev.z + step, rotY: prev.rotY + autoRotY };
      });

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 800;

      const sorted = [...particles].sort((a, b) => {
        const az = a.x * Math.sin(camera.rotY) + a.z * Math.cos(camera.rotY);
        const bz = b.x * Math.sin(camera.rotY) + b.z * Math.cos(camera.rotY);
        return bz - az;
      });

      sorted.forEach(p => {
        let { x, y, z } = p;

        if (p.type === 'nebula') {
          const wave = Math.sin(time + p.phase) * 5;
          x += wave;
          y += Math.cos(time + p.phase) * 5;
        } else if (p.type === 'icon') {
          y += Math.sin(time + p.phase) * 20;
        }

        let tx = x * Math.cos(camera.rotY) - z * Math.sin(camera.rotY);
        let tz = x * Math.sin(camera.rotY) + z * Math.cos(camera.rotY);
        x = tx; z = tz;
        let ty = y * Math.cos(camera.rotX) - z * Math.sin(camera.rotX);
        tz = y * Math.sin(camera.rotX) + z * Math.cos(camera.rotX);
        y = ty; z = tz;
        
        z += camera.z;

        if (z > 100) {
          const scale = fov / z;
          const px = x * scale + cx;
          const py = y * scale + cy;
          const ps = p.size * scale;
          
          const alpha = Math.min(1, 600 / z) * (0.4 + Math.sin(time * 2 + p.brightness * 10) * 0.3);

          if (p.type === 'icon') {
            ctx.shadowBlur = 20 * scale;
            ctx.shadowColor = 'rgba(66, 133, 244, 0.5)';
            ctx.fillStyle = `rgba(255,255,255,${alpha * 0.8})`;
            ctx.font = `${Math.floor(24 * scale)}px "SF Pro Display"`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.icon!, px, py);
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(66, 133, 244, ${alpha * 0.3})`;
            ctx.lineWidth = 1 * scale;
            ctx.arc(px, py, 25 * scale, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
          } else {
            ctx.beginPath();
            const grad = ctx.createRadialGradient(px, py, 0, px, py, ps * 2.5);
            grad.addColorStop(0, p.color + alpha + ')');
            grad.addColorStop(1, p.color + '0)');
            ctx.fillStyle = grad;
            ctx.arc(px, py, ps * 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      animationFrameId = requestAnimationFrame(render);
    };

    init(); render();

    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isDown = true;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseRef.current.isDown) {
        const dx = e.clientX - mouseRef.current.lastX;
        const dy = e.clientY - mouseRef.current.lastY;
        setCamera(prev => ({ ...prev, rotY: prev.rotY + dx * 0.005, rotX: prev.rotX + dy * 0.003 }));
        mouseRef.current.lastX = e.clientX;
        mouseRef.current.lastY = e.clientY;
      }
    };
    const handleMouseUp = () => mouseRef.current.isDown = false;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCamera(prev => ({ ...prev, targetZ: Math.max(300, Math.min(1800, prev.targetZ + e.deltaY)) }));
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationFrameId);
    };
  }, [camera.rotX, camera.rotY, camera.targetZ]);

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-start pt-4 pb-8 select-none relative h-[320px] overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(66,133,244,0.08),transparent_70%)]"></div>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <div className="z-10 text-center animate-in fade-in zoom-in duration-1000 flex flex-col items-center">
        <div className="mb-4 flex justify-center scale-90 drop-shadow-[0_0_40px_rgba(66,133,244,0.3)]">
          <Logo size={100} />
        </div>
        
        <div className="relative inline-block mb-4">
          <h1 className="text-6xl font-black text-white tracking-tighter relative z-10">
            <span className="font-yihe metallic-text">颐和康宁</span>
          </h1>
          <div className="absolute -inset-x-20 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent blur-[1px]"></div>
        </div>

        <div className="space-y-3 flex flex-col items-center">
           <p className="text-2xl font-yihe text-glow text-blue-100/90 tracking-[0.4em] animate-pulse duration-[4000ms]">
              医防智联，健康颐年
           </p>
           <p className="text-blue-100/40 text-[9px] font-black uppercase tracking-[0.6em] flex items-center justify-center gap-6">
              <span className="w-10 h-px bg-gradient-to-r from-transparent to-blue-500/30"></span>
              老年人共患医防融合AI管理平台
              <span className="w-10 h-px bg-gradient-to-l from-transparent to-blue-500/30"></span>
           </p>
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[8px] font-black text-white/10 uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2">
           <div className="w-2.5 h-2.5 rounded-full border border-white/10 flex items-center justify-center text-[7px]">􀉮</div>
           <span>全景交互探索</span>
        </div>
        <div className="w-1 h-1 bg-white/5 rounded-full"></div>
        <div className="flex items-center gap-2">
           <div className="w-2.5 h-2.5 rounded-full border border-white/10 flex items-center justify-center text-[7px]">􀉶</div>
           <span>智能视野缩放</span>
        </div>
      </div>
    </div>
  );
};

export default AIVisualHeader;
