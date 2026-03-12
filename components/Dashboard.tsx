
import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { UserRole } from '../types';

const chartData = [
  { name: '01', count: 45 }, { name: '05', count: 52 }, { name: '10', count: 48 },
  { name: '15', count: 61 }, { name: '20', count: 55 }, { name: '25', count: 67 }, { name: '30', count: 70 },
];

interface DashboardProps {
  role: UserRole;
  onNavigateToTask: (subTabId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ role, onNavigateToTask }) => {
  const [viewScale, setViewScale] = useState(1);
  const [viewType, setViewType] = useState('overview');

  const roleFeatures = {
    [UserRole.CDC_ADMIN]: [
      { label: '导入', icon: '📥', target: 'import', desc: '监测平台数据同步' },
      { label: '指派', icon: '🎯', target: 'assign', desc: '网格化任务下发' },
      { label: '效果评估', icon: '📊', target: 'eval', desc: '管理效能分析' },
      { label: '分析汇总', icon: '📑', target: 'summary', desc: '全域报表生成' }
    ],
    [UserRole.COMMUNITY_GP]: [
      { label: '待核实', icon: '✅', target: 'verify_gp', desc: '新分配对象确认' },
      { label: '待随访', icon: '🩺', target: 'followup', desc: '计划性健康回访' },
      { label: '待转诊', icon: '📤', target: 'referral_out', desc: '危急重症上划' },
      { label: '汇总功能', icon: '📈', target: 'gp_summary', desc: '签约服务评价' }
    ],
    [UserRole.HOSPITAL_SPECIALIST]: [
      { label: '待转诊', icon: '📩', target: 'referral_in', desc: '社区上划审核' },
      { label: '待诊', icon: '📅', target: 'clinic', desc: '预约池管理' },
      { label: '接诊过程', icon: '🏥', target: 'treatment', desc: '临床诊疗路径' },
      { label: '汇总', icon: '📊', target: 'spec_summary', desc: '医疗联体效能' }
    ],
    [UserRole.PATIENT]: []
  };

  const currentFeatures = roleFeatures[role] || [];

  return (
    <div className="space-y-10 transition-all duration-500 pb-32" style={{ transform: `scale(${viewScale})`, transformOrigin: 'top center' }}>
      
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative w-full md:w-80">
          <select 
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-sm outline-none appearance-none cursor-pointer hover:bg-white/10"
          >
            <option value="overview" className="bg-[#050B1A]">全域指挥看板 - Overview</option>
            <option value="analytics" className="bg-[#050B1A]">深度分析中心 - Analytics</option>
          </select>
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">▼</span>
        </div>
        
        <div className="flex items-center gap-6 bg-white/5 backdrop-blur-2xl px-8 py-4 rounded-2xl border border-white/10 shadow-2xl">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">视图比例</span>
          <input 
            type="range" min="0.75" max="1.25" step="0.05" 
            value={viewScale} 
            onChange={(e) => setViewScale(parseFloat(e.target.value))}
            className="w-40 h-1.5 bg-white/10 rounded-full accent-blue-600 appearance-none cursor-pointer"
          />
          <span className="text-xs font-black text-blue-400 w-10">{Math.round(viewScale * 100)}%</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-[3.5rem] p-10 tech-shadow relative overflow-hidden border border-blue-500/20 bg-blue-500/5 group hover:border-blue-500/40 transition-all">
          <div className="relative z-10 flex flex-col items-center">
            <h3 className="text-2xl font-black text-white tracking-tight mb-8">慢病临床指南与诊疗路径检索中心</h3>
            <div className="flex w-full gap-4 px-4">
              <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 px-8 py-5 flex items-center gap-5 focus-within:border-blue-500/50 transition-all">
                <span className="text-2xl opacity-40">🔍</span>
                <input 
                  type="text" 
                  placeholder="搜索最新高血压、糖尿病管理指南或专家共识..." 
                  className="bg-transparent outline-none w-full text-md text-white placeholder:text-slate-600 font-medium"
                />
              </div>
              <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-2xl hover:bg-blue-500 transition-all active:scale-95">
                深度检索
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
          <h4 className="text-md font-black text-white tracking-widest uppercase">业务功能矩阵</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {currentFeatures.map((item, i) => (
            <div 
              key={i} 
              onClick={() => onNavigateToTask(item.target)}
              className="glass-card p-8 rounded-[2.5rem] flex flex-col items-center gap-4 cursor-pointer group hover:bg-blue-600/10 hover:border-blue-500/30 transition-all shadow-xl text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 glass-icon rounded-3xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                {item.icon}
              </div>
              <div>
                <p className="text-[12px] font-black text-white tracking-widest uppercase mb-1">{item.label}</p>
                <p className="text-[7px] text-slate-500 font-bold uppercase leading-tight opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4 inset-x-0">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="glass-card rounded-[3.5rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 glass-icon rounded-2xl flex items-center justify-center text-3xl shadow-inner">📊</div>
            <div>
              <h4 className="text-lg font-black text-white">实时效能监测</h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Live Efficiency Tracking</p>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} fill="url(#chartGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-[3.5rem] p-10 border border-emerald-500/10 shadow-2xl bg-emerald-500/5 flex flex-col justify-between">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-14 h-14 glass-icon rounded-2xl flex items-center justify-center text-3xl">💊</div>
            <div>
              <h4 className="text-lg font-black text-white">智慧用药逻辑引擎</h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Drug Logic System</p>
            </div>
          </div>
          <div className="space-y-4">
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex justify-between items-center hover:bg-emerald-500/10 transition-all cursor-pointer group">
               <span className="text-sm font-black text-emerald-400">临床配伍禁忌查询</span>
               <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">􀄪</span>
             </div>
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex justify-between items-center hover:bg-blue-500/10 transition-all cursor-pointer group">
               <span className="text-sm font-black text-blue-400">多药联用风险评估</span>
               <span className="text-blue-500 group-hover:translate-x-1 transition-transform">􀄪</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
