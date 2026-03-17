
import React, { useState, useEffect } from 'react';
import { UserRole, Patient, PatientStatus } from '../types';
import { getReferralAdvice } from '../services/geminiService';
import { REAL_CDC_POOL, REAL_GP_VERIFY_POOL, REAL_GP_FOLLOWUP_POOL, REAL_GP_REFERRAL_POOL, REAL_SPEC_POOL } from '../data/realPatients';

// ==========================================
// 1. 疾控端 示例数据 (保持原样，不作修改)
// ==========================================
const CDC_DISPATCH_POOL: Patient[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `CDC_D_${i + 1}`,
  name: ['王大福', '李翠兰', '赵铁柱', '孙美玲', '钱进宝', '周建国', '吴秀英', '郑大钱', '冯秋燕', '陈卫东'][i],
  age: 65 + i,
  gender: i % 2 === 0 ? '男' : '女',
  idCard: `310115${1950 + i}********`,
  district: ['南码头街道', '周家渡街道', '花木街道', '东明路街道', '潍坊新村街道', '上钢新村街道', '三林镇', '北蔡镇', '张江镇', '金桥镇'][i],
  nonComplianceType: ['空腹血糖连续超标', '收缩压波动过大', '药物依从性极低', '生活方式干预失效', '并存症快速恶化', '糖化血红蛋白>9%', '静息心率持续偏高', 'BMI指数严重超标', '蛋白尿阳性未随访', '多药联用风险预警'][i],
  conditions: [['高血压'], ['2型糖尿病'], ['慢阻肺'], ['冠心病'], ['慢性肾病'], ['脑卒中后遗症'], ['心力衰竭'], ['帕金森病'], ['骨质疏松'], ['房颤']][i],
  status: PatientStatus.PENDING_ASSIGNMENT,
  address: '浦东新区XX路' + (i * 100) + '号',
  communityGP: '系统待指派',
  lastVisit: '2023-10-01',
  metrics: [{ bp_sys: 150 + i * 2, bp_dia: 95 + i, glucose: 8.5 + i * 0.5, weight: 70 + i, date: '2023-11-20' }],
  labResults: [], visits: [], chatHistory: [], medications: []
}));

const CDC_MANAGED_OVERVIEW: Patient[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `CDC_M_${i + 1}`,
  name: ['张卫平', '刘淑芬', '杨开山', '陈冬梅', '马保国', '严守一', '胡丽娜', '郭富民', '徐建平', '方芳'][i],
  age: 70 + i,
  gender: i % 3 === 0 ? '男' : '女',
  idCard: `310115${1945 + i}********`,
  district: '南码头街道',
  status: PatientStatus.FOLLOW_UP,
  conditions: ['原发性高血压', '2型糖尿病', '血脂异常'],
  newConditions: i % 4 === 0 ? ['脑卒中', '肾功能不全'] : ['白内障'],
  cciScore: 3 + (i % 5),
  nonComplianceType: '多病共患管理中',
  address: '临沂新村',
  communityGP: '王医生',
  lastVisit: '2023-11-15',
  metrics: [{ bp_sys: 142, bp_dia: 88, glucose: 7.2, weight: 68, waist: 92, bmi: 24.5, date: '2023-11-25' }],
  labResults: [{ category: '肾功', name: '肌酐', value: 110, unit: 'umol/L', status: 'high' }],
  medications: ['苯磺酸氨氯地平'], visits: [], chatHistory: []
}));

