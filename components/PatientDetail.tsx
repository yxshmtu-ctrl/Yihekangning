import React, { useState } from 'react';
import { Patient, UserRole, PatientStatus, ChatMessage } from '../types';
import { getDeepDiagnosis } from '../services/geminiService';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  userRole: UserRole;
}

const DIAGNOSIS_STAGES = ["同步CDC管理目标...", "映射GP随访实录...", "接入专科临床路径...", "AI全链条推理中..."];

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, userRole }) => {
  const [deepDiagnosis, setDeepDiagnosis] = useState<any>(null);
  const [loadingDeep, setLoadingDeep] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(patient.chatHistory || []);
  const [inputText, setInputText] = useState('');
  const [fusionStage, setFusionStage] = useState(0);

  const handleDeepDiagnosis = async () => {
    setLoadingDeep(true);
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
    const roleLabels: Record<string, string> = {
      [UserRole.CDC_ADMIN]: '疾控端',
      [UserRole.COMMUNITY_GP]: '全科端',
      [UserRole.HOSPITAL_SPECIALIST]: '专科端',
      [UserRole.PATIENT]: '患者'
    };
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderName: roleLabels[userRole],
      senderRole: userRole,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputText('');
  };

  const isCritical = patient.status === PatientStatus.CRITICAL;

  return (
    <div className="pb-24 space-y-4 animate-in fade-in duration-500">

      {/* 顶部栏 */}
      <div className="flex items-center justify-between">
        <button onClick={onBack}
          className="glass-card px-4 py-2 rounded-full text-[11px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2 border border-white/10">
          ← 退出详情
        </button>
        <div className="flex gap-2 items-center">
          <span className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-[10px] font-black flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            三端数据闭环中
          </span>
          <span className="hidden sm:block px-3 py-1.5 bg-white/5 border border-white/10 text-slate-500 rounded-full text-[10px] font-black">
            ID: {patient.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* 主体内容：左右布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* 左侧主内容 */}
        <div className="lg:col-span-8 space-y-4">

          {/* 患者信息卡 */}
          <div className="glass-card rounded-3xl p-5 relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-[60px] pointer-events-none"></div>

            {/* 头像 + 基本信息 */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl flex items-center justify-center text-white text-xl lg:text-2xl font-black shadow-lg flex-shrink-0">
                {patient.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl lg:text-2xl font-black text-white">{patient.name}</h2>
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-black text-white ${isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                    {patient.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm font-bold">
                  {patient.age}岁 · {patient.gender}
                  <span className="mx-2 text-slate-600">·</span>
                  <span className="text-blue-400">{patient.district}</span>
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {patient.conditions.slice(0, 5).map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-400">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* 核心指标 */}
            <div className="grid grid-cols-4 gap-2 mt-4 relative z-10">
              {[
                { l: '收缩压', v: patient.metrics[0].bp_sys, u: 'mmHg', alert: patient.metrics[0].bp_sys > 140 },
                { l: '舒张压', v: patient.metrics[0].bp_dia, u: 'mmHg', alert: patient.metrics[0].bp_dia > 90 },
                { l: '空腹血糖', v: patient.metrics[0].glucose, u: 'mmol/L', alert: patient.metrics[0].glucose > 7 },
                { l: '管理分值', v: 94, u: '分', alert: false }
              ].map((m, i) => (
                <div key={i} className={`rounded-2xl p-3 text-center border ${m.alert ? 'bg-rose-500/8 border-rose-500/25' : 'bg-white/5 border-white/8'}`}>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">{m.l}</p>
                  <p className={`text-lg lg:text-2xl font-black leading-none ${m.alert ? 'text-rose-400' : 'text-white'}`}>{m.v}</p>
                  <p className="text-[9px] text-slate-600 mt-1">{m.u}</p>
                </div>
              ))}
            </div>

            {/* 用药情况 */}
            {patient.medications && patient.medications.length > 0 && (
              <div className="mt-4 relative z-10">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">当前用药</p>
                <div className="flex flex-wrap gap-2">
                  {patient.medications.map((med, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400">💊 {med}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI 三端融合诊断 */}
          <div className="glass-card rounded-3xl p-5 bg-slate-900/80 border border-blue-500/15">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 glass-icon rounded-xl flex items-center justify-center text-xl">🪄</div>
              <div>
                <h3 className="text-base font-black text-white">三端闭环临床决策辅助报告</h3>
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-0.5">CDC-GP-Spec Multi-source Intelligence</p>
              </div>
            </div>

            {loadingDeep ? (
              <div className="py-12 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" style={{borderWidth:'3px'}}></div>
                <p className="text-blue-300 font-black text-sm">{fusionStage > 0 ? DIAGNOSIS_STAGES[fusionStage - 1] : '准备中...'}</p>
              </div>
            ) : deepDiagnosis ? (
              <div className="space-y-3 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">全域融合结论</p>
                    <p className="text-xs font-medium leading-relaxed text-blue-100">{deepDiagnosis.fusion_summary}</p>
                  </div>
                  <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">多药联用禁忌预警</p>
                    <p className="text-xs font-medium leading-relaxed text-rose-100">{deepDiagnosis.drug_interaction_report}</p>
                  </div>
                </div>
                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">联席临床路径建议</p>
                  <p className="text-xs font-medium leading-relaxed text-emerald-100">{deepDiagnosis.specific_intervention}</p>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] text-slate-500 font-black">置信度：{Math.round(deepDiagnosis.confidence_score * 100)}%</span>
                  <span className="text-[10px] font-black text-amber-400">{deepDiagnosis.urgency_alert}</span>
                </div>
                <button onClick={() => setDeepDiagnosis(null)}
                  className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">
                  重新生成决策
                </button>
              </div>
            ) : (
              <div onClick={handleDeepDiagnosis}
                className="py-14 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-blue-500/30 transition-all group">
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">🧠</span>
                <p className="text-blue-400/50 text-sm font-black">点击启动全流程临床证据链智能融合</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：三端沟通 */}
        <div className="lg:col-span-4">
          <div className="glass-card rounded-3xl p-5 flex flex-col border border-white/5 bg-slate-900/60 lg:h-[calc(100vh-160px)] h-[420px]">
            <div className="mb-4 pb-4 border-b border-white/8 flex-shrink-0">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
                三端联席沟通闭环
              </h3>
              <p className="text-[9px] text-slate-500 font-black uppercase mt-1 tracking-widest">CDC / GP / Specialist Feedback</p>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-30">
                  <span className="text-4xl mb-3">💬</span>
                  <p className="text-xs font-black uppercase">暂无联席意见</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.senderRole === userRole ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        msg.senderRole === UserRole.CDC_ADMIN ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/20' :
                        msg.senderRole === UserRole.COMMUNITY_GP ? 'bg-blue-600/20 text-blue-400 border-blue-500/20' :
                        'bg-slate-700/40 text-slate-300 border-slate-600/20'
                      }`}>{msg.senderName}</span>
                      <span className="text-[8px] text-slate-600">{msg.timestamp}</span>
                    </div>
                    <div className={`max-w-[90%] px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed ${
                      msg.senderRole === userRole
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-slate-300 border border-white/10'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 输入框 */}
            <div className="mt-3 pt-3 border-t border-white/8 flex-shrink-0">
              <div className="flex gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 focus-within:border-blue-500/40 transition-all">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="反馈管理意见..."
                  className="flex-1 bg-transparent px-3 py-2 text-xs outline-none text-white"
                />
                <button onClick={handleSendMessage}
                  className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-base shadow-lg active:scale-90 transition-all flex-shrink-0">
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
