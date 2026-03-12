
import React from 'react';

const Logo: React.FC<{ className?: string, size?: number }> = ({ className, size = 64 }) => {
  return (
    <div className={`relative flex items-center justify-center rounded-[2.2rem] metallic-logo-container ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-[82%] h-[82%] drop-shadow-2xl">
        <defs>
          {/* 高级铬金属渐变 */}
          <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="20%" style={{ stopColor: '#e2e8f0', stopOpacity: 1 }} />
            <stop offset="45%" style={{ stopColor: '#94a3b8', stopOpacity: 1 }} />
            <stop offset="55%" style={{ stopColor: '#cbd5e1', stopOpacity: 1 }} />
            <stop offset="80%" style={{ stopColor: '#475569', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1e293b', stopOpacity: 1 }} />
          </linearGradient>

          {/* 深度内阴影效果 */}
          <filter id="appleInset" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
            <feOffset dx="0" dy="2" />
            <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadow" />
            <feFlood floodColor="#000" floodOpacity="0.4" />
            <feComposite in2="shadow" operator="in" />
            <feComposite in2="SourceGraphic" operator="over" />
          </filter>

          {/* 镜面高光反射 */}
          <linearGradient id="shineMask" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* 1. 太极底座边界 - 极致细线 */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="url(#chromeGrad)" strokeWidth="0.5" strokeDasharray="1 3" opacity="0.3" />
        
        {/* 2. YH 融合核心路径 - 太极阴阳动态 */}
        <g filter="url(#appleInset)">
          {/* Y 的支架与 H 的左立柱形成的复合曲线 (阴部) */}
          <path 
            d="M32 25 V75 M32 50 C32 50 50 50 50 35 C50 20 68 20 68 35" 
            fill="none" 
            stroke="url(#chromeGrad)" 
            strokeWidth="8.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          {/* Y 的主干与 H 的右立柱形成的复合曲线 (阳部) */}
          <path 
            d="M68 75 V25 M68 50 C68 50 50 50 50 65 C50 80 32 80 32 65" 
            fill="none" 
            stroke="url(#chromeGrad)" 
            strokeWidth="8.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* 太极鱼眼 - 数字化圆点 */}
          <circle cx="50" cy="35" r="4.5" fill="#0f172a" />
          <circle cx="50" cy="65" r="4.5" fill="white" fillOpacity="0.9" />
        </g>

        {/* 3. 顶层镜面扫光层 */}
        <path 
          d="M50 15 A35 35 0 0 1 85 50 L50 50 Z" 
          fill="url(#shineMask)" 
          opacity="0.1" 
          pointerEvents="none"
        />
      </svg>
      {/* 动态物理扫光 */}
      <div className="reflect-beam"></div>
      
      <style>{`
        .metallic-logo-container {
          background: linear-gradient(145deg, #ffffff 0%, #f1f5f9 45%, #e2e8f0 100%);
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 
            8px 8px 16px #cbd5e1, 
            -8px -8px 16px #ffffff,
            inset 0 0 2px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
};

export default Logo;
