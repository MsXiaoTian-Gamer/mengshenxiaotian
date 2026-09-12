---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 52ccc64068be0e7a58ed8e5cc027dde0_d76def87ad8011f1af37525400826444
    ReservedCode1: gLIGvfpLG2OJf+cUSbDeBgjTs02hLTR2XiJ7mk7JEWzwAFMS3FJsSQFKjzmPm10O7OwGcyL1cVV3coCFwQiaOwbctMpOmOGb3DwlhlpLrHXFN1vZzi1juV/2d0r7zyxJXjBuKP3LNbZdI7bsRutbzOaBVVsDl/PoggOfnrMbl63j32B22gVYRPQc4uE=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 52ccc64068be0e7a58ed8e5cc027dde0_d76def87ad8011f1af37525400826444
    ReservedCode2: gLIGvfpLG2OJf+cUSbDeBgjTs02hLTR2XiJ7mk7JEWzwAFMS3FJsSQFKjzmPm10O7OwGcyL1cVV3coCFwQiaOwbctMpOmOGb3DwlhlpLrHXFN1vZzi1juV/2d0r7zyxJXjBuKP3LNbZdI7bsRutbzOaBVVsDl/PoggOfnrMbl63j32B22gVYRPQc4uE=
---

# PathFinding：Unity 网格寻路算法可视化 Demo

> 开源项目介绍：把 DFS、BFS、最短路径回溯和两种迷宫生成算法（随机化 DFS 回溯法、随机化 Prim）全部跑在一张运行时生成的网格上，按 `stepDelay` 一步步推进，在 Game 视图里直接看搜索的扩散过程，而不是只看到最终结果。Unity 6000.4.10f1 + URP 17.4.0，纯 C#，核心只有两个脚本。

仓库地址：https://github.com/MsXiaoTian-Gamer/PathFinding-A-Unity-Grid-Pathfinding-Algorithm-Visualizer

## 一、为什么写这个 Demo

学算法时最容易被"背实现"糊弄过去：DFS 用栈、BFS 用队列、最短路要记 `parent` 回溯，这些都能默写，但一旦问"同一张地图上，DFS 和 BFS 的扩散形状差在哪、为什么最短路必须用 BFS 而不是 DFS"，光靠脑子想很虚。

所以这个项目的目标很单一：**把算法的中间状态全部画出来**。每个节点都有 `isFound`（已探索）、`isPath`（最终路径）、`isFrontier`（Prim 待选前沿）这些状态位，搜索每推进一步，节点的颜色就实时刷新一次，`stepDelay` 控制节奏——想看清细节就把延迟调大，想快速跑完就调小。

它刻意没有做性能优化和工程化封装，定位是"算法过程的可视化教具"，代码量小到可以直接当阅读材料。

## 二、功能一览

所有功能都挂在键盘上，运行后按数字键即可：

| 按键 | 功能 | 说明 |
| --- | --- | --- |
| `1` | 深度优先搜索 DFS | 沿一条路一直深入，走不通再回溯，用栈实现 |
| `2` | 广度优先搜索 BFS | 按层向外扩散，用队列实现 |
| `3` | 最短路径 | BFS 先扩散到终点，再从终点沿 `parent` 回溯点亮整条路径，并在 Console 输出步数 |
| `4` | 迷宫生成（随机化 DFS 回溯法） | 先把整张网格重置为全墙，再从左上角格逐格凿墙，一次性完成 |
| `5` | 迷宫生成（随机化 Prim） | 与 `4` 同为迷宫生成，但会按 `stepDelay` 逐步展示「随机挑前沿格 → 打通一道墙」的过程 |
| `0` | 中断 / 清空 | 立刻停止正在运行的搜索协程，清空起点、终点、已探索、路径等全部痕迹（保留障碍标记） |
| 鼠标左键点击节点 | 切换障碍 | 点击任意网格节点，在「障碍 / 非障碍」之间切换，可以先手动摆出任意地图再跑算法 |

一个小细节：一段搜索没跑完时，新的按键会被忽略，避免多段搜索叠加显示。想打断就先按 `0`，它内部走的是 `StopAllCoroutines()`。

### 功能演示

下面两段录屏是 Demo 的实际运行效果（为便于观看，录制时把 `stepDelay` 调小了）。

**按键 `1` / `2`：DFS 与 BFS 的扩散对比**

<video controls playsinline preload="metadata" class="art-video" src="/videos/pathfinding-demo-1-2.mp4"></video>

