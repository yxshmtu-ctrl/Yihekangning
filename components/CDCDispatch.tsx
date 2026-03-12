
import React, { useState } from 'react';
import { Patient, PatientStatus, UserRole } from '../types';

const mockUnmetPatients: Patient[] = [
  {
    id: 'D001',
    // Added idCard for type compliance
    idCard: '110101194401015678',
    name: '赵铁柱',
    age: 79,
    gender: '男',
    status: PatientStatus.PENDING_ASSIGNMENT,
    conditions: ['高血压', '慢阻肺'],
    // Added medications for type compliance
    medications: ['氨氯地平 5mg qd', '沙丁胺醇 100ug prn'],
    // Added labResults for type compliance
    labResults: [
      { category: '肺功', name: 'FEV1/FVC', value: 65, unit: '%', status: 'low' }
    ],
    lastVisit: '2023-09-12',
    communityGP: '待指派',
    address: '幸福路12号幸福里小区3栋',
    district: '长青街社区',
    unmetReason: '指标不达标',
    metrics: [{ date: '2023-09-12', bp_sys: 165, bp_dia: 102, glucose: 7.1, weight: 68 }],
    visits: [],
    chatHistory: []
  },
  {
    id: 'D002',
    // Added idCard for type compliance
    idCard: '110101195805051234',
    name: '孙美玲',
    age: 65,
    gender: '女',
    status: PatientStatus.PENDING_ASSIGNMENT,
    conditions: ['2型糖尿病'],
    // Added medications for type compliance
    medications: ['格列齐特 30mg qd'],
    // Added labResults for type compliance
    labResults: [
      { category: '血糖', name: '空腹血糖', value: 11.2, unit: 'mmol/L', status: 'high' }
    ],
    lastVisit: '2023-08-05',
    communityGP: '待指派',
    address: '阳光大道88号阳光明珠12号楼',
    district: '晨曦镇卫生中心',
    unmetReason: '新发疾病',
    metrics: [{ date: '2023-08-05', bp_sys: 138, bp_dia: 88, glucose: 11.2, weight: 55 }],
    visits: [],
    chatHistory: []
  }
];

interface CDCDispatchProps {
  role: UserRole;
}

const CDCDispatch: React.FC<CDCDispatchProps> = ({ role }) => {
  const [patients, setPatients] = useState<Patient[]>(mockUnmetPatients);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleAutoDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      const updated = patients.map(p => ({
        ...p,
        status: PatientStatus.PENDING_VERIFICATION,
        communityGP: p.district + '核实中'
      }));
      setPatients(updated);
      setIsDispatching(false);
    }, 2000);
  };

  const handleAction = (id: string, action: 'verify' | 'return') => {
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">智能派发中心</h2>
          <p className="text-slate-500 mt-2 font-medium">全域不达标老年患者自动分拣与指派系统</p>
        </div>
        {role === UserRole.CDC_ADMIN && (
          <button 
            onClick={handleAutoDispatch}
            disabled={isDispatching}
            className={`px-8 py-4 rounded-2xl font-bold text-white transition-all shadow-xl ${
              isDispatching ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 scale-100 hover:scale-105 active:scale-95'
            }`}
          >
            {isDispatching ? '🚀 正在智能分拣...' : '🎯 启动全域自动派发'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {patients.map(p => (
          <div key={p.id} className="glass rounded-[2rem] p-8 apple-shadow hover-lift border border-white/60">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                  {p.gender === '男' ? '👴' : '👵'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{p.id} · {p.age}岁</p>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${
                p.unmetReason === '指标不达标' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {p.unmetReason}
              </span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-0.5">📍</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">{p.district}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">疾病情况</p>
                  <p className="text-sm font-semibold text-slate-700">{p.conditions.join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">当前状态</p>
                  <p className={`text-sm font-bold ${p.status === PatientStatus.PENDING_ASSIGNMENT ? 'text-slate-400' : 'text-blue-600 animate-pulse'}`}>
                    {p.status}
                  </p>
                </div>
              </div>
            </div>

            {role === UserRole.COMMUNITY_GP && p.status === PatientStatus.PENDING_VERIFICATION && (
              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction(p.id, 'verify')}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 active:scale-95 transition-transform"
                >
                  确认接收管理
                </button>
                <button 
                  onClick={() => handleAction(p.id, 'return')}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  信息不实退回
                </button>
              </div>
            )}
          </div>
        ))}
        {patients.length === 0 && (
          <div className="col-span-2 py-20 text-center">
            <div className="text-6xl mb-6 opacity-20">🍃</div>
            <p className="text-slate-400 font-medium">暂无待处理派发任务</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CDCDispatch;
