
import React, { useState, useEffect } from 'react';
import { Patient, WellnessPrescription, PatientStatus } from '../types';
import { getAIWellnessPrescription } from '../services/geminiService';

interface PatientDashboardProps {
  patient: Patient;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient }) => {
  const [wellness, setWellness] = useState<WellnessPrescription | null>(patient.wellnessPrescription || null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [thoughtStage, setThoughtStage] = useState(0);

  const stages = ["正在读取中医典籍数据...", "正在匹配体质辨识指标...", "正在融合DeepSeek推理...", "正在生成适宜养生方案..."];

  const generateWellness = async () => {
    setLoadingAI(true);
    for (let i = 0; i < stages.length; i++) {
      setThoughtStage(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    const result = await getAIWellnessPrescription(patient);
    if (result) setWellness(result);
    setLoadingAI(false);
  };

  return (
    <div className="space-y-8 pb-24">
      {/* 状态总览 */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-8 text-white jd-shadow relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl shadow-inner border border-white/20">
              👴
            </div>
            <div>
              <h2 className="text-2xl font-black">早上好，{patient.name}</h2>
              <p className="text-blue-100 text-xs font-bold mt-1 uppercase tracking-widest opacity-80">当前状态：{patient.status}</p>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-[10px] font-black text-blue-100/60 uppercase">自我管理天数</p>
              <p className="text-3xl font-black">128</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-blue-100/60 uppercase">健康积分</p>
              <p className="text-3xl font-black">2,450</p>
            </div>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* 核心功能区 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '自我管理', icon: '📝', color: 'bg-emerald-50 text-emerald-600' },
          { label: '待诊信息', icon: '⏰', color: 'bg-blue-50 text-blue-600', badge: patient.status === PatientStatus.APPOINTMENT_SCHEDULED ? '1' : null },
          { label: '就诊记录', icon: '📄', color: 'bg-purple-50 text-purple-600' },
          { label: '个人诊断', icon: '🩺', color: 'bg-orange-50 text-orange-600' },
          { label: '查看医嘱', icon: '📋', color: 'bg-rose-50 text-rose-600' },
          { label: '我的医生', icon: '👨‍⚕️', color: 'bg-indigo-50 text-indigo-600' },
          { label: '亲友绑定', icon: '👨‍👩‍👦', color: 'bg-cyan-50 text-cyan-600' },
          { label: '更多', icon: '✨', color: 'bg-slate-50 text-slate-400' },
        ].map((item, i) => (
          <div key={i} className="interactive-card bg-white p-6 rounded-[2.5rem] jd-shadow border border-slate-50 flex flex-col items-center gap-3 relative cursor-pointer">
            <div className={`w-14 h-14 ${item.color} glass-icon-container rounded-2xl flex items-center justify-center text-2xl`}>
              {item.icon}
            </div>
            <span className="text-xs font-black text-slate-700 tracking-tight">{item.label}</span>
            {item.badge && <span className="absolute top-4 right-8 w-5 h-5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-red-100">{item.badge}</span>}
          </div>
        ))}
      </div>

      {/* DeepSeek AI 养生方案 */}
      <div className="glass rounded-[3.5rem] p-10 jd-shadow border border-white relative overflow-hidden bg-slate-900 text-white group">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20">􀩽</div>
              <div>
                <h3 className="text-2xl font-black">DeepSeek AI 养生处方</h3>
                <p className="text-blue-200/50 text-[10px] font-black uppercase tracking-[0.2em] mt-1">基于跨系统全量数据的中医智慧化建议</p>
              </div>
            </div>
            {!wellness && !loadingAI && (
              <button onClick={generateWellness} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black shadow-2xl shadow-blue-500/30 transition-all active:scale-95">
                􀅼 开启 AI 深度养生规划
              </button>
            )}
          </div>

          {loadingAI ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-xl font-black animate-pulse text-blue-100">{stages[thoughtStage]}</p>
            </div>
          ) : wellness ? (
            <div className="space-y-8 animate-in zoom-in duration-700">
              {/* AI 思考展开 */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="animate-ping w-2 h-2 rounded-full bg-blue-400"></span> 思考逻辑 (Thought Process)
                </p>
                <p className="text-xs font-medium italic text-blue-100 leading-relaxed opacity-80">
                  “{wellness.aiThought}”
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                  <span className="text-3xl mb-4 block">🍵</span>
                  <h4 className="text-lg font-black text-blue-400">中医食疗</h4>
                  <p className="text-sm font-black mt-2 text-white">{wellness.dietTherapy.title}</p>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed font-medium">{wellness.dietTherapy.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {wellness.dietTherapy.ingredients.map((ing, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-black text-blue-200">{ing}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                  <span className="text-3xl mb-4 block">🧘‍♂️</span>
                  <h4 className="text-lg font-black text-emerald-400">养生功法</h4>
                  <p className="text-sm font-black mt-2 text-white">{wellness.exercise.title}</p>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed font-medium">{wellness.exercise.benefit}</p>
                  <p className="text-[9px] bg-emerald-500/10 text-emerald-300 p-3 rounded-xl mt-3 border border-emerald-500/20 font-medium italic">
                    {wellness.exercise.steps}
                  </p>
                </div>

                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                  <span className="text-3xl mb-4 block">🩹</span>
                  <h4 className="text-lg font-black text-amber-400">适宜技术</h4>
                  <p className="text-sm font-black mt-2 text-white">{wellness.technique.name}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{wellness.technique.position}</p>
                  <p className="text-[10px] text-slate-200 mt-2 leading-relaxed font-medium italic">
                    “{wellness.technique.action}”
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[3rem]">
              <span className="text-4xl opacity-20 mb-4">🍂</span>
              <p className="text-blue-100/30 text-xs font-black italic">点击按钮，生成您的专属秋季养生计划</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
