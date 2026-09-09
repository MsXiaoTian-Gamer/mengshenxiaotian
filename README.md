# 萌神小天博客 · msxiaotian.top

个人技术博客前端源码。复古终端 CRT 风格（PHOSPHOR.SYS），技术内容以 Unity 客户端 / 游戏开发 / 面试笔试记录为主。

生产地址：<https://msxiaotian.top>（Vercel 部署）

## 技术栈

- React 18 + TypeScript + Vite 5（React Router 6，代码分割 + Service Worker 预缓存）
- marked 渲染 Markdown、highlight.js 代码高亮、KaTeX 公式、Mermaid 图表（均自托管至 `public/vendor/`）
- Upstash Redis（REST API）提供文章访问计数，Vercel Serverless Function 兜底（`api/pv.ts`）
- 构建期脚本生成站点地图 / RSS / robots / 搜索索引

## 快速开始

```bash
npm install        # 安装依赖（node 版本建议 20+）
npm run dev        # 本地开发 http://localhost:5173
npm run build      # 类型检查 + 生产构建（prebuild 自动生成 feed/sitemap/robots/搜索索引）
npm run preview    # 本地预览构建产物
```

## 如何发布一篇文章

1. **写正文**：新建 `src/content/<YYYY-MM-DD>-<slug>.md`，纯 Markdown（首行为 `# 标题`，正文支持代码块 / LaTeX / Mermaid 等，语法高亮与渲染在 `src/lib/render.ts`）。
2. **登记元数据**：在 `src/data/articles.ts` 的 `ARTICLES` 数组**最前面**插入一条记录：

```ts
{
  title: "文章标题",
  date: "2026-09-09",          // YYYY-MM-DD，决定排序与 URL 前缀
  tags: ["Unity", "学习"],
  kind: "learn",               // 见下表
  path: "2026-09-09-xxx.md",   // 必须与文件名一致
  slug: "2026-09-09-xxx",      // 路由段，文章地址 /post/<slug>
  // downloads?: [{ name, url, desc }]  // 可选：文末资源下载区
}
```

3. **本地验证**：`npm run build`（prebuild 会重新生成 `public/feed.xml`、`sitemap.xml`、`robots.txt` 与 `src/data/generated-meta.ts`、搜索索引）。正文与元数据缺一不可——正文文件不存在或未登记都会导致该文章不可访问。
4. **部署**：push 到 `main` 后 Vercel 自动构建部署；构建命令 `npm run build`，产物目录 `dist`。

内容类型 `kind`：

| kind | 含义 | 示例 |
| --- | --- | --- |
| `learn` | 学习笔记 / 教程 | Unity 阶段系列 |
| `interview` | 笔试 / 面试记录 | 米哈游笔经、吉比特面经 |
| `release` | 游戏发布 / 更新 | Tiny Pet Sand Wars 更新 |
| `devlog` | 开发日志 | TapTap 聚光灯 |
| `post` | 普通文章 | 默认兜底 |

## 目录结构

```
src/
  components/      页面无关组件（CommandPalette 命令面板、CrBoot CRT 开机壳、Mascot 看板娘等）
  content/         Markdown 正文，文件名 <date>-<slug>.md
  data/
    articles.ts    文章元数据（发布文章改这里）
    generated-meta.ts  构建期生成（勿手改）
    learningPath.ts    Unity 学习路线数据（/learn 页）
    unityQuestions.ts  八股题库（/quiz 页）
  lib/
    content.ts     正文按需加载（import.meta.glob）
    render.ts      Markdown 渲染 + lightbox + 代码预览等
    theme.ts       CRT 三色主题 / 暗亮切换
    stats.ts       阅读计数（Upstash Redis）
    search.ts      搜索索引（fuse.js）
  pages/           路由页面（Home / Post / Archive / Learn / Quiz / Play / Pong / Stats / About）
  styles/          样式模块（见下）
scripts/
  gen-site.mjs     生成 public/sitemap.xml / feed.xml / robots.txt
  gen-posts.mjs    生成 search-index.json 与 generated-meta.ts
  gen-sw.mjs       生成 Service Worker 预缓存
api/pv.ts          Vercel Serverless：阅读数代理
```

## 样式体系

入口 `src/styles/blog.css` 按顺序 `@import`：

| 文件 | 职责 |
| --- | --- |
| `tokens.css` | 设计变量（CRT 三色主题变量、间距、字号、圆角） |
| `base.css` | 全局基础：reset、排版、按钮、弱化动效权威层 |
| `components.css` | 组件样式（卡片、看板娘、hero、动画 keyframes） |
| `pages.css` | 页面级样式（首页 / 文章 / 题库 / 游戏等） |

约定：

- 主题通过 `<html data-crt="green|amber|blue">` + `data-theme="dark|light"` 切换，所有颜色走 CSS 变量（`--brand` / `--bg` / `--text-*`），新增配色先看 `tokens.css`。
- 交互热区（按钮 / 标签 / 可点项）高度不低于 32px。
- 动效一律可被 `prefers-reduced-motion` 关闭：样式层由 `base.css` 末尾权威块统一压缩动画/过渡与视图过渡；JS 层动画（如 CRT 开机/关机壳 `src/components/CrBoot.tsx`）需自行检测 `matchMedia('(prefers-reduced-motion: reduce)')` 跳过。

## 命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 本地开发 |
| `npm run gen:site` | 重新生成 feed / sitemap / robots |
| `npm run gen:posts` | 重新生成搜索索引与 generated-meta |
| `npm run build` | prebuild + tsc + vite build + gen-sw（CI / Vercel 用） |
| `npm run lint` | ESLint 检查 |
| `npm run format` | Prettier 检查并输出待格式化列表 |
| `npm run format:write` | Prettier 全量格式化（提交前谨慎，建议单独 commit） |

## 环境变量

本地 `npm run dev` 默认不需要环境变量；阅读计数在本地开发走 mock。如需调试计数：

```bash
cp .env.example .env   # 填入 Upstash REST URL / Token
```

生产环境变量在 Vercel 项目设置中配置同名变量，勿提交真实 `.env`（已 gitignore）。

## 部署

- Vercel 自动部署 `main` 分支；`vercel.json` 处理 SPA rewrite 与旧 `/articles/*` 永久跳转到 `/post/*`。
- 静态资源已自托管（`public/vendor/hljs|katex|mermaid`），构建产物无外链 CDN，离线可用（SW 预缓存 100+ 项）。

## 相关项目

- Unity 游戏《Tiny Pet Sand Wars》：TapTap / itch.io
- 八股内容定位：Unity 客户端岗位面试（引擎 / 性能 / 原生层实战语境）
