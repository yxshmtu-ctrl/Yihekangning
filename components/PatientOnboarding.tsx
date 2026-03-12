
import React, { useState } from 'react';
import Logo from './Logo';

interface PatientOnboardingProps {
  onComplete: (data: any) => void;
}

const PatientOnboarding: React.FC<PatientOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [signed, setSigned] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '男',
    conditions: [] as string[]
  });

  const commonConditions = ['高血压', '2型糖尿病', '慢阻肺', '冠心病', '血脂异常'];

  const toggleCondition = (c: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.includes(c) 
        ? prev.conditions.filter(x => x !== c) 
        : [...prev.conditions, c]
    }));
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6">
      <div className="max-w-xl w-full glass rounded-[3rem] p-10 jd-shadow border border-white">
        <div className="flex flex-col items-center mb-10">
          <Logo size={80} />
          <h1 className="text-2xl font-black mt-4">欢迎加入颐和康宁</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Patient Onboarding</p>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-black flex items-center gap-2">
              <span className="text-blue-600">Step 1</span> 健康服务知情同意书
            </h2>
            <div className="h-64 overflow-y-auto bg-white/50 p-6 rounded-3xl border border-slate-100 text-xs leading-relaxed text-slate-600 custom-scrollbar shadow-inner">
              <p className="font-black mb-4">一、服务宗旨</p>
              <p className="mb-4">“颐和康宁”致力于通过数字化手段，为您提供全周期、闭环式的慢病管理与康复指导。您的健康数据将在疾控、社区、医院三端间加密流转。</p>
              <p className="font-black mb-4">二、隐私保障</p>
              <p className="mb-4">我们承诺严格遵守《个人信息保护法》，非诊疗与管理必要，绝不向第三方披露您的个人病历与身份数据。</p>
              <p className="font-black mb-4">三、免责声明</p>
              <p className="mb-4">本平台提供的 AI 建议（包括 DeepSeek 养生方案）仅供参考，不替代专业临床诊断，重症请务必就医。</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={signed} onChange={() => setSigned(!signed)} className="w-5 h-5 accent-blue-600" />
              <span className="text-sm font-bold text-slate-700">我已阅读并同意以上所有条款</span>
            </div>
            <button 
              disabled={!signed}
              onClick={() => setStep(2)}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all ${signed ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              下一步：登记信息
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
            <h2 className="text-xl font-black flex items-center gap-2">
              <span className="text-blue-600">Step 2</span> 建立个人健康档案
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">您的姓名</label>
                <input 
                  type="text" 
                  className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-500/20" 
                  placeholder="请输入姓名"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">您的年龄</label>
                <input 
                  type="number" 
                  className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-500/20" 
                  placeholder="请输入年龄"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">已患疾病（多选）</label>
              <div className="flex flex-wrap gap-2">
                {commonConditions.map(c => (
                  <button 
                    key={c}
                    onClick={() => toggleCondition(c)}
                    className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${formData.conditions.includes(c) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-500'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button 
              disabled={!formData.name || !formData.age}
              onClick={() => onComplete(formData)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-2xl active:scale-95 transition-all"
            >
              开启健康之旅
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientOnboarding;