// ==========================================
// 2. 全科端 示例数据 (保持原样，不作修改)
// ==========================================
const GP_VERIFY_POOL: Patient[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `GP_V_${i + 1}`,
  name: ['钱大妈', '赵老伯', '孙叔叔', '周阿姨', '吴大爷', '郑奶奶', '王伯伯', '冯阿姨', '陈爷爷', '褚老师'][i],
  age: 62 + i,
  gender: i % 2 === 0 ? '女' : '男',
  idCard: `310115${1955 + i}********`,
  district: '南码头街道',
  nonComplianceType: ['疾控中心下发：血糖异常(14.5)', 'CDC监控：血压过高(185/110)', '失访风险预警', '指标超标：糖化9.5%', '系统识别：新发并发症风险', '疑似脑梗死恢复期管理', '顽固性高血压预警', '慢性肾病进展风险', '多药联用风险核查', '血糖剧烈波动'][i],
  conditions: ['高血压', '糖尿病'], status: PatientStatus.PENDING_VERIFICATION,
  address: '南码头街道' + (i + 1) + '弄', communityGP: '待核实', lastVisit: '2023-11-01',
  metrics: [{ bp_sys: 165, bp_dia: 100, glucose: 10.5, weight: 65, date: '2023-12-10' }],
  labResults: [], visits: [], chatHistory: [], medications: []
}));

const GP_FOLLOWUP_POOL: Patient[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `GP_F_${i + 1}`,
  name: ['韩冬梅', '沈建国', '蒋秀英', '杨志强', '朱丽华', '秦大福', '尤金生', '许美云', '何开山', '吕芳'][i],
  age: 68 + i,
  gender: i % 2 === 0 ? '女' : '男',
  idCard: `310115${1952 + i}********`,
  district: '周家渡街道',
  nonComplianceType: ['血压控制率不佳 (175/105 mmHg)', '血糖控制率不佳 (HbA1c 9.2%)', '新发帕金森综合征', '肺癌术后疑似肿瘤转移', '冠心病频发心绞痛', '糖尿病足(II级)恶化', '视网膜病变快速进展', '顽固性失眠及焦虑状态', '慢性肾衰竭(G4期)进展', '骨质疏松并多发骨痛'][i],
  conditions: ['高血压', '2型糖尿病', '冠心病'], status: PatientStatus.FOLLOW_UP,
  address: '昌里路' + (i * 10 + 1) + '号', communityGP: '王医生', lastVisit: '2023-11-20',
  metrics: [{ bp_sys: 155, bp_dia: 98, glucose: 11.2, weight: 72, date: '2023-12-12' }],
  labResults: [{ category: '肿瘤', name: 'CEA', value: 15.4, unit: 'ng/ml', status: 'high' }], visits: [], chatHistory: [], medications: []
}));

const GP_REFERRAL_POOL: Patient[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `GP_R_${i + 1}`,
  name: ['金长青', '魏大宝', '陶翠花', '严守一', '华安', '章建平', '谢秀兰', '邹富贵', '喻德海', '柏芳'][i],
  age: 72 + i,
  gender: i % 2 === 0 ? '男' : '女',
  idCard: `310115${1948 + i}********`,
  district: '三林镇',
  nonComplianceType: '疑难杂症，社区治疗效果不显',
  conditions: ['高血压', '慢性肾病'], status: PatientStatus.PENDING_REFERRAL,
  address: '三林路' + (i + 1) + '号', communityGP: '李医生', lastVisit: '2023-11-25',
  metrics: [{ bp_sys: 190, bp_dia: 115, glucose: 7.0, weight: 68, date: '2023-12-15' }],
  labResults: [], visits: [], chatHistory: [], medications: []
}));

// ==========================================
// 3. 专科端 示例数据 (新增/修改内容)
// ==========================================

