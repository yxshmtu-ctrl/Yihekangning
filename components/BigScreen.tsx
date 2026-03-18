import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { REAL_CDC_POOL } from '../data/realPatients';
import { R1, R2, R3, R4 } from '../data/pudongMap';

// 街镇中心点（WGS84投影到SVG 580×620）
const TOWNS = [
  {id:'gq', name:'高桥镇',   x:159, y:20,  pts:67,  risk:2, gp:'第七人民医院'},
  {id:'wgq',name:'外高桥',   x:203, y:43,  pts:38,  risk:1, gp:'第七人民医院'},
  {id:'gx', name:'高行镇',   x:188, y:65,  pts:44,  risk:1, gp:'第七人民医院'},
  {id:'cl', name:'曹路镇',   x:290, y:134, pts:67,  risk:2, gp:'第七人民医院'},
  {id:'jq', name:'金桥镇',   x:187, y:179, pts:78,  risk:2, gp:'东方医院'},
  {id:'tz', name:'唐镇',     x:290, y:191, pts:52,  risk:1, gp:'仁济东院'},
  {id:'cs', name:'川沙新镇', x:378, y:236, pts:98,  risk:2, gp:'浦东新区人民医院'},
  {id:'ljz',name:'陆家嘴',   x:101, y:191, pts:89,  risk:2, gp:'东方医院'},
  {id:'wf', name:'潍坊新村', x:116, y:202, pts:72,  risk:2, gp:'公利医院'},
  {id:'yj', name:'洋泾',     x:133, y:202, pts:65,  risk:1, gp:'公利医院'},
  {id:'hm', name:'花木街道', x:184, y:213, pts:102, risk:3, gp:'仁济东院'},
  {id:'zj', name:'张江镇',   x:232, y:236, pts:124, risk:3, gp:'仁济东院'},
  {id:'tq', name:'塘桥',     x:113, y:213, pts:58,  risk:1, gp:'东方医院'},
  {id:'sg', name:'上钢新村', x:92,  y:225, pts:81,  risk:2, gp:'六院东院'},
  {id:'nm', name:'南码头路', x:104, y:236, pts:94,  risk:3, gp:'六院东院'},
  {id:'hd', name:'沪东新村', x:145, y:191, pts:68,  risk:2, gp:'公利医院'},
  {id:'jy', name:'金杨新村', x:159, y:191, pts:75,  risk:2, gp:'东方医院'},
  {id:'dm', name:'东明路',   x:92,  y:248, pts:86,  risk:3, gp:'六院东院'},
  {id:'zjd',name:'周家渡',   x:82,  y:248, pts:78,  risk:2, gp:'六院东院'},
  {id:'sl', name:'三林镇',   x:76,  y:270, pts:156, risk:4, gp:'六院东院'},
  {id:'bc', name:'北蔡镇',   x:145, y:259, pts:98,  risk:3, gp:'周浦医院'},
  {id:'kq', name:'康桥镇',   x:145, y:316, pts:95,  risk:2, gp:'曙光医院东院'},
  {id:'zp', name:'周浦镇',   x:174, y:327, pts:108, risk:3, gp:'周浦医院'},
  {id:'ht', name:'航头镇',   x:257, y:384, pts:87,  risk:2, gp:'浦东医院'},
  {id:'xc', name:'新场镇',   x:320, y:396, pts:63,  risk:1, gp:'浦东医院'},
  {id:'dt', name:'大团镇',   x:392, y:430, pts:45,  risk:1, gp:'浦东新区人民医院'},
  {id:'hn', name:'惠南镇',   x:451, y:418, pts:142, risk:3, gp:'浦东医院'},
  {id:'xqz',name:'宣桥镇',   x:451, y:384, pts:71,  risk:2, gp:'浦东新区人民医院'},
  {id:'zqz',name:'祝桥镇',   x:524, y:293, pts:55,  risk:1, gp:'浦东新区人民医院'},
];

