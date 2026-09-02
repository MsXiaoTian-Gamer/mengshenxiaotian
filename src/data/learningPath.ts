// Unity 学习路线：把分散的 Unity 学习文章组织成建议学习顺序
export interface LearningStep {
  step: string // 阶段名
  title: string
  slug: string
  desc: string
}

export const UNITY_LEARNING_PATH: LearningStep[] = [
  {
    step: '第 1 步',
    title: 'Unity 新手学习推荐',
    slug: '2025-10-20-Unity新手学习推荐',
    desc: '怎么选课、怎么规划学习路线',
  },
  {
    step: '第 2 步',
    title: 'Unity 零基础入门指南',
    slug: '2026-07-31-Unity-零基础入门指南',
    desc: '从装好 Unity 到跑通第一个场景',
  },
  {
    step: '第 3 步',
    title: 'Unity 第一阶段：基础入门与核心概念',
    slug: '2026-08-11-Unity-基础入门与核心概念',
    desc: '场景、组件、脚本、生命周期等核心概念',
  },
  {
    step: '工具箱',
    title: 'Unity 资源分享',
    slug: '2025-10-19-Unity资源分享',
    desc: '学习过程中好用的资源与工具',
  },
]
