// Unity 客户端八股题库（萌神小天博客 · 每日一题数据源）
// 按日期轮询取题，全部题目可在 /quiz 页刷题复习。

export type QuestionCategory =
  | 'C#基础'
  | 'Unity核心'
  | '协程与异步'
  | '渲染与性能'
  | '资源与内存'
  | '物理与碰撞'
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
  { id: 26, category: '渲染与性能', difficulty: 1, question: '什么是 Draw Call？为什么越少越好？', points: [
    '一次 Draw Call = CPU 提交一个渲染批次给 GPU；过多会卡 CPU（状态切换/提交开销）',
    '通过合批、图集、少换材质/Shader、静态批处理减少 Draw Call',
    '严格说现代引擎看 SetPass Call / 渲染状态切换；移动端尤其敏感',
  ] },
  { id: 27, category: '渲染与性能', difficulty: 2, question: '静态合批和动态合批的机制与限制？', points: [
    '静态合批：标记 Static 的物体在构建时合并网格，运行时一次提交；代价是内存与构建时间',
    '动态合批：运行时把满足条件的小网格合并；限制顶点数（≤900 左右，URP 与顶点属性相关）、材质必须相同',
    '合批前提：相同材质、无特殊 Renderer 设置、不破坏实例化需求；UI 图集也类似',
  ] },
  { id: 28, category: '渲染与性能', difficulty: 2, question: 'SRP Batcher 是什么？为什么能提升性能？', points: [
    'SRP Batcher 是 URP/HDRP 的合批路径：复用 Shader 属性块，减少 CPU 端 per-object 的材质状态设置',
    '要求 Shader 兼容 SRP Batcher（用 CBUFFER 声明属性），物体间只差材质属性也能快速切换',
    '把大量小物体材质统一、Shader 兼容后，Draw Call 与 CPU 提交开销明显下降',
  ] },
  { id: 29, category: '渲染与性能', difficulty: 2, question: '图集（Atlas）的作用？UGUI 为什么要打图集？', points: [
    '图集把多张小图合成一张大图，同图集内 UI/精灵共用一个材质纹理，可合批减少 Draw Call',
    'UGUI 动态合批要求相邻元素用同一图集，跨图集无法合批（TextMeshPro 字库同理）',
    '注意图集 padding 防止采样串色，注意图集尺寸上限与内存占用平衡',
  ] },
  { id: 30, category: '渲染与性能', difficulty: 2, question: '遮挡剔除（Occlusion Culling）原理与使用注意？', points: [
    '用遮挡体（Occluder）判断被完全挡住的物体不提交渲染，减少 GPU 负载',
    '需要烘焙遮挡数据（静态场景）；动态物体无法作为 occluder（可用遮挡查询）',
    '与视锥剔除互补：视锥剔除是基础，遮挡剔除进一步省 Draw Call；烘焙不当会产生“穿帮/弹出”',
  ] },
  { id: 31, category: '渲染与性能', difficulty: 2, question: '移动端纹理压缩格式怎么选？', points: [
    'iOS：ASTC（硬件支持好，质量/体积平衡）；旧设备可用 PVRTC',
    'Android：主流用 ASTC（高通/ARM 新 GPU 支持），兼容性兜底 ETC2（OpenGL ES 3.0 起）',
    '避免用未压缩 RGBA32 大纹理；UI 与 3D 图集按平台设置压缩格式，注意透明图与法线图差异',
  ] },
  { id: 32, category: '渲染与性能', difficulty: 3, question: '半透明物体为什么容易有渲染排序问题？', points: [
    '透明物体不写深度（或按需），渲染按距离从远到近（Transparent 队列），互相穿插时排序会错',
    '标准透明靠“画家算法”，物体互相穿插无法正确混合；粒子、水面常见伪影',
    '处理：拆碎穿插体、用深度写入技巧、Additive 混合减少错误、或用 OIT（代价高）',
  ] },
  { id: 33, category: '渲染与性能', difficulty: 2, question: '什么是 Overdraw？如何定位与优化？', points: [
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
  '渲染与性能',
  '资源与内存',
  '物理与碰撞',
  '热更与工程',
  '网络与同步',
  '架构与设计模式',
]
