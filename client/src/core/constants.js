export const SUBJECTS = [
  { id: 'CSAPP', label: 'CSAPP' },
  { id: 'DATA_STRUCTURES', label: '数据结构' },
];

export const LEARNING_MODES = [
  {
    id: 'context_stacking',
    label: 'Context Stacking 超前学习',
    hint: '把新旧材料串起来，先建立本周知识地图。',
  },
  {
    id: 'after_class_review',
    label: '课后深度复习',
    hint: '按 PPT 页码建立结构化理解和追问链。',
  },
  {
    id: 'examiner_perspective',
    label: '出题人视角',
    hint: '从考点、陷阱和迁移题角度拆解题目。',
  },
  {
    id: 'feynman',
    label: '费曼反讲',
    hint: '用自己的话解释概念，再暴露理解偏差。',
  },
  {
    id: 'multi_source_collision',
    label: '多维信息对撞',
    hint: '比较三份材料的观点、冲突和证据强弱。',
  },
];

export const LEARNING_PREFERENCES = [
  { id: 'framework_first', label: '框架优先' },
  { id: 'outline_then_fill', label: '目录后填充' },
  { id: 'reverse_thinking', label: '反向思考' },
  { id: 'why_chain', label: '追问为什么' },
  { id: 'essence_first', label: '提炼本质' },
  { id: 'exam_focus', label: '考试考点' },
  { id: 'engineering_use', label: '工程应用' },
  { id: 'less_repetition', label: '少重复' },
  { id: 'simple_explain', label: '12 岁也能懂' },
  { id: 'step_by_step', label: '渐进解释' },
  { id: 'interactive_check', label: '互动验证' },
  { id: 'obsidian_output', label: 'Obsidian 输出' },
];

export const DEFAULT_PAGE_NUMBER = 12;
