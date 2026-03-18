import React, { useState, useMemo } from 'react';
import { Patient, PatientStatus } from '../types';
import { REAL_CDC_POOL, REAL_GP_VERIFY_POOL, REAL_GP_FOLLOWUP_POOL, REAL_GP_REFERRAL_POOL, REAL_SPEC_POOL } from '../data/realPatients';

// 合并所有真实患者数据，去重
const ALL_PATIENTS: Patient[] = (() => {
  const seen = new Set<string>();
  const pools = [...REAL_CDC_POOL, ...REAL_GP_VERIFY_POOL, ...REAL_GP_FOLLOWUP_POOL, ...REAL_GP_REFERRAL_POOL, ...REAL_SPEC_POOL];
  return pools.filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
})();

const PAGE_SIZE = 12;

const SC = (s: PatientStatus) => {
  switch(s) {
    case PatientStatus.CRITICAL: return { bg:'rgba(239,68,68,.15)', color:'#f87171', label:'危急' };
    case PatientStatus.WARNING: return { bg:'rgba(245,158,11,.15)', color:'#fbbf24', label:'预警' };
    case PatientStatus.FOLLOW_UP: return { bg:'rgba(59,130,246,.15)', color:'#60a5fa', label:'随访中' };
    case PatientStatus.PENDING_REFERRAL: return { bg:'rgba(249,115,22,.15)', color:'#fb923c', label:'待转诊' };
    case PatientStatus.PENDING_VERIFICATION: return { bg:'rgba(139,92,246,.15)', color:'#a78bfa', label:'待核实' };
    case PatientStatus.PENDING_ASSIGNMENT: return { bg:'rgba(100,116,139,.15)', color:'#94a3b8', label:'待派发' };
    default: return { bg:'rgba(16,185,129,.15)', color:'#34d399', label:'正常' };
  }
};

const BP_ALERT = (sys: number) => sys > 160 ? '#ef4444' : sys > 140 ? '#f97316' : '#34d399';
const GL_ALERT = (g: number) => g > 10 ? '#ef4444' : g > 7 ? '#f97316' : '#34d399';

interface PatientListProps { onSelect: (p: Patient) => void; }