// 转诊接收 (5例，包含管理不达标具体信息)
const SPEC_REFERRAL_RECEPTION_POOL: Patient[] = [
  { 
    id: 'SR_RE_001', name: '李淑兰', age: 75, gender: '女', idCard: '3101151948********', 
    district: '南码头街道', nonComplianceType: '血压控制率极差 (188/112 mmHg) | 疑似顽固性高血压', 
    conditions: ['高血压', '慢性肾病'], status: PatientStatus.PENDING_REFERRAL, address: '浦三路200号', 
    communityGP: '王医生', lastVisit: '2023-12-01', metrics: [{ bp_sys: 188, bp_dia: 112, glucose: 6.2, weight: 65, date: '' }], 
    labResults: [{ category: '肾功', name: '肌酐', value: 145, unit: 'umol/L', status: 'high' }], visits: [], chatHistory: [], medications: ['利尿剂', 'CCB']
  },
  { 
    id: 'SR_RE_002', name: '赵爱民', age: 69, gender: '男', idCard: '3101151954********', 
    district: '花木街道', nonComplianceType: '肿瘤标志物CEA异常升高 (15.2) | 结肠癌术后疑似转移', 
    conditions: ['结肠癌术后', '高血压'], status: PatientStatus.PENDING_REFERRAL, address: '世纪大道', 
    communityGP: '张医生', lastVisit: '2023-11-20', metrics: [{ bp_sys: 140, bp_dia: 90, glucose: 5.8, weight: 62, date: '' }], 
    labResults: [{ category: '肿瘤', name: 'CEA', value: 15.2, unit: 'ng/mL', status: 'high' }], visits: [], chatHistory: [], medications: []
  },
  { 
    id: 'SR_RE_003', name: '王大福', age: 71, gender: '男', idCard: '3101151952********', 
    district: '周家渡街道', nonComplianceType: '血糖控制率不佳 (HbA1c 10.2%) | 糖尿病足II级恶化', 
    conditions: ['2型糖尿病', '冠心病'], status: PatientStatus.PENDING_REFERRAL, address: '上南路1500号', 
    communityGP: '李医生', lastVisit: '2023-12-05', metrics: [{ bp_sys: 135, bp_dia: 85, glucose: 14.2, weight: 78, date: '' }], 
    labResults: [{ category: '血糖', name: '糖化血红蛋白', value: 10.2, unit: '%', status: 'high' }], visits: [], chatHistory: [], medications: ['胰岛素']
  },
  { 
    id: 'SR_RE_004', name: '陈秀英', age: 82, gender: '女', idCard: '3101151941********', 
    district: '东明路街道', nonComplianceType: '心功能III级进展 | 频发心绞痛 | 瓣膜病变加重', 
    conditions: ['冠心病', '心力衰竭'], status: PatientStatus.PENDING_REFERRAL, address: '板泉路', 
    communityGP: '吴医生', lastVisit: '2023-11-28', metrics: [{ bp_sys: 125, bp_dia: 75, glucose: 6.0, weight: 58, date: '' }], 
    labResults: [{ category: '心标', name: 'NT-proBNP', value: 3800, unit: 'pg/mL', status: 'high' }], visits: [], chatHistory: [], medications: ['地高辛']
  },
  { 
    id: 'SR_RE_005', name: '孙建国', age: 67, gender: '男', idCard: '3101151956********', 
    district: '上钢新村', nonComplianceType: '新发脑梗死恢复期 | 房颤伴快速心室率', 
    conditions: ['脑卒中', '房颤'], status: PatientStatus.PENDING_REFERRAL, address: '历城路', 
    communityGP: '冯医生', lastVisit: '2023-12-02', metrics: [{ bp_sys: 155, bp_dia: 95, glucose: 6.5, weight: 72, date: '' }], 
    labResults: [{ category: '凝血', name: 'D-二聚体', value: 0.9, unit: 'mg/L', status: 'high' }], visits: [], chatHistory: [], medications: ['华法林']
  }
];

