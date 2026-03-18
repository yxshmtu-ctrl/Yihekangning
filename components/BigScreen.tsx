import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { REAL_CDC_POOL } from '../data/realPatients';
import { R1, R2, R3, R4 } from '../data/pudongMap';

// ── 街镇（WGS84→SVG 560×580 投影坐标）──
const TOWNS = [
  {id:'gq', name:'高桥镇',   x:108,y:41,  pts:67,  risk:2, gp:'第七人民医院'},
  {id:'wgq',name:'外高桥',   x:136,y:54,  pts:38,  risk:1, gp:'第七人民医院'},
  {id:'gx', name:'高行镇',   x:128,y:80,  pts:44,  risk:1, gp:'第七人民医院'},
  {id:'cl', name:'曹路镇',   x:202,y:124, pts:67,  risk:2, gp:'第七人民医院'},
  {id:'jq', name:'金桥镇',   x:128,y:155, pts:78,  risk:2, gp:'东方医院'},
  {id:'tz', name:'唐镇',     x:198,y:168, pts:52,  risk:1, gp:'仁济东院'},
  {id:'cs', name:'川沙新镇', x:266,y:207, pts:98,  risk:2, gp:'浦东新区人民医院'},
  {id:'ljz',name:'陆家嘴',   x:66, y:165, pts:89,  risk:2, gp:'东方医院'},
  {id:'hm', name:'花木街道', x:124,y:186, pts:102, risk:3, gp:'仁济东院'},
  {id:'zj', name:'张江镇',   x:162,y:207, pts:124, risk:3, gp:'仁济东院'},
  {id:'sg', name:'上钢新村', x:60, y:196, pts:81,  risk:2, gp:'六院东院'},
  {id:'nm', name:'南码头路', x:68, y:207, pts:94,  risk:3, gp:'六院东院'},
  {id:'dm', name:'东明路',   x:56, y:220, pts:86,  risk:3, gp:'六院东院'},
  {id:'zjd',name:'周家渡',   x:47, y:223, pts:78,  risk:2, gp:'六院东院'},
  {id:'sl', name:'三林镇',   x:42, y:244, pts:156, risk:4, gp:'六院东院'},
  {id:'bc', name:'北蔡镇',   x:97, y:234, pts:98,  risk:3, gp:'周浦医院'},
  {id:'kq', name:'康桥镇',   x:99, y:290, pts:95,  risk:2, gp:'曙光医院东院'},
  {id:'zp', name:'周浦镇',   x:118,y:303, pts:108, risk:3, gp:'周浦医院'},
  {id:'ht', name:'航头镇',   x:178,y:344, pts:87,  risk:2, gp:'浦东医院'},
  {id:'xc', name:'新场镇',   x:219,y:355, pts:63,  risk:1, gp:'浦东医院'},
  {id:'dt', name:'大团镇',   x:274,y:386, pts:45,  risk:1, gp:'浦东新区人民医院'},
  {id:'hn', name:'惠南镇',   x:313,y:372, pts:142, risk:3, gp:'浦东医院'},
  {id:'xqz',name:'宣桥镇',   x:313,y:341, pts:71,  risk:2, gp:'浦东新区人民医院'},
  {id:'zqz',name:'祝桥镇',   x:344,y:258, pts:55,  risk:1, gp:'浦东新区人民医院'},
];

