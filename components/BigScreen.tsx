import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { REAL_CDC_POOL } from '../data/realPatients';
import { R1, R2, R3, R4 } from '../data/pudongMap';

// ── 街镇中心（与 pudongMap.ts 同一投影 SVG 800×700）──
const TOWNS = [
  {id:'gq', name:'高桥镇',   x:162, y:25,  pts:67,  risk:2, gp:'第七人民医院'},
  {id:'wgq',name:'外高桥',   x:206, y:49,  pts:38,  risk:1, gp:'第七人民医院'},
  {id:'gx', name:'高行镇',   x:191, y:73,  pts:44,  risk:1, gp:'第七人民医院'},
  {id:'cl', name:'曹路镇',   x:292, y:144, pts:67,  risk:2, gp:'第七人民医院'},
  {id:'jq', name:'金桥镇',   x:190, y:192, pts:78,  risk:2, gp:'东方医院'},
  {id:'tz', name:'唐镇',     x:292, y:204, pts:52,  risk:1, gp:'仁济东院'},
  {id:'cs', name:'川沙新镇', x:378, y:252, pts:98,  risk:2, gp:'浦东新区人民医院'},
  {id:'ljz',name:'陆家嘴',   x:105, y:204, pts:89,  risk:2, gp:'东方医院'},
  {id:'wf', name:'潍坊新村', x:119, y:216, pts:72,  risk:2, gp:'公利医院'},
  {id:'yj', name:'洋泾街道', x:137, y:216, pts:65,  risk:1, gp:'公利医院'},
  {id:'hm', name:'花木街道', x:187, y:228, pts:102, risk:3, gp:'仁济东院'},
  {id:'zj', name:'张江镇',   x:234, y:252, pts:124, risk:3, gp:'仁济东院'},
  {id:'tq', name:'塘桥街道', x:116, y:228, pts:58,  risk:1, gp:'东方医院'},
  {id:'sg', name:'上钢新村', x:96,  y:240, pts:81,  risk:2, gp:'六院东院'},
  {id:'nm', name:'南码头路', x:108, y:252, pts:94,  risk:3, gp:'六院东院'},
  {id:'hd', name:'沪东新村', x:148, y:204, pts:68,  risk:2, gp:'公利医院'},
  {id:'jy', name:'金杨新村', x:162, y:204, pts:75,  risk:2, gp:'东方医院'},
  {id:'dm', name:'东明路',   x:96,  y:264, pts:86,  risk:3, gp:'六院东院'},
  {id:'zjd',name:'周家渡',   x:86,  y:264, pts:78,  risk:2, gp:'六院东院'},
  {id:'sl', name:'三林镇',   x:80,  y:287, pts:156, risk:4, gp:'六院东院'},
  {id:'bc', name:'北蔡镇',   x:148, y:275, pts:98,  risk:3, gp:'周浦医院'},
  {id:'kq', name:'康桥镇',   x:148, y:335, pts:95,  risk:2, gp:'曙光医院东院'},
  {id:'zp', name:'周浦镇',   x:177, y:347, pts:108, risk:3, gp:'周浦医院'},
  {id:'ht', name:'航头镇',   x:259, y:407, pts:87,  risk:2, gp:'浦东医院'},
  {id:'xc', name:'新场镇',   x:321, y:419, pts:63,  risk:1, gp:'浦东医院'},
  {id:'dt', name:'大团镇',   x:393, y:454, pts:45,  risk:1, gp:'浦东新区人民医院'},
  {id:'hn', name:'惠南镇',   x:450, y:443, pts:142, risk:3, gp:'浦东医院'},
  {id:'xqz',name:'宣桥镇',   x:450, y:407, pts:71,  risk:2, gp:'浦东新区人民医院'},
  {id:'zqz',name:'祝桥镇',   x:522, y:311, pts:55,  risk:1, gp:'浦东新区人民医院'},
];