按 `1` 触发深度优先搜索，可以看到它「沿一条路一直深入、走不通再回溯」的推进方式；按 `2` 触发广度优先搜索，则是按层均匀地向外扩散。两种算法在同一张网格上的扩散形状差异，一眼就能看出来。

**按键 `3` / `5`：最短路径与随机化 Prim 迷宫**

<video controls playsinline preload="metadata" class="art-video" src="/videos/pathfinding-demo-3-5.mp4"></video>

按 `3` 先用 BFS 扩散到终点，再沿 `parent` 从终点回溯点亮整条最短路；按 `5` 触发随机化 Prim 迷宫生成，青色前沿格被逐个选中、品红色依次凿开墙面，能直接看到「边界一点点长出来」的过程。

### 节点颜色图例

| 颜色 | 含义 | 对应字段 |
| --- | --- | --- |
| 蓝色 | 起点 | `isStart` |
| 黄色 | 终点 | `isEnd` |
| 红色 | 障碍物（不可通行） | `isBarrier` |
| 绿色 | 已探索到的节点 | `isFound` |
| 品红色 | 最终路径 / Prim 当前凿开的格 | `isPath` |
| 青色 | Prim 算法的待选前沿 | `isFrontier` |
| 白色 | 普通可通行节点 | 默认色 |

颜色优先级为：起点 > 终点 > 障碍 > 路径 > 前沿 > 已探索 > 普通节点。这条优先级写在 `Node.Update()` 里，一个节点同时命中多个状态时，永远显示语义更强的那个。

## 三、快速开始

1. 用 Unity Hub 添加项目目录，用 **Unity 6000.4.10f1**（或同系列 Unity 6 版本）打开；首次打开会自动从 Package Manager 拉取 URP 等依赖，等编译完成。
2. 打开场景 `Assets/Scenes/SampleScene.unity`。
3. 点 **Play** 进入运行模式，脚本会按 Inspector 上配置的 `x`、`y` 自动生成 `x × y` 的网格。
4. 先点节点摆几道障碍墙（可选），再按 `1` / `2` / `3` 看搜索过程，按 `4` / `5` 看迷宫生成，按 `0` 随时清空重来。

### 场景里需要什么

场景结构极简，只需要一个挂着控制脚本的物体 + 一个作为模板的节点：

1. 创建一个 Cube 当**模板节点**，调好缩放和材质颜色，然后**从场景中隐藏或移出网格范围**——模板节点本身不参与算法（`isInGrid` 为 `false`），也不会被点击切换。
2. 创建任意一个空物体（也可以直接挂在相机上），添加 **`Creat`** 脚本组件。
3. 在 `Creat` 的 Inspector 上填参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `MainCamera` | Transform | 主相机，脚本生成网格后会把相机摆到 `(x, x + y, y)` 的斜上方俯视整张网格 |
| `x` | int（最小 1） | 网格横向节点数（X 轴方向） |
| `y` | int（最小 1） | 网格纵向节点数（Z 轴方向） |
| `stepDelay` | float（最小 0.01） | 每个搜索 / 生成步骤之间的停顿秒数，越大演示越慢，默认 `0.5` |
| `nodeprefab` | Node | 上面创建的模板节点，需挂有 `Node` 脚本 |

4. 确认模板节点上有 **BoxCollider**（Unity 的 Cube 默认自带），否则鼠标点击无法命中节点、也就切不了障碍。

### 网格生成规则

- 节点按 `(i * 2, 0, j * 2)` 摆放，相邻节点中心间距固定为 **2 个单位**，行列下标从 `1` 开始。
- 每个节点生成时会把自身行列坐标缓存到 `Node.i` / `Node.j`，邻居查找直接按坐标取，不需要按索引反解。
- 迷宫以「奇数行、奇数列的交叉点」为格，格与格之间的偶数行列是墙，所以算法会自动避开偶数坐标的格作为起点。

## 四、代码结构

```
Assets/
├─ Script/
│  ├─ Node.cs      # 节点：状态标记（起点/终点/障碍/已探索/路径/前沿）、坐标、颜色刷新、点击切换障碍
│  └─ Creat.cs     # 控制中心：网格生成、按键分发、DFS / BFS / 最短路径 / 迷宫生成（DFS 回溯法、随机化 Prim）
├─ Scenes/
│  └─ SampleScene.unity
└─ Settings/       # URP 渲染管线配置
```

### `Node.cs`

单个网格节点，数据与显示都归它管：