const HOSPITALS = [
  {id:'df',  name:'东方医院',        abbr:'东方',x:63, y:174,st:'busy',  occ:88,beds:1200,grp:'东方医联体',  r:60},
  {id:'q7',  name:'第七人民医院',    abbr:'七院',x:108,y:34, st:'normal',occ:72,beds:800, grp:'七院医联体',  r:55},
  {id:'gl',  name:'公利医院',        abbr:'公利',x:81, y:168,st:'warn',  occ:81,beds:600, grp:'公利医联体',  r:48},
  {id:'rj',  name:'仁济东院',        abbr:'仁济',x:118,y:184,st:'busy',  occ:92,beds:1500,grp:'仁济医联体',  r:72},
  {id:'d6',  name:'六院东院',        abbr:'六院',x:47, y:220,st:'warn',  occ:84,beds:700, grp:'六院医联体',  r:55},
  {id:'lh',  name:'龙华医院东院',    abbr:'龙华',x:66, y:248,st:'normal',occ:67,beds:500, grp:'龙华医联体',  r:44},
  {id:'sgg', name:'曙光医院东院',    abbr:'曙光',x:99, y:287,st:'normal',occ:73,beds:600, grp:'曙光医联体',  r:48},
  {id:'pdry',name:'浦东新区人民医院',abbr:'浦新',x:266,y:207,st:'normal',occ:76,beds:900, grp:'浦新医联体',  r:60},
  {id:'pd',  name:'浦东医院',        abbr:'浦东',x:178,y:344,st:'normal',occ:65,beds:500, grp:'浦东医联体',  r:50},
  {id:'zph', name:'周浦医院',        abbr:'周浦',x:118,y:296,st:'normal',occ:70,beds:400, grp:'周浦医联体',  r:44},
  {id:'dfn', name:'东方南院',        abbr:'东南',x:181,y:362,st:'normal',occ:58,beds:300, grp:'东方医联体',  r:38},
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
  // 缩放和平移状态
  const [zoom,setZoom]=useState(1.0);
  const [pan,setPan]=useState({x:0,y:0});
  const [dragging,setDragging]=useState(false);
  const dragStart=useRef({x:0,y:0,px:0,py:0});
  const svgRef=useRef<SVGSVGElement>(null);
  const canvasRef=useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    const t=setInterval(()=>setTime(new Date().toLocaleTimeString()),1000);
    return()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    const cv=canvasRef.current; if(!cv) return;
    const ctx=cv.getContext('2d')!;
    cv.width=cv.offsetWidth; cv.height=cv.offsetHeight;
    const pts=Array.from({length:60},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,r:Math.random()*.8+.3}));
    let af:number;
    const draw=()=>{
      ctx.clearRect(0,0,cv.width,cv.height);
      pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>cv.width)p.vx*=-1;if(p.y<0||p.y>cv.height)p.vy*=-1;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(0,242,255,.16)';ctx.fill();});
      af=requestAnimationFrame(draw);};
    draw(); return()=>cancelAnimationFrame(af);
  },[]);

  // 滚轮缩放
  const onWheel=useCallback((e:React.WheelEvent)=>{
    e.preventDefault();
    setZoom(z=>Math.min(4,Math.max(0.5,z*(e.deltaY>0?0.9:1.1))));
  },[]);

  // 拖拽平移
  const onMouseDown=useCallback((e:React.MouseEvent)=>{
    setDragging(true);
    dragStart.current={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};
  },[pan]);

  const onMouseMove=useCallback((e:React.MouseEvent)=>{
    if(!dragging) return;
    setPan({x:dragStart.current.px+(e.clientX-dragStart.current.x),y:dragStart.current.py+(e.clientY-dragStart.current.y)});
  },[dragging]);

  const onMouseUp=useCallback(()=>setDragging(false),[]);

  const resetView=()=>{ setZoom(1); setPan({x:0,y:0}); };
  const zoomIn=()=>setZoom(z=>Math.min(4,z*1.3));
  const zoomOut=()=>setZoom(z=>Math.max(0.5,z/1.3));

  return(
    <div style={{position:'fixed',inset:0,background:'#010912',zIndex:100,display:'flex',flexDirection:'column',fontFamily:'-apple-system,sans-serif',overflow:'hidden'}}>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.35,pointerEvents:'none'}}/>
      <div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,242,255,.01) 3px,rgba(0,242,255,.01) 4px)',pointerEvents:'none',zIndex:1}}/>
      <div style={{position:'absolute',top:0,left:'25%',width:'50%',height:2,background:'linear-gradient(90deg,transparent,rgba(0,242,255,.5),transparent)',zIndex:2}}/>

      {/* HEADER */}
      <header style={{height:52,background:'linear-gradient(180deg,rgba(0,242,255,.07),rgba(1,9,20,.96))',backdropFilter:'blur(24px)',borderBottom:'1px solid rgba(0,242,255,.2)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 18px',flexShrink:0,position:'relative',zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,border:'1.5px solid #22d3ee',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',color:'#22d3ee',fontWeight:900,fontSize:14,boxShadow:'0 0 14px rgba(34,211,238,.5),inset 0 0 6px rgba(34,211,238,.1)'}}>✚</div>
          <div>
            <div style={{color:'#fff',fontWeight:900,fontSize:13.5,letterSpacing:'0.1em',textShadow:'0 0 14px rgba(34,211,238,.3)'}}>浦东新区医防融合指挥大屏</div>
            <div style={{color:'#22d3ee',fontSize:6,fontWeight:700,letterSpacing:'0.34em',opacity:.45,textTransform:'uppercase'}}>PUDONG NEW AREA · MEDICAL-PREVENTION INTEGRATED HUD v6.0 · REAL BOUNDARY</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          {[
            {l:'在管总人数',v:String(REAL_CDC_POOL.length+1847),u:'人',c:'#22d3ee'},
            {l:'高危预警',v:'47',u:'例',c:'#ef4444'},
            {l:'今日转诊',v:'12',u:'单',c:'#f97316'},
            {l:'急诊候诊',v:'10.4',u:'min',c:'#22c55e'},
            {l:'AI筛查',v:'328',u:'次/日',c:'#818cf8'},
          ].map((it,i)=>(
            <div key={i} style={{textAlign:'center',padding:'3px 8px',background:`${it.c}0e`,border:`1px solid ${it.c}1e`,borderRadius:6}}>
              <div style={{fontSize:5.5,color:'#64748b',fontWeight:900,textTransform:'uppercase',marginBottom:1,whiteSpace:'nowrap'}}>{it.l}</div>
              <div style={{fontSize:14,fontWeight:900,color:it.c,lineHeight:1}}>{it.v}<span style={{fontSize:6.5,marginLeft:1,opacity:.5}}>{it.u}</span></div>
            </div>
          ))}
          <div style={{color:'#22d3ee',fontWeight:900,fontSize:12,padding:'0 8px',borderLeft:'1px solid rgba(255,255,255,.06)',fontVariantNumeric:'tabular-nums'}}>{time}</div>
          <button onClick={onClose} style={{width:22,height:22,borderRadius:5,border:'1px solid rgba(255,255,255,.1)',background:'rgba(239,68,68,.08)',color:'rgba(255,255,255,.4)',cursor:'pointer',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center'}}
            onMouseOver={e=>{e.currentTarget.style.background='rgba(239,68,68,.3)';e.currentTarget.style.color='#fff';}}
            onMouseOut={e=>{e.currentTarget.style.background='rgba(239,68,68,.08)';e.currentTarget.style.color='rgba(255,255,255,.4)';}}>✕</button>
        </div>
      </header>

      {/* BODY */}
      <div style={{flex:1,display:'grid',gridTemplateColumns:'240px 1fr 240px',gap:6,padding:6,overflow:'hidden',position:'relative',zIndex:2}}>

        {/* 左栏 */}
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <div style={{...C,flex:1.5,padding:'9px 11px'}}>
            <T t="街镇慢病热力排行"/>
            <div style={{flex:1,overflowY:'auto',marginTop:6}}>
              {[...TOWNS].sort((a,b)=>b.pts-a.pts).map((t,i)=>(
                <div key={t.id} onClick={()=>setSel(sel?.id===t.id?null:t)}
                  style={{display:'flex',alignItems:'center',gap:4,marginBottom:3,padding:'3px 5px',borderRadius:5,background:sel?.id===t.id?`${RC(t.risk)}12`:'rgba(255,255,255,.02)',border:`1px solid ${RC(t.risk)}${sel?.id===t.id?'38':'10'}`,cursor:'pointer',transition:'all .15s'}}>
                  <div style={{width:13,height:13,borderRadius:2.5,background:`${RC(t.risk)}18`,border:`1px solid ${RC(t.risk)}45`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:6.5,fontWeight:900,color:RC(t.risk),flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:1.5}}>
                      <span style={{fontSize:8.5,fontWeight:900,color:'#dde4ef',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name}</span>
                      <span style={{fontSize:7.5,fontWeight:900,color:RC(t.risk),flexShrink:0,marginLeft:2}}>{t.pts}</span>
                    </div>
                    <div style={{height:1.8,background:'rgba(255,255,255,.05)',borderRadius:1}}>
                      <div style={{height:'100%',width:`${(t.pts/156)*100}%`,background:`linear-gradient(90deg,${RC(t.risk)}38,${RC(t.risk)})`,borderRadius:1}}/>
                    </div>
                  </div>
                  <span style={{fontSize:5.5,fontWeight:900,padding:'1px 3px',borderRadius:2,background:`${RC(t.risk)}15`,color:RC(t.risk),flexShrink:0,whiteSpace:'nowrap'}}>
                    {t.risk>=4?'极高':t.risk>=3?'高危':t.risk>=2?'中危':'低危'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{...C,flex:.75,padding:'9px 11px'}}>
            <T t="健康管理六维评估"/>
            <div style={{flex:1,minHeight:0}}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={RADAR}>
                  <PolarGrid stroke="rgba(0,242,255,.1)"/>
                  <PolarAngleAxis dataKey="s" tick={{fill:'#475569',fontSize:6.5,fontWeight:700}}/>
                  <Radar dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={.1} strokeWidth={1.4}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 中央地图容器 */}
        <div style={{position:'relative',overflow:'hidden',borderRadius:10,border:'1px solid rgba(0,242,255,.14)',background:'#010d22',display:'flex',alignItems:'center',justifyContent:'center'}}
          onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          style={{...{position:'relative',overflow:'hidden',borderRadius:10,border:'1px solid rgba(0,242,255,.14)',background:'#010d22',display:'flex',alignItems:'center',justifyContent:'center'},cursor:dragging?'grabbing':'grab'}}>

          {/* 四角装饰 */}
          {[[{top:8,left:8},{borderTop:'2px solid rgba(0,242,255,.4)',borderLeft:'2px solid rgba(0,242,255,.4)'}],
            [{top:8,right:8},{borderTop:'2px solid rgba(0,242,255,.4)',borderRight:'2px solid rgba(0,242,255,.4)'}],
            [{bottom:8,left:8},{borderBottom:'2px solid rgba(0,242,255,.4)',borderLeft:'2px solid rgba(0,242,255,.4)'}],
            [{bottom:8,right:8},{borderBottom:'2px solid rgba(0,242,255,.4)',borderRight:'2px solid rgba(0,242,255,.4)'}]
          ].map(([pos,brd],i)=>(
            <div key={i} style={{position:'absolute',...pos as any,...brd as any,width:16,height:16,zIndex:5,pointerEvents:'none'}}/>
          ))}

          {/* 标题 */}
          <div style={{position:'absolute',top:10,left:'50%',transform:'translateX(-50%)',zIndex:6,pointerEvents:'none',textAlign:'center',whiteSpace:'nowrap'}}>
            <span style={{fontSize:9.5,fontWeight:900,color:'rgba(34,211,238,.6)',letterSpacing:'0.26em',textTransform:'uppercase',textShadow:'0 0 10px rgba(34,211,238,.3)'}}>浦东新区 · 真实社区边界 · 1767个地块全域可视</span>
          </div>

          {/* 缩放控件 */}
          <div style={{position:'absolute',right:12,bottom:40,zIndex:8,display:'flex',flexDirection:'column',gap:4}}>
            {[{l:'+',fn:zoomIn},{l:'−',fn:zoomOut},{l:'⊡',fn:resetView}].map((btn,i)=>(
              <button key={i} onClick={btn.fn}
                style={{width:26,height:26,borderRadius:6,border:'1px solid rgba(0,242,255,.25)',background:'rgba(0,15,35,.85)',color:'#22d3ee',fontWeight:900,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(10px)'}}
                onMouseOver={e=>{e.currentTarget.style.background='rgba(0,242,255,.15)';}}
                onMouseOut={e=>{e.currentTarget.style.background='rgba(0,15,35,.85)';}}>
                {btn.l}
              </button>
            ))}
            <div style={{textAlign:'center',fontSize:7,color:'#475569',fontWeight:700,marginTop:2}}>{Math.round(zoom*100)}%</div>
          </div>

          {/* SVG 地图（缩放+平移） */}
          <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
            <svg
              ref={svgRef}
              viewBox="0 0 560 580"
              preserveAspectRatio="xMidYMid meet"
              style={{
                width:'100%', height:'100%',
                transform:`scale(${zoom}) translate(${pan.x/zoom}px,${pan.y/zoom}px)`,
                transformOrigin:'center center',
                transition:dragging?'none':'transform 0.1s ease',
                display:'block'
              }}>
              <defs>
                <radialGradient id="h4"><stop offset="0%" stopColor="#dc2626" stopOpacity=".82"/><stop offset="45%" stopColor="#ef4444" stopOpacity=".3"/><stop offset="100%" stopColor="#dc2626" stopOpacity="0"/></radialGradient>
                <radialGradient id="h3"><stop offset="0%" stopColor="#ef4444" stopOpacity=".68"/><stop offset="45%" stopColor="#f97316" stopOpacity=".2"/><stop offset="100%" stopColor="#ef4444" stopOpacity="0"/></radialGradient>
                <radialGradient id="h2"><stop offset="0%" stopColor="#f97316" stopOpacity=".52"/><stop offset="45%" stopColor="#fbbf24" stopOpacity=".12"/><stop offset="100%" stopColor="#f97316" stopOpacity="0"/></radialGradient>
                <radialGradient id="h1"><stop offset="0%" stopColor="#22c55e" stopOpacity=".38"/><stop offset="100%" stopColor="#22c55e" stopOpacity="0"/></radialGradient>
                {HOSPITALS.map(h=>(<radialGradient key={h.id} id={`hg${h.id}`}><stop offset="0%" stopColor={SC(h.st)} stopOpacity=".2"/><stop offset="60%" stopColor={SC(h.st)} stopOpacity=".04"/><stop offset="100%" stopColor={SC(h.st)} stopOpacity="0"/></radialGradient>))}
                <filter id="blur20"><feGaussianBlur stdDeviation="20"/></filter>
                <filter id="blur5"><feGaussianBlur stdDeviation="5"/></filter>
                <filter id="glow2"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="shadow6"><feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="rgba(0,0,0,.7)"/></filter>
              </defs>

              {/* 深色背景底板 */}
              <rect x="0" y="0" width="560" height="580" fill="#010d22"/>
              {/* 内网格 */}
              <g stroke="rgba(0,242,255,.035)" strokeWidth=".5">
                {Array.from({length:15},(_,i)=><line key={`h${i}`} x1="0" y1={i*40} x2="560" y2={i*40}/>)}
                {Array.from({length:15},(_,i)=><line key={`v${i}`} x1={i*40} y1="0" x2={i*40} y2="580"/>)}
              </g>

              {/* ── 真实社区边界多边形 ── */}
              <g fill="rgba(34,197,94,.055)" stroke="rgba(34,197,94,.2)" strokeWidth=".45">{R1.map((d,i)=><path key={i} d={d}/>)}</g>
              <g fill="rgba(249,115,22,.07)" stroke="rgba(249,115,22,.22)" strokeWidth=".5">{R2.map((d,i)=><path key={i} d={d}/>)}</g>
              <g fill="rgba(239,68,68,.09)" stroke="rgba(239,68,68,.26)" strokeWidth=".55">{R3.map((d,i)=><path key={i} d={d}/>)}</g>
              <g fill="rgba(220,38,38,.13)" stroke="rgba(220,38,38,.36)" strokeWidth=".65">{R4.map((d,i)=><path key={i} d={d}/>)}</g>

              {/* 热力叠加 */}
              <g filter="url(#blur20)" opacity=".7">
                {TOWNS.map(t=>(<circle key={t.id} cx={t.x} cy={t.y} r={28+(t.pts/156)*44+(t.risk*4)} fill={`url(#h${t.risk})`}/>))}
              </g>

              {/* 医联体辐射圈 */}
              {HOSPITALS.map(h=>(<g key={h.id}>
                <circle cx={h.x} cy={h.y} r={h.r} fill={`url(#hg${h.id})`}/>
                <circle cx={h.x} cy={h.y} r={h.r} fill="none" stroke={SC(h.st)} strokeWidth=".6" strokeDasharray={`${h.r*.3} ${h.r*5}`} opacity=".28"
                  style={{transformOrigin:`${h.x}px ${h.y}px`,animation:`spin ${7+h.r*.04}s linear infinite`}}/>
              </g>))}

              {/* 医联体连线+流动粒子 */}
              {LINKS.map(([a,b],i)=>{
                const ha=HOSPITALS.find(h=>h.id===a)!;
                const hb=HOSPITALS.find(h=>h.id===b)!;
                return(<g key={i}>
                  <line x1={ha.x} y1={ha.y} x2={hb.x} y2={hb.y} stroke="rgba(0,242,255,.1)" strokeWidth=".6" strokeDasharray="3 7"/>
                  <circle r="1.5" fill="#22d3ee" opacity=".6"><animateMotion dur={`${2.6+i*.3}s`} repeatCount="indefinite" path={`M${ha.x},${ha.y} L${hb.x},${hb.y}`}/></circle>
                </g>);
              })}

              {/* 街镇中心点+标签 */}
              {TOWNS.map(t=>(<g key={t.id} transform={`translate(${t.x},${t.y})`} style={{cursor:'pointer'}} onClick={()=>setSel(sel?.id===t.id?null:t)}>
                <circle r={3.5+(t.pts/156)*2.5} fill={RC(t.risk)} opacity=".1">
                  <animate attributeName="r" values={`${3.5+(t.pts/156)*2.5};${7+(t.pts/156)*4};${3.5+(t.pts/156)*2.5}`} dur={`${2+t.risk*.25}s`} repeatCount="indefinite"/>
                  <animate attributeName="opacity" values=".1;0;.1" dur={`${2+t.risk*.25}s`} repeatCount="indefinite"/>
                </circle>
                <circle r="3" fill={RC(t.risk)} opacity=".88" filter="url(#glow2)"/>
                <circle r="1.2" fill="rgba(255,255,255,.55)"/>
                {t.pts>70&&(<g>
                  <rect x={-t.name.length*3.2-2} y="-17" width={t.name.length*6.4+4} height="11" rx="2.5" fill="rgba(1,8,20,.9)" stroke={`${RC(t.risk)}42`} strokeWidth=".5"/>
                  <text x="0" textAnchor="middle" y="-9" fill={RC(t.risk)} fontSize="6.5" fontWeight="900">{t.name}</text>
                </g>)}
              </g>))}

              {/* 医院标记 */}
              {HOSPITALS.map(h=>(<g key={h.id} transform={`translate(${h.x},${h.y})`} style={{cursor:'pointer'}} onMouseEnter={()=>setHov(h)} onMouseLeave={()=>setHov(null)}>
                <rect x="-6" y="-6" width="12" height="12" rx="3" fill="rgba(1,8,20,.92)" stroke={SC(h.st)} strokeWidth="1" opacity=".95"/>
                <text textAnchor="middle" y="3.5" fill={SC(h.st)} fontSize="7" fontWeight="900">✚</text>
                <circle cx="4.5" cy="-4.5" r="1.8" fill={SC(h.st)}>{h.st!=='normal'&&<animate attributeName="opacity" values="1;.3;1" dur="1.4s" repeatCount="indefinite"/>}</circle>
                <g transform="translate(8,-4)">
                  <rect x="-1.5" y="-7" width={h.abbr.length*6.5+4} height="9.5" rx="2.5" fill="rgba(1,8,20,.93)" stroke={`${SC(h.st)}32`} strokeWidth=".5"/>
                  <text y="0" fill="rgba(255,255,255,.82)" fontSize="6.5" fontWeight="900">{h.abbr}</text>
                </g>
                {hov?.id===h.id&&(<g transform="translate(-55,-88)">
                  <rect x="0" y="0" width="110" height="70" rx="6" fill="rgba(1,8,20,.97)" stroke={SC(h.st)} strokeWidth="1" filter="url(#shadow6)"/>
                  <rect x="0" y="0" width="110" height="2.5" rx="1.2" fill={SC(h.st)} opacity=".6"/>
                  <text x="8" y="15" fill={SC(h.st)} fontSize="6.5" fontWeight="900">{h.grp}</text>
                  <text x="8" y="28" fill="white" fontSize="9.5" fontWeight="900">{h.name}</text>
                  <text x="8" y="41" fill="#94a3b8" fontSize="6.5">床位{h.beds} · 占用{h.occ}%</text>
                  <rect x="8" y="47" width="94" height="3.5" rx="1.5" fill="rgba(255,255,255,.06)"/>
                  <rect x="8" y="47" width={h.occ*.94} height="3.5" rx="1.5" fill={SC(h.st)} opacity=".5"/>
                  <text x="8" y="62" fill={SC(h.st)} fontSize="6.5" fontWeight="700">● {h.st==='busy'?'高负荷运转':h.st==='warn'?'负荷预警中':'运营正常'}</text>
                </g>)}
              </g>))}

              {/* 选中街镇弹窗 */}
              {sel&&(<g transform="translate(280,290)">
                <rect x="-88" y="-52" width="176" height="104" rx="8" fill="rgba(1,8,20,.97)" stroke={RC(sel.risk)} strokeWidth="1.3" filter="url(#shadow6)"/>
                <rect x="-88" y="-52" width="176" height="3" rx="1.5" fill={RC(sel.risk)} opacity=".65"/>
                <text textAnchor="middle" y="-31" fill={RC(sel.risk)} fontSize="11" fontWeight="900">{sel.name}</text>
                <text textAnchor="middle" y="-13" fill="white" fontSize="15" fontWeight="900">{sel.pts} 名在管患者</text>
                <text textAnchor="middle" y="4" fill="#94a3b8" fontSize="7.5">责任医院: {sel.gp}</text>
                <text textAnchor="middle" y="18" fill="#64748b" fontSize="7">风险: {sel.risk>=4?'极高危':sel.risk>=3?'高危':sel.risk>=2?'中危':'低危'} · 达标率约{56+sel.risk*6}%</text>
                <text textAnchor="middle" y="32" fill="#3b82f6" fontSize="7" style={{cursor:'pointer'}} onClick={()=>setSel(null)}>✕ 关闭</text>
              </g>)}

              {/* 图例 */}
              <g transform="translate(8,560)">
                {[{c:'#dc2626',l:'极高危'},{c:'#ef4444',l:'高危'},{c:'#f97316',l:'中危'},{c:'#22c55e',l:'低危'},{c:'#22d3ee',l:'医联体'}].map((it,i)=>(<g key={i} transform={`translate(${i*70},0)`}><circle cx="4" cy="3.5" r="3" fill={it.c} opacity=".8"/><text x="10" y="7" fill="#64748b" fontSize="7" fontWeight="700">{it.l}</text></g>))}
              </g>
            </svg>
          </div>

          {/* 操作提示 */}
          <div style={{position:'absolute',left:10,bottom:10,fontSize:7,color:'rgba(34,211,238,.3)',fontWeight:700,letterSpacing:'0.1em',zIndex:6,pointerEvents:'none'}}>
            滚轮缩放 · 拖拽平移 · 点击街镇查看详情
          </div>
        </div>

        {/* 右栏 */}
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <div style={{...C,flex:1.4,padding:'9px 11px'}}>
            <T t="医联体实时负荷"/>
            <div style={{flex:1,overflowY:'auto',marginTop:5}}>
              {HOSPITALS.map(h=>(<div key={h.id} style={{marginBottom:4,padding:'4px 6px',borderRadius:5,background:'rgba(255,255,255,.02)',border:`1px solid ${SC(h.st)}1a`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
                  <span style={{fontSize:8,fontWeight:900,color:'#dde4ef',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:116}}>{h.name}</span>
                  <span style={{fontSize:6,fontWeight:900,color:SC(h.st),padding:'1px 3px',background:`${SC(h.st)}12`,borderRadius:2.5,flexShrink:0,whiteSpace:'nowrap'}}>{h.st==='busy'?'⚠高负荷':h.st==='warn'?'△预警':'●正常'}</span>
                </div>
                <div style={{height:2,background:'rgba(255,255,255,.05)',borderRadius:1,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${h.occ}%`,background:`linear-gradient(90deg,${SC(h.st)}38,${SC(h.st)})`,borderRadius:1}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:1}}>
                  <span style={{fontSize:6,color:'#475569'}}>床位{h.beds}</span>
                  <span style={{fontSize:6.5,fontWeight:900,color:SC(h.st)}}>{h.occ}%</span>
                </div>
              </div>))}
            </div>
          </div>
          <div style={{...C,flex:.55,padding:'9px 11px'}}>
            <T t="在管人群月度趋势"/>
            <div style={{flex:1,minHeight:0}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND} margin={{left:-26,right:4,top:3,bottom:2}}>
                  <defs>
                    <linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity=".24"/><stop offset="95%" stopColor="#22d3ee" stopOpacity="0"/></linearGradient>
                    <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity=".16"/><stop offset="95%" stopColor="#22c55e" stopOpacity="0"/></linearGradient>
                  </defs>
                  <XAxis dataKey="m" tick={{fill:'#475569',fontSize:6.5}} axisLine={false} tickLine={false}/>
                  <Area type="monotone" dataKey="p" stroke="#22d3ee" strokeWidth={1.6} fill="url(#tg1)" dot={false}/>
                  <Area type="monotone" dataKey="c" stroke="#22c55e" strokeWidth={1.2} fill="url(#tg2)" dot={false} strokeDasharray="4 2"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{...C,flex:.5,padding:'9px 11px'}}>
            <T t="今日医疗动态"/>
            <div style={{flex:1,overflowY:'auto',marginTop:4}}>
              {[
                {t:'三林镇热力持续红色预警',c:'#ef4444',time:'11:05'},
                {t:'仁济东院92%，启动分流预案',c:'#f97316',time:'10:48'},
                {t:'张江AI筛查发现3例高危',c:'#818cf8',time:'10:32'},
                {t:'航头达标率81%，全区第一',c:'#22c55e',time:'09:58'},
                {t:'周浦完成5例跨院会诊',c:'#22d3ee',time:'09:30'},
              ].map((it,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:5,marginBottom:4}}>
                <div style={{width:2.5,height:2.5,borderRadius:'50%',background:it.c,flexShrink:0,boxShadow:`0 0 4px ${it.c}`}}/>
                <span style={{fontSize:8,color:'#94a3b8',flex:1,lineHeight:1.3}}>{it.t}</span>
                <span style={{fontSize:6.5,color:'#475569',flexShrink:0}}>{it.time}</span>
              </div>))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{height:26,background:'rgba(1,9,20,.96)',borderTop:'1px solid rgba(0,242,255,.12)',display:'flex',alignItems:'center',overflow:'hidden',flexShrink:0,zIndex:10}}>
        <div style={{padding:'0 10px',borderRight:'1px solid rgba(0,242,255,.14)',fontSize:6.5,fontWeight:900,color:'#22d3ee',whiteSpace:'nowrap',textTransform:'uppercase',letterSpacing:'0.16em',flexShrink:0}}>实时播报</div>
        <div style={{overflow:'hidden',flex:1,maskImage:'linear-gradient(90deg,transparent,black 2%,black 98%,transparent)'}}>
          <div style={{display:'flex',gap:48,whiteSpace:'nowrap',animation:'marquee 36s linear infinite',paddingLeft:14}}>
            {[
              `[${time}] 三林镇热力持续红色，网格化随访预警已触发，建议全科医生加密随访`,
              `[${time}] 仁济东院今日接收转诊12例，床位92%，启动应急分流预案`,
              `[${time}] 航头镇慢病管理达标率81%，位列浦东第一，经验向全区推广`,
              `[${time}] 张江镇AI辅助筛查识别3例高危患者，已自动下发疾控指派任务`,
              `[${time}] 东方医联体绿色通道今日累计分流${REAL_CDC_POOL.length+1847}例，平均候诊10.4分钟`,
            ].map((t,i)=><span key={i} style={{fontSize:8.5,color:'#64748b'}}>{t}</span>)}
          </div>
        </div>
      </footer>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
};

const C:React.CSSProperties={background:'linear-gradient(145deg,rgba(0,18,42,.78),rgba(0,10,24,.88))',backdropFilter:'blur(20px)',border:'1px solid rgba(0,242,255,.1)',borderRadius:11,display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 3px 18px rgba(0,0,0,.4),inset 0 1px 0 rgba(0,242,255,.04)'};
const T:React.FC<{t:string}>=({t})=>(<div style={{display:'flex',alignItems:'center',gap:5,flexShrink:0}}><div style={{width:2,height:11,background:'linear-gradient(180deg,#22d3ee,#3b82f6)',borderRadius:1.5,boxShadow:'0 0 4px rgba(34,211,238,.5)'}}/><span style={{fontSize:8.5,fontWeight:900,color:'#22d3ee',textTransform:'uppercase',letterSpacing:'0.14em'}}>{t}</span></div>);

export default BigScreen;
