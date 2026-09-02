// 由迁移脚本生成：文章元数据（与 src/content/*.md 一一对应）
export interface ArticleMeta {
  title: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  path: string;  // md 文件名，content key
  slug: string;  // 路由 slug（path 去掉 .md）
}

export const ARTICLES: ArticleMeta[] = [
  { title: "吉比特 Unity 客户端面试经历", date: "2026-08-19", tags: ["面试", "吉比特", "Unity"], path: "2026-08-19-gbits-unity-client-interview.md", slug: "2026-08-19-gbits-unity-client-interview" },
  { title: "米哈游游戏客户端笔经", date: "2026-08-17", tags: ["笔试", "米哈游", "客户端"], path: "2026-08-17-mihoyo-game-client-interview.md", slug: "2026-08-17-mihoyo-game-client-interview" },
  { title: "Unity 第一阶段：基础入门与核心概念学习笔记", date: "2026-08-11", tags: ["Unity", "学习"], path: "2026-08-11-Unity-基础入门与核心概念.md", slug: "2026-08-11-Unity-基础入门与核心概念" },
  { title: "Unity 零基础入门指南", date: "2026-07-31", tags: ["Unity", "学习"], path: "2026-07-31-Unity-零基础入门指南.md", slug: "2026-07-31-Unity-零基础入门指南" },
  { title: "Tiny Pet Sand Wars 更新来啦！🎉", date: "2026-07-14", tags: ["GameDev", "独立游戏", "更新"], path: "2026-07-14-Tiny-Pet-Sand-Wars-更新.md", slug: "2026-07-14-Tiny-Pet-Sand-Wars-更新" },
  { title: "Tiny Pet Sand Wars 更新来啦！", date: "2026-06-15", tags: ["GameDev", "独立游戏", "更新"], path: "2026-06-15-Tiny-Pet-Sand-Wars-更.md", slug: "2026-06-15-Tiny-Pet-Sand-Wars-更" },
  { title: "小宠沙暴大战1.2-游戏更新啦", date: "2026-05-31", tags: ["GameDev", "独立游戏", "更新"], path: "2026-05-31-小宠沙暴大战12-游戏更新啦.md", slug: "2026-05-31-小宠沙暴大战12-游戏更新啦" },
  { title: "游戏发布itch啦", date: "2026-05-10", tags: ["GameDev", "独立游戏"], path: "2026-05-10-游戏发布itch啦.md", slug: "2026-05-10-游戏发布itch啦" },
  { title: "腾讯游戏客户端一面凉经", date: "2025-11-15", tags: ["面试", "腾讯"], path: "2025-11-15-腾讯游戏客户端一面凉经.md", slug: "2025-11-15-腾讯游戏客户端一面凉经" },
  { title: "TapTap聚光灯开发日志Day7", date: "2025-10-30", tags: ["TapTap", "GameDev", "聚光灯"], path: "2025-10-30-TapTap聚光灯开发日志Day7.md", slug: "2025-10-30-TapTap聚光灯开发日志Day7" },
  { title: "TapTap聚光灯开发日志Day6", date: "2025-10-27", tags: ["TapTap", "GameDev", "聚光灯"], path: "2025-10-27-TapTap聚光灯开发日志Day6.md", slug: "2025-10-27-TapTap聚光灯开发日志Day6" },
  { title: "TapTap聚光灯开发日志Day5", date: "2025-10-24", tags: ["TapTap", "GameDev", "聚光灯"], path: "2025-10-24-TapTap聚光灯开发日志Day5.md", slug: "2025-10-24-TapTap聚光灯开发日志Day5" },
  { title: "Unity新手学习推荐", date: "2025-10-20", tags: ["Unity", "学习"], path: "2025-10-20-Unity新手学习推荐.md", slug: "2025-10-20-Unity新手学习推荐" },
  { title: "TapTap聚光灯开发日志Day4", date: "2025-10-19", tags: ["TapTap", "GameDev", "聚光灯"], path: "2025-10-19-TapTap聚光灯开发日志Day4.md", slug: "2025-10-19-TapTap聚光灯开发日志Day4" },
  { title: "Unity资源分享", date: "2025-10-19", tags: ["Unity"], path: "2025-10-19-Unity资源分享.md", slug: "2025-10-19-Unity资源分享" },
  { title: "TapTap聚光灯开发日志Day3", date: "2025-10-17", tags: ["TapTap", "GameDev", "聚光灯"], path: "2025-10-17-TapTap聚光灯开发日志Day3.md", slug: "2025-10-17-TapTap聚光灯开发日志Day3" },
  { title: "TapTap聚光灯开发日志Day2", date: "2025-10-14", tags: ["TapTap", "GameDev", "聚光灯"], path: "2025-10-14-TapTap聚光灯开发日志Day2.md", slug: "2025-10-14-TapTap聚光灯开发日志Day2" },
  { title: "TapTap聚光灯开发日志Day1", date: "2025-10-11", tags: ["TapTap", "GameDev", "聚光灯"], path: "2025-10-11-TapTap聚光灯开发日志Day1.md", slug: "2025-10-11-TapTap聚光灯开发日志Day1" },
];

export const ARTICLES_SORTED: ArticleMeta[] = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));