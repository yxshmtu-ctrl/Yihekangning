import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell } from 'recharts';
import { REAL_CDC_POOL } from '../data/realPatients';

// ── 浦东新区真实WGS84坐标投影后的街镇数据 ──
// 经纬度范围: lng[121.45-122.05] lat[30.85-31.62] → SVG(800×700)
const TOWNS = [
  // 城区街道（西部）
  {id:'ljz', name:'陆家嘴',   x:94,  y:346, pts:89,  risk:2, gp:'东方医院',    type:'S'},
  {id:'wf',  name:'潍坊新村', x:106, y:356, pts:72,  risk:2, gp:'公利医院',    type:'S'},
  {id:'yj',  name:'洋泾街道', x:121, y:353, pts:65,  risk:1, gp:'公利医院',    type:'S'},
  {id:'tq',  name:'塘桥街道', x:104, y:365, pts:58,  risk:1, gp:'东方医院',    type:'S'},
  {id:'sg',  name:'上钢新村', x:86,  y:371, pts:81,  risk:2, gp:'六院东院',    type:'S'},
  {id:'nm',  name:'南码头路', x:96,  y:378, pts:94,  risk:3, gp:'六院东院',    type:'S'},
  {id:'hd',  name:'沪东新村', x:132, y:350, pts:68,  risk:2, gp:'公利医院',    type:'S'},
  {id:'jy',  name:'金杨新村', x:144, y:341, pts:75,  risk:2, gp:'东方医院',    type:'S'},
  {id:'dm',  name:'东明路',   x:86,  y:387, pts:86,  risk:3, gp:'六院东院',    type:'S'},
  {id:'hm',  name:'花木街道', x:166, y:365, pts:102, risk:3, gp:'仁济东院',    type:'S'},
  {id:'zjd', name:'周家渡',   x:77,  y:386, pts:78,  risk:2, gp:'六院东院',    type:'S'},
  // 郊区镇
  {id:'sl',  name:'三林镇',   x:72,  y:407, pts:156, risk:4, gp:'六院东院',    type:'T'},
  {id:'zj',  name:'张江镇',   x:208, y:382, pts:124, risk:3, gp:'仁济东院',    type:'T'},
  {id:'jq',  name:'金桥镇',   x:168, y:335, pts:78,  risk:2, gp:'东方医院',    type:'T'},
  {id:'bc',  name:'北蔡镇',   x:132, y:401, pts:98,  risk:3, gp:'周浦医院',    type:'T'},
  {id:'kq',  name:'康桥镇',   x:132, y:442, pts:95,  risk:2, gp:'曙光医院东院',type:'T'},
  {id:'zp',  name:'周浦镇',   x:157, y:450, pts:108, risk:3, gp:'周浦医院',    type:'T'},
  {id:'ht',  name:'航头镇',   x:229, y:493, pts:87,  risk:2, gp:'浦东医院',    type:'T'},
  {id:'xc',  name:'新场镇',   x:284, y:502, pts:63,  risk:1, gp:'浦东医院',    type:'T'},
  {id:'dt',  name:'大团镇',   x:347, y:527, pts:45,  risk:1, gp:'浦东新区人民医院',type:'T'},
  {id:'xq',  name:'宣桥镇',   x:398, y:493, pts:71,  risk:2, gp:'浦东新区人民医院',type:'T'},
  {id:'zqz', name:'祝桥镇',   x:461, y:425, pts:55,  risk:1, gp:'浦东新区人民医院',type:'T'},
  {id:'cs',  name:'川沙新镇', x:334, y:382, pts:98,  risk:2, gp:'浦东新区人民医院',type:'T'},
  {id:'hn',  name:'惠南镇',   x:398, y:519, pts:142, risk:3, gp:'浦东医院',    type:'T'},
  {id:'tz',  name:'唐镇',     x:258, y:347, pts:52,  risk:1, gp:'仁济东院',    type:'T'},
  {id:'cl',  name:'曹路镇',   x:258, y:305, pts:67,  risk:2, gp:'第七人民医院',type:'T'},
  {id:'gx',  name:'高行镇',   x:170, y:253, pts:44,  risk:1, gp:'第七人民医院',type:'T'},
  {id:'gq',  name:'高桥镇',   x:144, y:219, pts:67,  risk:2, gp:'第七人民医院',type:'T'},
  {id:'wgq', name:'外高桥',   x:182, y:236, pts:38,  risk:1, gp:'第七人民医院',type:'S'},
];

