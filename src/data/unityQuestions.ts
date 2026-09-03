// Unity 客户端八股题库（萌神小天博客 · 每日一题数据源）
// 按日期轮询取题，全部题目可在 /quiz 页刷题复习。

export type QuestionCategory =
  | 'C#基础'
  | 'Unity核心'
  | '协程与异步'
  | '渲染与图形学'
  | '资源与内存'
  | '物理与碰撞'
  | '计算机网络'
  | '数据结构'
  | '热更与工程'
  | '网络与同步'
  | '架构与设计模式'

export interface UnityQuestion {
  id: number
  category: QuestionCategory
  difficulty: 1 | 2 | 3
  question: string
  /** 答题要点，每项一条 */
  points: string[]
}

export const UNITY_QUESTIONS: UnityQuestion[] = [
  // ============ C#基础 ============
  { id: 1, category: 'C#基础', difficulty: 1, question: 'class 和 struct 有什么区别？什么时候用 struct？', points: [
    'class 是引用类型存堆上，struct 是值类型存栈上（或内联在容器内），赋值行为不同：class 拷贝引用，struct 拷贝内容',
    'struct 默认密封、不可继承，不支持析构函数；适合小体积、短生命周期、不可变数据，如 Vector3、Color、矩阵',
    '频繁 new 大 struct 会带来拷贝开销；需要多态或较大对象时应选 class',
  ] },
  { id: 2, category: 'C#基础', difficulty: 1, question: '什么是装箱和拆箱？如何避免？', points: [
    '值类型转 object/接口会装箱：在堆上分配对象并拷贝值；拆箱是反向强制转换',
    '装箱产生 GC 压力，避免在热循环里把值类型当 object 用、避免 ArrayList/非泛型容器、避免值类型拼 string 时隐式装箱',
    '用泛型容器、ToString 前先转字符串、敏感处用值类型特化实现',
  ] },
  { id: 3, category: 'C#基础', difficulty: 2, question: 'C# 的 GC 如何工作？Unity 中如何减少 GC 开销？', points: [
    '基于可达性分析：从 GC Root（静态字段、栈引用、寄存器）出发标记可达对象，不可达的回收；分代（0/1/2代）减少全量扫描',
    'Unity 使用 Boehm/保守 GC（Mono）或分代 GC（IL2CPP），无法手动精确控制时机',
    '减少分配：对象池、缓存 List/string、避免每帧 new、用 ref struct/struct 容器、避免闭包与 LINQ 分配',
  ] },
  { id: 4, category: 'C#基础', difficulty: 1, question: 'string 为什么不可变？大量拼接如何优化？', points: [
    'string 是不可变引用类型，任何修改都会创建新对象，旧对象留给 GC',
    '循环拼接用 StringBuilder（预分配 Capacity）；高频日志/路径拼接避免 + 号',
    '固定少量拼接可用 string.Concat/插值（编译器会优化）；对同一字符串反复引用用 intern/常量',
  ] },
  { id: 5, category: 'C#基础', difficulty: 1, question: '委托（delegate）和事件（event）的区别？', points: [
    'event 是受限的委托字段：外部只能 += / -=，不能直接 Invoke 或赋值，封装性更好',
    '委托可直接调用、可作为参数传递；多播委托按注册顺序执行',
    'Unity 中 += 后必须在 OnDestroy/Disable 中 -=，否则对象被委托引用导致内存泄漏',
  ] },
  { id: 6, category: 'C#基础', difficulty: 2, question: '抽象类和接口怎么选？', points: [
    '抽象类可有字段/构造函数/部分实现，适合“is-a”且有公共状态或默认行为的基类',
    '接口只定义契约（可含默认实现），支持多实现，适合“can-do”能力组合与解耦',
    'C# 单继承多接口：需要共享实现用抽象类，需要跨继承树定义能力用接口',
  ] },
  { id: 7, category: 'C#基础', difficulty: 2, question: '值类型为什么不能直接赋 null？Nullable<T> 的原理？', points: [
    '值类型变量本身就持有数据，没有“引用为空”的概念；Nullable<T> 用 bool hasValue + T value 两个字段模拟可空',
    '写 int? 等价于 Nullable<int>，配合 ?? 运算符、HasValue/Value 使用',
    '泛型约束 where T : struct 与 where T : class 决定能否接 null',
  ] },
  { id: 8, category: 'C#基础', difficulty: 2, question: 'async/await 的原理？和 Unity 协程有何不同？', points: [
    'async 方法被编译成状态机，await 处挂起，继续执行靠 SynchronizationContext/Task 调度，不阻塞线程',
    'Unity 主线程有同步上下文，await 后默认回到主线程；但纯 async 不依赖 MonoBehaviour',
    '协程基于 IEnumerable 迭代器 + Unity 主循环驱动（yield 指令由引擎判断时机），与 async 线程模型不同',
  ] },
  { id: 9, category: 'C#基础', difficulty: 2, question: 'ref、out、in 关键字的区别？', points: [
    'ref：调用前必须初始化，方法内可读写，传引用可修改调用方变量',
    'out：调用前不必初始化，方法内必须赋值（常用来拿多个返回值）',
    'in：只读引用传递，避免大 struct 拷贝但不可修改；三者都要求实参是变量而非属性',
  ] },
  { id: 10, category: 'C#基础', difficulty: 3, question: '泛型的协变和逆变是什么？Unity/C# 里哪里用到？', points: [
    '协变 out：IEnumerable<Derived> 可赋给 IEnumerable<Base>（只出不进）；逆变 in：只进不出如 IComparer<Base> 用于 Derived',
    '数组是协变的（string[] 可当 object[]），但运行期写错会抛异常',
    '委托如 Action<in T>、Func<out TResult> 也支持；LINQ 与事件回调里常见',
  ] },

  // ============ Unity核心 ============
  { id: 11, category: 'Unity核心', difficulty: 1, question: 'MonoBehaviour 生命周期回调的完整顺序？', points: [
    'Awake → OnEnable → Start → FixedUpdate/Update/LateUpdate 循环',
    '场景卸载/销毁时：OnDisable → OnDestroy；应用退出还有 OnApplicationQuit',
    'Awake 在对象激活时调用一次（先于 Start）；OnEnable 每次 SetActive(true) 都触发',
  ] },
  { id: 12, category: 'Unity核心', difficulty: 1, question: 'Update、FixedUpdate、LateUpdate 的区别与使用场景？', points: [
    'Update 每帧调用，频率取决于帧率，适合输入检测、普通逻辑',
    'FixedUpdate 按固定时间步（默认 0.02s）调用，适合物理与刚体运动',
    'LateUpdate 在 Update 之后，适合相机跟随（避免抖动）、基于最终状态的处理',
  ] },
  { id: 13, category: 'Unity核心', difficulty: 1, question: '多个脚本的 Awake/Start 执行顺序如何控制？', points: [
    '同一物体按脚本添加顺序（不可靠）；不同物体默认不确定',
    'Project Settings → Script Execution Order 可指定执行顺序',
    '更推荐：不要在 Awake/Start 里跨对象强依赖先后，用事件/管理器解耦，或手动初始化调用',
  ] },
  { id: 14, category: 'Unity核心', difficulty: 1, question: '为什么移动要乘 Time.deltaTime？', points: [
    '把速度从“每帧位移”变成“每秒位移”，保证不同帧率下移动速度一致',
    '不乘则高帧率机器移动更快，逻辑在不同设备上表现不同',
    '涉及物理的位移应放 FixedUpdate（已按固定步长，无需再乘 deltaTime 但常用 Time.fixedDeltaTime 换算）',
  ] },
  { id: 15, category: 'Unity核心', difficulty: 1, question: '频繁调用 GetComponent 有什么问题？如何优化？', points: [
    'GetComponent 要做类型查找，每帧调用会带来 CPU 开销与可能的分配',
    '在 Awake/Start 缓存引用（字段持有），避免每帧 Get',
    '同物体多个脚本互访组件时，用依赖注入/缓存或事件通信减少查找',
  ] },
  { id: 16, category: 'Unity核心', difficulty: 2, question: 'transform.SetParent(parent, worldPositionStays) 两个参数含义？', points: [
    'worldPositionStays = true（默认）：保持世界坐标/旋转/缩放不变，只换父节点',
    'worldPositionStays = false：本地坐标不变，挂到新父节点后会受父级影响而“跳位”',
    'UI 动态创建子物体常用 false 并手动设 localScale/localPosition',
  ] },
  { id: 17, category: 'Unity核心', difficulty: 1, question: '为什么 GameObject.Find / FindObjectOfType 要少用？', points: [
    'Find 会遍历场景层级（按名字逐层找），FindObjectOfType 遍历所有物体与组件，代价高且随场景规模变慢',
    '没有静态缓存时每次调用都全量搜索，也不利于代码解耦',
    '替代：拖引用/SerializeField、管理器注册表、单例服务、事件系统获取',
  ] },
  { id: 18, category: 'Unity核心', difficulty: 2, question: 'Unity 对象“假删除”是什么？如何判断对象已被销毁？', points: [
    'Destroy 后 C# 引用仍存在但引擎对象已销毁，访问成员会抛 MissingReferenceException，即“假 null”',
    '用 == null / != null 判断（Unity 重载了运算符），但不要用 ?? 或 is null（走 C# 语义判断不了）',
    '场景切换 DontDestroyOnLoad 对象引用失效、资源释放后引用仍持有是常见原因',
  ] },
  { id: 19, category: 'Unity核心', difficulty: 2, question: 'MonoBehaviour 和普通 C# 类的区别？什么时候用普通类？', points: [
    'MonoBehaviour 必须挂 GameObject，有生命周期回调与 Inspector 序列化，受引擎管理',
    '普通 C# 类可 new、可被任何系统创建，适合纯逻辑/数据/工具类、状态机、管理器内部实现',
    '需要 Update 但不想挂物体的逻辑：可用 MonoBehaviour 单例驱动，或自己用 Timer/事件轮询',
  ] },
  { id: 20, category: 'Unity核心', difficulty: 2, question: 'OnTrigger 与 OnCollision 各自触发的条件？', points: [
    '碰撞双方都要有 Collider，至少一方有 Rigidbody；Trigger 双方（至少一方）勾 Is Trigger 时走 OnTrigger',
    '非 Trigger 走 OnCollision 并产生物理响应；Kinematic Rigidbody 触发 OnTrigger 但不会产生碰撞反弹',
    '至少一方是 Rigidbody 才会触发回调；两个静态碰撞体互不回调',
  ] },

  // ============ 协程与异步 ============
  { id: 21, category: '协程与异步', difficulty: 2, question: '协程的实现原理是什么？', points: [
    '协程方法返回 IEnumerator，编译器生成迭代器状态机；yield return 处保存状态并返回指令对象',
    'Unity 每帧（或按指令类型）调用 MoveNext 推进执行，yield 指令由引擎在合适时机恢复',
    '协程不创建线程，仍跑在主线程，只是把执行拆成多段',
  ] },
  { id: 22, category: '协程与异步', difficulty: 1, question: 'WaitForSeconds 受什么影响？暂停游戏怎么处理？', points: [
    '受 Time.timeScale 影响：timeScale=0 时 WaitForSeconds 永不到期',
    '要不受暂停影响用 WaitForSecondsRealtime 或自己累加 Time.unscaledDeltaTime',
    '大量 WaitForSeconds 每帧检查有开销，注意复用/缓存等待对象',
  ] },
  { id: 23, category: '协程与异步', difficulty: 2, question: '协程里出现异常会怎样？如何安全嵌套协程？', points: [
    '异常会中断该协程并向上抛出到引擎，若未处理可能导致逻辑中断且难以排查',
    '嵌套协程 yield return StartCoroutine(...) 内部异常同样会中断整条链',
    '关键协程加 try/catch/finally，资源清理放 finally；StartCoroutine 传字符串版无类型安全',
  ] },
  { id: 24, category: '协程与异步', difficulty: 3, question: '对象被销毁后协程还在跑吗？StopAllCoroutines 的坑？', points: [
    '协程绑定在 MonoBehaviour 上，物体销毁后协程自动停止；但若协程引用了已销毁对象会抛 MissingReference',
    'StopAllCoroutines 只停该组件启动的协程，不影响其他组件/其他物体',
    'Disable 不会停协程（协程跟对象激活无关，跟组件销毁有关）',
  ] },
  { id: 25, category: '协程与异步', difficulty: 2, question: '为什么游戏里常用“等待 X 秒后执行”而不直接 Thread.Sleep？', points: [
    'Thread.Sleep 阻塞当前线程，主线程睡眠会卡死渲染/输入',
    '协程/async 是非阻塞式挂起，不占线程、可随时取消、回到主线程安全操作 Unity API',
    '真正耗时计算可丢到 Thread/Task/Job System，完成后回主线程',
  ] },

  // ============ 渲染与性能 ============
  { id: 26, category: '渲染与图形学', difficulty: 1, question: '什么是 Draw Call？为什么越少越好？', points: [
    '一次 Draw Call = CPU 提交一个渲染批次给 GPU；过多会卡 CPU（状态切换/提交开销）',
    '通过合批、图集、少换材质/Shader、静态批处理减少 Draw Call',
    '严格说现代引擎看 SetPass Call / 渲染状态切换；移动端尤其敏感',
  ] },
  { id: 27, category: '渲染与图形学', difficulty: 2, question: '静态合批和动态合批的机制与限制？', points: [
    '静态合批：标记 Static 的物体在构建时合并网格，运行时一次提交；代价是内存与构建时间',
    '动态合批：运行时把满足条件的小网格合并；限制顶点数（≤900 左右，URP 与顶点属性相关）、材质必须相同',
    '合批前提：相同材质、无特殊 Renderer 设置、不破坏实例化需求；UI 图集也类似',
  ] },
  { id: 28, category: '渲染与图形学', difficulty: 2, question: 'SRP Batcher 是什么？为什么能提升性能？', points: [
    'SRP Batcher 是 URP/HDRP 的合批路径：复用 Shader 属性块，减少 CPU 端 per-object 的材质状态设置',
    '要求 Shader 兼容 SRP Batcher（用 CBUFFER 声明属性），物体间只差材质属性也能快速切换',
    '把大量小物体材质统一、Shader 兼容后，Draw Call 与 CPU 提交开销明显下降',
  ] },
  { id: 29, category: '渲染与图形学', difficulty: 2, question: '图集（Atlas）的作用？UGUI 为什么要打图集？', points: [
    '图集把多张小图合成一张大图，同图集内 UI/精灵共用一个材质纹理，可合批减少 Draw Call',
    'UGUI 动态合批要求相邻元素用同一图集，跨图集无法合批（TextMeshPro 字库同理）',
    '注意图集 padding 防止采样串色，注意图集尺寸上限与内存占用平衡',
  ] },
  { id: 30, category: '渲染与图形学', difficulty: 2, question: '遮挡剔除（Occlusion Culling）原理与使用注意？', points: [
    '用遮挡体（Occluder）判断被完全挡住的物体不提交渲染，减少 GPU 负载',
    '需要烘焙遮挡数据（静态场景）；动态物体无法作为 occluder（可用遮挡查询）',
    '与视锥剔除互补：视锥剔除是基础，遮挡剔除进一步省 Draw Call；烘焙不当会产生“穿帮/弹出”',
  ] },
  { id: 31, category: '渲染与图形学', difficulty: 2, question: '移动端纹理压缩格式怎么选？', points: [
    'iOS：ASTC（硬件支持好，质量/体积平衡）；旧设备可用 PVRTC',
    'Android：主流用 ASTC（高通/ARM 新 GPU 支持），兼容性兜底 ETC2（OpenGL ES 3.0 起）',
    '避免用未压缩 RGBA32 大纹理；UI 与 3D 图集按平台设置压缩格式，注意透明图与法线图差异',
  ] },
  { id: 32, category: '渲染与图形学', difficulty: 3, question: '半透明物体为什么容易有渲染排序问题？', points: [
    '透明物体不写深度（或按需），渲染按距离从远到近（Transparent 队列），互相穿插时排序会错',
    '标准透明靠“画家算法”，物体互相穿插无法正确混合；粒子、水面常见伪影',
    '处理：拆碎穿插体、用深度写入技巧、Additive 混合减少错误、或用 OIT（代价高）',
  ] },
  { id: 33, category: '渲染与图形学', difficulty: 2, question: '什么是 Overdraw？如何定位与优化？', points: [
    'Overdraw = 同一像素被多次绘制，移动端填充率（fillrate）受限时是主要瓶颈',
    '定位：Frame Debugger/Scene 视图 Overdraw 模式（暖色越浓越严重）',
    '优化：减少全屏后处理、粒子发射量、半透明层叠；缩小屏幕空间特效范围、LOD 减面',
  ] },

  // ============ 资源与内存 ============
  { id: 34, category: '资源与内存', difficulty: 2, question: 'Resources、AssetBundle、Addressables 的关系？', points: [
    'Resources 是内置资源目录，简单但有包体/内存不可控问题，官方不推荐大量使用',
    'AssetBundle 是资源打包单元，可远程下载与按需加载，但要自己管理依赖与生命周期',
    'Addressables 是基于 AssetBundle 的现代资源管理框架：可寻址加载、自动依赖、引用计数、远程/本地混合',
  ] },
  { id: 35, category: '资源与内存', difficulty: 2, question: 'AssetBundle 加载与卸载的正确姿势？依赖怎么处理？', points: [
    '用 manifest 记录依赖，加载 Asset 前先加载其依赖包；释放用 AssetBundle.Unload(false/true) 区分卸载资源',
    'Unload(true) 强制卸载已加载 Asset 会令引用失效（白物体）；一般业务层先 Release 再 Unload(false)',
    'Addressables 用 Addressables.Release 按引用计数释放，避免手写依赖管理出错',
  ] },
  { id: 36, category: '资源与内存', difficulty: 2, question: 'Unity 常见内存泄漏来源有哪些？', points: [
    '静态字段/单例长期持有对象引用（如事件 += 未 -=）',
    '协程未结束但引用大对象；AssetBundle/资源 Load 后不 Unload',
    '场景切换时 DontDestroyOnLoad 累积、闭包捕获大对象、UI 事件回调挂在已销毁物体',
  ] },
  { id: 37, category: '资源与内存', difficulty: 2, question: 'Resources.UnloadUnusedAssets 和 GC.Collect 何时用？', points: [
    'UnloadUnusedAssets 卸载无引用的资源（纹理/网格等），异步执行有开销，适合切场景后低频调用',
    'GC.Collect 强制托管堆回收，可能造成卡顿；不要每帧调用',
    '移动端谨慎：切场景、回主界面等低频时机配合使用即可',
  ] },
  { id: 38, category: '资源与内存', difficulty: 1, question: '对象池解决什么问题？核心实现要点？', points: [
    '复用频繁创建销毁的对象（子弹、怪物、特效），减少 Instantiate/Destroy 的 CPU 与 GC 压力',
    '要点：预创建/懒创建、Get 时重置状态并 SetActive(true)、Release 时回收并 SetActive(false)',
    '配合预制体引用池化；注意池内对象事件监听/协程要随回收清理',
  ] },
  { id: 39, category: '资源与内存', difficulty: 3, question: '大规模场景如何做资源异步加载与实例化优化？', points: [
    'Addressables.LoadAssetAsync 加载资源，InstantiateAsync（或分批 Instantiate）避免主线程卡顿',
    '分帧/分块初始化：先加载核心、后加载外围，使用加载进度条与对象池预创建',
    '用 Profiler 看加载峰值：纹理/网格/Shader 首帧编译（ShaderVariantCollection、AsyncShaderCompilation）',
  ] },
  { id: 40, category: '资源与内存', difficulty: 2, question: '用 Profiler 定位内存问题的基本步骤？', points: [
    '先看 Memory 分类：Managed Heap（C# 托管）与 Native（资源、引擎）分开看',
    'Managed：GC Alloc 定位每帧分配热点；用 Memory Profiler 抓堆快照 diff 找泄漏引用链',
    'Native：按资源类型排序找大纹理/网格/AudioClip 是否未卸载；检查 AssetBundle 是否残留',
  ] },

  // ============ 物理与碰撞 ============
  { id: 41, category: '物理与碰撞', difficulty: 2, question: '为什么刚体运动要放在 FixedUpdate？', points: [
    '物理引擎按固定步长（默认 0.02s）模拟，FixedUpdate 与其同步，保证物理稳定与确定性',
    '在 Update 里改 transform 移动刚体物体，会与物理插值打架导致抖动/穿透',
    '用 Rigidbody.MovePosition/AddForce 等 API 让物理接管，而不是直接改 transform',
  ] },
  { id: 42, category: '物理与碰撞', difficulty: 2, question: '高频 Physics.Raycast 怎么优化？', points: [
    '用 LayerMask 过滤，避免打到无关物体；尽量用非 alloc 版本（RaycastNonAlloc）',
    '控制频率：分帧检测、降低检测密度；用 SphereCast/BoxCast 代替多条 Raycast',
    '大世界用物理查询优化（碰撞体按区域管理），或改用自定义空间结构',
  ] },
  { id: 43, category: '物理与碰撞', difficulty: 2, question: 'CharacterController 与 Rigidbody 怎么选？', points: [
    'CharacterController 提供胶囊体移动/爬坡/台阶处理，适合传统第三人称/第一人称主角控制，自己写重力',
    'Rigidbody 走真实物理，适合受外力影响、可被推挤的角色/载具',
    '两者都可用于角色，关键看是否需要物理交互；不要同一物体同时启用两者冲突控制',
  ] },
  { id: 44, category: '物理与碰撞', difficulty: 2, question: 'Kinematic Rigidbody 是什么？常用在哪？', points: [
    'Kinematic = 不受物理力/碰撞影响、由代码直接控制运动，但会推动其他动态刚体',
    '用于移动平台、传送带、动画驱动的角色、触发器区域等',
    'Kinematic 物体与动态物体碰撞可产生推力；两个 Kinematic 之间不产生物理碰撞响应',
  ] },

  // ============ 热更与工程 ============
  { id: 45, category: '热更与工程', difficulty: 2, question: 'IL2CPP 和 Mono 的区别？为什么正式包常用 IL2CPP？', points: [
    'IL2CPP 把 IL 转成 C++ 再编译成原生码：性能更好、更难反编译、支持剪裁减小包体',
    'Mono 是 JIT/AOT 混合，启动快、迭代方便，但 iOS 限制 JIT、易被反编译',
    'IL2CPP 缺点：包体更大（含运行时）、构建慢、泛型/反射受限需处理（link.xml、代码裁剪）',
  ] },
  { id: 46, category: '热更与工程', difficulty: 2, question: 'Lua 热更的原理？xlua/tolua 为什么需要生成代码？', points: [
    '把可热更逻辑写成 Lua，运行时解释执行；C# 侧通过绑定层互调，改 Lua 不用重发客户端包',
    'tolua/xlua 生成 C#↔Lua 的绑定胶水代码（Wrap/委托桥），提升调用性能并处理生命周期',
    'iOS 审核对热更敏感：Lua 属解释执行可热更逻辑，需合规考量',
  ] },
  { id: 47, category: '热更与工程', difficulty: 3, question: 'AssetBundle 分包策略怎么设计？', points: [
    '按模块/场景分 Bundle：公共资源（UI 图集、Shader、公共模型）独立包，减少重复下载',
    '控制 Bundle 粒度：太小文件多、依赖复杂，太大下载/内存浪费；同屏同功能资源放一组',
    '首包 vs 热更包划分：核心战斗/进场景必需入首包，活动/后续内容走远程包',
  ] },
  { id: 48, category: '热更与工程', difficulty: 3, question: '客户端热更/版本管理基本流程？', points: [
    '客户端启动请求版本清单（远程 json/manifest），对比本地版本号',
    '差异文件走增量下载（AssetBundle 按 hash 比对），校验完整性后加载替换',
    '注意断点续传、失败重试、热更窗口管理（下载中禁进关键玩法）、资源版本与代码版本解耦',
  ] },
  { id: 49, category: '热更与工程', difficulty: 3, question: 'C# 代码在 iOS 上为什么不能 JIT？热更方案怎么绕？', points: [
    'iOS 禁止运行时生成可执行代码（JIT），只允许系统加载器已签名代码',
    '绕法：解释执行（Lua/HotReload 解释器）、AOT 全量编译、混合模式（IL2CPP + 解释器字节码）',
    'hybridclr（原 Huatuo）走 AOT+补充元数据，可让 C# 逻辑以解释模式热更，属较新方案',
  ] },

  // ============ 网络与同步 ============
  { id: 50, category: '网络与同步', difficulty: 2, question: '帧同步和状态同步的区别？各自适用场景？', points: [
    '帧同步：只同步输入，各端本地模拟整局，流量小、表现一致（适合格斗/RTS/多人同屏竞技）',
    '状态同步：服务器算权威状态，客户端同步位置/属性，安全可控（适合 MMO/需要防作弊/复杂交互）',
    '帧同步难点在确定性（浮点/随机/逻辑一致），状态同步难点在延迟与服务器性能',
  ] },
  { id: 51, category: '网络与同步', difficulty: 3, question: '帧同步如何保证多端确定性？', points: [
    '统一浮点：用定点数（如 long 定点）替代 float，避免不同平台指令差异',
    '随机数种子统一、逻辑与表现分离：只依赖同步输入与固定步长，不依赖本地时间/物理引擎',
    '禁止在战斗逻辑里用 Time.deltaTime、Unity 物理随机、字典遍历顺序等不确定源',
  ] },
  { id: 52, category: '网络与同步', difficulty: 3, question: '网络延迟高时如何保证手感？（预测/回滚/插值）', points: [
    '客户端预测：本地立刻执行操作，服务器确认后校正',
    '延迟补偿：服务器按玩家操作时刻的“过去状态”判定命中（FPS 常用）',
    '插值：对他人位置做缓冲插值平滑显示；回滚：冲突时把本地状态回退到服务器快照重演',
  ] },
  { id: 53, category: '网络与同步', difficulty: 2, question: '断线重连/弱网处理要做什么？', points: [
    '心跳检测、超时判定、自动重连退避；重连后拉取服务器快照同步状态',
    '战斗中断线：帧同步用“断线后补帧/服务器托管”，状态同步靠服务器权威继续推进',
    '客户端要做弱网表现降级（降低同步频率、显示重连中），避免假死与状态错乱',
  ] },

  // ============ 架构与设计模式 ============
  { id: 54, category: '架构与设计模式', difficulty: 1, question: 'Unity 中单例模式的正确姿势与坑？', points: [
    '泛型单例封装 Instance；常用场景：全局管理器（音频、事件、数据）',
    '坑：场景切换单例被销毁后 Instance 悬空、多实例重复、静态引用导致场景无法卸载',
    '改进：用 ScriptableObject 服务/依赖注入/事件中心，限制单例滥用；需要跨场景常驻用 DontDestroyOnLoad 并防重复',
  ] },
  { id: 55, category: '架构与设计模式', difficulty: 2, question: '游戏 UI 架构常用 MVC/MVP 吗？怎么组织？', points: [
    '大项目常用分层：View（界面表现）与 Model（数据）分离，Controller/Presenter 处理交互与数据绑定',
    'UI 框架核心：界面栈管理（打开/关闭/层级）、事件分发、数据绑定（观察者）',
    '过度拆分会让小功能变重；按团队规模选 MVVM 式绑定或轻量事件驱动',
  ] },
  { id: 56, category: '架构与设计模式', difficulty: 2, question: '事件中心/观察者模式怎么设计？注意什么？', points: [
    '定义事件类型与参数，中心管理注册与广播，解耦发布者与订阅者',
    '注意：忘记注销导致泄漏、事件参数装箱/分配、回调异常影响其他订阅者、层级混乱难调试',
    '增强：泛型事件减少装箱、支持优先级/异步、Debug 面板查看谁监听了谁',
  ] },
  { id: 57, category: '架构与设计模式', difficulty: 2, question: '状态机在游戏开发中的应用？', points: [
    '角色状态（Idle/Run/Attack/Die）、AI 状态、UI 流程状态都可建模为状态机',
    '实现：switch 简单版 / 状态模式类 + 状态转换表 / Animator 是引擎内置状态机',
    '复杂状态多时避免巨大 switch，用状态类与转换条件集中管理，防止状态泄漏与非法跳转',
  ] },
  { id: 58, category: '架构与设计模式', difficulty: 1, question: '工厂模式在游戏开发里的典型应用？', points: [
    '把“创建对象”的细节集中：按类型/配置生成不同敌人、武器、技能、UI 面板',
    '好处：新增类型不改调用方、配合对象池统一入口、便于依赖注入',
    'Unity 场景：工厂返回预制体实例，创建逻辑（加载、初始化、入池）收敛在工厂',
  ] },
  { id: 59, category: '架构与设计模式', difficulty: 2, question: '游戏主循环里常见架构分层有哪些？', points: [
    '逻辑层（玩法规则）、表现层（动画特效相机）、数据层（配置存档）分离，逻辑不直接依赖表现',
    '驱动层：管理器统一驱动（UpdateManager 批量调用模块 Tick），避免到处 Update',
    '好处：逻辑可单测、可帧同步回放、表现可换皮',
  ] },
  { id: 60, category: '架构与设计模式', difficulty: 3, question: 'ECS 和面向对象相比的核心优势？Unity DOTS 了解吗？', points: [
    'ECS = Entity（实体）+ Component（纯数据）+ System（逻辑），数据连续排布提升缓存命中与多线程（Job）并行',
    '适合大量同构实体：子弹海、群体 AI、大世界；缓存友好、无 GC 压力（可 Burst 编译）',
    '代价：上手门槛高、调试难、与现成 MonoBehaviour 生态割裂；适合性能瓶颈明确的系统局部使用',
  ] },

  // ============ 扩展批1 ============
  { id: 61, category: 'C#基础', difficulty: 1, question: '一个方法想返回多个值，有哪些做法？', points: [
    'out/ref 参数：适合少量值；ref 需先初始化，out 不用',
    '元组（ValueTuple）：(int, string) 或带名字 (int code, string msg)，轻量、语法糖解构方便',
    '自定义 struct/class 或泛型容器；struct 更省堆分配',
  ] },
  { id: 62, category: 'C#基础', difficulty: 1, question: 'foreach 的原理是什么？为什么迭代中不能修改集合？', points: [
    'foreach 是语法糖：调用 GetEnumerator() 拿 IEnumerator，循环 MoveNext() + 取 Current，最后 Dispose()',
    '迭代中修改集合会使枚举器失效抛 InvalidOperationException（List 内部有 version 校验）',
    '要边遍历边删除：倒序 for、收集待删再统一删，或用支持修改的结构',
  ] },
  { id: 63, category: 'C#基础', difficulty: 2, question: 'LINQ 的延迟执行（延迟加载）是什么？哪些操作会立即执行？', points: [
    'Select/Where/OrderBy 等返回 IEnumerable 的操作是延迟的：真正遍历时才逐个执行',
    'ToList/ToArray/Count/First/Any 等会立即执行（拉取数据），Aggregate/Sum 也立即',
    '延迟执行的好处：链式组合不产生中间集合；坑：底层数据在遍历前被改会影响结果、重复遍历重复计算',
  ] },
  { id: 64, category: 'C#基础', difficulty: 1, question: 'using 语句和 IDisposable 是什么关系？', points: [
    'using 语法糖展开为 try/finally 并调用 Dispose()（值类型用泛型约束不装箱）',
    '用于管理非托管资源：文件流、网络连接、数据库连接；Unity 中 AssetBundle 加载器、WWW 等',
    'using 声明（C# 8）：作用域结束自动释放；注意 Dispose 不等于 GC，只释放非托管资源',
  ] },
  { id: 65, category: 'C#基础', difficulty: 2, question: '反射是什么？有什么代价？', points: [
    '运行时通过 Type/Assembly 检查类型信息并动态创建对象、调用成员',
    '代价：慢（类型查找/方法绑定）、IL2CPP 下需 link.xml 或特性保留类型，否则被裁剪',
    '替代：泛型、接口多态、委托、表达式树、源码生成器（Source Generator）',
  ] },
  { id: 66, category: 'C#基础', difficulty: 2, question: 'Dictionary 底层如何实现？查找复杂度？', points: [
    '基于哈希桶数组 + 冲突链（开放寻址/链表法），用 key 的 GetHashCode 定位桶，再 Equals 精确比较',
    '平均 O(1) 查找，最坏 O(n)（哈希冲突严重）；扩容会重新哈希，有瞬时开销',
    '自定义 key 要正确重写 GetHashCode/Equals：相等的对象哈希必须一致；避免用可变对象当 key',
  ] },
  { id: 67, category: 'C#基础', difficulty: 2, question: '多线程安全共享数据有哪些手段？什么是死锁？', points: [
    'lock（Monitor）/Mutex/Semaphore 互斥；Interlocked 做原子加减；volatile 控制可见性（不保证原子）',
    'lock 本质是 Monitor.Enter/Exit + try/finally；建议锁私有对象而非 this/字符串',
    '死锁 = 两个线程互相持有对方需要的锁且不释放；避免：锁顺序一致、超时锁、减少嵌套锁',
  ] },
  { id: 68, category: 'C#基础', difficulty: 1, question: '你知道哪些 C# 较新的语法糖？', points: [
    '模式匹配 switch 表达式、is not、属性模式；record/with 表达式做不可变数据',
    '可空引用类型（? 注解）在编译期帮助防空引用；字符串插值 $、原始字符串、using 声明',
    'lambda 自然类型、局部函数、元组解构、索引/范围运算符（^ 和 ..）',
  ] },
  { id: 69, category: 'Unity核心', difficulty: 1, question: '为什么不要在 Update 里频繁 new 对象？', points: [
    '每次 new 都会在托管堆分配，积累后触发 GC 造成卡顿（GC Alloc 是性能关键指标）',
    'Unity 的 GC 在 IL2CPP/移动端频繁回收代价高；每帧分配即便很少也会放大压力',
    '优化：缓存复用对象、避免闭包/LINQ/字符串拼接、用对象池与预分配容器',
  ] },
  { id: 70, category: 'Unity核心', difficulty: 1, question: 'SetActive(false) 和脚本 enabled=false 有什么区别？', points: [
    'SetActive 控制 GameObject 激活态：失活时其所有组件回调停止（Update 不执行），且子物体一并失活',
    'enabled=false 只停用单个脚本：Update/协程仍跑吗？——MonoBehaviour.enabled=false 时 Update 停止，协程继续执行（除非物体失活/销毁）',
    'OnDisable：物体失活、脚本被禁用、销毁时都会调用；OnEnable 同理在激活时调用',
  ] },
  { id: 71, category: 'Unity核心', difficulty: 2, question: '场景切换时普通对象和 DontDestroyOnLoad 对象各经历什么？', points: [
    '普通对象在旧场景卸载时被 Destroy，走 OnDisable→OnDestroy',
    'DontDestroyOnLoad(this.gameObject) 的对象跨场景存活；再次加载含同名单例会重复创建，需防重',
    '常驻对象持有场景引用会导致场景无法卸载/泄漏；退出场景时手动清理事件与资源',
  ] },
  { id: 72, category: 'Unity核心', difficulty: 1, question: 'transform.position 和 transform.localPosition 的区别？', points: [
    'position 是世界坐标；localPosition 相对父节点的本地坐标（父级移动会影响其世界位置）',
    '没有父节点时两者一致；UI 物体常用 localPosition/localScale 在父节点下布局',
    '换算 API：Transform.TransformPoint/InverseTransformPoint 在局部与世界之间转换点',
  ] },
  { id: 73, category: 'Unity核心', difficulty: 1, question: 'Layer 和 Tag 有什么区别？射线过滤用哪个？', points: [
    'Layer 是 0-31 的整型位掩码，用于物理碰撞/射线/相机剔除分组；Tag 是字符串标识，用于 FindWithTag 等逻辑查找',
    '射线 Physics.Raycast 用 LayerMask 过滤层级，避免逐物体判断',
    'Layer 更适合高频/性能敏感筛选（位运算快），Tag 适合低频业务标记',
  ] },
  { id: 74, category: 'Unity核心', difficulty: 2, question: 'UI 里的 Canvas 为什么要尽量少、层级要浅？', points: [
    'Canvas 会触发重建（rebuild）：布局变化、属性变化都要重新生成网格；Canvas 多会多次重建与合批切换',
    '层级嵌套深、每帧改 UI 属性会造成 Layout/Graphic 重建开销和 Draw Call 增加',
    '优化：静态部分独立 Canvas、动态部分小范围更新、避免频繁改 RectTransform/Text、用图集与少嵌套',
  ] },

  // ============ 扩展批2 ============
  { id: 75, category: '协程与异步', difficulty: 2, question: 'StartCoroutine 传字符串和传 IEnumerator 的区别？', points: [
    '字符串版（"MethodName"）按名字启动，可配 StopCoroutine(name) 停止；无编译期类型检查，方法不存在运行时报错',
    'IEnumerator 版更安全，但停止时需持有同一个 IEnumerator 实例引用才有效',
    '生产环境建议用强类型 IEnumerator + Coroutine 句柄保存，便于精确停止',
  ] },
  { id: 76, category: '协程与异步', difficulty: 3, question: '如何实现“等待某个条件成立再继续”的协程？', points: [
    '自己写 while (!cond) yield return null 会每帧空转，开销可控但语义弱',
    '封装 WaitUntil/WaitWhile（Unity 内置）实现条件等待；大列表分帧处理常用',
    '复杂异步（多条件/带超时）可用 async/await + UniTask，取消与异常更完善',
  ] },
  { id: 77, category: '协程与异步', difficulty: 3, question: '协程的每帧开销来自哪里？大量协程会影响性能吗？', points: [
    '每个协程由引擎每帧/按指令推进：IEnumerator 状态机 + 指令对象（如 WaitForSeconds）会分配',
    'WaitForSeconds 每次 yield 都 new 对象；大量协程会造成 GC 压力与每帧遍历开销',
    '优化：缓存复用等待对象、用统一调度器（如 UniTask）减少协程数量、长任务分片处理',
  ] },
  { id: 78, category: '资源与内存', difficulty: 2, question: 'Resources.Load 为什么被官方不推荐？', points: [
    'Resources 目录内容全部打进包体，无法按需下载、无法做版本热更，包体膨胀',
    'Resources.Load 每次加载没有引用计数概念，容易忘记卸载；资源被 Resources 系统持有难精确释放',
    '推荐 Addressables/AssetBundle：可寻址、可远程、引用计数、按平台优化',
  ] },
  { id: 79, category: '资源与内存', difficulty: 2, question: '如何判断一个资源（纹理/网格）是否真的卸载了？', points: [
    '用 Profiler Memory 面板看资源列表与引用计数；场景对象、材质引用、已加载 AssetBundle 都会阻止卸载',
    'Resources.UnloadUnusedAssets 只卸载无任何引用的资源；运行时加载的新资源若被静态引用仍不卸载',
    'Addressables 场景可用 Addressables.GetLoadState/引用计数 API 追踪；怀疑泄漏用 Memory Profiler 快照对比',
  ] },
  { id: 80, category: '资源与内存', difficulty: 3, question: '热更新资源断点续传与校验怎么做？', points: [
    '下载器分块/分段下载，记录已下载偏移量，断线后从断点续传（需要服务端支持 Range）',
    '完整性校验：每个文件/包算 hash（MD5 或更好用 xxhash/SHA），下载完成后对比清单里的 hash',
    '版本清单先校验签名/完整性，防止中间人篡改；下载失败重试要退避，避免无限重试',
  ] },
  { id: 81, category: '资源与内存', difficulty: 2, question: 'Addressables 的引用计数泄漏常见原因？', points: [
    'LoadAssetAsync 后忘记 Release；InstantiateAsync 生成的实例销毁后没有 ReleaseInstance',
    '重复 Load 同一资源：Addressables 计数递增，每次 Load 都需对应 Release',
    '场景/预制体里引用其他资源：场景释放时子资源计数也要理清，用 Addressables 场景管理可自动处理',
  ] },
  { id: 82, category: '物理与碰撞', difficulty: 2, question: 'Rigidbody 的 interpolation 和 collision detection 模式何时用？', points: [
    'Interpolation 用于高速/相机跟随时平滑刚体渲染位置，避免“抖动画格”（Extrapolate 可预测未来）',
    'Collision Detection：Discrete（默认快但不精确）；Continuous/Continuous Dynamic 防止高速物体穿透，代价高',
    '子弹/高速弹体建议 Continuous 或自己用射线/球形扫掠检测，避免直接依赖物理引擎漏检',
  ] },
  { id: 83, category: '物理与碰撞', difficulty: 2, question: '物理引擎常见性能杀手有哪些？', points: [
    '碰撞体数量过多、复杂凸包/网格碰撞体、刚体睡眠设置不当（物体一直 awake）',
    '每帧大量 Raycast/Sweep、触发器频繁进出回调、物理步长被改小（fixedDeltaTime 调低会增加模拟次数）',
    '优化：用碰撞体 Layer 矩阵禁用无关碰撞、简化碰撞体、合并静态碰撞体、控制查询频率',
  ] },
  { id: 84, category: '物理与碰撞', difficulty: 3, question: '刚体穿透/隧道效应（tunneling）如何解决？', points: [
    '高速物体在单步内越过薄碰撞体导致漏检（隧道效应）',
    '解法：调小 fixedDeltaTime 或增大 Collision Detection 到 Continuous；把碰撞体加厚/用射线扫掠检测',
    '移动物体每帧位移不要超过最小碰撞体厚度；关键碰撞用专用检测（OverlapSphere/Raycast）兜底',
  ] },
  { id: 85, category: '热更与工程', difficulty: 2, question: 'IL2CPP 裁剪（code stripping）会带来什么问题？', points: [
    '未被引用/反射使用的类型可能被裁剪，运行时 Type.GetType/Activator.CreateInstance 返回 null',
    '处理：link.xml 显式保留类型/成员、[Preserve] 特性标记、IL2CPP 的 Managed Stripping Level 调低',
    '序列化/Json 反序列化、反射调用、多态注册表最易踩坑，接入新库要做真机验证',
  ] },
  { id: 86, category: '热更与工程', difficulty: 2, question: '打 AssetBundle 时如何避免资源冗余重复？', points: [
    '依赖分析：同一资源被多个 Bundle 引用时若不显式分离，会打进每个引用包造成重复',
    '公共资源单独成包（图集/Shader/通用模型），用 AssetBundle Build Report 检查重复项',
    '同名/同路径资源冲突、sub asset 处理不当也会重复；用 Addressables 分组与依赖自动管理',
  ] },
  { id: 87, category: '热更与工程', difficulty: 3, question: 'Unity 工程如何做 CI/CD 自动化打包？', points: [
    '命令行批处理：Unity -batchmode -quit -executeMethod 指定 Build 静态方法，传参数控制平台/版本',
    '配合 Jenkins/GitLab CI 流水线：拉代码、跑单元测试、打 AssetBundle/安装包、上传分发平台',
    '注意 License 激活、Android SDK/NDK 环境变量、构建产物按构建号归档与版本管理',
  ] },

  // ============ 扩展批3 ============
  { id: 88, category: '网络与同步', difficulty: 3, question: '多人游戏如何降低同步流量？', points: [
    '只同步“变化且关键”的数据：输入/位置差分（delta）而非全量每帧快照；用 BitStream 压缩字段',
    '服务器广播做区域裁剪（Interest Management）：只发给附近玩家；快照按需插值而非高频全量',
    '帧同步里只同步输入与随机种子，客户端本地演算，流量天然最小',
  ] },
  { id: 89, category: '网络与同步', difficulty: 3, question: '权威服务器（authoritative server）解决什么问题？', points: [
    '由服务器裁定合法状态，客户端只上报输入/意图，杜绝本地修改血量/坐标的作弊',
    '服务器也做碰撞/判定校验，客户端预测+校正；反作弊还要做行为校验与加密',
    '代价：服务器开销大、延迟要求高；纯帧同步可做成“服务器只转发输入”的半权威',
  ] },
  { id: 90, category: '架构与设计模式', difficulty: 2, question: '事件系统和直接方法调用的取舍？什么时候用事件？', points: [
    '直接调用：强耦合但链路清晰、性能好、易调试；适合明确一对一依赖',
    '事件/消息：解耦生产者和消费者，适合一对多、跨模块通知（UI 监听战斗结果、成就系统监听击杀）',
    '过度使用事件会让调用链不可追踪、调试困难；中间层设计要克制',
  ] },
  { id: 91, category: '架构与设计模式', difficulty: 2, question: 'ScriptableObject 在项目里一般怎么用？', points: [
    '做数据配置资产：数值表、技能配置、道具定义，不写死代码且可多人协作',
    '做事件通道/共享数据仓库（不可变配置 + 可变运行时状态分离），减少单例',
    '注意：SO 是资产（Asset），运行期修改会留在编辑器资产上，发布后修改只存在内存；大量 SO 注意内存',
  ] },
  { id: 92, category: '架构与设计模式', difficulty: 2, question: '命令模式在游戏里的应用（如技能/操作回放）？', points: [
    '把操作封装成对象（Execute/Undo），可排队、可撤销、可序列化记录',
    '应用：输入缓冲、回放系统、网络输入队列（帧同步里每条输入就是一个命令）',
    '配合状态快照可做“时间回溯/回滚”；实现要点是命令只依赖纯数据，方便序列化',
  ] },
  { id: 93, category: '架构与设计模式', difficulty: 3, question: '大型战斗系统如何做模块拆分？', points: [
    '分层：战斗核心逻辑（纯数据/纯函数，可回放可单测）与表现层（特效/音效/相机）分离',
    '模块化：Buff/技能/伤害计算/目标选择各自成系统，用事件或接口通信，避免巨型 God 类',
    '配置驱动：数值、Buff 效果、技能行为尽量配置化 + 脚本化，降低新增玩法成本',
  ] },
  { id: 94, category: '架构与设计模式', difficulty: 3, question: '数据驱动设计（Data-Driven）的好处与实现？', points: [
    '把行为参数从代码抽到配置：数值、掉落、技能、关卡、AI 参数，策划可调不用改代码重发包',
    '实现：ScriptableObject/Json/Excel 工具链导出，运行时统一加载与校验',
    '注意配置校验（缺字段/越界）、版本管理与热更；纯数据驱动避免把逻辑也塞进配置导致“配置即代码”难维护',
  ] },

  // ============ 计算机网络 ============
  { id: 95, category: '计算机网络', difficulty: 1, question: 'OSI 七层模型和 TCP/IP 四层模型分别是什么？', points: [
    'OSI：物理/数据链路/网络/传输/会话/表示/应用；TCP/IP：网络接口/网际/传输/应用',
    'TCP/IP 把 OSI 的上三层合并为应用层，网际层对应 IP 路由转发',
    '分层意义：每层只关心相邻层接口，便于实现与排障（如抓包定位到传输层）',
  ] },
  { id: 96, category: '计算机网络', difficulty: 1, question: 'TCP 和 UDP 的区别？游戏里怎么选？', points: [
    'TCP：面向连接、可靠有序、有拥塞控制；UDP：无连接、不保证可靠与顺序、开销小延迟低',
    '需要可靠全量数据的登录/下单用 TCP/HTTPS；实时战斗位置/输入用 UDP（可自己加 ACK/序号）',
    '很多游戏“UDP + 自研可靠层”或直接上 QUIC，兼顾低延迟与可靠性',
  ] },
  { id: 97, category: '计算机网络', difficulty: 2, question: 'TCP 三次握手和四次挥手的过程？为什么挥手要多一次？', points: [
    '握手：SYN → SYN+ACK → ACK，确认双方收发能力并交换初始序号',
    '挥手：FIN → ACK → FIN → ACK；因为 TCP 是全双工，两端要各自关闭自己的发送方向',
    'TIME_WAIT 在主动关闭方停留 2MSL，保证最后一个 ACK 可达、旧报文不串扰新连接',
  ] },
  { id: 98, category: '计算机网络', difficulty: 2, question: 'HTTP 和 HTTPS 的区别？HTTPS 握手大致流程？', points: [
    'HTTPS = HTTP + TLS：加密传输、证书校验身份、防篡改；代价是握手开销',
    'TLS 握手：ClientHello → ServerHello+证书 → 客户端验证证书并协商密钥 → 双方用对称密钥加密通信',
    '现代用 TLS1.3 1-RTT 握手，前向安全用 ECDHE 密钥交换；证书链校验防中间人',
  ] },
  { id: 99, category: '计算机网络', difficulty: 1, question: '常见 HTTP 状态码有哪些？各自含义？', points: [
    '2xx：200 OK、204 No Content；3xx：301 永久重定向、302 临时重定向、304 未修改（缓存）',
    '4xx：400 参数错误、401 未认证、403 无权限、404 不存在、429 限流',
    '5xx：500 服务器内部错误、502 网关错误、503 服务不可用、504 网关超时',
  ] },
  { id: 100, category: '计算机网络', difficulty: 1, question: '从输入 URL 到页面显示，发生了什么？', points: [
    'DNS 解析域名得到 IP → 建立 TCP 连接（HTTPS 加 TLS 握手）→ 发送 HTTP 请求',
    '服务器处理返回 HTML/资源 → 浏览器解析 HTML 构建 DOM、CSSOM，执行 JS，布局与绘制',
    '现代流程还含缓存（浏览器缓存/CDN）、HTTP/2 多路复用、预加载优化等',
  ] },
  { id: 101, category: '计算机网络', difficulty: 2, question: 'DNS 解析过程是怎样的？', points: [
    '先查浏览器缓存 → 本机 hosts/系统缓存 → 本地 DNS 服务器（递归查询）',
    '本地 DNS 迭代查询根服务器 → 顶级域（.com）→ 权威服务器，拿到 A/AAAA 记录',
    '优化：CDN 按地理位置返回就近节点 IP；DNS 污染/劫持可用 DoH/DoT',
  ] },
  { id: 102, category: '计算机网络', difficulty: 2, question: '什么是 TCP 粘包/拆包？如何处理？', points: [
    'TCP 是字节流无消息边界：多个小包合并（粘包）或大包分片（拆包）都很常见',
    '处理：定长消息、长度字段前置（包头+长度）、分隔符/结束符、或每个消息独立连接（不推荐）',
    'UDP 有消息边界但可能丢包乱序，需要自己加序号、校验与重传',
  ] },
  { id: 103, category: '计算机网络', difficulty: 3, question: 'TCP 拥塞控制有哪些算法？慢启动是什么？', points: [
    '慢启动：cwnd 从 1 开始指数增长（每个 RTT 翻倍），达到 ssthresh 进入拥塞避免',
    '拥塞避免：cwnd 线性增长；丢包（超时/3 个重复 ACK）触发快重传/快恢复，阈值减半',
    '现代还有 BBR（基于带宽时延积探测）等算法；拥塞控制目标是公平利用带宽、避免网络崩溃',
  ] },
  { id: 104, category: '计算机网络', difficulty: 3, question: 'TCP 流量控制和拥塞控制的区别？滑动窗口是什么？', points: [
    '流量控制：接收方通过窗口字段告诉发送方“我能收多少”，防止发送过快压垮接收方（端到端）',
    '拥塞控制：发送方根据网络状况调整 cwnd，防止压垮中间网络（全局）',
    '发送窗口 = min(接收窗口 rwnd, 拥塞窗口 cwnd)；滑动窗口允许批量发送+累计确认，提高吞吐',
  ] },
  { id: 105, category: '计算机网络', difficulty: 2, question: 'HTTP/1.1、HTTP/2、HTTP/3 的主要区别？', points: [
    'HTTP/1.1：持久连接 + 管道化（实际队头阻塞严重，一个连接一次一个请求响应）',
    'HTTP/2：二进制分帧 + 多路复用（同连接并发请求）、头部压缩 HPACK、Server Push；TCP 层队头阻塞仍在',
    'HTTP/3：基于 QUIC/UDP，连接迁移、0-RTT、彻底解决队头阻塞；头部用 QPACK',
  ] },
  { id: 106, category: '计算机网络', difficulty: 2, question: '长连接和短连接的区别？Keep-Alive 是什么？', points: [
    '短连接：每次请求建连-用后即断，握手开销大，适合低频小请求',
    '长连接：连接复用（HTTP Keep-Alive / TCP 连接池），减少握手与慢启动开销，适合高频交互',
    '长连接要处理空闲超时、心跳保活、断线重连与连接数管理；服务端资源占用更高',
  ] },
  { id: 107, category: '计算机网络', difficulty: 2, question: 'Cookie、Session、Token 的区别与关系？', points: [
    'Cookie 是浏览器存储的小数据，随请求自动携带，可存 sessionId 或登录态',
    'Session 在服务端保存用户状态，通过 sessionId 关联；集群部署需共享 Session（Redis）',
    'Token/JWT 是无状态认证：服务端验签即可，适合分布式；注意过期、刷新与吊销机制',
  ] },
  { id: 108, category: '计算机网络', difficulty: 2, question: 'WebSocket 和轮询/SSE 的区别？游戏里怎么用？', points: [
    '轮询：定时发 HTTP 请求，实时性差、浪费流量；长轮询改善延迟但连接成本高',
    'WebSocket：全双工长连接，双向实时推送，适合聊天/联机/实时协作',
    'SSE：服务端单向推送（基于 HTTP），简单且自动重连，适合通知类场景；实时游戏通常 WebSocket 或自定义 UDP',
  ] },
  { id: 109, category: '计算机网络', difficulty: 3, question: '什么是负载均衡？有哪些算法？', points: [
    '把请求分发到多台服务器，提升容量与可用性；分 DNS/四层（LVS）/七层（Nginx）负载',
    '算法：轮询、加权轮询、最少连接、IP Hash、一致性哈希（缓存场景减少迁移）',
    '健康检查剔除故障节点、会话保持（sticky session）与无状态化（JWT/Redis）是配套要点',
  ] },
  { id: 110, category: '计算机网络', difficulty: 3, question: '游戏实时对战为什么常不用纯 TCP？QUIC 适合游戏吗？', points: [
    'TCP 的可靠重传带来延迟抖动与队头阻塞，实时操作等不起重传；UDP 低延迟但需自管丢包',
    '实际做法：TCP 用于登录/商店/匹配等可靠业务，UDP/可靠 UDP 用于战斗帧数据',
    'QUIC 基于 UDP 实现可靠传输：0-RTT 建连、无队头阻塞、连接迁移，适合手游弱网对战',
  ] },

  // ============ 数据结构 ============
  { id: 111, category: '数据结构', difficulty: 1, question: '数组和链表的区别？各自适合什么场景？', points: [
    '数组：连续内存、按下标 O(1) 访问、缓存友好；插入/删除需搬移 O(n)',
    '链表：节点分散、顺序访问 O(n)、插入/删除 O(1)（已知位置）；内存不连续缓存差',
    '读多写少用数组/List；频繁中间插入删除、大小不确定用链表（但 C# 里 LinkedList 实际使用少，常用 List 平衡）',
  ] },
  { id: 112, category: '数据结构', difficulty: 1, question: '栈和队列的区别？用栈实现队列的思路？', points: [
    '栈：后进先出 LIFO；队列：先进先出 FIFO',
    '双栈实现队列：入队压入 in 栈；出队时若 out 栈空则把 in 全部倒入 out 再弹出',
    '应用：函数调用栈/递归转非递归、表达式求值（栈）；消息队列/任务调度（队列）',
  ] },
  { id: 113, category: '数据结构', difficulty: 2, question: '哈希冲突怎么解决？装载因子是什么？', points: [
    '开放寻址：线性/二次探测、再哈希；链表法：同桶挂链表/红黑树（Java 8 HashMap 树化）',
    '装载因子 = 元素数/桶数：越大冲突越多，通常超过阈值（如 0.75）就扩容重哈希',
    '哈希函数要均匀；攻击者可构造碰撞导致 O(n) 退化，需随机种子（如字符串哈希加盐）防护',
  ] },
  { id: 114, category: '数据结构', difficulty: 2, question: '二叉搜索树（BST）的特性？为什么会退化？', points: [
    '左子树 < 根 < 右子树，中序遍历有序；查找/插入平均 O(log n)',
    '插入有序序列时 BST 退化成链表，操作退化为 O(n)；需要自平衡（AVL/红黑树）',
    'AVL 严格平衡、红黑树近似平衡（旋转少）；实际系统常用红黑树（TreeMap、C++ map）',
  ] },
  { id: 115, category: '数据结构', difficulty: 2, question: '二叉树的前序/中序/后序/层序遍历分别怎么走？', points: [
    '前序：根→左→右；中序：左→根→右（BST 中序有序）；后序：左→右→根；层序：按层 BFS',
    '递归实现简单；工程上深树用迭代（显式栈）防爆栈',
    '用途：前序/中序可重建二叉树、后序适合先释放子节点、层序适合宽度优先搜索/层级处理',
  ] },
  { id: 116, category: '数据结构', difficulty: 2, question: '堆（优先队列）是什么？怎么实现？', points: [
    '堆是完全二叉树：大顶堆根最大、小顶堆根最小；父子满足堆序',
    '插入上浮、删除堆顶下沉，复杂度 O(log n)；建堆 O(n)',
    '应用：TopK、定时器/事件调度、Dijkstra 优先队列；C# 里用 PriorityQueue<T> 或自写数组堆',
  ] },
  { id: 117, category: '数据结构', difficulty: 2, question: '快排和归并排序的思路？复杂度与稳定性？', points: [
    '快排：选 pivot 分区，递归两侧；平均 O(n log n)，最坏 O(n²)（有序+固定 pivot）；不稳定',
    '归并：分治合并两个有序子数组；稳定 O(n log n)，需 O(n) 额外空间',
    '游戏客户端常用：数据量小用插入排序兜底（快排优化）、引擎内部排序对稳定性有要求时选归并',
  ] },
  { id: 118, category: '数据结构', difficulty: 2, question: '二分查找的前提与注意点？', points: [
    '前提：有序数组 + 支持随机访问；每次缩小一半 O(log n)',
    '边界易错：左闭右开/闭区间一致、mid = l + (r-l)/2 防溢出、处理死循环',
    '变体：找第一个/最后一个等于、找大于等于某值的下界（lower_bound）',
  ] },
  { id: 119, category: '数据结构', difficulty: 2, question: '图的邻接矩阵和邻接表区别？BFS 和 DFS 分别适合什么？', points: [
    '邻接矩阵：O(V²) 空间、判边 O(1)，适合稠密图；邻接表：O(V+E)、遍历邻居快，适合稀疏图',
    'BFS 按层扩散：最短路（无权）、拓扑层数、迷宫最短路径；用队列实现',
    'DFS 深挖：连通分量、环检测、拓扑排序（逆后序）、回溯搜索；用栈/递归实现',
  ] },
  { id: 120, category: '数据结构', difficulty: 3, question: 'Dijkstra 原理？A* 和它的关系？', points: [
    'Dijkstra：从起点出发每次选 dist 最小的未访问节点松弛，处理非负权图最短路 O((V+E)logV)',
    'A* = Dijkstra + 启发式：f = g + h，h 估计到终点代价（如曼哈顿/欧氏距离），更快找到目标',
    'h 可采纳（不高估）时 A* 最优；游戏寻路常用 A* + 导航网格分层，巨大地图用 HPA*/JPS',
  ] },
  { id: 121, category: '数据结构', difficulty: 3, question: 'AVL 树和红黑树的区别？为什么很多系统用红黑树？', points: [
    'AVL：任意节点左右子树高度差 ≤1，严格平衡，查询快；插入/删除旋转多',
    '红黑树：近似平衡（最长路径 ≤2×最短），旋转少、插入删除性能好；查找略慢于 AVL',
    '场景：写多读少/动态增删（TreeMap、定时器、Epoll）用红黑树；静态只查可用 AVL/二分',
  ] },
  { id: 122, category: '数据结构', difficulty: 3, question: 'B 树和 B+ 树的区别？为什么数据库/文件系统用 B+ 树？', points: [
    'B/B+ 树是多路平衡搜索树：降低树高，一次磁盘 IO 读一个大节点，减少寻道次数',
    'B+ 树：数据只在叶子、叶子链表相连、内部节点只存索引——范围查询友好、IO 更少',
    '数据库索引/文件系统用 B+ 树：层数低（3-4 层扛千万级）、支持高效范围扫描',
  ] },
  { id: 123, category: '数据结构', difficulty: 2, question: 'LRU 缓存怎么实现？', points: [
    '哈希表 + 双向链表：哈希 O(1) 定位，链表维护访问顺序',
    'get 命中把节点移到头部；put 新节点放头部，超容量删尾部；O(1) 操作',
    '变体：LFU（按访问频率）、2Q/ARC 等；游戏资源缓存/贴图流送常用 LRU',
  ] },
  { id: 124, category: '数据结构', difficulty: 3, question: 'KMP 算法解决什么问题？核心思想？', points: [
    '字符串匹配：在主串找模式串位置，暴力 O(n×m)，KMP 做到 O(n+m)',
    '核心：预处理 next 数组（模式串自身最长相等前后缀），失配时模式串不回退主串',
    'next 计算与匹配共用“失配跳转”思想；工程里还可配合 BM/Sunday 进一步加速',
  ] },
  { id: 125, category: '数据结构', difficulty: 3, question: '线段树/树状数组适合解决什么问题？', points: [
    '都是区间问题工具：单点/区间修改、区间求和/最值/异或，O(log n)',
    '线段树：递归分治维护区间信息，支持区间打标（懒更新），功能强实现复杂',
    '树状数组（BIT）：代码极短、常数小，支持前缀和/差分/逆序对，但不便做区间最值与复杂合并',
  ] },
  { id: 126, category: '数据结构', difficulty: 3, question: 'TopK/海量数据求频次怎么做？', points: [
    '内存够：哈希计数 + 大小为 K 的小顶堆（或快排 partition 法）O(n log K)',
    '海量数据：分治（哈希分桶 MapReduce）+ 每桶求 TopK 再归并；近似算法可用 Bloom Filter/Count-Min Sketch',
    '流式场景：蓄水池抽样求随机 TopK；注意“全局频次”要先全局聚合再排序',
  ] },

  // ============ 渲染扩展 ============
  { id: 127, category: '渲染与图形学', difficulty: 1, question: '渲染管线大致分哪些阶段？', points: [
    '应用阶段（CPU）：剔除、合批、提交渲染命令 → GPU 几何阶段：顶点着色、裁剪、光栅化',
    '片元阶段：片元着色、深度/模板测试、混合，输出到帧缓冲',
    '可编程管线给开发者着色器入口（VS/FS 或计算着色器），管线状态切换是性能关键',
  ] },
  { id: 128, category: '渲染与图形学', difficulty: 2, question: 'Draw Call 是什么？合批（Batching）为什么能提升性能？', points: [
    'Draw Call 是 CPU 向 GPU 提交的一次绘制命令；每批都要绑定资源/切换状态，次数多则 CPU 成为瓶颈',
    '合批：把多个小网格合并成一次提交（Static Batching 合并静态物体、Dynamic Batching 合并小网格）',
    '前提是材质/纹理/Shader 参数一致（可用图集 + 合并网格）；SRP Batcher 减少材质状态切换开销',
  ] },
  { id: 129, category: '渲染与图形学', difficulty: 2, question: '前向渲染和延迟渲染的区别与选择？', points: [
    '前向：每物体逐光源光照，多光源开销线性增长；移动端/少光源常用，支持 MSAA',
    '延迟：先渲 G-Buffer（几何信息）再全屏光照，光源与物体数解耦，适合大量光源',
    '延迟缺点：带宽大、难做透明/复杂材质、需专门处理抗锯齿；URP 可按平台与需求切换',
  ] },
  { id: 130, category: '渲染与图形学', difficulty: 2, question: 'GPU 上的坐标系与 Unity 左手系转换注意什么？', points: [
    'Unity 用左手坐标系（相机看 +Z），DX 用左手、OpenGL 用右手；美术工具（Maya）是右手系，导入需转换',
    'Unity 里顶点/法线在模型空间，Shader 中模型空间→世界→观察→裁剪由 MVP 矩阵变换',
    '屏幕空间 UV：Vulkan/DX 原点左上、OpenGL 左下，做全屏后处理时方向要小心（URP 统一向上采样用 flip）',
  ] },
  { id: 131, category: '渲染与图形学', difficulty: 2, question: '纹理压缩格式怎么选？为什么移动端用 ASTC/ETC？', points: [
    '桌面常用 BC 系列（BC7/DXT）；移动端传统用 ETC2（免版权、安卓兼容好）、ASTC（灵活、质量更高）',
    '纹理压缩是有损块压缩（4×4 等），直接减小带宽与显存；不要用 PNG 原图当运行时纹理',
    '选择看平台与质量需求：iOS/新安卓可 ASTC，老安卓 ETC2；UI 可保留 RGBA 但用图集控制大小',
  ] },
  { id: 132, category: '渲染与图形学', difficulty: 3, question: 'Mipmap 是什么？什么时候用、什么时候关？', points: [
    '预生成逐级缩小纹理：采样时按距离选合适层级，减少闪烁（moiré）与带宽',
    '3D 场景/地形基本都开；UI（1:1 采样）和 2D 精灵通常关掉，避免额外内存与模糊',
    '代价：多约 1/3 纹理内存；美术导入设置可改 Mipmap 开关与纹理大小限制',
  ] },
  { id: 133, category: '渲染与图形学', difficulty: 3, question: '什么是阴影贴图（Shadow Map）？常见问题与改进？', points: [
    '从光源视角渲深度图，片元比较深度判断是否在阴影中；平行光用正交、点光用立方体贴图',
    '问题：自阴影（shadow acne）用深度偏移解决、边缘锯齿（peter panning）用 bias 调优、PCF 软阴影',
    '改进：级联阴影（CSM）近处高分辨率远处低、屏幕空间接触阴影（SSAO 思路）补充细节',
  ] },
  { id: 134, category: '渲染与图形学', difficulty: 3, question: 'URP/SRP 相比内置管线的核心改进与迁移注意？', points: [
    'SRP Batcher 减少材质绑定、GPU Instancing 原生支持、单 Pass 正向渲染适配移动端、Shader 用 Shader Graph/URP 语法',
    '内置管线自定义 Shader 迁移需改：改用 SRP 宏与 CBUFFER、Multi_compile 变体减少、光照模式选择',
    '支持 Render Feature 做后处理/描边/URP 全屏；做性能分析时要看 Draw Call、SetPass Call 与带宽',
  ] },
]

/** 稳定锚点：2026-09-01 起算天数，用于按日期轮询 */
const DAY_ANCHOR = Date.UTC(2026, 8, 1)

/** 取某天的“第 N 天”序号（东八区日期） */
export function dayIndex(date: Date = new Date()): number {
  const y = date.getFullYear()
  const m = date.getMonth()
  const d = date.getDate()
  const todayUTC = Date.UTC(y, m, d)
  return Math.floor((todayUTC - DAY_ANCHOR) / 86400000)
}

/** 每日一题：按日期稳定轮询，不随刷新变化 */
export function getDailyQuestion(date: Date = new Date()): UnityQuestion {
  const idx = dayIndex(date)
  const q = UNITY_QUESTIONS[idx % UNITY_QUESTIONS.length]
  return { ...q, id: q.id }
}

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  'C#基础',
  'Unity核心',
  '协程与异步',
  '渲染与图形学',
  '资源与内存',
  '物理与碰撞',
  '计算机网络',
  '数据结构',
  '热更与工程',
  '网络与同步',
  '架构与设计模式',
]