const HOSPITALS = [
  {id:'df',  name:'东方医院',        abbr:'东方', x:90,  y:202, st:'busy',  occ:88, beds:1200, grp:'东方医联体', r:65},
  {id:'q7',  name:'第七人民医院',    abbr:'七院', x:160, y:45,  st:'normal',occ:72, beds:800,  grp:'七院医联体', r:58},
  {id:'gl',  name:'公利医院',        abbr:'公利', x:118, y:195, st:'warn',  occ:81, beds:600,  grp:'公利医联体', r:50},
  {id:'rj',  name:'仁济东院',        abbr:'仁济', x:155, y:215, st:'busy',  occ:92, beds:1500, grp:'仁济医联体', r:75},
  {id:'d6',  name:'六院东院',        abbr:'六院', x:80,  y:248, st:'warn',  occ:84, beds:700,  grp:'六院医联体', r:58},
  {id:'lh',  name:'龙华医院东院',    abbr:'龙华', x:105, y:280, st:'normal',occ:67, beds:500,  grp:'龙华医联体', r:46},
  {id:'sgg', name:'曙光医院东院',    abbr:'曙光', x:148, y:320, st:'normal',occ:73, beds:600,  grp:'曙光医联体', r:50},
  {id:'pdry',name:'浦东新区人民医院',abbr:'浦新', x:380, y:250, st:'normal',occ:76, beds:900,  grp:'浦新医联体', r:62},
  {id:'pd',  name:'浦东医院',        abbr:'浦东', x:290, y:400, st:'normal',occ:65, beds:500,  grp:'浦东医联体', r:54},
  {id:'zph', name:'周浦医院',        abbr:'周浦', x:172, y:330, st:'normal',occ:70, beds:400,  grp:'周浦医联体', r:46},
  {id:'dfn', name:'东方南院',        abbr:'东南', x:240, y:430, st:'normal',occ:58, beds:300,  grp:'东方医联体', r:40},
];

