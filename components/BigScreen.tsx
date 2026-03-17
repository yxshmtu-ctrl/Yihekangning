import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Cell, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { REAL_CDC_POOL } from '../data/realPatients';

// ── 浦东精确轮廓（更自然） ──
const OUTLINE = "M318,6 C342,10 372,16 402,28 C432,40 455,58 476,84 C497,110 512,142 528,172 C544,202 558,232 572,266 C586,300 598,336 612,370 C626,404 644,434 668,462 C692,490 720,514 744,534 C768,554 782,568 784,584 C786,600 766,616 742,622 C718,628 684,626 654,620 C624,614 592,604 562,596 C532,588 502,582 470,578 C438,574 404,572 372,572 C340,572 308,574 278,580 C248,586 220,596 198,600 C176,604 158,600 144,588 C130,576 124,555 122,530 C120,505 126,476 136,450 C146,424 160,400 166,374 C172,348 168,318 166,290 C164,262 166,234 170,208 C174,182 180,156 190,132 C200,108 214,86 232,66 C250,46 280,20 318,6 Z";

// ── 街镇数据（含位置、患者数、风险） ──
const TOWNS = [
  { id:'lujiazui',  name:'陆家嘴',  x:228, y:160, pts:89,  risk:3, gp:'浦东医院'   },
  { id:'zhangjiang',name:'张江镇',  x:372, y:250, pts:124, risk:3, gp:'仁济东院'   },
  { id:'sanlin',    name:'三林镇',  x:196, y:338, pts:156, risk:4, gp:'六院东院'   },
  { id:'chuansha',  name:'川沙新镇',x:568, y:298, pts:98,  risk:2, gp:'浦东新区人民医院'},
  { id:'huinan',    name:'惠南镇',  x:518, y:472, pts:142, risk:3, gp:'浦东医院'   },
  { id:'hangtou',   name:'航头镇',  x:420, y:530, pts:87,  risk:2, gp:'周浦医院'   },
  { id:'xinchang',  name:'新场镇',  x:530, y:542, pts:63,  risk:1, gp:'浦东医院'   },
  { id:'xuanqiao',  name:'宣桥镇',  x:630, y:516, pts:71,  risk:2, gp:'浦东新区人民医院'},
  { id:'zhuqiao',   name:'祝桥镇',  x:672, y:442, pts:55,  risk:1, gp:'公利医院'   },
  { id:'gaohang',   name:'高行镇',  x:312, y:50,  pts:44,  risk:1, gp:'第七人民医院'},
  { id:'gaoqiao',   name:'高桥镇',  x:252, y:72,  pts:67,  risk:2, gp:'第七人民医院'},
  { id:'jinqiao',   name:'金桥镇',  x:325, y:158, pts:78,  risk:2, gp:'东方医院'   },
  { id:'tangzhen',  name:'唐镇',    x:450, y:198, pts:52,  risk:1, gp:'仁济东院'   },
  { id:'zhoupu',    name:'周浦镇',  x:358, y:418, pts:108, risk:3, gp:'周浦医院'   },
  { id:'kangqiao',  name:'康桥镇',  x:294, y:468, pts:95,  risk:2, gp:'曙光医院东院'},
];