// ── 医联体医院（真实WGS84坐标投影） ──
const HOSPITALS = [
  {id:'df',  name:'东方医院',         abbr:'东方',  x:88,  y:358, st:'busy',   occ:88, beds:1200, grp:'东方医联体',  r:72},
  {id:'q7',  name:'第七人民医院',     abbr:'七院',  x:145, y:228, st:'normal', occ:72, beds:800,  grp:'七院医联体',  r:62},
  {id:'gl',  name:'公利医院',         abbr:'公利',  x:115, y:348, st:'warn',   occ:81, beds:600,  grp:'公利医联体',  r:55},
  {id:'rj',  name:'仁济东院',         abbr:'仁济',  x:160, y:360, st:'busy',   occ:92, beds:1500, grp:'仁济医联体',  r:82},
  {id:'d6',  name:'六院东院',         abbr:'六院',  x:82,  y:390, st:'warn',   occ:84, beds:700,  grp:'六院医联体',  r:62},
  {id:'lh',  name:'龙华医院东院',     abbr:'龙华',  x:118, y:410, st:'normal', occ:67, beds:500,  grp:'龙华医联体',  r:50},
  {id:'sg2', name:'曙光医院东院',     abbr:'曙光',  x:130, y:452, st:'normal', occ:73, beds:600,  grp:'曙光医联体',  r:54},
  {id:'pdry',name:'浦东新区人民医院', abbr:'浦新',  x:350, y:390, st:'normal', occ:76, beds:900,  grp:'浦新医联体',  r:68},
  {id:'pd',  name:'浦东医院',         abbr:'浦东',  x:280, y:490, st:'normal', occ:65, beds:500,  grp:'浦东医联体',  r:58},
  {id:'zph', name:'周浦医院',         abbr:'周浦',  x:155, y:455, st:'normal', occ:70, beds:400,  grp:'周浦医联体',  r:50},
  {id:'dfn', name:'东方南院',         abbr:'东南',  x:200, y:510, st:'normal', occ:58, beds:300,  grp:'东方医联体',  r:42},
];

// 医联体连线
const LINKS=[['df','gl'],['df','rj'],['df','d6'],['q7','gl'],['rj','d6'],['lh','sg2'],['pd','zph'],['pd','pdry'],['dfn','pd']];

const SC=(s:string)=>s==='busy'?'#ef4444':s==='warn'?'#f97316':'#22c55e';
const RC=(r:number)=>r>=4?'#dc2626':r>=3?'#ef4444':r>=2?'#f97316':'#22c55e';

const TREND=Array.from({length:12},(_,i)=>({m:`${i+1}月`,p:820+i*40+Math.floor(Math.random()*20),c:64+i*1.5}));
const RADAR=[{s:'血压达标',A:72},{s:'血糖达标',A:68},{s:'随访完成',A:85},{s:'用药规律',A:61},{s:'生活方式',A:55},{s:'转诊及时',A:78}];

// ── 浦东新区精确轮廓 (WGS84坐标转换后) ──
// 西部城区复杂轮廓 + 东南方向延伸
const OUTLINE = `
M 60,290 C 65,270 72,252 82,238
L 92,220 C 100,205 115,192 130,185
L 148,178 C 160,172 175,168 190,166
L 208,164 C 222,162 238,161 252,162
L 268,164 C 282,166 295,170 308,176
L 325,184 C 338,192 350,202 362,214
L 378,228 C 390,240 400,254 410,268
L 422,284 C 432,298 440,314 448,330
L 458,348 C 466,364 472,380 478,396
L 486,414 C 492,430 496,446 500,462
L 504,478 C 508,494 510,510 510,526
L 508,540 C 506,554 500,566 490,574
L 478,580 C 464,586 448,588 432,586
L 415,582 C 398,577 382,568 366,558
L 350,548 C 334,538 318,526 302,514
L 285,502 C 268,490 250,478 232,468
L 215,458 C 198,449 180,441 162,434
L 144,428 C 126,422 108,418 90,416
L 74,415 C 60,414 48,412 40,408
L 30,402 C 22,394 18,384 18,372
L 18,358 C 18,344 22,330 28,318
L 36,306 C 44,296 52,292 60,290 Z
`;

