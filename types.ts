
export enum PatientStatus {
  NORMAL = '正常',
  WARNING = '预警',
  CRITICAL = '危急',
  FOLLOW_UP = '随访监测',
  REFERRED = '已转诊',
  PENDING_ASSIGNMENT = '待派发',
  PENDING_VERIFICATION = '待核实',
  SPECIALIST_REVIEW = '专家核信中',
  APPOINTMENT_SCHEDULED = '预约已确认',
  IN_TREATMENT = '诊疗中',
  REHABILITATION = '康复评估',
  PENDING_RETURN = '待转回社区',
  COMPLETED = '已结案',
  PENDING_REFERRAL = '待发起转诊'
}

export enum UserRole {
  CDC_ADMIN = 'CDC_ADMIN',
  COMMUNITY_GP = 'COMMUNITY_GP',
  HOSPITAL_SPECIALIST = 'HOSPITAL_SPECIALIST',
  PATIENT = 'PATIENT'
}

export interface WellnessPrescription {
  dietTherapy: { title: string; desc: string; ingredients: string[] };
  exercise: { title: string; benefit: string; steps: string };
  technique: { name: string; position: string; action: string };
  aiThought: string;
}

export interface ReferralInfo {
  targetHospital?: string;
  targetDepartment?: string;
  targetSpecialist?: string;
  reason?: string;
  appointmentTime?: string;
  aiSuggestion?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  prognosis?: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export interface HealthMetric {
  date: string;
  bp_sys: number;
  bp_dia: number;
  glucose: number;
  weight: number;
  bmi?: number;
  heart_rate?: number;
  waist?: number; // 腰围
}

export interface LabResult {
  category: string;
  name: string;
  value: string | number;
  unit: string;
  status: 'normal' | 'high' | 'low';
}

export interface Patient {
  id: string;
  idCard: string;
  name: string;
  age: number;
  gender: '男' | '女';
  status: PatientStatus;
  conditions: string[]; // 在患疾病 (Charlson/CCI Category)
  newConditions?: string[]; // 新发疾病
  cciScore?: number; // 疾病负担CCI评分
  medications: string[];
  labResults: LabResult[];
  lastVisit: string;
  communityGP: string;
  address: string;
  district: string;
  unmetReason?: string;
  metrics: HealthMetric[];
  visits: any[];
  chatHistory: ChatMessage[];
  managementScore?: number;
  referral?: ReferralInfo;
  nonComplianceType?: string; // 管理不达标信息
  wellnessPrescription?: WellnessPrescription;
}