const LINKS=[['df','gl'],['df','rj'],['df','d6'],['q7','gl'],['rj','d6'],['lh','sgg'],['pd','zph'],['pd','pdry'],['dfn','pd']];
const SC=(s:string)=>s==='busy'?'#ef4444':s==='warn'?'#f97316':'#22c55e';
const RC=(r:number)=>r>=4?'#dc2626':r>=3?'#ef4444':r>=2?'#f97316':'#22c55e';
const TREND=Array.from({length:12},(_,i)=>({m:`${i+1}月`,p:820+i*40,c:64+i*1.5}));
const RADAR=[{s:'血压达标',A:72},{s:'血糖达标',A:68},{s:'随访完成',A:85},{s:'用药规律',A:61},{s:'生活方式',A:55},{s:'转诊及时',A:78}];

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
        if(d<80){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(0,242,255,${.06*(1-d/80)})`;ctx.lineWidth=.4;ctx.stroke();}}));
      af=requestAnimationFrame(draw);};
    draw(); return()=>cancelAnimationFrame(af);
  },[]);

  return(
    <div style={{position:'fixed',inset:0,background:'#010912',zIndex:100,display:'flex',flexDirection:'column',fontFamily:'-apple-system,sans-serif',overflow:'hidden'}}>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.4,pointerEvents:'none'}}/>
      <div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,242,255,.01) 3px,rgba(0,242,255,.01) 4px)',pointerEvents:'none',zIndex:1}}/>
      <div style={{position:'absolute',top:0,left:'25%',width:'50%',height:2,background:'linear-gradient(90deg,transparent,rgba(0,242,255,.5),transparent)',zIndex:2}}/>

      {/* HEADER */}
      <header style={{height:54,background:'linear-gradient(180deg,rgba(0,242,255,.07),rgba(1,9,20,.96))',backdropFilter:'blur(24px)',borderBottom:'1px solid rgba(0,242,255,.2)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',flexShrink:0,position:'relative',zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,border:'1.5px solid #22d3ee',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',color:'#22d3ee',fontWeight:900,fontSize:15,boxShadow:'0 0 16px rgba(34,211,238,.5),inset 0 0 8px rgba(34,211,238,.1)'}}>✚</div>
          <div>
            <div style={{color:'#fff',fontWeight:900,fontSize:14,letterSpacing:'0.1em',textShadow:'0 0 16px rgba(34,211,238,.3)'}}>浦东新区医防融合指挥大屏</div>
            <div style={{color:'#22d3ee',fontSize:6.5,fontWeight:700,letterSpacing:'0.36em',opacity:.45,textTransform:'uppercase'}}>PUDONG NEW AREA · MEDICAL-PREVENTION INTEGRATED HUD v6.0</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:5}}>
          {[
            {l:'在管总人数',v:String(REAL_CDC_POOL.length+1847),u:'人',c:'#22d3ee'},
            {l:'高危预警',v:'47',u:'例',c:'#ef4444'},
            {l:'今日转诊',v:'12',u:'单',c:'#f97316'},
            {l:'急诊候诊',v:'10.4',u:'min',c:'#22c55e'},
            {l:'AI筛查',v:'328',u:'次/日',c:'#818cf8'},
          ].map((it,i)=>(
            <div key={i} style={{textAlign:'center',padding:'4px 9px',background:`${it.c}0e`,border:`1px solid ${it.c}20`,borderRadius:7}}>
              <div style={{fontSize:6,color:'#64748b',fontWeight:900,textTransform:'uppercase',marginBottom:1,whiteSpace:'nowrap'}}>{it.l}</div>
              <div style={{fontSize:15,fontWeight:900,color:it.c,lineHeight:1}}>{it.v}<span style={{fontSize:7,marginLeft:2,opacity:.5}}>{it.u}</span></div>
            </div>
          ))}
          <div style={{color:'#22d3ee',fontWeight:900,fontSize:13,padding:'0 10px',borderLeft:'1px solid rgba(255,255,255,.06)',fontVariantNumeric:'tabular-nums'}}>{time}</div>
          <button onClick={onClose} style={{width:24,height:24,borderRadius:5,border:'1px solid rgba(255,255,255,.1)',background:'rgba(239,68,68,.08)',color:'rgba(255,255,255,.4)',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center'}}
            onMouseOver={e=>{e.currentTarget.style.background='rgba(239,68,68,.3)';e.currentTarget.style.color='#fff';}}
            onMouseOut={e=>{e.currentTarget.style.background='rgba(239,68,68,.08)';e.currentTarget.style.color='rgba(255,255,255,.4)';}}>✕</button>
        </div>
      </header>

      {/* BODY */}
      <div style={{flex:1,display:'grid',gridTemplateColumns:'248px 1fr 248px',gap:7,padding:7,overflow:'hidden',position:'relative',zIndex:2}}>

        {/* 左栏 */}
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          <div style={{...C,flex:1.5,padding:'10px 12px'}}>
            <T t="街镇慢病热力排行"/>
            <div style={{flex:1,overflowY:'auto',marginTop:7}}>
              {TOWNS.sort((a,b)=>b.pts-a.pts).map((t,i)=>(
                <div key={t.id} onClick={()=>setSel(sel?.id===t.id?null:t)}
                  style={{display:'flex',alignItems:'center',gap:5,marginBottom:4,padding:'4px 6px',borderRadius:6,background:sel?.id===t.id?`${RC(t.risk)}12`:'rgba(255,255,255,.02)',border:`1px solid ${RC(t.risk)}${sel?.id===t.id?'40':'12'}`,cursor:'pointer',transition:'all .15s'}}>
                  <div style={{width:14,height:14,borderRadius:3,background:`${RC(t.risk)}18`,border:`1px solid ${RC(t.risk)}50`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,fontWeight:900,color:RC(t.risk),flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                      <span style={{fontSize:9,fontWeight:900,color:'#dde4ef',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name}</span>
                      <span style={{fontSize:8,fontWeight:900,color:RC(t.risk),flexShrink:0,marginLeft:3}}>{t.pts}</span>
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
          <div style={{...C,flex:.8,padding:'10px 12px'}}>
            <T t="健康管理六维评估"/>
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

        {/* 中央真实地图 */}
        <div style={{position:'relative',overflow:'hidden',borderRadius:12,border:'1px solid rgba(0,242,255,.12)',background:'#010d20'}}>
          {/* 四角装饰 */}
          {[{top:10,left:10,bt:true,bl:true},{top:10,right:10,bt:true,br:true},{bottom:10,left:10,bb:true,bl:true},{bottom:10,right:10,bb:true,br:true}].map((s,i)=>(
            <div key={i} style={{position:'absolute',...s,width:18,height:18,
              borderTop:(s as any).bt?'2px solid rgba(0,242,255,.4)':'none',
              borderBottom:(s as any).bb?'2px solid rgba(0,242,255,.4)':'none',
              borderLeft:(s as any).bl?'2px solid rgba(0,242,255,.4)':'none',
              borderRight:(s as any).br?'2px solid rgba(0,242,255,.4)':'none',zIndex:5}}/>
          ))}

          <div style={{position:'absolute',top:10,left:'50%',transform:'translateX(-50%)',zIndex:6,textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <div style={{fontSize:9.5,fontWeight:900,color:'rgba(34,211,238,.6)',letterSpacing:'0.26em',textTransform:'uppercase',textShadow:'0 0 10px rgba(34,211,238,.3)',pointerEvents:'none'}}>浦东新区 · 真实社区边界 · 1519个地块</div>
            {/* 视图切换下拉框 */}
            <select value={mapView} onChange={e=>setMapView(e.target.value)}
              style={{background:'rgba(1,8,20,.92)',border:'1px solid rgba(0,242,255,.3)',borderRadius:8,color:'#22d3ee',fontSize:8.5,fontWeight:900,padding:'4px 28px 4px 10px',cursor:'pointer',outline:'none',letterSpacing:'0.12em',backdropFilter:'blur(12px)',boxShadow:'0 0 12px rgba(0,242,255,.15)',appearance:'none',WebkitAppearance:'none',backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2322d3ee'/%3E%3C/svg%3E")`,backgroundRepeat:'no-repeat',backgroundPosition:'right 8px center'}}>
              <option value="heat">🔥 慢病热力视图</option>
              <option value="boundary">🗺️ 社区边界视图</option>
              <option value="hospital">🏥 医联体辐射视图</option>
              <option value="risk">⚠️ 风险分级视图</option>
            </select>
          </div>

          <svg viewBox="0 0 580 630" style={{width:'100%',height:'100%',display:'block'}} preserveAspectRatio="xMidYMid meet">
            <defs>
              {/* 热力渐变 */}
              <radialGradient id="h4"><stop offset="0%" stopColor="#dc2626" stopOpacity=".85"/><stop offset="50%" stopColor="#ef4444" stopOpacity=".3"/><stop offset="100%" stopColor="#dc2626" stopOpacity="0"/></radialGradient>
              <radialGradient id="h3"><stop offset="0%" stopColor="#ef4444" stopOpacity=".7"/><stop offset="50%" stopColor="#f97316" stopOpacity=".2"/><stop offset="100%" stopColor="#ef4444" stopOpacity="0"/></radialGradient>
              <radialGradient id="h2"><stop offset="0%" stopColor="#f97316" stopOpacity=".55"/><stop offset="50%" stopColor="#fbbf24" stopOpacity=".14"/><stop offset="100%" stopColor="#f97316" stopOpacity="0"/></radialGradient>
              <radialGradient id="h1"><stop offset="0%" stopColor="#22c55e" stopOpacity=".4"/><stop offset="100%" stopColor="#22c55e" stopOpacity="0"/></radialGradient>
              {HOSPITALS.map(h=>(
                <radialGradient key={h.id} id={`hg${h.id}`}>
                  <stop offset="0%" stopColor={SC(h.st)} stopOpacity=".22"/>
                  <stop offset="60%" stopColor={SC(h.st)} stopOpacity=".06"/>
                  <stop offset="100%" stopColor={SC(h.st)} stopOpacity="0"/>
                </radialGradient>
              ))}
              <filter id="blur22"><feGaussianBlur stdDeviation="22"/></filter>
              <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
              <filter id="glow3"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="shadow8"><feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,.7)"/></filter>
            </defs>

            {/* ── 真实社区边界多边形 ── */}
            {/* 低危区域 (risk=1) */}
            <g fill={mapView==='risk'?"rgba(34,197,94,.14)":"rgba(34,197,94,.06)"} stroke={mapView==='boundary'?"rgba(34,197,94,.4)":"rgba(34,197,94,.22)"} strokeWidth={mapView==='boundary'?".8":".5"}>
              {R1.map((d,i)=><path key={i} d={d}/>)}
            </g>
            {/* 中危区域 (risk=2) */}
            <g fill={mapView==='risk'?"rgba(249,115,22,.14)":"rgba(249,115,22,.07)"} stroke={mapView==='boundary'?"rgba(249,115,22,.4)":"rgba(249,115,22,.25)"} strokeWidth={mapView==='boundary'?".8":".5"}>
              {R2.map((d,i)=><path key={i} d={d}/>)}
            </g>
            {/* 高危区域 (risk=3) */}
            <g fill={mapView==='risk'?"rgba(239,68,68,.18)":"rgba(239,68,68,.09)"} stroke={mapView==='boundary'?"rgba(239,68,68,.45)":"rgba(239,68,68,.28)"} strokeWidth={mapView==='boundary'?"1":".6"}>
              {R3.map((d,i)=><path key={i} d={d}/>)}
            </g>
            {/* 极高危区域 (risk=4) */}
            <g fill={mapView==='risk'?"rgba(220,38,38,.24)":"rgba(220,38,38,.13)"} stroke={mapView==='boundary'?"rgba(220,38,38,.55)":"rgba(220,38,38,.38)"} strokeWidth={mapView==='boundary'?"1.2":".7"}>
              {R4.map((d,i)=><path key={i} d={d}/>)}
            </g>

            {/* 热力叠加层（仅热力和风险视图显示） */}
            {mapView!=='boundary'&&mapView!=='hospital'&&(
              <g filter="url(#blur22)" opacity=".75">
                {TOWNS.map(t=>(
                  <circle key={t.id} cx={t.x} cy={t.y}
                    r={32+(t.pts/156)*50+(t.risk*5)}
                    fill={`url(#h${t.risk})`}/>
                ))}
              </g>
            )}

            {/* 医联体辐射圈（hospital视图更显眼） */}
            {HOSPITALS.map(h=>(
              <g key={h.id} opacity={mapView==='hospital'?1:0.6}>
                <circle cx={h.x} cy={h.y} r={mapView==='hospital'?h.r*1.4:h.r} fill={`url(#hg${h.id})`} opacity={mapView==='hospital'?1.5:1}/>
                <circle cx={h.x} cy={h.y} r={mapView==='hospital'?h.r*1.4:h.r} fill="none" stroke={SC(h.st)} strokeWidth={mapView==='hospital'?1:".6"} strokeDasharray={`${h.r*.3} ${h.r*5}`} opacity={mapView==='hospital'?.5:".28"}
                  style={{transformOrigin:`${h.x}px ${h.y}px`,animation:`spin ${8+h.r*.04}s linear infinite`}}/>
                {mapView==='hospital'&&(
                  <circle cx={h.x} cy={h.y} r={h.r*.5} fill="none" stroke={SC(h.st)} strokeWidth=".5" strokeDasharray="2 5" opacity=".3"/>
                )}
              </g>
            ))}

            {/* 医联体连线 + 流动粒子 */}
            {LINKS.map(([a,b],i)=>{
              const ha=HOSPITALS.find(h=>h.id===a)!;
              const hb=HOSPITALS.find(h=>h.id===b)!;
              return(
                <g key={i}>
                  <line x1={ha.x} y1={ha.y} x2={hb.x} y2={hb.y} stroke="rgba(0,242,255,.1)" strokeWidth=".7" strokeDasharray="3 7"/>
                  <circle r="1.6" fill="#22d3ee" opacity=".65">
                    <animateMotion dur={`${2.8+i*.3}s`} repeatCount="indefinite" path={`M${ha.x},${ha.y} L${hb.x},${hb.y}`}/>
                  </circle>
                </g>
              );
            })}

            {/* 街镇中心标注 - 全部显示 */}
            {TOWNS.map(t=>(
              <g key={t.id} transform={`translate(${t.x},${t.y})`} style={{cursor:'pointer'}} onClick={()=>setSel(sel?.id===t.id?null:t)}>
                {/* 脉冲 */}
                <circle r={4+(t.pts/156)*3} fill={RC(t.risk)} opacity=".1">
                  <animate attributeName="r" values={`${4+(t.pts/156)*3};${8+(t.pts/156)*5};${4+(t.pts/156)*3}`} dur={`${2.2+t.risk*.3}s`} repeatCount="indefinite"/>
                  <animate attributeName="opacity" values=".1;0;.1" dur={`${2.2+t.risk*.3}s`} repeatCount="indefinite"/>
                </circle>
                <circle r="3.5" fill={RC(t.risk)} opacity=".85" filter="url(#glow3)"/>
                <circle r="1.5" fill="rgba(255,255,255,.55)"/>
                {/* 所有街镇都显示名字标签 */}
                <rect x={-t.name.length*3.5-3} y="-20" width={t.name.length*7+6} height="12" rx="3" fill="rgba(1,8,20,.88)" stroke={`${RC(t.risk)}40`} strokeWidth=".6"/>
                <text x="0" textAnchor="middle" y="-11" fill={RC(t.risk)} fontSize={t.pts>100?8.5:7} fontWeight="900">{t.name}</text>
                {/* 患者数（高危或患者多的显示） */}
                {(t.pts>90||t.risk>=3)&&(
                  <g transform="translate(0,8)">
                    <rect x="-9" y="-5" width="18" height="9" rx="3" fill={`${RC(t.risk)}22`} stroke={`${RC(t.risk)}44`} strokeWidth=".5"/>
                    <text x="0" textAnchor="middle" y="2" fill={RC(t.risk)} fontSize="6.5" fontWeight="900">{t.pts}</text>
                  </g>
                )}
              </g>
            ))}

            {/* 医院标记 */}
            {HOSPITALS.map(h=>(
              <g key={h.id} transform={`translate(${h.x},${h.y})`} style={{cursor:'pointer'}}
                onMouseEnter={()=>setHov(h)} onMouseLeave={()=>setHov(null)}>
                <rect x="-7" y="-7" width="14" height="14" rx="3.5" fill="rgba(1,8,20,.92)" stroke={SC(h.st)} strokeWidth="1.1" opacity=".95"/>
                <text textAnchor="middle" y="4" fill={SC(h.st)} fontSize="8" fontWeight="900">✚</text>
                <circle cx="5.5" cy="-5.5" r="2" fill={SC(h.st)}>
                  {h.st!=='normal'&&<animate attributeName="opacity" values="1;.3;1" dur="1.4s" repeatCount="indefinite"/>}
                </circle>
                <g transform="translate(10,-5)">
                  <rect x="-2" y="-7.5" width={h.abbr.length*7+5} height="10.5" rx="3" fill="rgba(1,8,20,.93)" stroke={`${SC(h.st)}35`} strokeWidth=".5"/>
                  <text y="0" fill="rgba(255,255,255,.84)" fontSize="7" fontWeight="900">{h.abbr}</text>
                </g>
                {hov?.id===h.id&&(
                  <g transform="translate(-62,-96)">
                    <rect x="0" y="0" width="124" height="78" rx="7" fill="rgba(1,8,20,.97)" stroke={SC(h.st)} strokeWidth="1.1" filter="url(#shadow8)"/>
                    <rect x="0" y="0" width="124" height="3" rx="1.5" fill={SC(h.st)} opacity=".6"/>
                    <text x="9" y="17" fill={SC(h.st)} fontSize="7" fontWeight="900">{h.grp}</text>
                    <text x="9" y="32" fill="white" fontSize="10.5" fontWeight="900">{h.name}</text>
                    <text x="9" y="47" fill="#94a3b8" fontSize="7">床位 {h.beds} · 占用 {h.occ}%</text>
                    <rect x="9" y="54" width="106" height="4" rx="2" fill="rgba(255,255,255,.06)"/>
                    <rect x="9" y="54" width={h.occ*1.06} height="4" rx="2" fill={SC(h.st)} opacity=".5"/>
                    <text x="9" y="70" fill={SC(h.st)} fontSize="7" fontWeight="700">● {h.st==='busy'?'高负荷运转':h.st==='warn'?'负荷预警中':'运营正常'}</text>
                  </g>
                )}
              </g>
            ))}

            {/* 选中街镇弹窗 */}
            {sel&&(
              <g transform="translate(290,315)">
                <rect x="-95" y="-56" width="190" height="112" rx="9" fill="rgba(1,8,20,.97)" stroke={RC(sel.risk)} strokeWidth="1.4" filter="url(#shadow8)"/>
                <rect x="-95" y="-56" width="190" height="3.5" rx="1.8" fill={RC(sel.risk)} opacity=".65"/>
                <text textAnchor="middle" y="-34" fill={RC(sel.risk)} fontSize="12" fontWeight="900">{sel.name}</text>
                <text textAnchor="middle" y="-15" fill="white" fontSize="16" fontWeight="900">{sel.pts} 名在管患者</text>
                <text textAnchor="middle" y="3" fill="#94a3b8" fontSize="8.5">责任医院: {sel.gp}</text>
                <text textAnchor="middle" y="19" fill="#64748b" fontSize="8">
                  风险: {sel.risk>=4?'极高危':sel.risk>=3?'高危':sel.risk>=2?'中危':'低危'} · 达标率约 {56+sel.risk*6}%
                </text>
                <text textAnchor="middle" y="35" fill="#3b82f6" fontSize="8" style={{cursor:'pointer'}} onClick={()=>setSel(null)}>✕ 关闭</text>
              </g>
            )}

            {/* 图例 */}
            <g transform="translate(12,606)">
              {[{c:'#dc2626',l:'极高危'},{c:'#ef4444',l:'高危'},{c:'#f97316',l:'中危'},{c:'#22c55e',l:'低危'},{c:'#22d3ee',l:'医联体'}].map((it,i)=>(
                <g key={i} transform={`translate(${i*72},0)`}>
                  <circle cx="5" cy="4" r="3.5" fill={it.c} opacity=".8"/>
                  <text x="12" y="8" fill="#64748b" fontSize="7.5" fontWeight="700">{it.l}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* 右栏 */}
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          <div style={{...C,flex:1.4,padding:'10px 12px'}}>
            <T t="医联体实时负荷"/>
            <div style={{flex:1,overflowY:'auto',marginTop:6}}>
              {HOSPITALS.map(h=>(
                <div key={h.id} style={{marginBottom:5,padding:'5px 7px',borderRadius:6,background:'rgba(255,255,255,.02)',border:`1px solid ${SC(h.st)}1c`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
                    <span style={{fontSize:8.5,fontWeight:900,color:'#dde4ef',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:122}}>{h.name}</span>
                    <span style={{fontSize:6.5,fontWeight:900,color:SC(h.st),padding:'1px 4px',background:`${SC(h.st)}12`,borderRadius:3,flexShrink:0,whiteSpace:'nowrap'}}>
                      {h.st==='busy'?'⚠ 高负荷':h.st==='warn'?'△ 预警':'● 正常'}
                    </span>
                  </div>
                  <div style={{height:2.5,background:'rgba(255,255,255,.05)',borderRadius:1.5,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${h.occ}%`,background:`linear-gradient(90deg,${SC(h.st)}40,${SC(h.st)})`,borderRadius:1.5}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:1.5}}>
                    <span style={{fontSize:6.5,color:'#475569'}}>床位{h.beds}</span>
                    <span style={{fontSize:7,fontWeight:900,color:SC(h.st)}}>{h.occ}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{...C,flex:.6,padding:'10px 12px'}}>
            <T t="在管人群月度趋势"/>
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
          <div style={{...C,flex:.55,padding:'10px 12px'}}>
            <T t="今日医疗动态"/>
            <div style={{flex:1,overflowY:'auto',marginTop:5}}>
              {[
                {t:'三林镇热力持续红色预警',c:'#ef4444',time:'11:05'},
                {t:'仁济东院92%，启动分流预案',c:'#f97316',time:'10:48'},
                {t:'张江AI筛查发现3例高危',c:'#818cf8',time:'10:32'},
                {t:'航头达标率81%，全区第一',c:'#22c55e',time:'09:58'},
                {t:'周浦完成5例跨院会诊',c:'#22d3ee',time:'09:30'},
              ].map((it,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:5,marginBottom:4,padding:'3px 0'}}>
                  <div style={{width:2.5,height:2.5,borderRadius:'50%',background:it.c,flexShrink:0,boxShadow:`0 0 5px ${it.c}`}}/>
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

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
};

const C:React.CSSProperties={background:'linear-gradient(145deg,rgba(0,18,42,.78),rgba(0,10,24,.88))',backdropFilter:'blur(20px)',border:'1px solid rgba(0,242,255,.1)',borderRadius:12,display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.4),inset 0 1px 0 rgba(0,242,255,.05)'};
const T:React.FC<{t:string}>=({t})=>(<div style={{display:'flex',alignItems:'center',gap:5,flexShrink:0}}><div style={{width:2.5,height:12,background:'linear-gradient(180deg,#22d3ee,#3b82f6)',borderRadius:2,boxShadow:'0 0 5px rgba(34,211,238,.5)'}}/><span style={{fontSize:9,fontWeight:900,color:'#22d3ee',textTransform:'uppercase',letterSpacing:'0.15em'}}>{t}</span></div>);

export default BigScreen;
