// Unity 学习路线：把分散的 Unity 学习文章组织成建议学习顺序
export interface LearningStep {
  step: string // 阶段名
  title: string
  slug: string
  desc: string
  status?: 'done' | 'wip' // 该步对应学习内容：已完成 / 仍在连载推进（阶段3A）
}

export const UNITY_LEARNING_PATH: LearningStep[] = [
  {
    step: '第 1 步',
    title: 'Unity 零基础入门指南',
    slug: '2026-07-31-Unity-零基础入门指南',
    desc: '从装好 Unity 到跑通第一个场景',
    status: 'done',
  },
  {
    step: '第 2 步',
    title: 'Unity 第一阶段：基础入门与核心概念',
    slug: '2026-08-11-Unity-基础入门与核心概念',
    desc: '场景、组件、脚本、生命周期等核心概念',
    status: 'done',
  },
  {
    step: '第 3 步',
    title: 'Unity 第二阶段：设计模式与代码结构',
    slug: '2026-08-28-Unity-第二阶段-设计模式与代码结构',
    desc: '观察者/事件、状态机、对象池、工厂等常用结构与解耦',
    status: 'done',
  },
  {
    step: '第 4 步',
    title: 'Unity 第三阶段：项目架构与工程化实践',
    slug: '2026-09-08-Unity-第三阶段-项目架构与工程化实践',
    desc: '架构分层、数据驱动、场景流、存档、UI 与工程化',
    status: 'wip',
  },
]
