// Unity 学习路线：把分散的 Unity 学习文章组织成建议学习顺序
export interface LearningStep {
  step: string // 阶段名
  title: string
  slug: string
  desc: string
  status?: 'done' | 'wip' // 该步对应学习内容：已完成 / 仍在连载推进
  related?: { title: string; slug: string; note?: string }[] // 同阶段配套文章
  quizCat?: string // 可用题库分类名（/learn 练习入口）
  checks?: string[] // 能力自检清单（可在 /learn 页勾选，localStorage 持久化）
}

export const UNITY_LEARNING_PATH: LearningStep[] = [
  {
    step: '第 1 步',
    title: 'Unity 零基础入门指南',
    slug: '2026-07-31-Unity-零基础入门指南',
    desc: '从装好 Unity 到跑通第一个场景',
    status: 'done',
    related: [
      { title: 'Unity 新手学习推荐', slug: '2025-10-20-Unity新手学习推荐', note: '动手之前先看这份方式建议' },
      { title: 'Unity 资源分享', slug: '2025-10-19-Unity资源分享', note: '配套学习资料合集' },
    ],
    checks: [
      '装好 Unity Hub，创建第一个 3D 项目',
      '在场景中摆放物体并理解 Transform',
      '运行 / 停止游戏，区分 Scene 与 Game 视图',
      '能给物体添加组件并看懂 Inspector 属性',
    ],
  },
  {
    step: '第 2 步',
    title: 'Unity 第一阶段：基础入门与核心概念',
    slug: '2026-08-11-Unity-基础入门与核心概念',
    desc: '场景、组件、脚本、生命周期等核心概念',
    status: 'done',
    quizCat: 'Unity核心',
    checks: [
      '能说清 GameObject 与 Component 的关系',
      '掌握 MonoBehaviour 生命周期调用顺序',
      '会用 Input / 刚体 / 碰撞器做基础移动与碰撞',
      '能切换场景、实例化预制体',
    ],
  },
  {
    step: '第 3 步',
    title: 'Unity 第二阶段：设计模式与代码结构',
    slug: '2026-08-28-Unity-第二阶段-设计模式与代码结构',
    desc: '观察者/事件、状态机、对象池、工厂等常用结构与解耦',
    status: 'done',
    quizCat: '架构与设计模式',
    checks: [
      '用事件 / 委托完成两个系统间的解耦',
      '能实现一个状态机并说清适用场景',
      '理解对象池降低 GC 与实例化开销的原理',
      '能识别过度抽象，保持结构简单',
    ],
  },
  {
    step: '第 4 步',
    title: 'Unity 第三阶段：项目架构与工程化实践',
    slug: '2026-09-08-Unity-第三阶段-项目架构与工程化实践',
    desc: '架构分层、数据驱动、场景流、存档、UI 与工程化',
    status: 'wip',
    quizCat: '热更与工程',
    checks: [
      '能说清架构分层各自职责与边界',
      '理解数据驱动配置与序列化的应用',
      '知道 Addressables 与资源加载策略的取舍',
      '能组织场景流、存档与 UI 管理',
    ],
  },
]
