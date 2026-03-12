
import React from 'react';
import { UserRole } from '../types';
import Logo from './Logo';

interface NavigationProps {
  currentRole: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigateToTask: (target: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentRole, activeTab, setActiveTab, onNavigateToTask }) => {
  const menuItems = [
    { id: 'dashboard', label: '工作控制台', icon: '📊' },
    { id: 'tasks', label: '任务响应中心', icon: '🎯' }, // Renamed to emphasize operational focus
    { id: 'patients', label: '全域档案库', icon: '👥' },
    { id: 'bigscreen', label: '指挥大屏', icon: '🖥️' },
    { id: 'settings', label: '系统配置', icon: '⚙️' },
  ];

  // Specific task notifications based on role
  const roleSpecificTasks = {
    [UserRole.CDC_ADMIN]: [
      { t: '指标异常待指派', p: '24名患者', time: '现在', urgent: true, target: 'cdc_dispatch' },
      { t: '质控结果待审', p: '长青街道', time: '10:30', urgent: false, target: 'cdc_qc' }
    ],
    [UserRole.COMMUNITY_GP]: [
      { t: '新指派核实', p: '刘厚德', time: '5分钟前', urgent: true, target: 'gp_verify' },
      { t: '计划内随访', p: '黄爱国', time: '11:15', urgent: false, target: 'gp_followup' }
    ],
    [UserRole.HOSPITAL_SPECIALIST]: [
      { t: '转诊初审申请', p: '邓长青', time: '13:45', urgent: true, target: 'spec_referral' },
      { t: '转回社区评估', p: '李建国', time: '15:20', urgent: false, target: 'spec_return' }
    ],
    [UserRole.PATIENT]: []
  };

  const tasks = roleSpecificTasks[currentRole] || [];

  return (
    <nav className="w-72 glass-card h-[calc(100vh-3rem)] fixed left-6 top-6 rounded-[2.5rem] flex flex-col z-40 tech-shadow overflow-hidden border-white/10">
      <div className="p-8 pb-4 flex flex-col items-center shrink-0">
        <Logo size={60} />
        <div className="mt-4 text-center">
          <h1 className="text-lg font-black text-white tracking-tighter font-yihe leading-tight">颐和康宁</h1>
          <p className="text-[7px] text-blue-400 font-black tracking-[0.4em] uppercase opacity-80 mt-1">Medical AI Ecosystem</p>
        </div>
      </div>
      
      <div className="flex-1 px-4 space-y-2 overflow-y-auto py-6 custom-scrollbar">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 px-4 opacity-40">System Navigation</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 group ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/40 border border-blue-400/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="text-[11px] font-black tracking-widest uppercase">{item.label}</span>
          </button>
        ))}

        {currentRole !== UserRole.PATIENT && tasks.length > 0 && (
          <div className="mt-10 space-y-3">
            <div className="flex items-center justify-between px-4 mb-4">
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">待办事项</p>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]"></span>
            </div>
            {tasks.map((task, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveTab('tasks');
                  onNavigateToTask(task.target);
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  task.urgent ? 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10' : 'bg-white/5 border-white/10 hover:bg-white/10'
                } group active:scale-95`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className={`text-[9px] font-black uppercase tracking-tight ${task.urgent ? 'text-rose-400' : 'text-blue-400'}`}>{task.t}</p>
                  <span className="text-[8px] text-slate-600 font-bold">{task.time}</span>
                </div>
                <p className="text-xs font-black text-white truncate">{task.p}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-8 shrink-0 border-t border-white/5 bg-slate-900/40">
        <div className="bg-white/5 p-4 rounded-[1.5rem] border border-white/10 flex items-center gap-4 shadow-inner group hover:bg-white/10 transition-all cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:scale-105 transition-transform">
            {currentRole.charAt(0)}
          </div>
          <div>
            <p className="text-[9px] font-black text-white leading-none uppercase tracking-widest">在线权限</p>
            <p className="text-[8px] text-slate-500 font-bold mt-2 uppercase tracking-tight opacity-60">{currentRole}</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