const HOSPITALS = [
  {id:'df',  name:'东方医院',         abbr:'东方', x:98,  y:216, st:'busy',   occ:88, beds:1200, grp:'东方医联体', r:70},
  {id:'q7',  name:'第七人民医院',     abbr:'七院', x:164, y:49,  st:'normal', occ:72, beds:800,  grp:'七院医联体', r:62},
  {id:'gl',  name:'公利医院',         abbr:'公利', x:122, y:208, st:'warn',   occ:81, beds:600,  grp:'公利医联体', r:54},
  {id:'rj',  name:'仁济东院',         abbr:'仁济', x:160, y:228, st:'busy',   occ:92, beds:1500, grp:'仁济医联体', r:80},
  {id:'d6',  name:'六院东院',         abbr:'六院', x:84,  y:264, st:'warn',   occ:84, beds:700,  grp:'六院医联体', r:62},
  {id:'lh',  name:'龙华医院东院',     abbr:'龙华', x:110, y:300, st:'normal', occ:67, beds:500,  grp:'龙华医联体', r:50},
  {id:'sgg', name:'曙光医院东院',     abbr:'曙光', x:150, y:338, st:'normal', occ:73, beds:600,  grp:'曙光医联体', r:54},
  {id:'pdry',name:'浦东新区人民医院', abbr:'浦新', x:390, y:270, st:'normal', occ:76, beds:900,  grp:'浦新医联体', r:66},
  {id:'pd',  name:'浦东医院',         abbr:'浦东', x:295, y:418, st:'normal', occ:65, beds:500,  grp:'浦东医联体', r:58},
  {id:'zph', name:'周浦医院',         abbr:'周浦', x:175, y:350, st:'normal', occ:70, beds:400,  grp:'周浦医联体', r:50},
  {id:'dfn', name:'东方南院',         abbr:'东南', x:248, y:450, st:'normal', occ:58, beds:300,  grp:'东方医联体', r:44},
];

const LINKS=[['df','gl'],['df','rj'],['df','d6'],['q7','gl'],['rj','d6'],['lh','sgg'],['pd','zph'],['pd','pdry'],['dfn','pd']];
const SC=(s:string)=>s==='busy'?'#ef4444':s==='warn'?'#f97316':'#22c55e';
const RC=(r:number)=>r>=4?'#dc2626':r>=3?'#ef4444':r>=2?'#f97316':'#22c55e';
const TREND=Array.from({length:12},(_,i)=>({m:`${i+1}月`,p:820+i*40,c:64+i*1.5}));
const RADAR=[{s:'血压达标',A:72},{s:'血糖达标',A:68},{s:'随访完成',A:85},{s:'用药规律',A:61},{s:'生活方式',A:55},{s:'转诊及时',A:78}];

const VIEW_LABELS:Record<string,string> = {heat:'慢病热力',boundary:'社区边界',hospital:'医联体辐射',risk:'风险分级'};