// 门诊预约 (5例)
// Fix: Added missing required 'conditions' property to SPEC_APPOINTMENT_SCHEDULE to satisfy Patient interface
const SPEC_APPOINTMENT_SCHEDULE: Patient[] = [
  { id: 'SA_01', name: '张德顺', age: 74, gender: '男', idCard: '310115********', district: '浦东新区', status: PatientStatus.APPOINTMENT_SCHEDULED, address: '预约系统', communityGP: '陈医生', lastVisit: '2023-12-01', metrics: [{ bp_sys: 145, bp_dia: 90, glucose: 7.0, weight: 70, date: '' }], labResults: [], visits: [], chatHistory: [], medications: [], nonComplianceType: '预约确认: 2023-12-15 09:00', conditions: ['高血压'] },
  { id: 'SA_02', name: '李梅芳', age: 66, gender: '女', idCard: '310115********', district: '浦东新区', status: PatientStatus.APPOINTMENT_SCHEDULED, address: '预约系统', communityGP: '吴医生', lastVisit: '2023-12-02', metrics: [{ bp_sys: 135, bp_dia: 85, glucose: 6.5, weight: 62, date: '' }], labResults: [], visits: [], chatHistory: [], medications: [], nonComplianceType: '预约确认: 2023-12-15 10:30', conditions: ['高血压'] },
  { id: 'SA_03', name: '王守义', age: 79, gender: '男', idCard: '310115********', district: '浦东新区', status: PatientStatus.APPOINTMENT_SCHEDULED, address: '预约系统', communityGP: '张医生', lastVisit: '2023-12-03', metrics: [{ bp_sys: 155, bp_dia: 95, glucose: 8.0, weight: 68, date: '' }], labResults: [], visits: [], chatHistory: [], medications: [], nonComplianceType: '预约确认: 2023-12-16 08:30', conditions: ['高血压'] },
  { id: 'SA_04', name: '赵大妈', age: 81, gender: '女', idCard: '310115********', district: '浦东新区', status: PatientStatus.APPOINTMENT_SCHEDULED, address: '预约系统', communityGP: '王医生', lastVisit: '2023-12-04', metrics: [{ bp_sys: 120, bp_dia: 75, glucose: 6.0, weight: 55, date: '' }], labResults: [], visits: [], chatHistory: [], medications: [], nonComplianceType: '预约确认: 2023-12-16 14:00', conditions: ['高血压'] },
  { id: 'SA_05', name: '陈建平', age: 70, gender: '男', idCard: '310115********', district: '浦东新区', status: PatientStatus.APPOINTMENT_SCHEDULED, address: '预约系统', communityGP: '周医生', lastVisit: '2023-12-05', metrics: [{ bp_sys: 140, bp_dia: 88, glucose: 7.2, weight: 75, date: '' }], labResults: [], visits: [], chatHistory: [], medications: [], nonComplianceType: '预约确认: 2023-12-17 11:15', conditions: ['高血压'] }
];

