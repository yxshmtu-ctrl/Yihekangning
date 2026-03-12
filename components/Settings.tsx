
import React, { useState } from 'react';
import Logo from './Logo';

const Settings: React.FC = () => {
  const [signed, setSigned] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter font-yihe">系统设置与合规</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Governance, Security & Agreements</p>
        </div>
        <div className="px-4 py-2 glass rounded-full border border-white/60 apple-shadow">
          <span className="text-[10px] font-black text-blue-600 uppercase">Version 2.5.0-Final</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="glass rounded-[3rem] p-10 apple-shadow border border-white bg-white/40">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <span className="text-blue-600">􀟝</span> 
              数据安全与知情协议签署
            </h3>
            <div className="h-64 overflow-y-auto pr-4 mb-6 text-xs text-slate-600 leading-relaxed font-medium bg-white/20 p-6 rounded-2xl border border-white/40 custom-scrollbar shadow-inner">
              <p className="mb-4 font-black text-slate-900">尊敬的颐和康宁用户：</p>
              <p className="mb-4">欢迎进入医防融合闭环管理系统。为保障老年患者个人隐私及医疗数据安全，请您确认以下协议条款：</p>
              <p className="mb-4">1. <span className="font-bold text-slate-800">全链路数据加密：</span> 本系统采用端到端国密级别加密算法。疾控中心、全科端及专科端数据传输过程受证书级保护。</p>
              <p className="mb-4">2. <span className="font-bold text-slate-800">隐私合规：</span> 所有涉及身份证号、联系电话（如：18916165907）及详细病历的信息仅用于授权转诊与随访提醒。</p>
              <p className="mb-4">3. <span className="font-bold text-slate-800">知情告知：</span> 在执行转诊申请时，系统将自动通过短信推送知情协议至患者终端，获取患者数字签名后生效。</p>
              <p className="mb-4">4. <span className="font-bold text-slate-800">AI 辅助决策声明：</span> AI 生成的建议仅作为临床辅助。医生在做出决定前应对患者进行实地检查。</p>
              <p className="italic text-slate-400 border-t border-slate-100 pt-4 mt-4">签署即视为认同颐和康宁数字医疗生态系统的合规运作标准。</p>
            </div>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <button onClick={() => setSigned(!signed)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${signed ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200'}`}>
                    {signed && '✓'}
                  </button>
                  <span className="text-xs font-black text-slate-600 select-none cursor-pointer" onClick={() => setSigned(!signed)}>我已阅读并签署上述全链路数据安全知情协议</span>
               </div>
               <button className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all transform active:scale-95 ${signed ? 'bg-slate-900 text-white shadow-xl hover:shadow-2xl' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                  立即确认授权
               </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="glass rounded-[2.5rem] p-8 apple-shadow border border-white bg-slate-900 text-white relative overflow-hidden group">
             <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-blue-500/10 rounded-full blur-3xl transition-transform duration-1000"></div>
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">联络与反馈 / Contact</h4>
             <div className="space-y-6">
                <div>
                   <p className="text-[9px] text-slate-500 font-black uppercase mb-1 tracking-widest">技术支持专线</p>
                   <p className="text-2xl font-black tracking-tight text-blue-400">189 1616 5907</p>
                </div>
                <div>
                   <p className="text-[9px] text-slate-500 font-black uppercase mb-1 tracking-widest">系统响应标准</p>
                   <p className="text-sm font-bold">24/7 数字化医疗专家待命</p>
                </div>
             </div>
           </div>

           <div className="glass rounded-[2.5rem] p-10 apple-shadow border border-white/60 bg-white/40 flex flex-col items-center text-center relative">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.6em] mb-4">Designer Signature</p>
              <div className="space-y-3">
                 <p className="text-3xl font-black text-slate-900 font-yihe italic leading-none metallic-text">七叶一枝花</p>
                 <p className="text-[8px] text-slate-400 font-black tracking-[0.3em] uppercase opacity-60">Paris Polyphylla · Chief Architect</p>
              </div>
              <div className="mt-10 pt-8 border-t border-slate-200/60 w-full">
                 <p className="text-[8px] text-slate-300 font-black tracking-widest uppercase">© 2024 YIHE HARMONY ECOSYSTEM</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
