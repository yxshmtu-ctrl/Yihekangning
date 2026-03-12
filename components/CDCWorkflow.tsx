
import React, { useState } from 'react';
import { UserRole, PatientStatus } from '../types';

const CDCWorkflow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const steps = [
    { id: 1, label: '数据导入', icon: '📥' },
    { id: 2, label: '地址分拣', icon: '🎯' },
    { id: 3, label: '协同核实', icon: '✅' },
    { id: 4, label: '效果评价', icon: '📊' }
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">疾控指挥管理工作流</h2>
          <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">CDC Command Center Workflow</p>
        </div>
        <div className="flex gap-2 glass p-1.5 rounded-[2rem] border border-white/60 apple-shadow">
          {steps.map(step => (
            <button 
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`px-6 py-3 rounded-full text-xs font-black transition-all ${
                activeStep === step.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/50'
              }`}
            >
              {step.icon} {step.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '待处理核实', value: '142', sub: '近24小时新增' },
          { label: '质控通过率', value: '96.8%', sub: '符合管理标准' },
          { label: '平均派发时效', value: '2.4h', sub: '优于基准值' },
          { label: '管理不达标率', value: '4.2%', sub: '季度环比 -1.2%' }
        ].map((s, i) => (
          <div key={i} className="glass rounded-[2.5rem] p-8 border border-white/80 apple-shadow hover-lift">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-3xl font-black text-slate-900">{s.value}</p>
            <p className="text-[10px] text-emerald-500 font-bold mt-2">{s.sub}</p>
          </div>
        ))}
      </div>

      {activeStep === 1 && (
        <div className="relative h-[400px] rounded-[3rem] overflow-hidden apple-shadow group border border-white">
          <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale group-hover:grayscale-0 transition-all duration-1000" alt="Data" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-center px-12">
            <h3 className="text-3xl font-black text-white mb-4">全域慢性病监测平台<br/>患者信息同步</h3>
            <p className="text-slate-300 max-w-md text-sm font-medium mb-8">
              系统已自动连接疾控中心慢性病监测平台。正在同步最新季度管理不达标患者数据，包含体检异常及新发疾病记录。
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs hover:scale-105 transition-all">
                􀐛 立即导入数据
              </button>
              <button className="px-8 py-4 glass text-white rounded-2xl font-black text-xs border border-white/20">
                􀅼 历史导入记录
              </button>
            </div>
          </div>
        </div>
      )}

      {activeStep === 4 && (
        <div className="glass rounded-[3.5rem] p-12 border border-white apple-shadow">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-900">管理效果动态评估</h3>
              <p className="text-slate-400 text-xs font-bold mt-2">实时质控与多维度汇总分析</p>
            </div>
            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg">􀈂 导出汇总分析报告</button>
          </div>
          <div className="h-64 flex items-center justify-center text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            [ 此处集成多维可视化图表组件 ]
          </div>
        </div>
      )}
    </div>
  );
};

export default CDCWorkflow;
