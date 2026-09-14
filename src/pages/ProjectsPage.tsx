import { Link } from 'react-router-dom'
import { setPageMeta } from '../lib/seo'
import { useEffect } from 'react'

export default function ProjectsPage() {
  useEffect(() => { setPageMeta('项目作品 - 萌神小天', 'Unity 游戏开发与算法可视化项目作品集') }, [])
  return <main className="projects-page" id="mainContent">
    <p className="projects-kicker">PROJECTS / WORKLOG</p>
    <h1>项目作品</h1>
    <p className="projects-intro">这里集中记录我正在制作、维护和学习中的 Unity 项目。</p>
    <div className="project-grid">
      <article className="project-card"><span className="project-status">持续更新</span><h2>Tiny Pet Sand Wars</h2><p>轻量快节奏的俯视角肉鸽生存射击游戏，记录从玩法原型到发布迭代的完整过程。</p><div><a href="https://msxiaotian.itch.io/tiny-pet-sand-wars" target="_blank" rel="noopener noreferrer">itch.io 试玩 ↗</a><Link to="/archive">查看开发日志 →</Link></div></article>
      <article className="project-card"><span className="project-status">开源 Demo</span><h2>PathFinding 可视化</h2><p>在 Unity 网格中可视化 DFS、BFS、最短路径回溯和迷宫生成算法。</p><div><a href="https://github.com/MsXiaoTian-Gamer/PathFinding-A-Unity-Grid-Pathfinding-Algorithm-Visualizer" target="_blank" rel="noopener noreferrer">GitHub 源码 ↗</a><Link to="/post/2026-09-11-PathFinding-Unity-网格寻路算法可视化">阅读项目文章 →</Link></div></article>
    </div>
  </main>
}
