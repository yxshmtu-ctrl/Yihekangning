
import React, { useState } from 'react';
import { Patient, PatientStatus } from '../types';

const mockPatients: Patient[] = [
  {
    id: '1',
    idCard: '110101195101010012',
    name: '张大爷',
    age: 72,
    gender: '男',
    status: PatientStatus.WARNING,
    conditions: ['高血压', '2型糖尿病'],
    medications: ['氨氯地平 5mg qd'],
    labResults: [],
    lastVisit: '2023-11-25',
    communityGP: '王医生',
    address: '幸福路12号',
    district: '长青街社区',
    metrics: [{ date: '2023-11-25', bp_sys: 158, bp_dia: 95, glucose: 8.5, weight: 75 }],
    visits: [],
    chatHistory: []
  },
  {
    id: '2',
    idCard: '110101195505051234',
    name: '王奶奶',
    age: 68,
    gender: '女',
    status: PatientStatus.NORMAL,
    conditions: ['冠心病'],
    medications: [],
    labResults: [],
    lastVisit: '2023-11-28',
    communityGP: '李医生',
    address: '阳光大道88号',
    district: '晨曦镇中心',
    metrics: [{ date: '2023-11-28', bp_sys: 125, bp_dia: 80, glucose: 5.6, weight: 62 }],
    visits: [],
    chatHistory: []
  }
];

interface PatientListProps {
  onSelect: (patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ onSelect }) => {
  const [search, setSearch] = useState('');

  const getStatusStyle = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.NORMAL: return 'bg-emerald-50 text-emerald-600';
      case PatientStatus.WARNING: return 'bg-amber-50 text-amber-600';
      case PatientStatus.CRITICAL: return 'bg-rose-50 text-rose-600';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="px-1 flex flex-col gap-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">全域健康档案</h2>
        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl jd-shadow border border-slate-50">
          <span className="text-slate-300">🔍</span>
          <input 
            type="text" 
            placeholder="搜索姓名、身份证..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="space-y-4">
        {mockPatients.filter(p => p.name.includes(search)).map((patient) => (
          <div 
            key={patient.id} 
            onClick={() => onSelect(patient)}
            className="interactive-card bg-white rounded-[2rem] p-6 jd-shadow border border-slate-50 cursor-pointer flex items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl">
                {patient.gender === '男' ? '👴' : '👵'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">{patient.name}</h3>
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${getStatusStyle(patient.status)}`}>
                    {patient.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">
                  {patient.age}岁 · {patient.district}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 hidden md:flex border-x border-slate-100 px-6">
               <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">最近血压</p>
                  <p className="text-md font-black text-slate-800">{patient.metrics[0].bp_sys}/{patient.metrics[0].bp_dia}</p>
               </div>
               <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">最近血糖</p>
                  <p className={`text-md font-black ${patient.metrics[0].glucose > 7 ? 'text-rose-500' : 'text-slate-800'}`}>{patient.metrics[0].glucose}</p>
               </div>
            </div>

            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 font-black">􀄪</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientList;
