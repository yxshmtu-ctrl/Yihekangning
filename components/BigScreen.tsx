
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

// 浦东新区医联体核心医院数据 (ARCGIS 映射坐标系统)
const pudongMedicalUnions = [
  { id: '1', name: '东方医院', x: 210, y: 135, beds: 120, status: 'busy', type: '核心院区' },
  { id: '2', name: '浦南医院', x: 185, y: 175, beds: 45, status: 'normal', type: '医联体成员' },
  { id: '3', name: '公利医院', x: 275, y: 155, beds: 82, status: 'warning', type: '核心院区' },
  { id: '4', name: '浦东医院', x: 530, y: 450, beds: 156, status: 'busy', type: '核心院区' },
  { id: '5', name: '第七人民医院', x: 295, y: 35, beds: 74, status: 'normal', type: '核心院区' },
  { id: '6', name: '浦东新区人民医院', x: 585, y: 305, beds: 98, status: 'warning', type: '核心院区' },
  { id: '7', name: '浦东医院(临港)', x: 710, y: 540, beds: 32, status: 'normal', type: '新建院区' },
  { id: '8', name: '仁济医院(东院)', x: 245, y: 165, beds: 210, status: 'busy', type: '特邀协作' },
  { id: '9', name: '曙光医院(东院)', x: 345, y: 225, beds: 140, status: 'normal', type: '中医基地' },
];

// 精确化浦东行政区划主轮廓 (根据参考图还原)
const pudongMainOutline = "M215,5 C240,10 270,15 300,25 C330,35 360,80 400,110 C440,140 480,180 520,240 C560,300 640,340 700,400 C760,460 790,520 785,550 C780,580 720,595 680,590 C640,585 550,580 500,565 C450,550 400,530 350,525 C300,520 250,530 220,520 C190,510 160,480 140,430 C120,380 140,320 165,280 C190,240 160,200 155,160 C150,120 180,50 215,5 Z";

// 重点人群热力数据 (各街镇样本点)
const heatmapData = [
  { x: 220, y: 150, r: 40, intensity: 0.6 }, // 陆家嘴区域
  { x: 360, y: 240, r: 50, intensity: 0.8 }, // 张江区域
  { x: 190, y: 320, r: 45, intensity: 0.9 }, // 三林区域
  { x: 520, y: 450, r: 60, intensity: 0.5 }, // 惠南区域
  { x: 700, y: 530, r: 35, intensity: 0.4 }, // 临港区域
  { x: 300, y: 50, r: 30, intensity: 0.3 },  // 高桥区域
  { x: 580, y: 310, r: 40, intensity: 0.7 }, // 川沙区域
];

const BigScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [hoveredHosp, setHoveredHosp] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const vitalData = Array.from({ length: 20 }, (_, i) => ({ t: i, v: 70 + Math.random() * 20 }));
  const drugData = [
    { name: '急救类', value: 45, color: '#00F2FF' },
    { name: '慢病类', value: 30, color: '#0055FF' },
    { name: '疫苗类', value: 25, color: '#10b981' }
  ];
  const orData = [
    { name: '1号楼', val: 85 }, { name: '2号楼', val: 62 }, { name: '3号楼', val: 94 }, { name: '综合', val: 78 }
  ];

  return (
    <div className="fixed inset-0 bg-[#020617] z-[100] flex flex-col font-sans overflow-hidden animate-in fade-in duration-1000">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e3a8a30,transparent_70%)]"></div>
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      </div>

      <header className="h-20 bg-slate-900/40 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between px-10 relative z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 border border-cyan-400 rounded-lg flex items-center justify-center text-cyan-400 font-black text-xl shadow-[0_0_15px_rgba(34,211,238,0.4)]">✚</div>
          <div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase">浦东新区医防融合指挥大屏</h1>
            <p className="text-[8px] text-cyan-400 font-bold uppercase tracking-[0.4em] opacity-60">Pudong Medical Union Integrated HUD v4.5</p>
          </div>
        </div>

        <div className="flex gap-8 items-center">
          <div className="flex bg-slate-950/80 rounded-full p-1 border border-white/10 shadow-inner">
            <button onClick={() => setViewMode('3D')} className={`px-6 py-2 rounded-full text-[10px] font-black transition-all ${viewMode === '3D' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500'}`}>3D 态势</button>
            <button onClick={() => setViewMode('2D')} className={`px-6 py-2 rounded-full text-[10px] font-black transition-all ${viewMode === '2D' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500'}`}>区域拓扑</button>
          </div>
          <div className="flex gap-6 border-l border-white/5 pl-6">
             {[
               { l: '急诊绿通', v: '10.43', u: 'min', c: 'text-emerald-400' },
               { l: '全网病床', v: '11.57', u: 'k', c: 'text-cyan-400' }
             ].map((it, i) => (
               <div key={i} className="text-center px-4">
                  <p className="text-[8px] text-slate-500 font-black uppercase mb-1">{it.l}</p>
                  <p className={`text-lg font-black ${it.c}`}>{it.v}<span className="text-[10px] ml-1 opacity-50">{it.u}</span></p>
               </div>
             ))}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded border border-white/10 flex items-center justify-center hover:bg-rose-500/20 transition-all text-white">✕</button>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-12 gap-6 relative">
        <div className="col-span-3 space-y-6">
           <div className="hud-card h-1/2 flex flex-col p-6">
              <h3 className="text-xs font-black text-cyan-400 tracking-widest uppercase mb-6 flex items-center gap-2"><span className="w-1 h-3 bg-cyan-400 rounded-full"></span> 生命监控</h3>
              <div className="flex-1 flex flex-col">
                 <div className="flex items-center gap-4 mb-4">
                    <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100" className="w-14 h-14 rounded-2xl border border-cyan-500/30 object-cover" alt="patient" />
                    <div><p className="text-sm font-black text-white">王建国 (ID: 0459)</p><p className="text-[10px] text-cyan-400 font-bold">高血压在管 · 状态稳定</p></div>
                 </div>
                 <div className="flex-1 min-h-[120px]">
                    <ResponsiveContainer width="100%" height="100%"><AreaChart data={vitalData}><Area type="monotone" dataKey="v" stroke="#00F2FF" strokeWidth={2} fillOpacity={0.1} isAnimationActive={false} /></AreaChart></ResponsiveContainer>
                 </div>
              </div>
           </div>
           <div className="hud-card h-[calc(50%-1.5rem)] flex flex-col p-6">
              <h3 className="text-xs font-black text-cyan-400 tracking-widest uppercase mb-6">药品库存分析</h3>
              <div className="flex-1 flex items-center">
                 <div className="w-1/2 h-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={drugData} innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value">{drugData.map((entry, index) => <Cell key={index} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer></div>
                 <div className="w-1/2 space-y-4">
                    {drugData.map(d => (
                       <div key={d.name} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }}></div><span className="text-[10px] text-slate-400 font-black">{d.name}</span></div><span className="text-xs font-black text-white">{d.value}%</span></div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="col-span-6 relative flex items-center justify-center perspective-[2000px]">
           <svg viewBox="0 0 800 600" className={`w-full h-full transition-all duration-1000 ${viewMode === '3D' ? 'transform rotateX-[35deg] rotateZ-[-15deg] scale-110' : 'transform scale-95'} filter drop-shadow-[0_50px_100px_rgba(0,0,0,0.8)]`}>
              <defs>
                <filter id="heatBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="15" /></filter>
                <radialGradient id="heatGrad"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.6"/><stop offset="100%" stopColor="#ef4444" stopOpacity="0"/></radialGradient>
              </defs>

              {/* 浦东新区主轮廓 */}
              <path d={pudongMainOutline} fill={viewMode === '3D' ? '#050b1a' : 'rgba(255,255,255,0.02)'} stroke="#00F2FF" strokeWidth="2" className="transition-all duration-1000" />

              {/* 街镇边界划分 (模拟划分) */}
              <g stroke="rgba(0,242,255,0.15)" strokeWidth="0.8" fill="none">
                <path d="M210,120 Q300,100 350,150" /> {/* 高桥-高东 */}
                <path d="M165,220 L300,230 L380,260" /> {/* 陆家嘴-张江 */}
                <path d="M150,340 L300,350 L450,400" /> {/* 三林-周浦 */}
                <path d="M450,400 L550,380 L650,420" /> {/* 川沙-祝桥 */}
                <path d="M350,525 L450,480 L550,490" /> {/* 航头-新场-宣桥 */}
              </g>

              {/* 重点人群热力图层 */}
              <g filter="url(#heatBlur)">
                {heatmapData.map((point, i) => (
                  <circle key={i} cx={point.x} cy={point.y} r={point.r * point.intensity} fill="url(#heatGrad)" />
                ))}
              </g>

              {/* 街镇名称标注 */}
              <g fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold">
                 <text x="240" y="70">高桥镇</text><text x="350" y="240">张江镇</text>
                 <text x="170" y="320" fill="rgba(239,68,68,0.4)">三林镇 (高密)</text>
                 <text x="500" y="440">惠南镇</text><text x="660" y="520">临港新城</text>
                 <text x="560" y="280">川沙新镇</text>
              </g>

              {/* 医疗机构标记点 */}
              {pudongMedicalUnions.map((h) => (
                 <g key={h.id} transform={`translate(${h.x}, ${h.y})`} className="cursor-pointer group" onMouseEnter={() => setHoveredHosp(h)} onMouseLeave={() => setHoveredHosp(null)}>
                    <circle r="12" fill={h.status === 'busy' ? '#ef4444' : '#00F2FF'} opacity="0.1" className="animate-ping" />
                    {viewMode === '3D' ? (
                      <><rect x="-3" y="-35" width="6" height="35" fill={h.status === 'busy' ? '#ef4444' : '#00F2FF'} opacity="0.8" /><rect x="-3" y="-35" width="6" height="6" fill="white" opacity="0.6" /></>
                    ) : (
                      <path d="M0,0 L-5,-12 A5,5 0 1,1 5,-12 Z" fill={h.status === 'busy' ? '#ef4444' : '#00F2FF'} />
                    )}
                    <g transform={`translate(10, ${viewMode === '3D' ? -30 : -8})`}>
                       <rect x="-4" y="-10" width="100" height="20" rx="10" fill="rgba(5,11,26,0.9)" stroke="rgba(0,242,255,0.3)" />
                       <text y="3" fill="white" fontSize="8" fontWeight="900" textAnchor="start" className="px-3">{h.name}</text>
                    </g>
                    {hoveredHosp?.id === h.id && (
                       <g transform="translate(0, -80)" className="animate-in zoom-in duration-300">
                          <rect x="-55" y="-35" width="110" height="55" rx="10" fill="#0f172a" stroke="#00F2FF" strokeWidth="1" />
                          <text textAnchor="middle" fill="#00F2FF" fontSize="8" fontWeight="black" y="-15">{h.type}</text>
                          <text textAnchor="middle" fill="white" fontSize="10" fontWeight="black" y="5">病床占用: {h.beds}%</text>
                          <text textAnchor="middle" fill={h.status === 'busy' ? '#ef4444' : '#10b981'} fontSize="8" fontWeight="black" y="20">状态: {h.status === 'busy' ? '极高负荷' : '正常'}</text>
                       </g>
                    )}
                 </g>
              ))}
           </svg>
        </div>

        <div className="col-span-3 space-y-6">
           <div className="hud-card h-1/2 flex flex-col p-6">
              <h3 className="text-xs font-black text-cyan-400 tracking-widest uppercase mb-6 flex items-center gap-2"><span className="w-1 h-3 bg-cyan-400 rounded-full"></span> 手术室使用效率</h3>
              <div className="flex-1"><ResponsiveContainer width="100%" height="100%"><BarChart data={orData}><Bar dataKey="val" fill="#00F2FF" radius={[4, 4, 0, 0]}>{orData.map((entry, index) => <Cell key={`cell-${index}`} fillOpacity={0.4 + index * 0.2} />)}</Bar><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 'black' }} /></BarChart></ResponsiveContainer></div>
           </div>
           <div className="hud-card h-[calc(50%-1.5rem)] flex flex-col p-6">
              <h3 className="text-xs font-black text-cyan-400 tracking-widest uppercase mb-4">医护实时排班表</h3>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                 {[{ n: '张志远', r: '心内科', t: '在岗', s: '正常' }, { n: '李晓梅', r: '急诊科', t: '手术中', s: '繁忙' }, { n: '王大方', r: '老年医学', t: '随访中', s: '正常' }, { n: '陈思思', r: '影像科', t: '在岗', s: '正常' }].map((it, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-cyan-500/30 transition-all"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] font-black text-cyan-400">{it.n.charAt(0)}</div><div><p className="text-xs font-black text-white">{it.n}</p><p className="text-[9px] text-slate-500">{it.r}</p></div></div><span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${it.s === '繁忙' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-400'}`}>{it.t}</span></div>
                 ))}
              </div>
           </div>
        </div>
      </main>

      <footer className="h-12 bg-slate-900/60 border-t border-cyan-500/20 flex items-center px-10 overflow-hidden relative z-50">
         <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
            <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-4 py-1 rounded-full border border-cyan-400/30">重点人群热力监控 (POPULATION DENSITY)</span>
            <p className="text-xs font-medium text-slate-400 flex gap-20">
               <span>[11:05] 三林镇热力等级升至红色，建议全科医生加大随访频率。</span>
               <span>[11:20] 东方医院智慧医联体：10名老年患者已通过绿色通道快速分流。</span>
            </p>
         </div>
      </footer>

      <style>{`
        .hud-card { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(0, 242, 255, 0.1); position: relative; overflow: hidden; }
        .hud-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #00F2FF; opacity: 0.3; }
        @keyframes marquee { 0% { transform: translateX(50%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default BigScreen;