const BigScreen:React.FC<{onClose:()=>void}>=({onClose})=>{
  const [time,setTime]=useState(new Date().toLocaleTimeString());
  const [hov,setHov]=useState<any>(null);
  const [sel,setSel]=useState<any>(null);
  const [mapView,setMapView]=useState('heat');
  const canvasRef=useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    const t=setInterval(()=>setTime(new Date().toLocaleTimeString()),1000);
    return()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    const cv=canvasRef.current; if(!cv) return;
    const ctx=cv.getContext('2d')!;
    cv.width=cv.offsetWidth; cv.height=cv.offsetHeight;
    const pts=Array.from({length:70},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,r:Math.random()*.9+.3}));
    let af:number;
    const draw=()=>{
      ctx.clearRect(0,0,cv.width,cv.height);
      pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>cv.width)p.vx*=-1;if(p.y<0||p.y>cv.height)p.vy*=-1;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(0,242,255,.18)';ctx.fill();});
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<80){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(0,242,255,${.06*(1-d/80)})`;ctx.lineWidth=.4;ctx.stroke();}}));
      af=requestAnimationFrame(draw);};
    draw(); return()=>cancelAnimationFrame(af);
  },[]);

  return(
    <div style={{position:'fixed',inset:0,background:'#010912',zIndex:100,display:'flex',flexDirection:'column',fontFamily:'-apple-system,sans-serif',overflow:'hidden'}}>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.4,pointerEvents:'none'}}/>
      <div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,242,255,.01) 3px,rgba(0,242,255,.01) 4px)',pointerEvents:'none',zIndex:1}}/>
      <div style={{position:'absolute',top:0,left:'20%',width:'60%',height:2,background:'linear-gradient(90deg,transparent,rgba(0,242,255,.5),transparent)',zIndex:2}}/>

      {/* ── HEADER ── */}
      <header style={{height:52,background:'linear-gradient(180deg,rgba(0,242,255,.07),rgba(1,9,20,.96))',backdropFilter:'blur(24px)',borderBottom:'1px solid rgba(0,242,255,.2)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',flexShrink:0,position:'relative',zIndex:10,gap:8}}>
        {/* 左：Logo + 标题 */}
        <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
          <div style={{width:30,height:30,border:'1.5px solid #22d3ee',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',color:'#22d3ee',fontWeight:900,fontSize:14,boxShadow:'0 0 14px rgba(34,211,238,.5)'}}>✚</div>
          <div className="bs-title">
            <div style={{color:'#fff',fontWeight:900,fontSize:13,letterSpacing:'0.08em'}}>浦东新区医防融合指挥大屏</div>
            <div style={{color:'#22d3ee',fontSize:6,fontWeight:700,letterSpacing:'0.32em',opacity:.42,textTransform:'uppercase'}}>PUDONG MEDICAL-PREVENTION HUD v6.0</div>
          </div>
        </div>

        {/* 中：视图切换下拉（绝对居中） */}
        <div style={{position:'absolute',left:'50%',transform:'translateX(-50%)',zIndex:11}}>
          <select value={mapView} onChange={e=>setMapView(e.target.value)}
            style={{background:'rgba(0,15,35,.95)',border:'1.5px solid rgba(0,242,255,.5)',borderRadius:8,color:'#22d3ee',fontSize:10,fontWeight:900,padding:'6px 28px 6px 12px',cursor:'pointer',outline:'none',letterSpacing:'0.1em',backdropFilter:'blur(16px)',boxShadow:'0 0 16px rgba(0,242,255,.2)',appearance:'none',WebkitAppearance:'none',backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2322d3ee' opacity='.8'/%3E%3C/svg%3E")`,backgroundRepeat:'no-repeat',backgroundPosition:'right 9px center',minWidth:140}}>
            <option value="heat">🔥 慢病热力视图</option>
            <option value="boundary">🗺️ 社区边界视图</option>
            <option value="hospital">🏥 医联体辐射视图</option>
            <option value="risk">⚠️ 风险分级视图</option>
          </select>
        </div>

        {/* 右：KPI + 时间 + 关闭 */}
        <div style={{display:'flex',alignItems:'center',gap:5,flexShrink:0}}>
          {[
            {l:'在管总人数',v:String(REAL_CDC_POOL.length+1847),u:'人',c:'#22d3ee'},
            {l:'高危预警',v:'47',u:'例',c:'#ef4444'},
            {l:'今日转诊',v:'12',u:'单',c:'#f97316'},
            {l:'急诊候诊',v:'10.4',u:'min',c:'#22c55e'},
          ].map((it,i)=>(
            <div key={i} className={`bs-kpi bs-kpi-${i}`} style={{textAlign:'center',padding:'3px 8px',background:`${it.c}0d`,border:`1px solid ${it.c}1e`,borderRadius:6}}>
              <div style={{fontSize:5.5,color:'#64748b',fontWeight:900,textTransform:'uppercase',marginBottom:1,whiteSpace:'nowrap'}}>{it.l}</div>
              <div style={{fontSize:14,fontWeight:900,color:it.c,lineHeight:1}}>{it.v}<span style={{fontSize:6.5,marginLeft:2,opacity:.5}}>{it.u}</span></div>
            </div>
          ))}
          <div style={{color:'#22d3ee',fontWeight:900,fontSize:12,padding:'0 8px',borderLeft:'1px solid rgba(255,255,255,.06)',fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>{time}</div>
          <button onClick={onClose} style={{width:22,height:22,borderRadius:5,border:'1px solid rgba(255,255,255,.1)',background:'rgba(239,68,68,.08)',color:'rgba(255,255,255,.4)',cursor:'pointer',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}
            onMouseOver={e=>{e.currentTarget.style.background='rgba(239,68,68,.3)';e.currentTarget.style.color='#fff';}}
            onMouseOut={e=>{e.currentTarget.style.background='rgba(239,68,68,.08)';e.currentTarget.style.color='rgba(255,255,255,.4)';}}>✕</button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="bs-body" style={{flex:1,display:'grid',gridTemplateColumns:'240px 1fr 240px',gap:6,padding:6,overflow:'hidden',position:'relative',zIndex:2}}>

        {/* 左栏 */}
        <div className="bs-left" style={{display:'flex',flexDirection:'column',gap:6}}>
          <div style={{...C,flex:1.4,padding:'10px 12px'}}>
            <Ttl t="街镇慢病热力排行"/>
            <div style={{flex:1,overflowY:'auto',marginTop:6}}>
              {TOWNS.sort((a,b)=>b.pts-a.pts).map((t,i)=>(
                <div key={t.id} onClick={()=>setSel(sel?.id===t.id?null:t)}
                  style={{display:'flex',alignItems:'center',gap:5,marginBottom:4,padding:'4px 6px',borderRadius:5,background:sel?.id===t.id?`${RC(t.risk)}12`:'rgba(255,255,255,.02)',border:`1px solid ${RC(t.risk)}${sel?.id===t.id?'40':'12'}`,cursor:'pointer',transition:'all .15s'}}>
                  <div style={{width:13,height:13,borderRadius:3,background:`${RC(t.risk)}18`,border:`1px solid ${RC(t.risk)}50`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:6.5,fontWeight:900,color:RC(t.risk),flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                      <span style={{fontSize:8.5,fontWeight:900,color:'#dde4ef',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name}</span>
                      <span style={{fontSize:7.5,fontWeight:900,color:RC(t.risk),flexShrink:0,marginLeft:3}}>{t.pts}</span>
                    </div>
                    <div style={{height:2,background:'rgba(255,255,255,.05)',borderRadius:1}}>
                      <div style={{height:'100%',width:`${(t.pts/156)*100}%`,background:`linear-gradient(90deg,${RC(t.risk)}40,${RC(t.risk)})`,borderRadius:1}}/>
                    </div>
                  </div>
                  <span style={{fontSize:6,fontWeight:900,padding:'1px 3px',borderRadius:2,background:`${RC(t.risk)}16`,color:RC(t.risk),flexShrink:0,whiteSpace:'nowrap'}}>
                    {t.risk>=4?'极高':t.risk>=3?'高危':t.risk>=2?'中危':'低危'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{...C,flex:.75,padding:'10px 12px'}}>
            <Ttl t="健康管理六维评估"/>
            <div style={{flex:1,minHeight:0}}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={RADAR}>
                  <PolarGrid stroke="rgba(0,242,255,.1)"/>
                  <PolarAngleAxis dataKey="s" tick={{fill:'#475569',fontSize:7,fontWeight:700}}/>
                  <Radar dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={.1} strokeWidth={1.5}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 中央地图 */}
        <div className="bs-map" style={{position:'relative',overflow:'hidden',borderRadius:10,border:'1px solid rgba(0,242,255,.12)',background:'#010d20',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {/* 四角装饰 */}
          {[{top:8,left:8,borderTop:'2px solid rgba(0,242,255,.4)',borderLeft:'2px solid rgba(0,242,255,.4)'},{top:8,right:8,borderTop:'2px solid rgba(0,242,255,.4)',borderRight:'2px solid rgba(0,242,255,.4)'},{bottom:8,left:8,borderBottom:'2px solid rgba(0,242,255,.4)',borderLeft:'2px solid rgba(0,242,255,.4)'},{bottom:8,right:8,borderBottom:'2px solid rgba(0,242,255,.4)',borderRight:'2px solid rgba(0,242,255,.4)'}].map((s,i)=>(
            <div key={i} style={{position:'absolute',...s,width:16,height:16,zIndex:5}}/>
          ))}
          {/* 当前视图标签 */}
          <div style={{position:'absolute',top:10,left:'50%',transform:'translateX(-50%)',zIndex:6,pointerEvents:'none',whiteSpace:'nowrap'}}>
            <div style={{fontSize:9,fontWeight:900,color:'rgba(34,211,238,.55)',letterSpacing:'0.24em',textTransform:'uppercase',textShadow:'0 0 8px rgba(34,211,238,.3)'}}>
              浦东新区 · {VIEW_LABELS[mapView]} · 1519个地块
            </div>
          </div>

          {/* SVG 地图主体 - viewBox 与 pudongMap.ts 投影完全匹配 */}
          <svg
            viewBox="0 0 800 700"
            style={{width:'100%',height:'100%',display:'block'}}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="h4"><stop offset="0%" stopColor="#dc2626" stopOpacity=".8"/><stop offset="50%" stopColor="#ef4444" stopOpacity=".25"/><stop offset="100%" stopColor="#dc2626" stopOpacity="0"/></radialGradient>
              <radialGradient id="h3"><stop offset="0%" stopColor="#ef4444" stopOpacity=".65"/><stop offset="50%" stopColor="#f97316" stopOpacity=".18"/><stop offset="100%" stopColor="#ef4444" stopOpacity="0"/></radialGradient>
              <radialGradient id="h2"><stop offset="0%" stopColor="#f97316" stopOpacity=".5"/><stop offset="50%" stopColor="#fbbf24" stopOpacity=".12"/><stop offset="100%" stopColor="#f97316" stopOpacity="0"/></radialGradient>
              <radialGradient id="h1"><stop offset="0%" stopColor="#22c55e" stopOpacity=".38"/><stop offset="100%" stopColor="#22c55e" stopOpacity="0"/></radialGradient>
              {HOSPITALS.map(h=>(
                <radialGradient key={h.id} id={`hg${h.id}`}>
                  <stop offset="0%" stopColor={SC(h.st)} stopOpacity=".2"/>
                  <stop offset="60%" stopColor={SC(h.st)} stopOpacity=".05"/>
                  <stop offset="100%" stopColor={SC(h.st)} stopOpacity="0"/>
                </radialGradient>
              ))}
              <filter id="blur22"><feGaussianBlur stdDeviation="22"/></filter>
              <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
              <filter id="glow3"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="shadow8"><feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,.7)"/></filter>
            </defs>

            {/* 真实社区边界 - 按风险着色 */}
            <g fill={mapView==='risk'?"rgba(34,197,94,.15)":"rgba(34,197,94,.055)"} stroke={mapView==='boundary'?"rgba(34,197,94,.45)":"rgba(34,197,94,.2)"} strokeWidth={mapView==='boundary'?".8":".45"}>
              {R1.map((d,i)=><path key={i} d={d}/>)}
            </g>
            <g fill={mapView==='risk'?"rgba(249,115,22,.15)":"rgba(249,115,22,.065)"} stroke={mapView==='boundary'?"rgba(249,115,22,.45)":"rgba(249,115,22,.22)"} strokeWidth={mapView==='boundary'?".8":".5"}>
              {R2.map((d,i)=><path key={i} d={d}/>)}
            </g>
            <g fill={mapView==='risk'?"rgba(239,68,68,.2)":"rgba(239,68,68,.085)"} stroke={mapView==='boundary'?"rgba(239,68,68,.5)":"rgba(239,68,68,.26)"} strokeWidth={mapView==='boundary'?"1":".55"}>
              {R3.map((d,i)=><path key={i} d={d}/>)}
            </g>
            <g fill={mapView==='risk'?"rgba(220,38,38,.28)":"rgba(220,38,38,.13)"} stroke={mapView==='boundary'?"rgba(220,38,38,.6)":"rgba(220,38,38,.36)"} strokeWidth={mapView==='boundary'?"1.2":".65"}>
              {R4.map((d,i)=><path key={i} d={d}/>)}
            </g>

            {/* 热力叠加 */}
            {mapView!=='boundary'&&mapView!=='hospital'&&(
              <g filter="url(#blur22)" opacity=".7">
                {TOWNS.map(t=>(
                  <circle key={t.id} cx={t.x} cy={t.y} r={30+(t.pts/156)*55+(t.risk*5)} fill={`url(#h${t.risk})`}/>
                ))}
              </g>
            )}

            {/* 医联体辐射圈 */}
            {HOSPITALS.map(h=>(
              <g key={h.id} opacity={mapView==='hospital'?1:.55}>
                <circle cx={h.x} cy={h.y} r={mapView==='hospital'?h.r*1.35:h.r} fill={`url(#hg${h.id})`}/>
                <circle cx={h.x} cy={h.y} r={mapView==='hospital'?h.r*1.35:h.r} fill="none" stroke={SC(h.st)} strokeWidth={mapView==='hospital'?.9:".55"} strokeDasharray={`${h.r*.3} ${h.r*5}`} opacity={mapView==='hospital'?.5:".25"}
                  style={{transformOrigin:`${h.x}px ${h.y}px`,animation:`spin ${8+h.r*.04}s linear infinite`}}/>
              </g>
            ))}

            {/* 医联体连线 + 流动粒子 */}
            {mapView!=='boundary'&&LINKS.map(([a,b],i)=>{
              const ha=HOSPITALS.find(h=>h.id===a)!;
              const hb=HOSPITALS.find(h=>h.id===b)!;
              return(
                <g key={i}>
                  <line x1={ha.x} y1={ha.y} x2={hb.x} y2={hb.y} stroke="rgba(0,242,255,.1)" strokeWidth=".6" strokeDasharray="3 7"/>
                  <circle r="1.5" fill="#22d3ee" opacity=".6">
                    <animateMotion dur={`${2.8+i*.3}s`} repeatCount="indefinite" path={`M${ha.x},${ha.y} L${hb.x},${hb.y}`}/>
                  </circle>
                </g>
              );
            })}

            {/* 街镇标注 - 全部显示 */}
            {TOWNS.map(t=>(
              <g key={t.id} transform={`translate(${t.x},${t.y})`} style={{cursor:'pointer'}} onClick={()=>setSel(sel?.id===t.id?null:t)}>
                <circle r={3+(t.pts/156)*3} fill={RC(t.risk)} opacity=".1">
                  <animate attributeName="r" values={`${3+(t.pts/156)*3};${7+(t.pts/156)*5};${3+(t.pts/156)*3}`} dur={`${2.2+t.risk*.3}s`} repeatCount="indefinite"/>
                  <animate attributeName="opacity" values=".1;0;.1" dur={`${2.2+t.risk*.3}s`} repeatCount="indefinite"/>
                </circle>
                <circle r="3.2" fill={RC(t.risk)} opacity=".85" filter="url(#glow3)"/>
                <circle r="1.3" fill="rgba(255,255,255,.5)"/>
                {/* 所有街镇显示名字 */}
                <rect x={-t.name.length*3.4-2} y="-19" width={t.name.length*6.8+5} height="11" rx="2.5" fill="rgba(1,8,20,.88)" stroke={`${RC(t.risk)}38`} strokeWidth=".5"/>
                <text x="0" textAnchor="middle" y="-10.5" fill={RC(t.risk)} fontSize={t.pts>100?8:7} fontWeight="900">{t.name}</text>
                {/* 高危显示患者数 */}
                {(t.pts>90||t.risk>=3)&&(
                  <g transform="translate(0,8)">
                    <rect x="-9" y="-5" width="18" height="9" rx="2.5" fill={`${RC(t.risk)}20`} stroke={`${RC(t.risk)}40`} strokeWidth=".4"/>
                    <text x="0" textAnchor="middle" y="2" fill={RC(t.risk)} fontSize="6.5" fontWeight="900">{t.pts}</text>
                  </g>
                )}
              </g>
            ))}

            {/* 医院标记 */}
            {HOSPITALS.map(h=>(
              <g key={h.id} transform={`translate(${h.x},${h.y})`} style={{cursor:'pointer'}}
                onMouseEnter={()=>setHov(h)} onMouseLeave={()=>setHov(null)}>
                <rect x="-6.5" y="-6.5" width="13" height="13" rx="3" fill="rgba(1,8,20,.92)" stroke={SC(h.st)} strokeWidth="1" opacity=".95"/>
                <text textAnchor="middle" y="4" fill={SC(h.st)} fontSize="7.5" fontWeight="900">✚</text>
                <circle cx="5" cy="-5" r="1.8" fill={SC(h.st)}>
                  {h.st!=='normal'&&<animate attributeName="opacity" values="1;.3;1" dur="1.4s" repeatCount="indefinite"/>}
                </circle>
                <g transform="translate(9,-4)">
                  <rect x="-2" y="-7" width={h.abbr.length*7+5} height="10" rx="2.5" fill="rgba(1,8,20,.93)" stroke={`${SC(h.st)}32`} strokeWidth=".5"/>
                  <text y="0" fill="rgba(255,255,255,.82)" fontSize="6.5" fontWeight="900">{h.abbr}</text>
                </g>
                {hov?.id===h.id&&(
                  <g transform="translate(-60,-92)">
                    <rect x="0" y="0" width="120" height="74" rx="6" fill="rgba(1,8,20,.97)" stroke={SC(h.st)} strokeWidth="1" filter="url(#shadow8)"/>
                    <rect x="0" y="0" width="120" height="3" rx="1.5" fill={SC(h.st)} opacity=".6"/>
                    <text x="8" y="16" fill={SC(h.st)} fontSize="7" fontWeight="900">{h.grp}</text>
                    <text x="8" y="30" fill="white" fontSize="10" fontWeight="900">{h.name}</text>
                    <text x="8" y="44" fill="#94a3b8" fontSize="6.5">床位 {h.beds} · 占用 {h.occ}%</text>
                    <rect x="8" y="50" width="104" height="3.5" rx="2" fill="rgba(255,255,255,.06)"/>
                    <rect x="8" y="50" width={h.occ*1.04} height="3.5" rx="2" fill={SC(h.st)} opacity=".5"/>
                    <text x="8" y="66" fill={SC(h.st)} fontSize="6.5" fontWeight="700">● {h.st==='busy'?'高负荷运转':h.st==='warn'?'负荷预警中':'运营正常'}</text>
                  </g>
                )}
              </g>
            ))}

            {/* 选中街镇弹窗 */}
            {sel&&(
              <g transform="translate(400,350)">
                <rect x="-95" y="-52" width="190" height="105" rx="8" fill="rgba(1,8,20,.97)" stroke={RC(sel.risk)} strokeWidth="1.3" filter="url(#shadow8)"/>
                <rect x="-95" y="-52" width="190" height="3" rx="1.5" fill={RC(sel.risk)} opacity=".65"/>
                <text textAnchor="middle" y="-30" fill={RC(sel.risk)} fontSize="12" fontWeight="900">{sel.name}</text>
                <text textAnchor="middle" y="-12" fill="white" fontSize="15" fontWeight="900">{sel.pts} 名在管患者</text>
                <text textAnchor="middle" y="5" fill="#94a3b8" fontSize="8">责任医院: {sel.gp}</text>
                <text textAnchor="middle" y="20" fill="#64748b" fontSize="7.5">风险: {sel.risk>=4?'极高危':sel.risk>=3?'高危':sel.risk>=2?'中危':'低危'} · 达标率约 {56+sel.risk*6}%</text>
                <text textAnchor="middle" y="36" fill="#3b82f6" fontSize="7.5" style={{cursor:'pointer'}} onClick={()=>setSel(null)}>✕ 关闭</text>
              </g>
            )}

            {/* 图例 */}
            <g transform="translate(20,678)">
              {[{c:'#dc2626',l:'极高危'},{c:'#ef4444',l:'高危'},{c:'#f97316',l:'中危'},{c:'#22c55e',l:'低危'},{c:'#22d3ee',l:'医联体'}].map((it,i)=>(
                <g key={i} transform={`translate(${i*80},0)`}>
                  <circle cx="5" cy="4" r="3.5" fill={it.c} opacity=".8"/>
                  <text x="13" y="8" fill="#64748b" fontSize="7.5" fontWeight="700">{it.l}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* 右栏 */}
        <div className="bs-right" style={{display:'flex',flexDirection:'column',gap:6}}>
          <div style={{...C,flex:1.4,padding:'10px 12px'}}>
            <Ttl t="医联体实时负荷"/>
            <div style={{flex:1,overflowY:'auto',marginTop:6}}>
              {HOSPITALS.map(h=>(
                <div key={h.id} style={{marginBottom:5,padding:'5px 7px',borderRadius:5,background:'rgba(255,255,255,.02)',border:`1px solid ${SC(h.st)}1c`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
                    <span style={{fontSize:8.5,fontWeight:900,color:'#dde4ef',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:128}}>{h.name}</span>
                    <span style={{fontSize:6.5,fontWeight:900,color:SC(h.st),padding:'1px 4px',background:`${SC(h.st)}12`,borderRadius:3,flexShrink:0,whiteSpace:'nowrap'}}>
                      {h.st==='busy'?'⚠ 高负荷':h.st==='warn'?'△ 预警':'● 正常'}
                    </span>
                  </div>
                  <div style={{height:2.5,background:'rgba(255,255,255,.05)',borderRadius:1.5,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${h.occ}%`,background:`linear-gradient(90deg,${SC(h.st)}40,${SC(h.st)})`,borderRadius:1.5}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:1.5}}>
                    <span style={{fontSize:6.5,color:'#475569'}}>床位 {h.beds}</span>
                    <span style={{fontSize:7,fontWeight:900,color:SC(h.st)}}>{h.occ}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{...C,flex:.58,padding:'10px 12px'}}>
            <Ttl t="在管人群月度趋势"/>
            <div style={{flex:1,minHeight:0}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND} margin={{left:-24,right:4,top:4,bottom:2}}>
                  <defs>
                    <linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity=".25"/><stop offset="95%" stopColor="#22d3ee" stopOpacity="0"/></linearGradient>
                    <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity=".18"/><stop offset="95%" stopColor="#22c55e" stopOpacity="0"/></linearGradient>
                  </defs>
                  <XAxis dataKey="m" tick={{fill:'#475569',fontSize:7}} axisLine={false} tickLine={false}/>
                  <Area type="monotone" dataKey="p" stroke="#22d3ee" strokeWidth={1.7} fill="url(#tg1)" dot={false}/>
                  <Area type="monotone" dataKey="c" stroke="#22c55e" strokeWidth={1.2} fill="url(#tg2)" dot={false} strokeDasharray="4 2"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{...C,flex:.5,padding:'10px 12px'}}>
            <Ttl t="今日医疗动态"/>
            <div style={{flex:1,overflowY:'auto',marginTop:5}}>
              {[
                {t:'三林镇热力持续红色预警',c:'#ef4444',time:'11:05'},
                {t:'仁济东院92%，启动分流预案',c:'#f97316',time:'10:48'},
                {t:'张江AI筛查发现3例高危',c:'#818cf8',time:'10:32'},
                {t:'航头达标率81%，全区第一',c:'#22c55e',time:'09:58'},
                {t:'周浦完成5例跨院会诊',c:'#22d3ee',time:'09:30'},
              ].map((it,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:5,marginBottom:4}}>
                  <div style={{width:2.5,height:2.5,borderRadius:'50%',background:it.c,flexShrink:0,boxShadow:`0 0 4px ${it.c}`}}/>
                  <span style={{fontSize:8.5,color:'#94a3b8',flex:1,lineHeight:1.3}}>{it.t}</span>
                  <span style={{fontSize:6.5,color:'#475569',flexShrink:0}}>{it.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{height:28,background:'rgba(1,9,20,.96)',borderTop:'1px solid rgba(0,242,255,.12)',display:'flex',alignItems:'center',overflow:'hidden',flexShrink:0,zIndex:10}}>
        <div style={{padding:'0 10px',borderRight:'1px solid rgba(0,242,255,.15)',fontSize:7,fontWeight:900,color:'#22d3ee',whiteSpace:'nowrap',textTransform:'uppercase',letterSpacing:'0.16em',flexShrink:0}}>实时播报</div>
        <div style={{overflow:'hidden',flex:1,maskImage:'linear-gradient(90deg,transparent,black 2%,black 98%,transparent)'}}>
          <div style={{display:'flex',gap:48,whiteSpace:'nowrap',animation:'marquee 36s linear infinite',paddingLeft:16}}>
            {[
              `[${time}] 三林镇热力持续红色，网格化随访预警已触发，建议全科医生加密随访频次`,
              `[${time}] 仁济东院今日接收转诊12例，床位92%，启动应急分流预案`,
              `[${time}] 航头镇慢病管理达标率81%，位列浦东29个街镇第一`,
              `[${time}] 张江镇AI辅助筛查识别3例新增高危患者，已自动下发疾控指派任务`,
              `[${time}] 东方医联体绿色通道今日累计分流${REAL_CDC_POOL.length+1847}例，平均候诊10.4分钟`,
            ].map((t,i)=><span key={i} style={{fontSize:9,color:'#64748b'}}>{t}</span>)}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        select option{background:#0a1628;color:#22d3ee;}

        /* 响应式 */
        @media(max-width:900px){
          .bs-body{grid-template-columns:180px 1fr 180px!important;}
        }
        @media(max-width:700px){
          .bs-body{grid-template-columns:1fr!important;grid-template-rows:auto 55vw auto;overflow-y:auto!important;}
          .bs-left{order:2;}
          .bs-map{order:1;height:55vw;min-height:240px;}
          .bs-right{order:3;}
          .bs-kpi-2,.bs-kpi-3{display:none!important;}
          .bs-title{display:none;}
        }
        @media(max-width:480px){
          .bs-kpi-1{display:none!important;}
        }
      `}</style>
    </div>
  );
};

const C:React.CSSProperties={background:'linear-gradient(145deg,rgba(0,18,42,.78),rgba(0,10,24,.88))',backdropFilter:'blur(20px)',border:'1px solid rgba(0,242,255,.1)',borderRadius:10,display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 4px 18px rgba(0,0,0,.4),inset 0 1px 0 rgba(0,242,255,.05)'};
const Ttl:React.FC<{t:string}>=({t})=>(<div style={{display:'flex',alignItems:'center',gap:5,flexShrink:0,marginBottom:2}}><div style={{width:2.5,height:11,background:'linear-gradient(180deg,#22d3ee,#3b82f6)',borderRadius:2,boxShadow:'0 0 5px rgba(34,211,238,.5)'}}/><span style={{fontSize:8.5,fontWeight:900,color:'#22d3ee',textTransform:'uppercase',letterSpacing:'0.14em'}}>{t}</span></div>);

export default BigScreen;