// ── 医联体医院 ──
const HOSPITALS = [
  { id:'df',   name:'东方医院',        abbr:'东方',  x:222, y:152, grp:'东方',  beds:1200, occ:88, st:'busy',   r:82  },
  { id:'q7',   name:'第七人民医院',    abbr:'七院',  x:298, y:44,  grp:'七院',  beds:800,  occ:72, st:'normal', r:68  },
  { id:'gl',   name:'公利医院',        abbr:'公利',  x:278, y:162, grp:'公利',  beds:600,  occ:81, st:'warn',   r:58  },
  { id:'pdry', name:'浦东新区人民医院', abbr:'浦新',  x:585, y:312, grp:'浦新',  beds:900,  occ:76, st:'normal', r:74  },
  { id:'pd',   name:'浦东医院',        abbr:'浦东',  x:530, y:455, grp:'浦东',  beds:500,  occ:65, st:'normal', r:62  },
  { id:'zp',   name:'周浦医院',        abbr:'周浦',  x:360, y:412, grp:'周浦',  beds:400,  occ:70, st:'normal', r:54  },
  { id:'dfn',  name:'东方南院',        abbr:'东南',  x:350, y:528, grp:'东方',  beds:300,  occ:58, st:'normal', r:44  },
  { id:'rj',   name:'仁济东院',        abbr:'仁济',  x:250, y:166, grp:'仁济',  beds:1500, occ:92, st:'busy',   r:88  },
  { id:'d6',   name:'六院东院',        abbr:'六院',  x:198, y:326, grp:'六院',  beds:700,  occ:84, st:'warn',   r:66  },
  { id:'lh',   name:'龙华医院东院',    abbr:'龙华',  x:315, y:250, grp:'龙华',  beds:500,  occ:67, st:'normal', r:54  },
  { id:'sg',   name:'曙光医院东院',    abbr:'曙光',  x:360, y:230, grp:'曙光',  beds:600,  occ:73, st:'normal', r:58  },
];

const SC = (st:string) => st==='busy'?'#ef4444':st==='warn'?'#f97316':'#22c55e';
const RC = (r:number)  => r>=4?'#dc2626':r>=3?'#ef4444':r>=2?'#f97316':'#22c55e';

const LINKS = [['df','gl'],['df','rj'],['df','dfn'],['q7','gl'],['rj','d6'],['lh','sg'],['pd','zp'],['pd','pdry']];

const TREND = Array.from({length:12},(_,i)=>({m:`${i+1}月`,p:820+i*42+Math.floor(Math.random()*25),c:63+i*1.6+Math.random()*3}));

const RADAR_DATA = [
  {s:'血压达标',A:72},{s:'血糖达标',A:68},{s:'随访完成',A:85},{s:'用药规律',A:61},{s:'生活方式',A:55},{s:'转诊及时',A:78}
];