- **状态字段**：`isStart`、`isEnd`、`isBarrier`、`isFound`、`isPath`、`isFrontier`、`isInGrid`
- **坐标字段**：`i`、`j`（由 `Creat` 生成时赋值）
- **搜索辅助**：`weight`、`key`、`parent`（用于路径回溯，也为加权 / Prim 类算法预留）
- `Update()`：按状态优先级实时刷新材质颜色
- `OnMouseDown()`：运行时点击切换 `isBarrier`，只翻转障碍标记，不干扰正在进行的搜索协程

### `Creat.cs`

项目主控脚本，核心方法如下：

| 方法 | 职责 |
| --- | --- |
| `Start()` | 生成 `x × y` 网格并摆放相机 |
| `Update()` | 监听 `0`~`5` 按键并分发到对应算法；搜索期间忽略新按键 |
| `GetNode(i, j)` | 按行列坐标取节点，越界返回 `null` |
| `GetFirstNode()` / `GetLastNode()` | 取首个 / 末个可通行节点作为起点、终点（避开迷宫生成后落在墙上的坐标） |
| `GetNeighbors(node)` | 取上下左右四邻域节点 |
| `GetCellNeighbors(cell)` | 取「隔一道墙」的相邻格（行列坐标相差 2），供迷宫生成使用 |
| `DFS(node)` | 深度优先搜索协程 |
| `BFS(node)` | 广度优先搜索协程 |
| `FindShortestPath(start, end)` | BFS 求最短路 + 沿 `parent` 回溯点亮路径，Console 输出「最短路径步数」 |
| `Creat_Maze()` | 随机化深度优先（回溯法）迷宫生成，一次性完成 |
| `Prim(startNode)` | 随机化 Prim 迷宫生成协程，逐步展示 |
| `AddFrontierCells(cell, frontier)` | 把格的隔墙邻居加入 Prim 待选前沿 |
| `ResetNodes()` | 清空搜索痕迹（保留障碍标记） |

## 五、几个实现要点

- **协程驱动动画**：所有需要逐步演示的算法都写成 `IEnumerator`，用 `yield return new WaitForSeconds(stepDelay)` 控制节奏，`0` 键通过 `StopAllCoroutines()` 立即中断。这样算法的推进节奏和 Unity 的帧循环天然解耦，不需要额外的计时器。
- **`isFound` 的双重用途**：迷宫生成期间，它临时充当「已并入迷宫 / 已连通」标记；生成结束后统一切回 `false`，把字段让给搜索算法复用。
- **随机化 DFS 回溯法迷宫**：从左上角格出发，随机挑一个未并入的隔墙邻格，打通两者正中间的墙；无路可走时回溯（弹栈）。生成的结果四邻域连通、无环、无孤立格。
- **随机化 Prim 迷宫**：维护一个「待选前沿」列表，每步随机挑一个前沿格，在它周围已连通的格里随机挑一个，打通中间那道墙。相比按最小权重挑边，随机化 Prim 生成的迷宫纹理更均匀，也更容易看出"边界一点点长出来"的感觉。
- **最短路回溯**：BFS 扩散时给每个节点记录 `parent`，命中终点后从终点一路沿 `parent` 退回起点，边退边把 `isPath` 置位，从而点亮完整路径——这也是为什么最短路用的是 BFS 而不是 DFS：只有按层扩散才能保证第一次到达终点时走的就是最短的那条。

## 六、Console 输出

运行这些操作时会在 Console 打印结果，方便对照：

- 按 `3`：`最短路径步数：N`，或 `未找到从起点到终点的路径`
- 按 `4`：`迷宫生成完成：连通格数 N，可通行节点 M`
- 按 `5`：`Prim 迷宫生成完成：连通格数 N`

## 七、后续可以怎么玩

项目本身是学习 / 演示定位，没做工程化优化，所以很适合当二次开发的起点：

- 加 A*、Dijkstra、JPS 等算法，直接在 `Update()` 的按键分发里挂新槽位即可（`Node` 已经预留了 `weight` / `key` 字段）；
- 把 `isFound` 的绿色改成随时间渐变，观察扩散的"波前"；
- 换成 3D 体素网格，或者把网格尺寸开到 100×100 以上，直观感受不同算法的访问节点数量差异。

仓库源码和完整 README：

https://github.com/MsXiaoTian-Gamer/PathFinding-A-Unity-Grid-Pathfinding-Algorithm-Visualizer

*（本文由 AI 辅助整理，内容基于项目 README 与源码）*
*（内容由AI生成，仅供参考）*
