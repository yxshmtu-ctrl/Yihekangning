import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import BigScreen from './components/BigScreen';
import AIVisualHeader from './components/AIVisualHeader';
import CDCWorkflow from './components/CDCWorkflow';
import TaskCenter from './components/TaskCenter';
import Settings from './components/Settings';
import PatientOnboarding from './components/PatientOnboarding';
import PatientDashboard from './components/PatientDashboard';
import { UserRole, Patient, PatientStatus } from './types';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.CDC_ADMIN);
  const [activeTab, setActiveTab] = useState('tasks');
  const [initialSubTab, setInitialSubTab] = useState<string | undefined>(undefined);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  const [mockPatient] = useState<Patient>({
    id: 'P_SELF', name: '李建国', idCard: '1101011952********', age: 71, gender: '男',
    status: PatientStatus.NORMAL, conditions: ['高血压'], medications: ['氨氯地平'],
    labResults: [], metrics: [{ date: '2023-11-01', bp_sys: 135, bp_dia: 85, glucose: 5.8, weight: 70 }],
    lastVisit: '', communityGP: '王医生', address: '颐和花园', district: '长青街社区',
    chatHistory: [], visits: []
  });

  const isBigScreenActive = activeTab === 'bigscreen';
  const showNav = !isBigScreenActive && (currentRole !== UserRole.PATIENT || hasOnboarded);

  const navigateToTask = (subTabId: string) => {
    setInitialSubTab(subTabId);
    setActiveTab('tasks');
  };

  const renderContent = () => {
    if (currentRole === UserRole.PATIENT && !hasOnboarded) {
      return <PatientOnboarding onComplete={() => setHasOnboarded(true)} />;
    }
    if (isBigScreenActive) {
      return <BigScreen onClose={() => setActiveTab('dashboard')} />;
    }
    if (selectedPatient) {
      return <PatientDetail patient={selectedPatient} onBack={() => setSelectedPatient(null)} userRole={currentRole} />;
    }
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            <AIVisualHeader />
            {currentRole === UserRole.PATIENT ? <PatientDashboard patient={mockPatient} /> : <Dashboard role={currentRole} onNavigateToTask={navigateToTask} />}
          </div>
        );
      case 'patients': return <div className="max-w-[1600px] mx-auto"><PatientList onSelect={setSelectedPatient} /></div>;
      case 'tasks': return <div className="max-w-full"><TaskCenter role={currentRole} onSelectPatient={setSelectedPatient} initialTab={initialSubTab} /></div>;
      case 'dispatch': return <div className="max-w-[1600px] mx-auto"><CDCWorkflow /></div>;
      case 'settings': return <div className="max-w-[1400px] mx-auto"><Settings /></div>;
      default: return <TaskCenter role={currentRole} onSelectPatient={setSelectedPatient} initialTab={initialSubTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050B1A] flex text-slate-200 overflow-hidden">
      {showNav && (
        <Navigation
          currentRole={currentRole}
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setInitialSubTab(undefined); }}
          onNavigateToTask={navigateToTask}
        />
      )}

      <main className={`flex-1 transition-all duration-300 h-screen overflow-y-auto custom-scrollbar
        ${isBigScreenActive ? 'ml-0 p-0' : showNav ? 'lg:ml-80 ml-0' : 'ml-0'}
        ${isBigScreenActive ? '' : showNav ? 'pt-16 lg:pt-0' : ''}
        p-4 lg:p-10 pb-24`}>
        {renderContent()}
      </main>

      {/* 底部角色切换 Dock */}
      {!isBigScreenActive && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 glass-card p-1.5 rounded-[2rem] flex gap-1 tech-shadow z-50 border border-white/20">
          {[
            { r: UserRole.CDC_ADMIN, label: '疾控端', color: 'bg-indigo-600' },
            { r: UserRole.COMMUNITY_GP, label: '全科端', color: 'bg-blue-600' },
            { r: UserRole.HOSPITAL_SPECIALIST, label: '专科端', color: 'bg-slate-700' },
            { r: UserRole.PATIENT, label: '患者端', color: 'bg-emerald-600' }
          ].map(item => (
            <button key={item.r}
              onClick={() => {
                setCurrentRole(item.r);
                setActiveTab(item.r === UserRole.PATIENT ? 'dashboard' : 'tasks');
                setInitialSubTab(undefined);
                setSelectedPatient(null);
              }}
              className={`px-4 py-2 lg:px-6 lg:py-2.5 rounded-[1.5rem] text-[10px] font-black tracking-widest transition-all ${
                currentRole === item.r ? `${item.color} text-white shadow-lg` : 'text-slate-500 hover:text-white'
              }`}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