const BigScreen: React.FC<{onClose:()=>void}> = ({onClose}) => {
  const [time,  setTime]  = useState(new Date().toLocaleTimeString());
  const [hov,   setHov]   = useState<any>(null);
  const [sel,   setSel]   = useState<any>(null);
  const [tick,  setTick]  = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 真实患者街镇统计
  const distMap: Record<string,number> = {};
  REAL_CDC_POOL.forEach(p=>{ const d=p.district||'其他'; distMap[d]=(distMap[d]||0)+1; });

  useEffect(()=>{
    const t=setInterval(()=>{ setTime(new Date().toLocaleTimeString()); setTick(v=>(v+1)%200); },1000);
    return ()=>clearInterval(t);
  },[]);

  // 粒子背景
  useEffect(()=>{
    const cv=canvasRef.current; if(!cv) return;
    const ctx=cv.getContext('2d')!;
    cv.width=cv.offsetWidth; cv.height=cv.offsetHeight;
    const pts=Array.from({length:80},()=>({
      x:Math.random()*cv.width, y:Math.random()*cv.height,
      vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25,
      r:Math.random()*1.2+.4, a:Math.random()
    }));
    let af:number;
    const draw=()=>{
      ctx.clearRect(0,0,cv.width,cv.height);
      pts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>cv.width)  p.vx*=-1;
        if(p.y<0||p.y>cv.height) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(0,242,255,${p.a*.3})`; ctx.fill();
      });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<90){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(0,242,255,${.07*(1-d/90)})`; ctx.lineWidth=.4; ctx.stroke(); }
      }));
      af=requestAnimationFrame(draw);
    };
    draw(); return ()=>cancelAnimationFrame(af);
  },[]);

  const COMPLIANCE = TOWNS.slice(0,8).sort((a,b)=>b.pts-a.pts).map(t=>({
    name:t.name, v:Math.round(55+t.risk*5+Math.random()*12), risk:t.risk
  }));

  return (
    <div style={{position:'fixed',inset:0,background:'#010812',zIndex:100,display:'flex',flexDirection:'column',fontFamily:'-apple-system,sans-serif',overflow:'hidden'}}>
      {/* 粒子层 */}
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.5,pointerEvents:'none'}}/>
      {/* 扫描线 */}
      <div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,242,255,.012) 3px,rgba(0,242,255,.012) 4px)',pointerEvents:'none',zIndex:1}}/>
      {/* 顶部光晕 */}
      <div style={{position:'absolute',top:0,left:'30%',width:'40%',height:2,background:'linear-gradient(90deg,transparent,rgba(0,242,255,.6),transparent)',zIndex:2}}/>

      {/* ── HEADER ── */}
      <header style={{height:58,background:'linear-gradient(180deg,rgba(0,242,255,.06) 0%,rgba(1,8,18,.95) 100%)',backdropFilter:'blur(24px)',borderBottom:'1px solid rgba(0,242,255,.18)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0,position:'relative',zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:34,height:34,border:'1.5px solid #22d3ee',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#22d3ee',fontWeight:900,fontSize:17,boxShadow:'0 0 20px rgba(34,211,238,.5),inset 0 0 10px rgba(34,211,238,.1)'}}>✚</div>
          <div>
            <div style={{color:'#fff',fontWeight:900,fontSize:15,letterSpacing:'0.1em',textShadow:'0 0 20px rgba(34,211,238,.4)'}}>浦东新区医防融合指挥大屏</div>
            <div style={{color:'#22d3ee',fontSize:7,fontWeight:700,letterSpacing:'0.4em',opacity:.5,textTransform:'uppercase'}}>PUDONG NEW AREA MEDICAL-PREVENTION INTEGRATED HUD · v5.0</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          {[
            {l:'在管总人数',v:String(REAL_CDC_POOL.length+1847),u:'人',c:'#22d3ee',bg:'rgba(34,211,238,.08)'},
            {l:'高危预警',  v:'47',u:'例',c:'#ef4444',bg:'rgba(239,68,68,.08)'},
            {l:'今日转诊',  v:'12',u:'单',c:'#f97316',bg:'rgba(249,115,22,.08)'},
            {l:'平均急诊候诊',v:'10.4',u:'min',c:'#22c55e',bg:'rgba(34,197,94,.08)'},
            {l:'AI辅助筛查',v:'328',u:'次/日',c:'#818cf8',bg:'rgba(129,140,248,.08)'},
          ].map((it,i)=>(
            <div key={i} style={{textAlign:'center',padding:'5px 12px',background:it.bg,border:`1px solid ${it.c}22`,borderRadius:8}}>
              <div style={{fontSize:7,color:'#64748b',fontWeight:900,textTransform:'uppercase',marginBottom:1,whiteSpace:'nowrap'}}>{it.l}</div>
              <div style={{fontSize:17,fontWeight:900,color:it.c,lineHeight:1}}>{it.v}<span style={{fontSize:8,marginLeft:2,opacity:.6}}>{it.u}</span></div>
            </div>
          ))}
          <div style={{color:'#22d3ee',fontWeight:900,fontSize:13,padding:'0 12px',borderLeft:'1px solid rgba(255,255,255,.06)',fontVariantNumeric:'tabular-nums'}}>{time}</div>
          <button onClick={onClose} style={{width:26,height:26,borderRadius:6,border:'1px solid rgba(255,255,255,.1)',background:'rgba(239,68,68,.08)',color:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}} onMouseOver={e=>{e.currentTarget.style.background='rgba(239,68,68,.3)';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='rgba(239,68,68,.08)';e.currentTarget.style.color='rgba(255,255,255,.5)';}}>✕</button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{flex:1,display:'grid',gridTemplateColumns:'268px 1fr 268px',gap:8,padding:8,overflow:'hidden',position:'relative',zIndex:2}}>

        {/* ── 左栏 ── */}
        <div style={{display:'flex',flexDirection:'column',gap:8}}>

          {/* 街镇热力排行 */}
          <div style={{...card,flex:1.4,padding:'12px 14px'}}>
            <Title t="街镇慢病热力排行" />
            <div style={{flex:1,overflowY:'auto',marginTop:8}}>
              {TOWNS.sort((a,b)=>b.pts-a.pts).map((t,i)=>(
                <div key={t.id} style={{display:'flex',alignItems:'center',gap:7,marginBottom:6,padding:'5px 7px',borderRadius:7,background:sel?.id===t.id?`${RC(t.risk)}12`:'rgba(255,255,255,.025)',border:`1px solid ${RC(t.risk)}${sel?.id===t.id?'44':'18'}`,cursor:'pointer',transition:'all .2s'}}
                  onClick={()=>setSel(sel?.id===t.id?null:t)}>
                  <div style={{width:16,height:16,borderRadius:3,background:`${RC(t.risk)}20`,border:`1px solid ${RC(t.risk)}66`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:900,color:RC(t.risk),flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                      <span style={{fontSize:10,fontWeight:900,color:'#e2e8f0',whiteSpace:'nowrap'}}>{t.name}</span>
                      <span style={{fontSize:9,fontWeight:900,color:RC(t.risk)}}>{t.pts}人</span>
                    </div>
                    <div style={{height:2.5,background:'rgba(255,255,255,.06)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${(t.pts/156)*100}%`,background:`linear-gradient(90deg,${RC(t.risk)}55,${RC(t.risk)})`,borderRadius:2,transition:'width .6s'}}/>
                    </div>
                  </div>
                  <div style={{width:28,textAlign:'right',flexShrink:0}}>
                    {t.risk>=4&&<span style={{fontSize:7,background:'rgba(220,38,38,.2)',color:'#ef4444',padding:'1px 4px',borderRadius:3,fontWeight:900}}>极高</span>}
                    {t.risk===3&&<span style={{fontSize:7,background:'rgba(239,68,68,.15)',color:'#f87171',padding:'1px 4px',borderRadius:3,fontWeight:900}}>高危</span>}
                    {t.risk===2&&<span style={{fontSize:7,background:'rgba(249,115,22,.12)',color:'#fb923c',padding:'1px 4px',borderRadius:3,fontWeight:900}}>中危</span>}
                    {t.risk===1&&<span style={{fontSize:7,background:'rgba(34,197,94,.1)',color:'#4ade80',padding:'1px 4px',borderRadius:3,fontWeight:900}}>低危</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 六维雷达图 */}
          <div style={{...card,flex:.9,padding:'12px 14px'}}>
            <Title t="辖区健康管理六维评估" />
            <div style={{flex:1,minHeight:0}}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="rgba(0,242,255,.1)" />
                  <PolarAngleAxis dataKey="s" tick={{fill:'#475569',fontSize:8,fontWeight:700}}/>
                  <Radar dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={.12} strokeWidth={1.5}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── 中央地图 ── */}
        <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
          {/* 四角装饰 */}
          {[{t:0,l:0,bl:'border-top','bbl':'border-left'},{t:0,r:0},{b:0,l:0},{b:0,r:0}].map((_,i)=>(
            <div key={i} style={{position:'absolute',...(i===0?{top:8,left:8}:i===1?{top:8,right:8}:i===2?{bottom:8,left:8}:{bottom:8,right:8}),width:20,height:20,borderTop:i<2?'2px solid rgba(0,242,255,.4)':'none',borderBottom:i>=2?'2px solid rgba(0,242,255,.4)':'none',borderLeft:i%2===0?'2px solid rgba(0,242,255,.4)':'none',borderRight:i%2===1?'2px solid rgba(0,242,255,.4)':'none'}}/>
          ))}

          <svg viewBox="0 0 800 650" style={{width:'100%',height:'100%',maxHeight:'calc(100vh - 120px)'}}>
            <defs>
              {/* 热力渐变 */}
              <radialGradient id="rg4"><stop offset="0%" stopColor="#dc2626" stopOpacity=".75"/><stop offset="70%" stopColor="#ef4444" stopOpacity=".2"/><stop offset="100%" stopColor="#dc2626" stopOpacity="0"/></radialGradient>
              <radialGradient id="rg3"><stop offset="0%" stopColor="#ef4444" stopOpacity=".6"/><stop offset="70%" stopColor="#f97316" stopOpacity=".15"/><stop offset="100%" stopColor="#ef4444" stopOpacity="0"/></radialGradient>
              <radialGradient id="rg2"><stop offset="0%" stopColor="#f97316" stopOpacity=".45"/><stop offset="70%" stopColor="#fbbf24" stopOpacity=".1"/><stop offset="100%" stopColor="#f97316" stopOpacity="0"/></radialGradient>
              <radialGradient id="rg1"><stop offset="0%" stopColor="#22c55e" stopOpacity=".35"/><stop offset="100%" stopColor="#22c55e" stopOpacity="0"/></radialGradient>
              {/* 立体地图渐变 */}
              <linearGradient id="mapGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(0,242,255,.04)"/>
                <stop offset="100%" stopColor="rgba(0,60,120,.12)"/>
              </linearGradient>
              {/* 医联体辐射渐变 */}
              {HOSPITALS.map(h=>(
                <radialGradient key={h.id} id={`hg${h.id}`}>
                  <stop offset="0%" stopColor={SC(h.st)} stopOpacity=".18"/>
                  <stop offset="60%" stopColor={SC(h.st)} stopOpacity=".04"/>
                  <stop offset="100%" stopColor={SC(h.st)} stopOpacity="0"/>
                </radialGradient>
              ))}
              <filter id="blur18"><feGaussianBlur stdDeviation="18"/></filter>
              <filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
              <filter id="glow4"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,.5)"/></filter>
            </defs>

            {/* 底层阴影（3D效果） */}
            <path d={OUTLINE} transform="translate(6,8)" fill="rgba(0,0,0,.4)" filter="url(#blur8)"/>

            {/* 地图主体 */}
            <path d={OUTLINE} fill="url(#mapGrad)" stroke="none"/>
            <path d={OUTLINE} fill="rgba(0,20,50,.88)"/>

            {/* 内部网格 */}
            <clipPath id="mapClip"><path d={OUTLINE}/></clipPath>
            <g clipPath="url(#mapClip)">
              <g stroke="rgba(0,242,255,.045)" strokeWidth=".6">
                {Array.from({length:14},(_,i)=><line key={`h${i}`} x1="100" y1={i*48+20} x2="780" y2={i*48+20}/>)}
                {Array.from({length:16},(_,i)=><line key={`v${i}`} x1={i*48+100} y1="0" x2={i*48+100} y2="650"/>)}
              </g>
            </g>

            {/* 边框高光（立体感） */}
            <path d={OUTLINE} fill="none" stroke="rgba(0,242,255,.35)" strokeWidth="1.5" filter="url(#glow4)"/>
            <path d={OUTLINE} fill="none" stroke="rgba(0,242,255,.08)" strokeWidth="8"/>

            {/* ── 热力层（模糊渲染） ── */}
            <g filter="url(#blur18)" clipPath="url(#mapClip)">
              {TOWNS.map(t=>(
                <circle key={t.id} cx={t.x} cy={t.y}
                  r={50+(t.pts/156)*72+(t.risk*8)}
                  fill={`url(#rg${t.risk})`}/>
              ))}
            </g>

            {/* ── 医联体辐射圈 ── */}
            {HOSPITALS.map(h=>(
              <g key={h.id}>
                {/* 辐射面积 */}
                <circle cx={h.x} cy={h.y} r={h.r} fill={`url(#hg${h.id})`}/>
                {/* 外圈虚线旋转 */}
                <circle cx={h.x} cy={h.y} r={h.r} fill="none" stroke={SC(h.st)} strokeWidth=".8" strokeDasharray={`${h.r*.4} ${h.r*6}`} opacity=".35"
                  style={{transformOrigin:`${h.x}px ${h.y}px`,animation:`spin ${9+h.r*.04}s linear infinite`}}/>
                {/* 内圈静态 */}
                <circle cx={h.x} cy={h.y} r={h.r*.65} fill="none" stroke={SC(h.st)} strokeWidth=".5" strokeDasharray="2 6" opacity=".2"/>
              </g>
            ))}

            {/* 医联体连线 */}
            {LINKS.map(([a,b],i)=>{
              const ha=HOSPITALS.find(h=>h.id===a)!;
              const hb=HOSPITALS.find(h=>h.id===b)!;
              const mx=(ha.x+hb.x)/2, my=(ha.y+hb.y)/2;
              return (
                <g key={i}>
                  <line x1={ha.x} y1={ha.y} x2={hb.x} y2={hb.y} stroke="rgba(0,242,255,.1)" strokeWidth=".8" strokeDasharray="3 6"/>
                  {/* 流动粒子效果 */}
                  <circle r="2" fill="rgba(0,242,255,.6)" opacity=".7">
                    <animateMotion dur={`${3+i*.4}s`} repeatCount="indefinite" path={`M${ha.x},${ha.y} L${hb.x},${hb.y}`}/>
                  </circle>
                </g>
              );
            })}

            {/* ── 街镇标签 ── */}
            {TOWNS.map(t=>(
              <g key={t.id} transform={`translate(${t.x},${t.y})`} style={{cursor:'pointer'}} onClick={()=>setSel(sel?.id===t.id?null:t)}>
                {/* 脉冲圆 */}
                <circle r={5+(t.pts/156)*4} fill={RC(t.risk)} opacity=".15">
                  <animate attributeName="r" values={`${5+(t.pts/156)*4};${10+(t.pts/156)*6};${5+(t.pts/156)*4}`} dur="3s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values=".15;0;.15" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle r="4.5" fill={RC(t.risk)} opacity=".85" filter="url(#glow4)"/>
                {/* 标签背景 */}
                <rect x="-22" y="-26" width={t.name.length*7.5+6} height="15" rx="4" fill="rgba(1,8,18,.92)" stroke={`${RC(t.risk)}50`} strokeWidth=".8"/>
                <text x={t.name.length*3.75-19} y="-15" textAnchor="middle" fill={RC(t.risk)} fontSize="8.5" fontWeight="900">{t.name}</text>
                {/* 患者数小标 */}
                <rect x="-10" y="8" width="22" height="11" rx="3" fill={`${RC(t.risk)}22`} stroke={`${RC(t.risk)}44`} strokeWidth=".6"/>
                <text x="1" y="17" textAnchor="middle" fill={RC(t.risk)} fontSize="7.5" fontWeight="900">{t.pts}</text>
              </g>
            ))}

            {/* ── 医院标记 ── */}
            {HOSPITALS.map(h=>(
              <g key={h.id} transform={`translate(${h.x},${h.y})`} style={{cursor:'pointer'}}
                onMouseEnter={()=>setHov(h)} onMouseLeave={()=>setHov(null)}>
                {/* 十字图标 */}
                <rect x="-8" y="-8" width="16" height="16" rx="4" fill="rgba(1,8,18,.9)" stroke={SC(h.st)} strokeWidth="1.2" opacity=".9"/>
                <text textAnchor="middle" y="5" fill={SC(h.st)} fontSize="9" fontWeight="900">✚</text>
                {/* 状态指示 */}
                <circle cx="6" cy="-6" r="2.5" fill={SC(h.st)} opacity=".9">
                  {h.st!=='normal'&&<animate attributeName="opacity" values=".9;.3;.9" dur="1.5s" repeatCount="indefinite"/>}
                </circle>
                {/* 名称标签 */}
                <g transform="translate(12,-6)">
                  <rect x="-2" y="-9" width={h.abbr.length*8+6} height="12" rx="3.5" fill="rgba(1,8,18,.92)" stroke={`${SC(h.st)}40`} strokeWidth=".7"/>
                  <text y="0" fill="rgba(255,255,255,.88)" fontSize="8" fontWeight="900">{h.abbr}</text>
                </g>
                {/* Hover 详情卡 */}
                {hov?.id===h.id&&(
                  <g transform="translate(-65,-105)">
                    <rect x="0" y="0" width="130" height="80" rx="8" fill="rgba(1,8,18,.97)" stroke={SC(h.st)} strokeWidth="1.2"/>
                    <rect x="0" y="0" width="130" height="3" rx="1" fill={SC(h.st)} opacity=".6"/>
                    <text x="10" y="18" fill={SC(h.st)} fontSize="8" fontWeight="900" textDecoration="none">{h.grp}医联体</text>
                    <text x="10" y="34" fill="white" fontSize="10.5" fontWeight="900">{h.name}</text>
                    <text x="10" y="50" fill="#94a3b8" fontSize="8">床位 {h.beds} · 占用 {h.occ}%</text>
                    <rect x="10" y="58" width={h.occ} height="5" rx="2" fill={SC(h.st)} opacity=".5"/>
                    <rect x="10" y="58" width="110" height="5" rx="2" fill="rgba(255,255,255,.06)"/>
                    <rect x="10" y="58" width={h.occ*1.1} height="5" rx="2" fill={SC(h.st)} opacity=".5"/>
                    <text x="10" y="76" fill={SC(h.st)} fontSize="8" fontWeight="700">● {h.st==='busy'?'高负荷运转':h.st==='warn'?'预警中':'运营正常'}</text>
                  </g>
                )}
              </g>
            ))}

            {/* 选中街镇详情弹窗 */}
            {sel&&(
              <g>
                <rect x="290" y="268" width="200" height="110" rx="10" fill="rgba(1,8,18,.97)" stroke={RC(sel.risk)} strokeWidth="1.5" filter="url(#shadow)"/>
                <rect x="290" y="268" width="200" height="4" rx="2" fill={RC(sel.risk)} opacity=".7"/>
                <text x="390" y="292" textAnchor="middle" fill={RC(sel.risk)} fontSize="12" fontWeight="900">{sel.name}</text>
                <text x="390" y="312" textAnchor="middle" fill="white" fontSize="16" fontWeight="900">{sel.pts} 名在管患者</text>
                <text x="390" y="330" textAnchor="middle" fill="#94a3b8" fontSize="9">责任医院: {sel.gp}</text>
                <text x="390" y="347" textAnchor="middle" fill="#64748b" fontSize="8.5">风险等级: {sel.risk>=4?'极高危':sel.risk>=3?'高危':sel.risk>=2?'中危':'低危'} · 达标率: {60+sel.risk*5}%</text>
                <text x="390" y="364" textAnchor="middle" fill="#3b82f6" fontSize="8" style={{cursor:'pointer'}} onClick={()=>setSel(null)}>✕ 关闭</text>
              </g>
            )}

            {/* 图例 */}
            <g transform="translate(22,620)">
              {[{c:'#dc2626',l:'极高危'},{c:'#ef4444',l:'高危'},{c:'#f97316',l:'中危'},{c:'#22c55e',l:'低危'},{c:'#22d3ee',l:'医联体'}].map((it,i)=>(
                <g key={i} transform={`translate(${i*74},0)`}>
                  <circle cx="5" cy="4" r="3.5" fill={it.c} opacity=".8"/>
                  <text x="13" y="8" fill="#64748b" fontSize="8" fontWeight="700">{it.l}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* ── 右栏 ── */}
        <div style={{display:'flex',flexDirection:'column',gap:8}}>

          {/* 医联体负荷 */}
          <div style={{...card,flex:1.4,padding:'12px 14px'}}>
            <Title t="医联体实时负荷监控" />
            <div style={{flex:1,overflowY:'auto',marginTop:8}}>
              {HOSPITALS.map(h=>(
                <div key={h.id} style={{marginBottom:6,padding:'6px 8px',borderRadius:7,background:'rgba(255,255,255,.025)',border:`1px solid ${SC(h.st)}20`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                    <span style={{fontSize:9.5,fontWeight:900,color:'#e2e8f0',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:130}}>{h.name}</span>
                    <span style={{fontSize:7.5,fontWeight:900,color:SC(h.st),padding:'1px 5px',background:`${SC(h.st)}15`,borderRadius:4,flexShrink:0,whiteSpace:'nowrap'}}>
                      {h.st==='busy'?'⚠ 高负荷':h.st==='warn'?'△ 预警中':'● 正常'}
                    </span>
                  </div>
                  <div style={{height:3,background:'rgba(255,255,255,.06)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${h.occ}%`,background:`linear-gradient(90deg,${SC(h.st)}55,${SC(h.st)})`,borderRadius:2,transition:'width .6s'}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:2}}>
                    <span style={{fontSize:7,color:'#475569'}}>床位 {h.beds} · 占用率</span>
                    <span style={{fontSize:7.5,fontWeight:900,color:SC(h.st)}}>{h.occ}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 趋势折线 */}
          <div style={{...card,flex:.7,padding:'12px 14px'}}>
            <Title t="在管人群月度增长趋势" />
            <div style={{flex:1,minHeight:0}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND} margin={{left:-22,right:6,top:5,bottom:2}}>
                  <defs>
                    <linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity=".3"/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity=".2"/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="m" tick={{fill:'#475569',fontSize:7.5}} axisLine={false} tickLine={false}/>
                  <Area type="monotone" dataKey="p" stroke="#22d3ee" strokeWidth={1.8} fill="url(#tg1)" dot={false}/>
                  <Area type="monotone" dataKey="c" stroke="#22c55e" strokeWidth={1.4} fill="url(#tg2)" dot={false} strokeDasharray="4 2"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:2}}>
              <div style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:16,height:2,background:'#22d3ee',borderRadius:1}}/><span style={{fontSize:7,color:'#475569',fontWeight:700}}>在管人数</span></div>
              <div style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:16,height:2,background:'#22c55e',borderRadius:1,backgroundImage:'repeating-linear-gradient(90deg,#22c55e,#22c55e 4px,transparent 4px,transparent 6px)'}}/><span style={{fontSize:7,color:'#475569',fontWeight:700}}>达标率%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER 播报 ── */}
      <footer style={{height:32,background:'linear-gradient(180deg,rgba(0,242,255,.04) 0%,rgba(1,8,18,.95) 100%)',borderTop:'1px solid rgba(0,242,255,.14)',display:'flex',alignItems:'center',overflow:'hidden',flexShrink:0,position:'relative',zIndex:10}}>
        <div style={{padding:'0 12px',borderRight:'1px solid rgba(0,242,255,.18)',fontSize:7.5,fontWeight:900,color:'#22d3ee',whiteSpace:'nowrap',textTransform:'uppercase',letterSpacing:'0.18em',flexShrink:0}}>实时播报</div>
        <div style={{overflow:'hidden',flex:1,maskImage:'linear-gradient(90deg,transparent,black 3%,black 97%,transparent)'}}>
          <div style={{display:'flex',gap:48,whiteSpace:'nowrap',animation:'marquee 36s linear infinite',paddingLeft:20}}>
            {[
              `[${time}] 三林镇热力等级持续红色，已触发网格化随访预警，建议全科医生加密随访频次`,
              `[${time}] 仁济东院今日转诊接收12例，床位占用率92%，启动分流预案`,
              `[${time}] 航头镇慢病管理达标率81%，位列浦东第一，经验向全区推广中`,
              `[${time}] 张江镇AI辅助筛查发现3例新增高危患者，已自动下发疾控指派任务`,
              `[${time}] 东方医联体绿色通道今日累计分流老年患者${REAL_CDC_POOL.length+1847}例，平均候诊10.4分钟`,
              `[${time}] 周浦医院完成跨院会诊5例，三端数据闭环响应时间平均8.2分钟`,
            ].map((t,i)=><span key={i} style={{fontSize:9.5,color:'#64748b'}}>{t}</span>)}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
      `}</style>
    </div>
  );
};

const card: React.CSSProperties = {
  background:'linear-gradient(145deg,rgba(0,20,45,.75),rgba(0,10,25,.85))',
  backdropFilter:'blur(20px)',
  border:'1px solid rgba(0,242,255,.1)',
  borderRadius:14,
  display:'flex',
  flexDirection:'column',
  overflow:'hidden',
  position:'relative',
  boxShadow:'0 4px 24px rgba(0,0,0,.4),inset 0 1px 0 rgba(0,242,255,.06)',
};

const Title:React.FC<{t:string}> = ({t}) => (
  <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
    <div style={{width:2.5,height:13,background:'linear-gradient(180deg,#22d3ee,#3b82f6)',borderRadius:2,boxShadow:'0 0 6px rgba(34,211,238,.5)'}}/>
    <span style={{fontSize:9.5,fontWeight:900,color:'#22d3ee',textTransform:'uppercase',letterSpacing:'0.16em'}}>{t}</span>
  </div>
);

export default BigScreen;