const BigScreen:React.FC<{onClose:()=>void}>=({onClose})=>{
  const [time,setTime]=useState(new Date().toLocaleTimeString());
  const [hov,setHov]=useState<any>(null);
  const [sel,setSel]=useState<any>(null);
  const [tick,setTick]=useState(0);
  const canvasRef=useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    const t=setInterval(()=>{setTime(new Date().toLocaleTimeString());setTick(v=>(v+1)%300);},1000);
    return()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    const cv=canvasRef.current;if(!cv)return;
    const ctx=cv.getContext('2d')!;
    cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;
    const pts=Array.from({length:90},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.1+.4}));
    let af:number;
    const draw=()=>{
      ctx.clearRect(0,0,cv.width,cv.height);
      pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>cv.width)p.vx*=-1;if(p.y<0||p.y>cv.height)p.vy*=-1;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(0,242,255,.2)';ctx.fill();});
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<85){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(0,242,255,${.065*(1-d/85)})`;ctx.lineWidth=.4;ctx.stroke();}}));
      af=requestAnimationFrame(draw);};
    draw();return()=>cancelAnimationFrame(af);
  },[]);

  const COMPLIANCE=TOWNS.slice(0,9).sort((a,b)=>b.pts-a.pts).map(t=>({name:t.name.replace('街道','').replace('新村',''),v:Math.round(56+t.risk*6+(t.pts/156)*15),risk:t.risk}));

  return(
    <div style={{position:'fixed',inset:0,background:'#010912',zIndex:100,display:'flex',flexDirection:'column',fontFamily:'-apple-system,sans-serif',overflow:'hidden'}}>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.45,pointerEvents:'none'}}/>
      <div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,242,255,.011) 3px,rgba(0,242,255,.011) 4px)',pointerEvents:'none',zIndex:1}}/>
      <div style={{position:'absolute',top:0,left:'25%',width:'50%',height:2,background:'linear-gradient(90deg,transparent,rgba(0,242,255,.55),transparent)',zIndex:2}}/>

      {/* HEADER */}
      <header style={{height:56,background:'linear-gradient(180deg,rgba(0,242,255,.07),rgba(1,9,20,.96))',backdropFilter:'blur(24px)',borderBottom:'1px solid rgba(0,242,255,.2)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 22px',flexShrink:0,position:'relative',zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:11}}>
          <div style={{width:33,height:33,border:'1.5px solid #22d3ee',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#22d3ee',fontWeight:900,fontSize:16,boxShadow:'0 0 18px rgba(34,211,238,.5),inset 0 0 8px rgba(34,211,238,.1)'}}>✚</div>
          <div>
            <div style={{color:'#fff',fontWeight:900,fontSize:14.5,letterSpacing:'0.1em',textShadow:'0 0 18px rgba(34,211,238,.35)'}}>浦东新区医防融合指挥大屏</div>
            <div style={{color:'#22d3ee',fontSize:7,fontWeight:700,letterSpacing:'0.38em',opacity:.48,textTransform:'uppercase'}}>PUDONG NEW AREA · MEDICAL-PREVENTION INTEGRATED HUD v5.1</div>
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
            <div key={i} style={{textAlign:'center',padding:'4px 10px',background:`${it.c}0f`,border:`1px solid ${it.c}22`,borderRadius:7}}>
              <div style={{fontSize:6.5,color:'#64748b',fontWeight:900,textTransform:'uppercase',marginBottom:1,whiteSpace:'nowrap'}}>{it.l}</div>
              <div style={{fontSize:16,fontWeight:900,color:it.c,lineHeight:1}}>{it.v}<span style={{fontSize:7.5,marginLeft:2,opacity:.55}}>{it.u}</span></div>
            </div>
          ))}
          <div style={{color:'#22d3ee',fontWeight:900,fontSize:13,padding:'0 10px',borderLeft:'1px solid rgba(255,255,255,.06)',fontVariantNumeric:'tabular-nums'}}>{time}</div>
          <button onClick={onClose} style={{width:25,height:25,borderRadius:5,border:'1px solid rgba(255,255,255,.1)',background:'rgba(239,68,68,.08)',color:'rgba(255,255,255,.45)',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}}
            onMouseOver={e=>{e.currentTarget.style.background='rgba(239,68,68,.28)';e.currentTarget.style.color='#fff';}}
            onMouseOut={e=>{e.currentTarget.style.background='rgba(239,68,68,.08)';e.currentTarget.style.color='rgba(255,255,255,.45)';}}>✕</button>
        </div>
      </header>

      {/* BODY */}
      <div style={{flex:1,display:'grid',gridTemplateColumns:'256px 1fr 256px',gap:7,padding:7,overflow:'hidden',position:'relative',zIndex:2}}>

        {/* 左栏 */}
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          <div style={{...C,flex:1.5,padding:'11px 13px'}}>
            <T t="街镇慢病热力排行"/>
            <div style={{flex:1,overflowY:'auto',marginTop:7}}>
              {TOWNS.sort((a,b)=>b.pts-a.pts).map((t,i)=>(
                <div key={t.id} onClick={()=>setSel(sel?.id===t.id?null:t)}
                  style={{display:'flex',alignItems:'center',gap:6,marginBottom:5,padding:'4px 6px',borderRadius:6,background:sel?.id===t.id?`${RC(t.risk)}14`:'rgba(255,255,255,.022)',border:`1px solid ${RC(t.risk)}${sel?.id===t.id?'44':'15'}`,cursor:'pointer',transition:'all .18s'}}>
                  <div style={{width:15,height:15,borderRadius:3,background:`${RC(t.risk)}1a`,border:`1px solid ${RC(t.risk)}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:7.5,fontWeight:900,color:RC(t.risk),flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                      <span style={{fontSize:9.5,fontWeight:900,color:'#dde4ef',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name}</span>
                      <span style={{fontSize:8.5,fontWeight:900,color:RC(t.risk),flexShrink:0,marginLeft:4}}>{t.pts}</span>
                    </div>
                    <div style={{height:2,background:'rgba(255,255,255,.05)',borderRadius:1}}>
                      <div style={{height:'100%',width:`${(t.pts/156)*100}%`,background:`linear-gradient(90deg,${RC(t.risk)}44,${RC(t.risk)})`,borderRadius:1}}/>
                    </div>
                  </div>
                  <span style={{fontSize:6.5,fontWeight:900,padding:'1px 4px',borderRadius:3,background:`${RC(t.risk)}18`,color:RC(t.risk),flexShrink:0,whiteSpace:'nowrap'}}>
                    {t.risk>=4?'极高':t.risk>=3?'高危':t.risk>=2?'中危':'低危'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{...C,flex:.85,padding:'11px 13px'}}>
            <T t="健康管理六维评估"/>
            <div style={{flex:1,minHeight:0}}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={RADAR}>
                  <PolarGrid stroke="rgba(0,242,255,.1)"/>
                  <PolarAngleAxis dataKey="s" tick={{fill:'#475569',fontSize:7.5,fontWeight:700}}/>
                  <Radar dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={.11} strokeWidth={1.5}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 中央地图 */}
        <div style={{position:'relative',overflow:'hidden',borderRadius:12,border:'1px solid rgba(0,242,255,.1)',background:'linear-gradient(145deg,rgba(0,15,38,.9),rgba(0,8,22,.95))'}}>
          {/* 四角装饰 */}
          {[[0,0,1,0,0,1],[0,1,1,0,0,0],[1,0,0,0,0,1],[1,1,0,0,0,0]].map(([b,r,bt,bb,bl,br],i)=>(
            <div key={i} style={{position:'absolute',...(b?{bottom:10}:{top:10}),...(r?{right:10}:{left:10}),width:18,height:18,
              borderTop:bt?'2px solid rgba(0,242,255,.4)':'none',borderBottom:bb?'2px solid rgba(0,242,255,.4)':'none',
              borderLeft:bl?'2px solid rgba(0,242,255,.4)':'none',borderRight:br?'2px solid rgba(0,242,255,.4)':'none',zIndex:5}}/>
          ))}
          {/* 标题 */}
          <div style={{position:'absolute',top:14,left:'50%',transform:'translateX(-50%)',zIndex:6,textAlign:'center',pointerEvents:'none'}}>
            <div style={{fontSize:11,fontWeight:900,color:'rgba(34,211,238,.7)',letterSpacing:'0.3em',textTransform:'uppercase',textShadow:'0 0 12px rgba(34,211,238,.4)'}}>浦东新区 · 29个街镇全域可视</div>
          </div>

          <svg viewBox="0 0 560 620" style={{width:'100%',height:'100%',display:'block'}}>
            <defs>
              {/* 热力渐变 4级 */}
              <radialGradient id="h4"><stop offset="0%" stopColor="#dc2626" stopOpacity=".8"/><stop offset="55%" stopColor="#ef4444" stopOpacity=".25"/><stop offset="100%" stopColor="#dc2626" stopOpacity="0"/></radialGradient>
              <radialGradient id="h3"><stop offset="0%" stopColor="#ef4444" stopOpacity=".65"/><stop offset="55%" stopColor="#f97316" stopOpacity=".18"/><stop offset="100%" stopColor="#ef4444" stopOpacity="0"/></radialGradient>
              <radialGradient id="h2"><stop offset="0%" stopColor="#f97316" stopOpacity=".5"/><stop offset="55%" stopColor="#fbbf24" stopOpacity=".12"/><stop offset="100%" stopColor="#f97316" stopOpacity="0"/></radialGradient>
              <radialGradient id="h1"><stop offset="0%" stopColor="#22c55e" stopOpacity=".38"/><stop offset="100%" stopColor="#22c55e" stopOpacity="0"/></radialGradient>
              {/* 地图底色渐变 */}
              <linearGradient id="mg" x1="0" y1="0" x2=".3" y2="1">
                <stop offset="0%" stopColor="rgba(0,40,80,.12)"/>
                <stop offset="100%" stopColor="rgba(0,15,40,.06)"/>
              </linearGradient>
              {/* 医联体渐变 */}
              {HOSPITALS.map(h=>(
                <radialGradient key={h.id} id={`hg${h.id}`}>
                  <stop offset="0%" stopColor={SC(h.st)} stopOpacity=".2"/>
                  <stop offset="60%" stopColor={SC(h.st)} stopOpacity=".05"/>
                  <stop offset="100%" stopColor={SC(h.st)} stopOpacity="0"/>
                </radialGradient>
              ))}
              <filter id="blur20"><feGaussianBlur stdDeviation="20"/></filter>
              <filter id="blur10"><feGaussianBlur stdDeviation="10"/></filter>
              <filter id="blur4"><feGaussianBlur stdDeviation="4"/></filter>
              <filter id="glow3"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="shadow6"><feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="rgba(0,0,0,.6)"/></filter>
              <clipPath id="mc"><path d={OUTLINE}/></clipPath>
            </defs>

            {/* 3D底层阴影 */}
            <path d={OUTLINE} transform="translate(5,7)" fill="rgba(0,0,0,.5)" filter="url(#blur10)"/>
            <path d={OUTLINE} transform="translate(3,4)" fill="rgba(0,0,0,.3)" filter="url(#blur4)"/>

            {/* 地图主体底色 */}
            <path d={OUTLINE} fill="rgba(0,18,45,.9)"/>
            <path d={OUTLINE} fill="url(#mg)"/>

            {/* 内部网格（裁剪在地图内） */}
            <g clipPath="url(#mc)">
              <g stroke="rgba(0,242,255,.04)" strokeWidth=".5">
                {Array.from({length:16},(_,i)=><line key={`h${i}`} x1="0" y1={i*40} x2="600" y2={i*40}/>)}
                {Array.from({length:16},(_,i)=><line key={`v${i}`} x1={i*40} y1="0" x2={i*40} y2="650"/>)}
              </g>
              {/* 等高线效果 */}
              <g stroke="rgba(0,242,255,.02)" strokeWidth="1" fill="none">
                <ellipse cx="120" cy="380" rx="80" ry="60"/>
                <ellipse cx="120" cy="380" rx="110" ry="85"/>
                <ellipse cx="200" cy="420" rx="100" ry="70"/>
              </g>
            </g>

            {/* 热力层（在地图内渲染） */}
            <g filter="url(#blur20)" clipPath="url(#mc)">
              {TOWNS.map(t=>(
                <circle key={t.id} cx={t.x} cy={t.y}
                  r={38+(t.pts/156)*55+(t.risk*6)}
                  fill={`url(#h${t.risk})`}/>
              ))}
            </g>

            {/* 地图边框（外发光） */}
            <path d={OUTLINE} fill="none" stroke="rgba(0,242,255,.08)" strokeWidth="10"/>
            <path d={OUTLINE} fill="none" stroke="rgba(0,242,255,.4)" strokeWidth="1.2" filter="url(#glow3)"/>
            {/* 顶部高光 */}
            <path d={OUTLINE} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="2" strokeDasharray="1 3"/>

            {/* 医联体辐射圈 */}
            {HOSPITALS.map(h=>(
              <g key={h.id}>
                <circle cx={h.x} cy={h.y} r={h.r} fill={`url(#hg${h.id})`}/>
                <circle cx={h.x} cy={h.y} r={h.r} fill="none" stroke={SC(h.st)} strokeWidth=".7" strokeDasharray={`${h.r*.35} ${h.r*5.5}`} opacity=".3"
                  style={{transformOrigin:`${h.x}px ${h.y}px`,animation:`spin ${8+h.r*.04}s linear infinite`}}/>
                <circle cx={h.x} cy={h.y} r={h.r*.6} fill="none" stroke={SC(h.st)} strokeWidth=".4" strokeDasharray="2 7" opacity=".18"/>
              </g>
            ))}

            {/* 医联体连线（含流动粒子） */}
            {LINKS.map(([a,b],i)=>{
              const ha=HOSPITALS.find(h=>h.id===a)!;
              const hb=HOSPITALS.find(h=>h.id===b)!;
              return(
                <g key={i}>
                  <line x1={ha.x} y1={ha.y} x2={hb.x} y2={hb.y} stroke="rgba(0,242,255,.09)" strokeWidth=".7" strokeDasharray="3 7"/>
                  <circle r="1.8" fill="#22d3ee" opacity=".7">
                    <animateMotion dur={`${2.8+i*.35}s`} repeatCount="indefinite" path={`M${ha.x},${ha.y} L${hb.x},${hb.y}`}/>
                  </circle>
                </g>
              );
            })}

            {/* 街镇点位 */}
            {TOWNS.map(t=>(
              <g key={t.id} transform={`translate(${t.x},${t.y})`} style={{cursor:'pointer'}}
                onClick={()=>setSel(sel?.id===t.id?null:t)}>
                {/* 脉冲动画 */}
                <circle r={5+(t.pts/156)*3.5} fill={RC(t.risk)} opacity=".12">
                  <animate attributeName="r" values={`${5+(t.pts/156)*3.5};${10+(t.pts/156)*6};${5+(t.pts/156)*3.5}`} dur={`${2.5+t.risk*.3}s`} repeatCount="indefinite"/>
                  <animate attributeName="opacity" values=".12;0;.12" dur={`${2.5+t.risk*.3}s`} repeatCount="indefinite"/>
                </circle>
                {/* 核心点 */}
                <circle r="4" fill={RC(t.risk)} opacity=".88" filter="url(#glow3)"/>
                <circle r="2" fill="rgba(255,255,255,.5)"/>
                {/* 名称标签（仅镇级别显示，街道省略以防拥挤） */}
                {(t.type==='T' || ['ljz','nm','dm','sl','hm'].includes(t.id)) && (
                  <g>
                    <rect x={-t.name.length*3.8-3} y="-22" width={t.name.length*7.6+6} height="13" rx="3.5" fill="rgba(1,8,20,.92)" stroke={`${RC(t.risk)}48`} strokeWidth=".7"/>
                    <text x="0" textAnchor="middle" y="-12" fill={RC(t.risk)} fontSize="8" fontWeight="900">{t.name}</text>
                  </g>
                )}
                {/* 患者数气泡 */}
                {t.pts>90&&(
                  <g>
                    <circle cx="8" cy="-8" r="8" fill={`${RC(t.risk)}22`} stroke={RC(t.risk)} strokeWidth=".7"/>
                    <text x="8" y="-4" textAnchor="middle" fill={RC(t.risk)} fontSize="6.5" fontWeight="900">{t.pts}</text>
                  </g>
                )}
              </g>
            ))}

            {/* 医院标记 */}
            {HOSPITALS.map(h=>(
              <g key={h.id} transform={`translate(${h.x},${h.y})`} style={{cursor:'pointer'}}
                onMouseEnter={()=>setHov(h)} onMouseLeave={()=>setHov(null)}>
                <rect x="-7.5" y="-7.5" width="15" height="15" rx="3.5" fill="rgba(1,8,20,.92)" stroke={SC(h.st)} strokeWidth="1.2" opacity=".95"/>
                <text textAnchor="middle" y="4.5" fill={SC(h.st)} fontSize="8.5" fontWeight="900">✚</text>
                {/* 状态灯 */}
                <circle cx="6" cy="-6" r="2.2" fill={SC(h.st)}>
                  {h.st!=='normal'&&<animate attributeName="opacity" values="1;.3;1" dur="1.4s" repeatCount="indefinite"/>}
                </circle>
                {/* 简称标签 */}
                <g transform="translate(10,-5)">
                  <rect x="-2" y="-8" width={h.abbr.length*7.5+5} height="11" rx="3" fill="rgba(1,8,20,.93)" stroke={`${SC(h.st)}38`} strokeWidth=".6"/>
                  <text y="0" fill="rgba(255,255,255,.86)" fontSize="7.5" fontWeight="900">{h.abbr}</text>
                </g>
                {/* Hover 卡片 */}
                {hov?.id===h.id&&(
                  <g transform="translate(-68,-102)">
                    <rect x="0" y="0" width="136" height="82" rx="8" fill="rgba(1,8,20,.97)" stroke={SC(h.st)} strokeWidth="1.2" filter="url(#shadow6)"/>
                    <rect x="0" y="0" width="136" height="3" rx="1.5" fill={SC(h.st)} opacity=".65"/>
                    <text x="10" y="18" fill={SC(h.st)} fontSize="7.5" fontWeight="900">{h.grp}</text>
                    <text x="10" y="34" fill="white" fontSize="11" fontWeight="900">{h.name}</text>
                    <text x="10" y="50" fill="#94a3b8" fontSize="7.5">床位 {h.beds}  ·  占用 {h.occ}%</text>
                    <rect x="10" y="57" width="116" height="4" rx="2" fill="rgba(255,255,255,.06)"/>
                    <rect x="10" y="57" width={h.occ*1.16} height="4" rx="2" fill={SC(h.st)} opacity=".55"/>
                    <text x="10" y="74" fill={SC(h.st)} fontSize="7.5" fontWeight="700">● {h.st==='busy'?'高负荷运转':h.st==='warn'?'负荷预警中':'运营正常'}</text>
                  </g>
                )}
              </g>
            ))}

            {/* 选中街镇弹窗 */}
            {sel&&(
              <g transform="translate(280,310)">
                <rect x="-105" y="-60" width="210" height="118" rx="10" fill="rgba(1,8,20,.97)" stroke={RC(sel.risk)} strokeWidth="1.5" filter="url(#shadow6)"/>
                <rect x="-105" y="-60" width="210" height="4" rx="2" fill={RC(sel.risk)} opacity=".7"/>
                <text textAnchor="middle" y="-38" fill={RC(sel.risk)} fontSize="12.5" fontWeight="900">{sel.name}</text>
                <text textAnchor="middle" y="-18" fill="white" fontSize="17" fontWeight="900">{sel.pts} 名在管患者</text>
                <text textAnchor="middle" y="0" fill="#94a3b8" fontSize="9">责任医院: {sel.gp}</text>
                <text textAnchor="middle" y="16" fill="#64748b" fontSize="8.5">
                  风险: {sel.risk>=4?'极高危':sel.risk>=3?'高危':sel.risk>=2?'中危':'低危'}  ·  类型: {sel.type==='T'?'建制镇':'街道'}
                </text>
                <text textAnchor="middle" y="32" fill="#475569" fontSize="8">达标率约 {56+sel.risk*6}%  ·  共{sel.pts}人在管</text>
                <text textAnchor="middle" y="48" fill="#3b82f6" fontSize="8" style={{cursor:'pointer'}} onClick={()=>setSel(null)}>✕ 关闭</text>
              </g>
            )}

            {/* 图例 */}
            <g transform="translate(14,588)">
              {[{c:'#dc2626',l:'极高危'},{c:'#ef4444',l:'高危'},{c:'#f97316',l:'中危'},{c:'#22c55e',l:'低危'},{c:'#22d3ee',l:'医联体'}].map((it,i)=>(
                <g key={i} transform={`translate(${i*76},0)`}>
                  <circle cx="5" cy="4" r="3.5" fill={it.c} opacity=".8"/>
                  <text x="13" y="8" fill="#64748b" fontSize="7.5" fontWeight="700">{it.l}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* 右栏 */}
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          <div style={{...C,flex:1.5,padding:'11px 13px'}}>
            <T t="医联体实时负荷"/>
            <div style={{flex:1,overflowY:'auto',marginTop:7}}>
              {HOSPITALS.map(h=>(
                <div key={h.id} style={{marginBottom:5,padding:'5px 7px',borderRadius:6,background:'rgba(255,255,255,.022)',border:`1px solid ${SC(h.st)}1e`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2.5}}>
                    <span style={{fontSize:9,fontWeight:900,color:'#dde4ef',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:128}}>{h.name}</span>
                    <span style={{fontSize:7,fontWeight:900,color:SC(h.st),padding:'1px 4px',background:`${SC(h.st)}14`,borderRadius:3,flexShrink:0,whiteSpace:'nowrap'}}>
                      {h.st==='busy'?'⚠ 高负荷':h.st==='warn'?'△ 预警':'● 正常'}
                    </span>
                  </div>
                  <div style={{height:2.5,background:'rgba(255,255,255,.05)',borderRadius:1.5,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${h.occ}%`,background:`linear-gradient(90deg,${SC(h.st)}44,${SC(h.st)})`,borderRadius:1.5}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:1.5}}>
                    <span style={{fontSize:6.5,color:'#475569'}}>床位{h.beds}</span>
                    <span style={{fontSize:7,fontWeight:900,color:SC(h.st)}}>{h.occ}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{...C,flex:.65,padding:'11px 13px'}}>
            <T t="在管人群月度趋势"/>
            <div style={{flex:1,minHeight:0}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND} margin={{left:-24,right:5,top:4,bottom:2}}>
                  <defs>
                    <linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity=".28"/><stop offset="95%" stopColor="#22d3ee" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity=".18"/><stop offset="95%" stopColor="#22c55e" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="m" tick={{fill:'#475569',fontSize:7}} axisLine={false} tickLine={false}/>
                  <Area type="monotone" dataKey="p" stroke="#22d3ee" strokeWidth={1.8} fill="url(#tg1)" dot={false}/>
                  <Area type="monotone" dataKey="c" stroke="#22c55e" strokeWidth={1.3} fill="url(#tg2)" dot={false} strokeDasharray="4 2"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{...C,flex:.5,padding:'11px 13px'}}>
            <T t="今日医疗动态"/>
            <div style={{flex:1,overflowY:'auto',marginTop:6}}>
              {[
                {t:'三林镇热力红色预警',c:'#ef4444',time:'11:05'},
                {t:'仁济东院床位92%，启动分流',c:'#f97316',time:'10:48'},
                {t:'张江AI筛查发现3例高危',c:'#818cf8',time:'10:32'},
                {t:'航头镇达标率81%，全区第一',c:'#22c55e',time:'09:58'},
                {t:'周浦医院完成5例跨院会诊',c:'#22d3ee',time:'09:30'},
              ].map((it,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:5,padding:'4px 0'}}>
                  <div style={{width:3,height:3,borderRadius:'50%',background:it.c,flexShrink:0,boxShadow:`0 0 5px ${it.c}`}}/>
                  <span style={{fontSize:9,color:'#94a3b8',flex:1,lineHeight:1.3}}>{it.t}</span>
                  <span style={{fontSize:7,color:'#475569',flexShrink:0}}>{it.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{height:30,background:'rgba(1,9,20,.96)',borderTop:'1px solid rgba(0,242,255,.12)',display:'flex',alignItems:'center',overflow:'hidden',flexShrink:0,zIndex:10}}>
        <div style={{padding:'0 11px',borderRight:'1px solid rgba(0,242,255,.16)',fontSize:7,fontWeight:900,color:'#22d3ee',whiteSpace:'nowrap',textTransform:'uppercase',letterSpacing:'0.18em',flexShrink:0}}>实时播报</div>
        <div style={{overflow:'hidden',flex:1,maskImage:'linear-gradient(90deg,transparent,black 2%,black 98%,transparent)'}}>
          <div style={{display:'flex',gap:48,whiteSpace:'nowrap',animation:'marquee 38s linear infinite',paddingLeft:18}}>
            {[
              `[${time}] 三林镇热力持续红色，网格化随访预警已触发，建议全科医生加密随访`,
              `[${time}] 仁济东院今日接收转诊12例，床位占用率92%，启动应急分流预案`,
              `[${time}] 航头镇慢病管理达标率81%，位列浦东29个街镇第一，经验向全区推广`,
              `[${time}] 张江镇AI辅助筛查识别3例新增高危患者，自动下发疾控指派任务`,
              `[${time}] 东方医联体绿色通道今日累计分流老年患者${REAL_CDC_POOL.length+1847}例，平均候诊10.4分钟`,
            ].map((t,i)=><span key={i} style={{fontSize:9,color:'#64748b'}}>{t}</span>)}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
      `}</style>
    </div>
  );
};

const C:React.CSSProperties={
  background:'linear-gradient(145deg,rgba(0,18,42,.78),rgba(0,10,24,.88))',
  backdropFilter:'blur(20px)',
  border:'1px solid rgba(0,242,255,.1)',
  borderRadius:12,
  display:'flex',
  flexDirection:'column',
  overflow:'hidden',
  boxShadow:'0 4px 20px rgba(0,0,0,.4),inset 0 1px 0 rgba(0,242,255,.05)',
};

const T:React.FC<{t:string}>=({t})=>(
  <div style={{display:'flex',alignItems:'center',gap:5,flexShrink:0}}>
    <div style={{width:2.5,height:12,background:'linear-gradient(180deg,#22d3ee,#3b82f6)',borderRadius:2,boxShadow:'0 0 5px rgba(34,211,238,.5)'}}/>
    <span style={{fontSize:9,fontWeight:900,color:'#22d3ee',textTransform:'uppercase',letterSpacing:'0.16em'}}>{t}</span>
  </div>
);

export default BigScreen;
