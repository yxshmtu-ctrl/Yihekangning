
import React, { useState, useEffect } from 'react';
import { Patient, UserRole, PatientStatus, ChatMessage } from '../types';
import { getHealthAnalysis, getDeepDiagnosis } from '../services/geminiService';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  userRole: UserRole;
}

// Fixed: Define diagnosis stages at the component level to ensure they are accessible in both the logic and the JSX
const DIAGNOSIS_STAGES = ["同步CDC管理目标...", "映射GP随访实录...", "接入专科临床路径...", "AI全链条推理中..."];

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, userRole }) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [deepDiagnosis, setDeepDiagnosis] = useState<any>(null);
  const [loadingDeep, setLoadingDeep] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(patient.chatHistory || []);
  const [inputText, setInputText] = useState('');
  const [fusionStage, setFusionStage] = useState(0);

  useEffect(() => {
    const fetchAnalysis = async () => {
      const result = await getHealthAnalysis(patient);
      setAnalysis(result);
    };
    fetchAnalysis();
  }, [patient]);

  const handleDeepDiagnosis = async () => {
    setLoadingDeep(true);
    // Iterate through the diagnosis stages using the component-level constant
    for (let i = 0; i < DIAGNOSIS_STAGES.length; i++) {
      setFusionStage(i + 1);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    const result = await getDeepDiagnosis(patient);
    setDeepDiagnosis(result);
    setLoadingDeep(false);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const roleLabels = { [UserRole.CDC_ADMIN]: '疾控端', [UserRole.COMMUNITY_GP]: '全科端', [UserRole.HOSPITAL_SPECIALIST]: '专科端', [UserRole.PATIENT]: '患者' };
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderName: roleLabels[userRole],
      senderRole: userRole,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([...chatMessages, newMessage]);
    setInputText('');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="glass-card px-8 py-4 rounded-full text-[11px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest flex items-center gap-4">
          􀄪 退出详情看板
        </button>
        <div className="flex gap-4">
          <span className="px-6 py-2.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            三端数据闭环中
          </span>
          <span className="px-6 py-2.5 bg-white/5 border border-white/10 text-slate-500 rounded-full text-[10px] font-black uppercase">
            ID: {patient.id.slice(0, 8)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* 患者核心卡片 */}
          <div className="glass-card rounded-[4rem] p-12 tech-shadow relative overflow-hidden bg-white/5 border-white/10">
            <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="flex items-center gap-12 relative z-10">
              <div className="w-40 h-40 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[3.5rem] flex items-center justify-center text-white text-6xl font-black shadow-2xl ring-8 ring-white/5">
                {patient.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-6">
                  <h2 className="text-6xl font-black text-white tracking-tighter">{patient.name}</h2>
                  <span className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl ${
                    patient.status === PatientStatus.CRITICAL ? 'bg-rose-500 text-white shadow-rose-900/40' : 'bg-emerald-500 text-white shadow-emerald-900/40'
                  }`}>
                    {patient.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 mt-8">
                  <p className="text-slate-400 font-black text-lg">{patient.age}岁 · {patient.gender}</p>
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <p className="text-blue-400 font-black text-lg tracking-widest uppercase italic">{patient.district}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-8 mt-16 relative z-10">
              {[
                { l: '收缩压', v: patient.metrics[0].bp_sys, u: 'mmHg' },
                { l: '舒张压', v: patient.metrics[0].bp_dia, u: 'mmHg' },
                { l: '空腹血糖', v: patient.metrics[0].glucose, u: 'mmol/L' },
                { l: '管理分值', v: '94', u: 'SC' }
              ].map((m, i) => (
                <div key={i} className="bg-white/5 p-8 rounded-[3rem] border border-white/5 text-center group hover:bg-white/10 transition-all">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{m.l}</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <p className="text-4xl font-black text-white group-hover:scale-110 transition-transform">{m.v}</p>
                    <span className="text-[10px] font-bold text-slate-600">{m.u}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI 全程融合诊断报告 */}
          <div className="glass-card rounded-[4rem] p-12 bg-slate-900/80 border-blue-500/20 shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
                <div className="flex items-center gap-8 mb-12">
                   <div className="w-20 h-20 glass-icon rounded-[2.5rem] flex items-center justify-center text-4xl shadow-blue-500/30">🪄</div>
                   <div>
                      <h3 className="text-3xl font-black text-white tracking-tight">三端闭环临床决策辅助报告</h3>
                      <p className="text-[11px] text-blue-400 font-black uppercase tracking-[0.4em] mt-2 italic">CDC-GP-Spec Multi-source Intelligence</p>
                   </div>
                </div>

                {loadingDeep ? (
                  <div className="py-24 flex flex-col items-center gap-10 animate-pulse">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    {/* Fixed: Use the component-level DIAGNOSIS_STAGES array to resolve the reference error */}
                    <p className="text-blue-100 font-black text-2xl tracking-widest">{fusionStage > 0 ? DIAGNOSIS_STAGES[fusionStage-1] : "准备中..."}</p>
                  </div>
                ) : deepDiagnosis ? (
                  <div className="space-y-10 animate-in zoom-in duration-700">
                    <div className="grid grid-cols-2 gap-10">
                       <div className="p-10 bg-white/5 rounded-[3.5rem] border border-white/5 hover:border-blue-500/30 transition-all">
                          <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-6">全域融合结论</p>
                          <p className="text-md font-medium leading-relaxed text-blue-50">{deepDiagnosis.fusion_summary}</p>
                       </div>
                       <div className="p-10 bg-rose-500/5 rounded-[3.5rem] border border-rose-500/10 hover:border-rose-500/40 transition-all">
                          <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest mb-6">多药联用禁忌深度预警</p>
                          <p className="text-md font-medium leading-relaxed text-rose-50">{deepDiagnosis.drug_interaction_report}</p>
                       </div>
                    </div>
                    <div className="p-10 bg-emerald-500/5 rounded-[3.5rem] border border-emerald-500/10 shadow-inner">
                       <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-6">联席临床路径建议</p>
                       <p className="text-md font-medium leading-relaxed text-emerald-50">{deepDiagnosis.specific_intervention}</p>
                    </div>
                    <button onClick={() => setDeepDiagnosis(null)} className="w-full py-6 bg-white/5 border border-white/10 rounded-3xl text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">重新生成决策</button>
                  </div>
                ) : (
                  <div className="py-28 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[4rem] group cursor-pointer hover:border-blue-500/30 transition-all" onClick={handleDeepDiagnosis}>
                    <p className="text-blue-400/30 text-lg font-black italic">点击启动全流程临床证据链智能融合</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* 右侧：三端对话与反馈中心 (重点强化) */}
        <div className="lg:col-span-4 flex flex-col h-[950px]">
           <div className="glass-card rounded-[3.5rem] p-10 flex flex-col flex-1 border border-white/5 bg-slate-900/60 shadow-2xl relative">
             <div className="mb-10 border-b border-white/10 pb-8">
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]"></span>
                  三端联席沟通闭环
                </h3>
                <p className="text-[10px] text-slate-500 font-black uppercase mt-2 tracking-[0.2em]">CDC / GP / Specialist Feedback Center</p>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-8 px-2 custom-scrollbar pr-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-20">
                    <span className="text-6xl mb-4">💬</span>
                    <p className="text-xs font-black uppercase">暂无联席意见反馈</p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.senderRole === userRole ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-3 mb-2 px-2">
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                          msg.senderRole === UserRole.CDC_ADMIN ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/20' : 
                          msg.senderRole === UserRole.COMMUNITY_GP ? 'bg-blue-600/30 text-blue-400 border border-blue-500/20' : 
                          'bg-slate-700/50 text-slate-300'
                        }`}>{msg.senderName}</span>
                        <span className="text-[8px] text-slate-600 font-bold">{msg.timestamp}</span>
                      </div>
                      <div className={`max-w-[95%] px-6 py-5 rounded-[2.5rem] text-sm font-medium leading-relaxed shadow-xl ${
                        msg.senderRole === userRole ? 'bg-blue-600 text-white shadow-blue-900/30' : 'bg-white/5 text-slate-300 border border-white/10'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
             </div>

             <div className="mt-10 pt-8 border-t border-white/10">
                <div className="flex gap-4 bg-white/5 p-3 rounded-[2.5rem] border border-white/10 shadow-inner group focus-within:border-blue-500/50 transition-all">
                   <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="反馈管理意见或临床建议..." 
                    className="flex-1 bg-transparent px-6 py-4 rounded-full text-sm outline-none text-white font-medium" 
                   />
                   <button onClick={handleSendMessage} className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-900/40 active:scale-90 transition-all">􀄫</button>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
