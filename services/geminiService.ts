import { Patient, WellnessPrescription } from "../types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getAIWellnessPrescription = async (patient: Patient): Promise<WellnessPrescription | null> => {
  await delay(3200);
  return {
    dietTherapy: {
      title: "山药薏仁粥 · 健脾化湿方",
      desc: `针对${patient.name}的体质，以健脾益气、化痰祛湿为核心治则，选用药食同源之品，调和气血阴阳。`,
      ingredients: ["山药30g", "薏苡仁20g", "茯苓15g", "芡实15g", "红枣5枚", "粳米100g"]
    },
    exercise: {
      title: "八段锦 · 调理脾胃须单举",
      benefit: "疏通三焦，调和脾胃，改善气血循环，适合老年慢性病患者日常练习。",
      steps: "1.自然站立，双脚与肩同宽。2.左手上举掌心朝上，右手下按掌心朝下。3.两手对拉保持5秒。4.左右交替各做8次。每日晨起15分钟。"
    },
    technique: {
      name: "足三里穴位按摩",
      position: "小腿外侧，犊鼻下3寸，胫骨前嵴外一横指处",
      action: "以拇指指腹顺时针按揉，每次3分钟，力度适中，以酸胀感为宜。每日早晚各一次。"
    },
    aiThought: `综合${patient.name}患者年龄${patient.age}岁、血压${patient.metrics[0]?.bp_sys}/${patient.metrics[0]?.bp_dia}mmHg及血糖${patient.metrics[0]?.glucose}mmol/L数据：食疗健脾祛湿为主；功法选八段锦；穴位选足三里补后天之本。三法协同，标本兼治。`
  };
};

export const getHealthAnalysis = async (patient: Patient) => {
  await delay(1500);
  return {
    summary: `患者${patient.name}，${patient.age}岁，整体健康管理状态尚可。血压${patient.metrics[0]?.bp_sys}/${patient.metrics[0]?.bp_dia}mmHg，血糖${patient.metrics[0]?.glucose}mmol/L，建议加强随访频率，重点监测心血管风险指标。`,
    risks: ["收缩压偏高，需持续监测心血管事件风险","多病共患，多药联用存在相互作用风险","建议每月复查肾功能及血脂全套","关注跌倒风险，建议家庭环境安全评估"]
  };
};

export const getDeepDiagnosis = async (patient: Patient) => {
  await delay(3500);
  return {
    fusion_summary: `患者${patient.name}（${patient.age}岁）现患${patient.conditions.join('、')}，三端数据融合分析显示整体慢病控制处于临界状态。血压${patient.metrics[0]?.bp_sys}/${patient.metrics[0]?.bp_dia}mmHg，提示靶器官损害风险中等。建议启动强化管理方案，每2周随访一次。`,
    drug_interaction_report: `现用药方案中各类药物之间存在潜在相互作用风险。建议药剂师审方，重点关注利尿剂与ACEI类药物联用时的血钾水平，每月复查血生化。如肌酐升高超过30%基线值，应立即调整方案。`,
    specific_intervention: `建议社区全科医生每2周随访一次，重点监测晨起血压和空腹血糖。血压持续超过180/110mmHg时立即启动绿色通道转诊流程。同时建议转介营养科进行个体化膳食指导。`,
    confidence_score: 0.87,
    urgency_alert: (patient.metrics[0]?.bp_sys || 0) > 180 ? "⚠️ 高危：建议48小时内复诊" : "🟡 中危：建议2周内随访"
  };
};

export const getReferralAdvice = async (patient: Patient) => {
  await delay(1800);
  return {
    aiReasoning: `基于患者${patient.name}的异常类型「${patient.nonComplianceType || '指标波动'}」及当前生命体征综合分析，社区医疗资源已难以满足其诊疗需求，建议启动上级医院转诊流程。`,
    suggestedDept: patient.conditions.includes('冠心病') || patient.conditions.includes('心力衰竭') ? '心内科' : patient.conditions.includes('慢性肾病') ? '肾内科' : patient.conditions.includes('2型糖尿病') ? '内分泌科' : '老年医学科',
    urgency: (patient.metrics[0]?.bp_sys || 0) > 185 ? "紧急（24小时内）" : "普通（1周内）",
    preHospitalAction: "转诊前请完善：①近3个月血压记录表；②空腹血糖及糖化血红蛋白；③肾功能、电解质；④心电图。并通知患者家属陪同就诊。"
  };
};