const TaskCenter: React.FC<TaskCenterProps> = ({ role, onSelectPatient, initialTab }) => {
  const [activeSubTab, setActiveSubTab] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<number>(15);

  useEffect(() => {
    const defaultTabs = {
      [UserRole.CDC_ADMIN]: 'cdc_overview',
      [UserRole.COMMUNITY_GP]: 'gp_verify',
      [UserRole.HOSPITAL_SPECIALIST]: 'spec_referral_reception'
    };
    setActiveSubTab(initialTab || defaultTabs[role] || '');
  }, [role, initialTab]);

  useEffect(() => {
    switch (activeSubTab) {
      case 'cdc_overview': setPatients(REAL_CDC_POOL); break;
      case 'cdc_dispatch': setPatients(REAL_CDC_POOL); break;
      case 'gp_verify': setPatients(REAL_GP_VERIFY_POOL); break;
      case 'gp_followup': setPatients(REAL_GP_FOLLOWUP_POOL); break;
      case 'gp_referral': setPatients(REAL_GP_REFERRAL_POOL); break;
      case 'spec_referral_reception': setPatients(REAL_SPEC_POOL); break;
      case 'spec_appointment_center': setPatients(REAL_SPEC_POOL); break;
      case 'spec_clinical_process': setPatients([REAL_SPEC_POOL[0]]); break;
      default: setPatients([]);
    }
  }, [activeSubTab]);

  const handleNotifyPatient = (p: Patient) => {
    alert(`[系统通知已发送至 ${p.name}]\n内容: 门诊预约已确认。\n医院: 浦东医院(总院)\n科室: 心内科\n时间: 12月${selectedDate}日 上午09:30\n请持身份证及社保卡准时就诊。`);
  };

  const config = {
    [UserRole.CDC_ADMIN]: {
      title: '疾控端 - 慢病监测与质控台',
      tabs: [
        { id: 'cdc_overview', label: '在管一览', icon: '📋' },
        { id: 'cdc_dispatch', label: '指派核实', icon: '🎯' },
        { id: 'cdc_template', label: '导入模板', icon: '📥' }
      ]
    },
    [UserRole.COMMUNITY_GP]: {
      title: '全科端 - 社区医防协同中心',
      tabs: [
        { id: 'gp_verify', label: '待核实一览', icon: '✅' },
        { id: 'gp_followup', label: '随访管理', icon: '🩺' },
        { id: 'gp_referral', label: '转诊申请一览', icon: '📤' }
      ]
    },
    [UserRole.HOSPITAL_SPECIALIST]: {
      title: '专科端 - 数字化协作诊疗中心',
      tabs: [
        { id: 'spec_referral_reception', label: '转诊接收', icon: '📩' },
        { id: 'spec_appointment_center', label: '门诊预约', icon: '📅' },
        { id: 'spec_clinical_process', label: '就诊过程', icon: '🏥' }
      ]
    }
  }[role];

  const renderCalendarUI = () => (
    <div className="grid grid-cols-12 gap-10 h-full animate-in fade-in duration-700">
       <div className="col-span-4 glass-card p-10 rounded-[4rem] border-white/5 bg-slate-900/40">
          <div className="flex justify-between items-center mb-10">
             <h4 className="text-3xl font-black text-white italic">2023年12月</h4>
             <div className="flex gap-3">
                <button className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">􀄪</button>
                <button className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">􀄫</button>
             </div>
          </div>
          <div className="grid grid-cols-7 gap-3 mb-6">
             {['一', '二', '三', '四', '五', '六', '日'].map(d => <span key={d} className="text-[11px] font-black text-slate-600 text-center uppercase tracking-widest">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-4">
             {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                <button 
                  key={d} 
                  onClick={() => setSelectedDate(d)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl text-xs font-black transition-all border ${
                    selectedDate === d ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-110 z-10' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                  }`}
                >
                   {d}
                   {d === 15 || d === 16 || d === 17 ? <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1"></span> : null}
                </button>
             ))}
          </div>
          <div className="mt-16 space-y-6">
             <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">当日出诊专家: 3名</p>
             </div>
             <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">剩余预约号源: 12个</p>
             </div>
          </div>
       </div>
       <div className="col-span-8 space-y-8">
          <div className="flex justify-between items-end mb-4 px-4">
             <div>
                <h4 className="text-4xl font-black text-white tracking-tighter">当日预约患者录</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2">Appointment List for Dec {selectedDate}</p>
             </div>
             <button className="px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3">
               􀥄 全员就诊提醒
             </button>
          </div>
          <div className="grid grid-cols-2 gap-8 h-[600px] overflow-y-auto no-scrollbar pb-20">
             {patients.map(p => renderPatientCard(p))}
          </div>
       </div>
    </div>
  );

  const renderClinicalProcessUI = () => {
    const p = patients[0] || SPEC_REFERRAL_RECEPTION_POOL[0];
    return (
      <div className="glass-card p-16 rounded-[4.5rem] border-white/10 bg-white/5 space-y-16 animate-in slide-in-from-bottom-10 duration-1000">
         <div className="flex justify-between items-start border-b border-white/5 pb-12">
            <div className="flex gap-10">
               <div className="w-40 h-40 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[3.5rem] flex items-center justify-center text-7xl shadow-2xl ring-8 ring-white/5">
                 {p.gender === '男' ? '👴' : '👵'}
               </div>
               <div>
                  <h3 className="text-6xl font-black text-white tracking-tighter mb-6">{p.name}</h3>
                  <div className="flex gap-6">
                     <span className="px-5 py-2 bg-white/5 rounded-2xl border border-white/10 text-[11px] font-black text-slate-400 uppercase tracking-widest">{p.age}岁 / {p.gender}</span>
                     <span className="px-5 py-2 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/10 text-[11px] font-black uppercase tracking-widest">就诊状态: 诊疗方案制定中</span>
                  </div>
               </div>
            </div>
            <div className="flex flex-col items-end gap-6">
               <button className="px-12 py-6 bg-emerald-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform active:scale-95">转出康复 / 回归社区管理</button>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Current Flow: Rehabilitation Assessment</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-12">
            <div className="space-y-8">
               <div className="glass-card p-10 rounded-[3.5rem] border-white/5 bg-slate-900/60 shadow-inner">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">􀉚</div>
                     <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest">门诊诊断 & 临床主诉</h4>
                  </div>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-sm text-slate-200 outline-none h-40 font-medium leading-relaxed focus:border-blue-500/50 transition-all" defaultValue={`患者主诉：${p.nonComplianceType}\n临床诊断：原发性高血压(3级，极高危组)，慢性肾脏病(G3a期)。\n诊疗备注：社区三联用药效果不佳，需调整为沙库巴曲缬沙坦方案。`} />
               </div>
               <div className="glass-card p-10 rounded-[3.5rem] border-white/5 bg-slate-900/60 shadow-inner">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400">🔍</div>
                     <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">相关临床检查 / 辅助报告</h4>
                  </div>
                  <div className="space-y-4">
                     {['心脏彩超: 左心室向心性肥厚', '24h动态血压: 夜间血压未降', '眼底检查: 视网膜动脉硬化II级'].map(ex => (
                        <div key={ex} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all cursor-pointer">
                           <span className="text-xs font-bold text-slate-300">{ex}</span>
                           <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">PDF 报告预览</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            <div className="space-y-8">
               <div className="glass-card p-10 rounded-[3.5rem] border-white/5 bg-slate-900/60 shadow-inner">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center text-orange-400">💊</div>
                     <h4 className="text-xs font-black text-orange-400 uppercase tracking-widest">用药调整 & 预后建议</h4>
                  </div>
                  <div className="space-y-4 mb-6">
                     <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl">
                        <p className="text-sm font-black text-white mb-2">沙库巴曲缬沙坦钠片 (200mg bid)</p>
                        <p className="text-[10px] text-blue-300 italic opacity-80">建议连续服用4周后复查肾功。注意血压波动。</p>
                     </div>
                     <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                        <p className="text-sm font-black text-white mb-2">苯磺酸氨氯地平 (5mg qd)</p>
                        <p className="text-[10px] text-slate-500 italic">维持原剂量，监测下肢水肿情况。</p>
                     </div>
                  </div>
               </div>
               <div className="glass-card p-10 rounded-[3.5rem] border-white/5 bg-emerald-500/5 ring-1 ring-emerald-500/20">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400">↩️</div>
                     <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">出院及社区健康指导</h4>
                  </div>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-sm text-slate-200 outline-none h-40 font-medium leading-relaxed italic" defaultValue="建议转回社区管理。重点监测晨起血压，限盐限钾，每月进行一次线上门诊复诊。如出现头晕加重请实时通过APP发起急救响应。" />
               </div>
            </div>
         </div>
      </div>
    );
  };

  const renderPatientCard = (p: Patient) => (
    <div key={p.id} className="glass-card p-6 rounded-[2rem] border border-white/5 hover:border-blue-500/20 transition-all group flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-5">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              {p.gender === '男' ? '👴' : '👵'}
            </div>
            <div>
              <h3 className="text-base font-black text-white cursor-pointer hover:text-blue-400" onClick={() => onSelectPatient(p)}>{p.name}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{p.age}岁 · {p.district}</p>
            </div>
          </div>
          <button onClick={() => onSelectPatient(p)} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 text-sm">›</button>
        </div>
        
        <div className="bg-rose-500/5 p-4 rounded-[1.5rem] border border-rose-500/10 mb-4 min-h-[60px] flex flex-col justify-center">
          <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">转诊原因 / 管理不达标详情</p>
          <p className="text-xs font-bold text-slate-200 leading-relaxed">{p.nonComplianceType}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
           <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[8px] text-slate-500 uppercase font-black mb-1">最近血压</p>
              <p className="text-base font-black text-white">{p.metrics[0].bp_sys}/{p.metrics[0].bp_dia}</p>
           </div>
           <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[8px] text-slate-500 uppercase font-black mb-1">最近血糖</p>
              <p className="text-base font-black text-white">{p.metrics[0].glucose}</p>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {activeSubTab === 'gp_verify' && (
          <div className="flex gap-2 mt-2">
            <button className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">核实并转入管理</button>
            <button className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">非管辖退回</button>
          </div>
        )}
        {activeSubTab === 'gp_followup' && (
          <div className="grid grid-cols-2 gap-2 mt-2">
             <button className="py-3 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">健康干预</button>
             <button className="py-3 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">疫苗屏障</button>
             <button className="col-span-2 py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">发起医疗救助/转诊</button>
          </div>
        )}
        {activeSubTab === 'gp_referral' && (
          <div className="space-y-3 mt-2">
             <div className="glass-card p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-1">AI 转诊辅助建议</p>
                <p className="text-[10px] text-indigo-100/80 leading-relaxed italic">"根据患者病情波动，建议上划至三级医院心内科进行深度评估。"</p>
             </div>
             <div className="space-y-2">
                <select className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black text-slate-300 outline-none"><option>-- 择转诊医疗机构 --</option><option>上海市东方医院</option></select>
                <select className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black text-slate-300 outline-none"><option>-- 选择意向专科医生 --</option><option>王主任 (首席专家)</option></select>
             </div>
             <button className="w-full py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95">提交转诊申请单</button>
          </div>
        )}
        {activeSubTab === 'spec_referral_reception' && (
          <div className="flex flex-col gap-2 mt-2">
            <button className="w-full py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">确认接收转诊</button>
            <div className="flex gap-2">
               <button className="flex-1 py-2.5 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95">拒绝</button>
               <button className="flex-1 py-2.5 bg-orange-600/20 border border-orange-500/30 text-orange-400 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95">建议再上转</button>
            </div>
          </div>
        )}
        {activeSubTab === 'spec_appointment_center' && (
           <button onClick={() => handleNotifyPatient(p)} className="w-full py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-2">
              通知患者就诊信息
           </button>
        )}
        {activeSubTab === 'cdc_overview' && (
           <button onClick={() => onSelectPatient(p)} className="w-full py-3 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest mt-2">👁️ 查看健康数字孪生</button>
        )}
        {activeSubTab === 'cdc_dispatch' && (
           <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg mt-2">🎯 确认派发街道中心</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-full mx-auto px-2 lg:px-12 pb-28 relative min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-8">
        <div>
           <h2 className="text-2xl font-black text-white tracking-tight font-yihe">{config?.title}</h2>
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-1">Medical-Prevention Digital Command Hub</p>
        </div>
        <div className="flex bg-slate-900/80 p-1.5 rounded-[2rem] border border-white/10 shadow-inner overflow-x-auto no-scrollbar">
          {config?.tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} className={`whitespace-nowrap px-6 py-3 rounded-[1.5rem] text-[11px] font-black transition-all flex items-center gap-2 ${activeSubTab === tab.id ? 'bg-blue-600 text-white shadow-2xl' : 'text-slate-500 hover:text-slate-300'}`}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[800px]">
        {activeSubTab === 'spec_appointment_center' ? (
           renderCalendarUI()
        ) : activeSubTab === 'spec_clinical_process' ? (
           renderClinicalProcessUI()
        ) : patients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8 items-stretch">
            {patients.map(p => renderPatientCard(p))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed border-white/5 rounded-[4rem]">
             <span className="text-6xl opacity-10 mb-4">📂</span>
             <p className="text-slate-600 font-black uppercase tracking-widest">当前任务队列已清空</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-32 left-12 right-12 flex justify-between items-center pointer-events-none z-30">
          <div className="flex gap-4">
             <div className="glass-card px-8 py-4 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-4 animate-in slide-in-from-left-10">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]"></div>
                <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">全域协作网: 专科联席指挥部在线</p>
             </div>
          </div>
          <div className="flex gap-4">
             <div className="glass-card px-8 py-4 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_#3b82f6]"></div>
                <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">数据流状态: 三端闭环映射就绪</p>
             </div>
          </div>
      </div>
    </div>
  );
};

export default TaskCenter;
