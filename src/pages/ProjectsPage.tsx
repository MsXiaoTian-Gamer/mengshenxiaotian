import { Link } from 'react-router-dom'
import { setPageMeta } from '../lib/seo'
import { useEffect } from 'react'
import { ARTICLES_SORTED } from '../data/articles'

export default function ProjectsPage() {
  useEffect(() => { setPageMeta('项目作品 - 萌神小天', '独立游戏、TapMaker 作品与 Unity 算法可视化项目') }, [])
  const latestUpdate = ARTICLES_SORTED[0]
  return <main className="projects-page" id="mainContent">
    <p className="projects-kicker">PROJECTS / WORKLOG</p>
    <h1>从一个想法，到一款能玩的游戏。</h1>
    <p className="projects-intro">这里记录独立游戏、TapMaker 实验和 Unity 技术 Demo。每个项目都附有试玩、源码或开发记录。</p>
    <div className="projects-overview" aria-label="项目概览"><span><strong>03</strong> 个代表项目</span><span><strong>Unity + TapMaker</strong> 创作工具</span><span><strong>持续更新</strong> 从原型到发布</span></div>
    <div className="project-grid">
      <article className="project-card"><span className="project-status">持续更新 · 已发布</span><h2>Tiny Pet Sand Wars</h2><p>轻量快节奏的俯视角肉鸽生存射击游戏，记录从玩法原型到发布迭代的完整过程。</p><div className="project-tags"><span>Unity</span><span>独立游戏</span><span>WebGL</span></div><ol className="project-timeline"><li>玩法原型与核心循环</li><li>武器、成就和地图系统</li><li>itch.io / TapTap 发布迭代</li></ol><div><a href="https://msxiaotian.itch.io/tiny-pet-sand-wars" target="_blank" rel="noopener noreferrer">itch.io 试玩 ↗</a><Link to="/archive">查看开发日志 →</Link></div></article>
      <article className="project-card project-card-featured"><span className="project-status">TapMaker · 已发布并持续更新</span><div className="project-card-index">PROJECT 03 / 2026</div><h2>《百万粉主播》</h2><p>用 TapMaker 完成的像素风放置经营游戏。从主播首播到登上星途舞台，持续打磨成长目标、粉丝养成与移动端体验。</p><div className="project-tags"><span>TapMaker</span><span>像素风</span><span>放置经营</span></div><ol className="project-timeline"><li>首作上线，记录无代码游戏创作流程</li><li>加入星途企划、粉丝团成长与挑战</li><li>持续优化成长节奏和移动端交互</li></ol><div><a href="https://www.taptap.cn/app/976057" target="_blank" rel="noopener noreferrer">TapTap 试玩 ↗</a><Link to={'/post/' + latestUpdate.slug}>阅读最近更新 →</Link></div></article>
      <article className="project-card"><span className="project-status">开源 Demo · 已完成</span><h2>PathFinding 可视化</h2><p>在 Unity 网格中可视化 DFS、BFS、最短路径回溯和迷宫生成算法。</p><div className="project-tags"><span>Unity 6</span><span>C#</span><span>算法</span></div><ol className="project-timeline"><li>运行时网格与迷宫生成</li><li>DFS / BFS 搜索动画</li><li>开源并配套技术文章</li></ol><div><a href="https://github.com/MsXiaoTian-Gamer/PathFinding-A-Unity-Grid-Pathfinding-Algorithm-Visualizer" target="_blank" rel="noopener noreferrer">GitHub 源码 ↗</a><Link to="/post/2026-09-11-PathFinding-Unity-网格寻路算法可视化">阅读项目文章 →</Link></div></article>
    </div>
  </main>
}