const PatientList: React.FC<PatientListProps> = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'card'|'table'>('card');

  const filtered = useMemo(() => {
    return ALL_PATIENTS.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !search || p.name.includes(search) || p.idCard?.includes(search) || p.district?.includes(search) || p.communityGP?.includes(search);
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchRisk = filterRisk === 'all'
        || (filterRisk === 'high' && (p.metrics[0]?.bp_sys > 160 || p.metrics[0]?.glucose > 10))
        || (filterRisk === 'mid' && (p.metrics[0]?.bp_sys > 140 || p.metrics[0]?.glucose > 7))
        || (filterRisk === 'normal' && p.metrics[0]?.bp_sys <= 140 && p.metrics[0]?.glucose <= 7);
      return matchSearch && matchStatus && matchRisk;
    });
  }, [search, filterStatus, filterRisk]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  // 统计
  const stats = useMemo(() => ({
    total: ALL_PATIENTS.length,
    critical: ALL_PATIENTS.filter(p => p.metrics[0]?.bp_sys > 160 || p.metrics[0]?.glucose > 10).length,
    followup: ALL_PATIENTS.filter(p => p.status === PatientStatus.FOLLOW_UP).length,
    referral: ALL_PATIENTS.filter(p => p.status === PatientStatus.PENDING_REFERRAL).length,
  }), []);

  return (
    <div style={{paddingBottom:90}}>

      {/* 页头 */}
      <div style={{marginBottom:18}}>
        <h2 style={{fontSize:22,fontWeight:900,color:'#fff',margin:'0 0 4px',letterSpacing:'-0.02em'}}>全域健康档案库</h2>
        <p style={{fontSize:7,color:'#64748b',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.3em',margin:0}}>INTEGRATED PATIENT HEALTH RECORD SYSTEM · {ALL_PATIENTS.length} RECORDS</p>
      </div>

      {/* 统计卡片 */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        {[
          {l:'在管总人数',v:stats.total,u:'人',c:'#22d3ee',icon:'👥'},
          {l:'高危预警',v:stats.critical,u:'例',c:'#ef4444',icon:'⚠️'},
          {l:'随访管理中',v:stats.followup,u:'人',c:'#60a5fa',icon:'🩺'},
          {l:'待发起转诊',v:stats.referral,u:'单',c:'#f97316',icon:'📤'},
        ].map((it,i)=>(
          <div key={i} style={{background:'linear-gradient(135deg,rgba(0,18,42,.7),rgba(0,10,24,.8))',border:`1px solid ${it.c}20`,borderRadius:14,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,boxShadow:`0 0 20px ${it.c}08`}}>
            <div style={{width:38,height:38,borderRadius:10,background:`${it.c}12`,border:`1px solid ${it.c}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{it.icon}</div>
            <div>
              <p style={{fontSize:6.5,color:'#64748b',fontWeight:900,textTransform:'uppercase',margin:'0 0 2px',letterSpacing:'0.15em'}}>{it.l}</p>
              <p style={{fontSize:20,fontWeight:900,color:it.c,margin:0,lineHeight:1}}>{it.v}<span style={{fontSize:8,marginLeft:2,opacity:.6}}>{it.u}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* 搜索+筛选+视图切换 */}
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {/* 搜索框 */}
        <div style={{flex:1,minWidth:200,display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:12,padding:'8px 14px'}}>
          <span style={{color:'#475569',fontSize:14}}>🔍</span>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="搜索姓名、社区、责任医生..."
            style={{background:'transparent',border:'none',outline:'none',color:'#fff',fontSize:11,width:'100%'}}/>
          {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:'#475569',cursor:'pointer',fontSize:14,padding:0}}>✕</button>}
        </div>

        {/* 状态筛选 */}
        <div style={{display:'flex',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',borderRadius:12,padding:3,gap:2}}>
          {[{v:'all',l:'全部'},{v:PatientStatus.FOLLOW_UP,l:'随访中'},{v:PatientStatus.PENDING_REFERRAL,l:'待转诊'},{v:PatientStatus.PENDING_VERIFICATION,l:'待核实'}].map(opt=>(
            <button key={opt.v} onClick={()=>{setFilterStatus(opt.v);setPage(1);}}
              style={{padding:'5px 10px',borderRadius:9,fontSize:8,fontWeight:900,border:'none',cursor:'pointer',background:filterStatus===opt.v?'#2563eb':'transparent',color:filterStatus===opt.v?'#fff':'#64748b',whiteSpace:'nowrap',transition:'all .15s'}}>
              {opt.l}
            </button>
          ))}
        </div>

        {/* 风险筛选 */}
        <div style={{display:'flex',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',borderRadius:12,padding:3,gap:2}}>
          {[{v:'all',l:'所有风险'},{v:'high',l:'高危',c:'#ef4444'},{v:'mid',l:'中危',c:'#f97316'},{v:'normal',l:'正常',c:'#34d399'}].map(opt=>(
            <button key={opt.v} onClick={()=>{setFilterRisk(opt.v);setPage(1);}}
              style={{padding:'5px 10px',borderRadius:9,fontSize:8,fontWeight:900,border:'none',cursor:'pointer',background:filterRisk===opt.v?(opt.c||'#2563eb'):'transparent',color:filterRisk===opt.v?'#fff':'#64748b',whiteSpace:'nowrap',transition:'all .15s'}}>
              {opt.l}
            </button>
          ))}
        </div>

        {/* 视图切换 */}
        <div style={{display:'flex',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',borderRadius:12,padding:3,gap:2}}>
          {([['card','卡片','⊞'],['table','列表','☰']] as const).map(([v,l,icon])=>(
            <button key={v} onClick={()=>setViewMode(v)}
              style={{padding:'5px 10px',borderRadius:9,fontSize:8,fontWeight:900,border:'none',cursor:'pointer',background:viewMode===v?'rgba(255,255,255,.1)':'transparent',color:viewMode===v?'#fff':'#64748b',display:'flex',alignItems:'center',gap:4}}>
              <span>{icon}</span>{l}
            </button>
          ))}
        </div>
      </div>

      {/* 结果数 */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <p style={{fontSize:8,color:'#64748b',fontWeight:900,textTransform:'uppercase',margin:0}}>
          找到 <span style={{color:'#22d3ee'}}>{filtered.length}</span> 条记录 · 第 {page}/{totalPages} 页
        </p>
      </div>

      {/* 卡片视图 */}
      {viewMode === 'card' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(440px,1fr))',gap:10}}>
          {paged.map(p => {
            const sc = SC(p.status);
            const m = p.metrics[0];
            return (
              <div key={p.id} onClick={()=>onSelect(p)}
                style={{background:'linear-gradient(135deg,rgba(0,18,42,.7),rgba(0,10,24,.85))',border:'1px solid rgba(255,255,255,.07)',borderRadius:18,padding:'14px 16px',cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:12,boxShadow:'0 2px 12px rgba(0,0,0,.3)'}}
                onMouseOver={e=>{(e.currentTarget as HTMLDivElement).style.border='1px solid rgba(59,130,246,.3)';(e.currentTarget as HTMLDivElement).style.transform='translateY(-1px)';}}
                onMouseOut={e=>{(e.currentTarget as HTMLDivElement).style.border='1px solid rgba(255,255,255,.07)';(e.currentTarget as HTMLDivElement).style.transform='translateY(0)';}}>

                {/* 头像 */}
                <div style={{width:44,height:44,borderRadius:13,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
                  {p.gender==='男'?'👴':'👵'}
                </div>

                {/* 基本信息 */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                    <span style={{fontSize:14,fontWeight:900,color:'#fff'}}>{p.name}</span>
                    <span style={{fontSize:7,fontWeight:900,padding:'2px 6px',borderRadius:5,background:sc.bg,color:sc.color}}>{sc.label}</span>
                    <span style={{fontSize:7,color:'#475569',fontWeight:700}}>{p.age}岁 · {p.gender}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                    <span style={{fontSize:7.5,color:'#64748b'}}>📍{p.district}</span>
                    <span style={{fontSize:7.5,color:'#64748b'}}>👨‍⚕️{p.communityGP}</span>
                  </div>
                  {/* 疾病标签 */}
                  <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                    {p.conditions.slice(0,3).map((c,i)=>(
                      <span key={i} style={{fontSize:6.5,padding:'1px 6px',borderRadius:4,background:'rgba(59,130,246,.1)',border:'1px solid rgba(59,130,246,.18)',color:'#93c5fd'}}>{c}</span>
                    ))}
                    {p.conditions.length>3&&<span style={{fontSize:6.5,color:'#475569'}}>+{p.conditions.length-3}</span>}
                  </div>
                </div>

                {/* 指标数据 */}
                <div style={{display:'flex',gap:10,flexShrink:0,borderLeft:'1px solid rgba(255,255,255,.05)',paddingLeft:12}}>
                  <div style={{textAlign:'center'}}>
                    <p style={{fontSize:6,color:'#64748b',fontWeight:900,textTransform:'uppercase',margin:'0 0 2px',letterSpacing:'0.1em'}}>收缩压</p>
                    <p style={{fontSize:14,fontWeight:900,color:BP_ALERT(m?.bp_sys||0),margin:0}}>{m?.bp_sys||'—'}</p>
                    <p style={{fontSize:6,color:'#475569',margin:0}}>/{m?.bp_dia||'—'}</p>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <p style={{fontSize:6,color:'#64748b',fontWeight:900,textTransform:'uppercase',margin:'0 0 2px',letterSpacing:'0.1em'}}>血糖</p>
                    <p style={{fontSize:14,fontWeight:900,color:GL_ALERT(m?.glucose||0),margin:0}}>{m?.glucose||'—'}</p>
                    <p style={{fontSize:6,color:'#475569',margin:0}}>mmol/L</p>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <p style={{fontSize:6,color:'#64748b',fontWeight:900,textTransform:'uppercase',margin:'0 0 2px',letterSpacing:'0.1em'}}>体重</p>
                    <p style={{fontSize:14,fontWeight:900,color:'#94a3b8',margin:0}}>{m?.weight||'—'}</p>
                    <p style={{fontSize:6,color:'#475569',margin:0}}>kg</p>
                  </div>
                </div>

                <button style={{width:28,height:28,borderRadius:8,background:'rgba(59,130,246,.1)',border:'1px solid rgba(59,130,246,.2)',color:'#60a5fa',fontSize:14,cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
              </div>
            );
          })}
        </div>
      )}

      {/* 表格视图 */}
      {viewMode === 'table' && (
        <div style={{background:'linear-gradient(135deg,rgba(0,18,42,.7),rgba(0,10,24,.85))',border:'1px solid rgba(255,255,255,.07)',borderRadius:16,overflow:'hidden'}}>
          {/* 表头 */}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1.5fr 1fr 1fr 1fr 0.8fr',gap:0,padding:'10px 16px',borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            {['姓名/状态','年龄·性别','所在社区','责任医生','收缩压','血糖','体重','操作'].map((h,i)=>(
              <span key={i} style={{fontSize:7,fontWeight:900,color:'#475569',textTransform:'uppercase',letterSpacing:'0.12em'}}>{h}</span>
            ))}
          </div>
          {/* 数据行 */}
          {paged.map((p,i)=>{
            const sc=SC(p.status); const m=p.metrics[0];
            return(
              <div key={p.id} onClick={()=>onSelect(p)}
                style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1.5fr 1fr 1fr 1fr 0.8fr',gap:0,padding:'9px 16px',borderBottom:'1px solid rgba(255,255,255,.04)',cursor:'pointer',transition:'background .15s'}}
                onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background='rgba(59,130,246,.05)'}
                onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:16}}>{p.gender==='男'?'👴':'👵'}</span>
                  <div>
                    <span style={{fontSize:11,fontWeight:900,color:'#fff'}}>{p.name}</span>
                    <span style={{fontSize:6.5,fontWeight:900,padding:'1px 5px',borderRadius:4,background:sc.bg,color:sc.color,marginLeft:5}}>{sc.label}</span>
                  </div>
                </div>
                <span style={{fontSize:10,color:'#94a3b8',alignSelf:'center'}}>{p.age}岁·{p.gender}</span>
                <span style={{fontSize:9.5,color:'#94a3b8',alignSelf:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.district}</span>
                <span style={{fontSize:9.5,color:'#94a3b8',alignSelf:'center'}}>{p.communityGP}</span>
                <span style={{fontSize:12,fontWeight:900,color:BP_ALERT(m?.bp_sys||0),alignSelf:'center'}}>{m?.bp_sys||'—'}/{m?.bp_dia||'—'}</span>
                <span style={{fontSize:12,fontWeight:900,color:GL_ALERT(m?.glucose||0),alignSelf:'center'}}>{m?.glucose||'—'}</span>
                <span style={{fontSize:11,color:'#64748b',alignSelf:'center'}}>{m?.weight||'—'}kg</span>
                <button style={{width:24,height:24,borderRadius:6,background:'rgba(59,130,246,.1)',border:'1px solid rgba(59,130,246,.18)',color:'#60a5fa',fontSize:12,cursor:'pointer',alignSelf:'center'}}>›</button>
              </div>
            );
          })}
        </div>
      )}

      {/* 空状态 */}
      {filtered.length === 0 && (
        <div style={{textAlign:'center',padding:'60px 0',color:'#475569'}}>
          <div style={{fontSize:40,marginBottom:12,opacity:.3}}>🔍</div>
          <p style={{fontSize:12,fontWeight:900,textTransform:'uppercase',letterSpacing:'0.2em'}}>未找到匹配记录</p>
          <p style={{fontSize:9,marginTop:4}}>尝试修改搜索条件或筛选器</p>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:6,marginTop:16}}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
            style={{padding:'6px 14px',borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:page===1?'#334155':'#94a3b8',cursor:page===1?'not-allowed':'pointer',fontSize:9,fontWeight:900}}>
            ← 上一页
          </button>
          {Array.from({length:Math.min(7,totalPages)},(_,i)=>{
            const start = Math.max(1, Math.min(page-3, totalPages-6));
            const pg = start+i;
            if(pg>totalPages) return null;
            return(
              <button key={pg} onClick={()=>setPage(pg)}
                style={{width:28,height:28,borderRadius:7,background:page===pg?'#2563eb':'rgba(255,255,255,.04)',border:`1px solid ${page===pg?'rgba(59,130,246,.5)':'rgba(255,255,255,.07)'}`,color:page===pg?'#fff':'#64748b',cursor:'pointer',fontSize:9,fontWeight:900}}>
                {pg}
              </button>
            );
          })}
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
            style={{padding:'6px 14px',borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:page===totalPages?'#334155':'#94a3b8',cursor:page===totalPages?'not-allowed':'pointer',fontSize:9,fontWeight:900}}>
            下一页 →
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientList;
