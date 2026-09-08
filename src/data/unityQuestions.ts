// Unity 客户端八股题库（萌神小天博客 · 每日一题数据源）
// 按日期轮询取题，全部题目可在 /quiz 页刷题复习。

export type QuestionCategory =
  | 'C#基础'
  | 'Unity核心'
  | 'UGUI'
  | '协程与异步'
  | '渲染与图形学'
  | '资源与内存'
  | '物理与碰撞'
  | '计算机网络'
  | '数据结构'
  | '热更与工程'
  | '网络与同步'
  | '架构与设计模式'
  | 'C++'
  | '计算机组成原理'

export interface UnityQuestion {
  id: number
  category: QuestionCategory
  difficulty: 1 | 2 | 3
  question: string
  /** 答题要点，每项一条 */
  points: string[]
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: string
}

export const UNITY_QUESTIONS: UnityQuestion[] = [
  // ============ C#基础 ============
  { id: 1, category: 'C#基础', difficulty: 1, question: 'class 和 struct 有什么区别？什么时候用 struct？', points: [
    'class 是引用类型存堆上，struct 是值类型存栈上（或内联在容器内），赋值行为不同：class 拷贝引用，struct 拷贝内容',
    'struct 默认密封、不可继承，不支持析构函数；适合小体积、短生命周期、不可变数据，如 Vector3、Color、矩阵',
    '频繁 new 大 struct 会带来拷贝开销；需要多态或较大对象时应选 class',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '面试官常让你现场对比后追问：Vector3 为什么是 struct？先讲引用/值类型与赋值语义的区别，再给选型标准——小体积、短生命周期、不可变、需要值语义，最后落到 Unity 里 Vector3、Color 正是如此，同时主动补一句大 struct 反复拷贝有开销。',
  },
  { id: 2, category: 'C#基础', difficulty: 1, question: '什么是装箱和拆箱？如何避免？', points: [
    '值类型转 object/接口会装箱：在堆上分配对象并拷贝值；拆箱是反向强制转换',
    '装箱产生 GC 压力，避免在热循环里把值类型当 object 用、避免 ArrayList/非泛型容器、避免值类型拼 string 时隐式装箱',
    '用泛型容器、ToString 前先转字符串、敏感处用值类型特化实现',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给定义：值类型转 object 或接口时在堆上装箱。面试官更想看你是否知道触发点，点名 ArrayList、非泛型容器、值类型拼字符串这几类高危场景，再用泛型容器、缓存、显式转 string 收尾，顺手提一句可用 Profiler 观察 GC Alloc。',
  },
  { id: 3, category: 'C#基础', difficulty: 2, question: 'C# 的 GC 如何工作？Unity 中如何减少 GC 开销？', points: [
    '基于可达性分析：从 GC Root（静态字段、栈引用、寄存器）出发标记可达对象，不可达的回收；分代（0/1/2代）减少全量扫描',
    'Unity 使用 Boehm/保守 GC（Mono）或分代 GC（IL2CPP），无法手动精确控制时机',
    '减少分配：对象池、缓存 List/string、避免每帧 new、用 ref struct/struct 容器、避免闭包与 LINQ 分配',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '结构建议：一句话讲可达性分析与 GC Root，分代只说结论，重心放在 Unity 的 GC 不可控，所以平时靠减少分配来降低压力。抛出对象池、缓存、避免闭包与 LINQ、按需 new 这组实战手段，比背算法更符合客户端岗位画像。',
  },
  { id: 4, category: 'C#基础', difficulty: 1, question: 'string 为什么不可变？大量拼接如何优化？', points: [
    'string 是不可变引用类型，任何修改都会创建新对象，旧对象留给 GC',
    '循环拼接用 StringBuilder（预分配 Capacity）；高频日志/路径拼接避免 + 号',
    '固定少量拼接可用 string.Concat/插值（编译器会优化）；对同一字符串反复引用用 intern/常量',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先答不可变带来的线程安全与字符串驻留好处，转折到代价——每次修改都产生新对象。按场景给方案：少量拼接用插值交给编译器，循环或高频拼通用 StringBuilder 且预分配 Capacity，最后落到日志与 UI 文案这类真实高频点。',
  },
  { id: 5, category: 'C#基础', difficulty: 1, question: '委托（delegate）和事件（event）的区别？', points: [
    'event 是受限的委托字段：外部只能 += / -=，不能直接 Invoke 或赋值，封装性更好',
    '委托可直接调用、可作为参数传递；多播委托按注册顺序执行',
    'Unity 中 += 后必须在 OnDestroy/Disable 中 -=，否则对象被委托引用导致内存泄漏',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '核心差异是 event 对外只暴露订阅接口，外部不能直接 Invoke 或整体赋值，封装性更强。建议补一个 Unity 特有的加分点：+= 之后必须在 OnDestroy 或 OnDisable 中 -=，否则委托引用会让对象无法回收。',
  },
  { id: 6, category: 'C#基础', difficulty: 2, question: '抽象类和接口怎么选？', points: [
    '抽象类可有字段/构造函数/部分实现，适合“is-a”且有公共状态或默认行为的基类',
    '接口只定义契约（可含默认实现），支持多实现，适合“can-do”能力组合与解耦',
    'C# 单继承多接口：需要共享实现用抽象类，需要跨继承树定义能力用接口',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '别只背定义，给判断流程：需要共享字段与默认实现、语义是 is-a 就选抽象类；需要契约与多能力组合、语义是 can-do 就选接口，再点一句 C# 单继承多接口是重要约束。能举出 Unity 例子会更稳，比如敌人基类与 IHealable 接口。',
  },
  { id: 7, category: 'C#基础', difficulty: 2, question: '值类型为什么不能直接赋 null？Nullable<T> 的原理？', points: [
    '值类型变量本身就持有数据，没有“引用为空”的概念；Nullable<T> 用 bool hasValue + T value 两个字段模拟可空',
    '写 int? 等价于 Nullable<int>，配合 ?? 运算符、HasValue/Value 使用',
    '泛型约束 where T : struct 与 where T : class 决定能否接 null',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲值类型变量本身就持有数据，没有空引用的概念，所以 Nullable 要额外用 hasValue 标志位模拟；再说 int? 就是 Nullable<int> 的语法糖，配合 ??、HasValue 使用。若被追问，补充 where T : struct 这类泛型约束对可空性的影响。',
  },
  { id: 8, category: 'C#基础', difficulty: 2, question: 'async/await 的原理？和 Unity 协程有何不同？', points: [
    'async 方法被编译成状态机，await 处挂起，继续执行靠 SynchronizationContext/Task 调度，不阻塞线程',
    'Unity 主线程有同步上下文，await 后默认回到主线程；但纯 async 不依赖 MonoBehaviour',
    '协程基于 IEnumerable 迭代器 + Unity 主循环驱动（yield 指令由引擎判断时机），与 async 线程模型不同',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '从编译产物切入最有说服力：async 方法被改写成状态机，await 处挂起并交给调度器恢复，不占线程；协程则是迭代器状态机由 Unity 主循环驱动。区别讲清楚后落到选型：UI 流程与延迟用协程，网络 IO 等真实异步用 async 更合适。',
  },
  { id: 9, category: 'C#基础', difficulty: 2, question: 'ref、out、in 关键字的区别？', points: [
    'ref：调用前必须初始化，方法内可读写，传引用可修改调用方变量',
    'out：调用前不必初始化，方法内必须赋值（常用来拿多个返回值）',
    'in：只读引用传递，避免大 struct 拷贝但不可修改；三者都要求实参是变量而非属性',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '推荐用矩阵式回答，面试官容易跟丢：ref 调用前必须初始化、方法内可读写；out 无需初始化但方法内必须赋值，用于多返回值；in 是只读引用传递。最后统一强调三者实参都必须是变量，并把 in 对大 struct 的省拷贝价值说出来。',
  },
  { id: 10, category: 'C#基础', difficulty: 3, question: '泛型的协变和逆变是什么？Unity/C# 里哪里用到？', points: [
    '协变 out：IEnumerable<Derived> 可赋给 IEnumerable<Base>（只出不进）；逆变 in：只进不出如 IComparer<Base> 用于 Derived',
    '数组是协变的（string[] 可当 object[]），但运行期写错会抛异常',
    '委托如 Action<in T>、Func<out TResult> 也支持；LINQ 与事件回调里常见',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '用方向记忆：out 只出不进所以子类可当父类用，in 只进不出所以父类比较器可用于子类。举 LINQ 与委托的例子最稳：IEnumerable 协变、Action 逆变、Func 协变。补一句数组协变是运行期才检查的坑，能显出你真懂而不是背书。',
  },

  // ============ Unity核心 ============
  { id: 11, category: 'Unity核心', difficulty: 1, question: 'MonoBehaviour 生命周期回调的完整顺序？', points: [
    'Awake → OnEnable → Start → FixedUpdate/Update/LateUpdate 循环',
    '场景卸载/销毁时：OnDisable → OnDestroy；应用退出还有 OnApplicationQuit',
    'Awake 在对象激活时调用一次（先于 Start）；OnEnable 每次 SetActive(true) 都触发',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '顺序题必须背得干净利落：Awake、OnEnable、Start，然后 FixedUpdate/Update/LateUpdate 循环，销毁时 OnDisable、OnDestroy。说完再补两个细节显深度：Awake 先于 Start 且只调一次，OnEnable 每次 SetActive(true) 都会触发。',
  },
  { id: 12, category: 'Unity核心', difficulty: 1, question: 'Update、FixedUpdate、LateUpdate 的区别与使用场景？', points: [
    'Update 每帧调用，频率取决于帧率，适合输入检测、普通逻辑',
    'FixedUpdate 按固定时间步（默认 0.02s）调用，适合物理与刚体运动',
    'LateUpdate 在 Update 之后，适合相机跟随（避免抖动）、基于最终状态的处理',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '三兄弟各一句话：Update 每帧跟帧率走，处理输入与普通逻辑；FixedUpdate 固定步长驱动物理；LateUpdate 在 Update 后适合相机跟随。最后点出物理放 FixedUpdate 是为了与物理引擎步长一致，避免帧率波动导致表现不稳。',
  },
  { id: 13, category: 'Unity核心', difficulty: 1, question: '多个脚本的 Awake/Start 执行顺序如何控制？', points: [
    '同一物体按脚本添加顺序（不可靠）；不同物体默认不确定',
    'Project Settings → Script Execution Order 可指定执行顺序',
    '更推荐：不要在 Awake/Start 里跨对象强依赖先后，用事件/管理器解耦，或手动初始化调用',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '老实承认默认顺序不可靠不会扣分，重点是给出控制手段：Script Execution Order 可调脚本执行序。加分做法是补架构视角——初始化别依赖隐式先后，用管理器统一驱动或事件通知，让 Awake 之间零耦合。',
  },
  { id: 14, category: 'Unity核心', difficulty: 1, question: '为什么移动要乘 Time.deltaTime？', points: [
    '把速度从“每帧位移”变成“每秒位移”，保证不同帧率下移动速度一致',
    '不乘则高帧率机器移动更快，逻辑在不同设备上表现不同',
    '涉及物理的位移应放 FixedUpdate（已按固定步长，无需再乘 deltaTime 但常用 Time.fixedDeltaTime 换算）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '一句话点题：乘 deltaTime 把位移从每帧换算成每秒，帧率无关。再补反例：不乘的话 144Hz 机器比 30Hz 快近 5 倍。最后说明物理运动放 FixedUpdate，避免帧率抖动影响物理表现。',
  },
  { id: 15, category: 'Unity核心', difficulty: 1, question: '频繁调用 GetComponent 有什么问题？如何优化？', points: [
    'GetComponent 要做类型查找，每帧调用会带来 CPU 开销与可能的分配',
    '在 Awake/Start 缓存引用（字段持有），避免每帧 Get',
    '同物体多个脚本互访组件时，用依赖注入/缓存或事件通信减少查找',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先指出每帧 GetComponent 的类型查找与缓存失效开销，再给标准做法：Awake 里缓存引用字段。想加分就延伸到架构：组件之间高频互访应靠注入、注册表或事件解耦，而不是在运行时反复找组件。',
  },
  { id: 16, category: 'Unity核心', difficulty: 2, question: 'transform.SetParent(parent, worldPositionStays) 两个参数含义？', points: [
    'worldPositionStays = true（默认）：保持世界坐标/旋转/缩放不变，只换父节点',
    'worldPositionStays = false：本地坐标不变，挂到新父节点后会受父级影响而“跳位”',
    'UI 动态创建子物体常用 false 并手动设 localScale/localPosition',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '答两个参数语义：true 保持世界坐标位姿只换父节点，常用于物品换手等；false 保持本地坐标，挂到新父级后可能跳位。建议补 UGUI 场景：动态创建子物体用 false 后要手动复位 localPosition 和 localScale。',
  },
  { id: 17, category: 'Unity核心', difficulty: 1, question: '为什么 GameObject.Find / FindObjectOfType 要少用？', points: [
    'Find 会遍历场景层级（按名字逐层找），FindObjectOfType 遍历所有物体与组件，代价高且随场景规模变慢',
    '没有静态缓存时每次调用都全量搜索，也不利于代码解耦',
    '替代：拖引用/SerializeField、管理器注册表、单例服务、事件系统获取',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '讲清代价：Find 按名字遍历层级、FindObjectOfType 遍历全场景，代价随规模上升且启动阶段集中调用会卡顿。替代方案按推荐度排：Inspector 拖引用、单例与注册表、事件系统，最后补一句还能避免字符串魔法导致的重构风险。',
  },
  { id: 18, category: 'Unity核心', difficulty: 2, question: 'Unity 对象“假删除”是什么？如何判断对象已被销毁？', points: [
    'Destroy 后 C# 引用仍存在但引擎对象已销毁，访问成员会抛 MissingReferenceException，即“假 null”',
    '用 == null / != null 判断（Unity 重载了运算符），但不要用 ?? 或 is null（走 C# 语义判断不了）',
    '场景切换 DontDestroyOnLoad 对象引用失效、资源释放后引用仍持有是常见原因',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给画面：Destroy 后引擎对象已销毁但 C# 壳还在，访问成员抛 MissingReferenceException，这就是假 null。判断只能用 Unity 重载过的 ==null，不能用 ?? 或 is null。主动点出场景切换后 DontDestroyOnLoad 引用失效是高频触发点。',
  },
  { id: 19, category: 'Unity核心', difficulty: 2, question: 'MonoBehaviour 和普通 C# 类的区别？什么时候用普通类？', points: [
    'MonoBehaviour 必须挂 GameObject，有生命周期回调与 Inspector 序列化，受引擎管理',
    '普通 C# 类可 new、可被任何系统创建，适合纯逻辑/数据/工具类、状态机、管理器内部实现',
    '需要 Update 但不想挂物体的逻辑：可用 MonoBehaviour 单例驱动，或自己用 Timer/事件轮询',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '差异一句话：MonoBehaviour 依赖 GameObject，有生命周期、序列化与引擎驱动；普通类可自由 new 和注入。实用结论：纯逻辑、状态机、数据层尽量用普通类方便测试，需要引擎回调的部分再挂 MB。加分：纯 C# 类要每帧 Tick 可用一个 MB 单例驱动。',
  },
  { id: 20, category: 'Unity核心', difficulty: 2, question: 'OnTrigger 与 OnCollision 各自触发的条件？', points: [
    '碰撞双方都要有 Collider，至少一方有 Rigidbody；Trigger 双方（至少一方）勾 Is Trigger 时走 OnTrigger',
    '非 Trigger 走 OnCollision 并产生物理响应；Kinematic Rigidbody 触发 OnTrigger 但不会产生碰撞反弹',
    '至少一方是 Rigidbody 才会触发回调；两个静态碰撞体互不回调',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '建议画条件矩阵：双方都有 Collider 且至少一方有 Rigidbody 是基础；勾了 Is Trigger 走 OnTrigger，没勾走 OnCollision 产生物理响应。再补边界：Kinematic 刚体触发 Trigger 但不产生碰撞反弹，两个静态碰撞体互相不回调。',
  },

  // ============ 协程与异步 ============
  { id: 21, category: '协程与异步', difficulty: 2, question: '协程的实现原理是什么？', points: [
    '协程方法返回 IEnumerator，编译器生成迭代器状态机；yield return 处保存状态并返回指令对象',
    'Unity 每帧（或按指令类型）调用 MoveNext 推进执行，yield 指令由引擎在合适时机恢复',
    '协程不创建线程，仍跑在主线程，只是把执行拆成多段',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '拆两层讲：语言层，协程方法被编译成迭代器状态机，yield return 保存现场并返回指令；引擎层，Unity 按时机调用 MoveNext 推进。最后强调协程仍跑主线程，只是把代码切成多段执行，这决定了它能安全操作场景对象。',
  },
  { id: 22, category: '协程与异步', difficulty: 1, question: 'WaitForSeconds 受什么影响？暂停游戏怎么处理？', points: [
    '受 Time.timeScale 影响：timeScale=0 时 WaitForSeconds 永不到期',
    '要不受暂停影响用 WaitForSecondsRealtime 或自己累加 Time.unscaledDeltaTime',
    '大量 WaitForSeconds 每帧检查有开销，注意复用/缓存等待对象',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '直接答：WaitForSeconds 走 scaled 时间，timeScale 归零后永远不会到期。暂停需求给两条路：WaitForSecondsRealtime，或自己累加 Time.unscaledDeltaTime。再加一句工程经验：高频等待尽量缓存同一个等待对象，减少每帧分配。',
  },
  { id: 23, category: '协程与异步', difficulty: 2, question: '协程里出现异常会怎样？如何安全嵌套协程？', points: [
    '异常会中断该协程并向上抛出到引擎，若未处理可能导致逻辑中断且难以排查',
    '嵌套协程 yield return StartCoroutine(...) 内部异常同样会中断整条链',
    '关键协程加 try/catch/finally，资源清理放 finally；StartCoroutine 传字符串版无类型安全',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲后果：协程内异常会中断整条链，外层往往拿不到错误，表现是逻辑静默停止，难排查。给方案：需要可靠性的协程包 try/catch/finally，清理放 finally；嵌套用 yield return StartCoroutine 时同样注意。补一句字符串重载没有类型安全。',
  },
  { id: 24, category: '协程与异步', difficulty: 3, question: '对象被销毁后协程还在跑吗？StopAllCoroutines 的坑？', points: [
    '协程绑定在 MonoBehaviour 上，物体销毁后协程自动停止；但若协程引用了已销毁对象会抛 MissingReference',
    'StopAllCoroutines 只停该组件启动的协程，不影响其他组件/其他物体',
    'Disable 不会停协程（协程跟对象激活无关，跟组件销毁有关）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先厘清生命周期：协程挂在 MonoBehaviour 上，物体销毁时协程随之终止；但组件 Disable 不会停协程，这是高频误判。StopAllCoroutines 只停当前组件启动的协程。最后提醒：协程里引用已销毁对象仍会抛 MissingReferenceException。',
  },
  { id: 25, category: '协程与异步', difficulty: 2, question: '为什么游戏里常用“等待 X 秒后执行”而不直接 Thread.Sleep？', points: [
    'Thread.Sleep 阻塞当前线程，主线程睡眠会卡死渲染/输入',
    '协程/async 是非阻塞式挂起，不占线程、可随时取消、回到主线程安全操作 Unity API',
    '真正耗时计算可丢到 Thread/Task/Job System，完成后回主线程',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '落点明确：Thread.Sleep 阻塞线程，主线程一睡渲染、输入、网络全卡住。协程与 async 是挂起而非阻塞，主线程可以继续处理其他事，且能随时取消。补一个进阶表述：真耗时计算交给 Thread/Task/Job System，回主线程只做结果应用。',
  },

  // ============ 渲染与性能 ============
  { id: 26, category: '渲染与图形学', difficulty: 1, question: '什么是 Draw Call？为什么越少越好？', points: [
    '一次 Draw Call = CPU 提交一个渲染批次给 GPU；过多会卡 CPU（状态切换/提交开销）',
    '通过合批、图集、少换材质/Shader、静态批处理减少 Draw Call',
    '严格说现代引擎看 SetPass Call / 渲染状态切换；移动端尤其敏感',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '一句话定义：Draw Call 是 CPU 向 GPU 提交一个渲染批次的开销单位，过多会卡在 CPU 端。然后按手段讲：合批、图集、同材质、静态批处理。加分项是主动区分概念——现代管线更关注 SetPass Call 与渲染状态切换，且移动端对提交次数格外敏感。',
  },
  { id: 27, category: '渲染与图形学', difficulty: 2, question: '静态合批和动态合批的机制与限制？', points: [
    '静态合批：标记 Static 的物体在构建时合并网格，运行时一次提交；代价是内存与构建时间',
    '动态合批：运行时把满足条件的小网格合并；限制顶点数（≤900 左右，URP 与顶点属性相关）、材质必须相同',
    '合批前提：相同材质、无特殊 Renderer 设置、不破坏实例化需求；UI 图集也类似',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '建议分两块对比着答：静态合批在构建期合并同材质静态网格，运行时一次提交，代价是内存与构建时间；动态合批运行时合小网格，受顶点数上限与同材质约束。最后补一句限制条件——开启实例化、特殊 Renderer 设置都会破坏合批，能体现出你踩过坑。',
  },
  { id: 28, category: '渲染与图形学', difficulty: 2, question: 'SRP Batcher 是什么？为什么能提升性能？', points: [
    'SRP Batcher 是 URP/HDRP 的合批路径：复用 Shader 属性块，减少 CPU 端 per-object 的材质状态设置',
    '要求 Shader 兼容 SRP Batcher（用 CBUFFER 声明属性），物体间只差材质属性也能快速切换',
    '把大量小物体材质统一、Shader 兼容后，Draw Call 与 CPU 提交开销明显下降',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '点出本质：SRP Batcher 让 Shader 属性以 CBUFFER 声明、按块复用，CPU 不再为每个物体重设材质状态，把 per-object 开销降下来。说完条件与收益后可以补一句使用前提：Shader 需兼容 SRP Batcher，且它对大量同 Shader 小物体收益最明显。',
  },
  { id: 29, category: '渲染与图形学', difficulty: 2, question: '图集（Atlas）的作用？UGUI 为什么要打图集？', points: [
    '图集把多张小图合成一张大图，同图集内 UI/精灵共用一个材质纹理，可合批减少 Draw Call',
    'UGUI 动态合批要求相邻元素用同一图集，跨图集无法合批（TextMeshPro 字库同理）',
    '注意图集 padding 防止采样串色，注意图集尺寸上限与内存占用平衡',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先答作用：同图集内精灵共享纹理与材质，可被合批成更少的 Draw Call。再补工程细节：跨图集元素无法合批，所以 UI 要按界面/用途规划图集；图集留 padding 防串色，还要权衡图集尺寸与内存。最后可以提一句 TextMeshPro 字体图集同理。',
  },
  { id: 30, category: '渲染与图形学', difficulty: 2, question: '遮挡剔除（Occlusion Culling）原理与使用注意？', points: [
    '用遮挡体（Occluder）判断被完全挡住的物体不提交渲染，减少 GPU 负载',
    '需要烘焙遮挡数据（静态场景）；动态物体无法作为 occluder（可用遮挡查询）',
    '与视锥剔除互补：视锥剔除是基础，遮挡剔除进一步省 Draw Call；烘焙不当会产生“穿帮/弹出”',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '答两层：视锥剔除是基础裁剪，遮挡剔除更进一步，把被完整遮挡的物体在烘焙好的遮挡数据里判定后直接不提交。注意点要讲全：需要静态场景烘焙、动态物体不能做遮挡体、烘焙不当会出现物体弹出的穿帮感。',
  },
  { id: 31, category: '渲染与图形学', difficulty: 2, question: '移动端纹理压缩格式怎么选？', points: [
    'iOS：ASTC（硬件支持好，质量/体积平衡）；旧设备可用 PVRTC',
    'Android：主流用 ASTC（高通/ARM 新 GPU 支持），兼容性兜底 ETC2（OpenGL ES 3.0 起）',
    '避免用未压缩 RGBA32 大纹理；UI 与 3D 图集按平台设置压缩格式，注意透明图与法线图差异',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按平台给结论：iOS 用 ASTC 为主、老设备兼容 PVRTC；Android 新 GPU 用 ASTC，兼容兜底 ETC2。补一个反例意识：直接放 RGBA32 大纹理是移动端内存爆掉的常见原因，UI 与 3D 图集要分平台设压缩，带透明通道的图还要单独评估格式。',
  },
  { id: 32, category: '渲染与图形学', difficulty: 3, question: '半透明物体为什么容易有渲染排序问题？', points: [
    '透明物体不写深度（或按需），渲染按距离从远到近（Transparent 队列），互相穿插时排序会错',
    '标准透明靠“画家算法”，物体互相穿插无法正确混合；粒子、水面常见伪影',
    '处理：拆碎穿插体、用深度写入技巧、Additive 混合减少错误、或用 OIT（代价高）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲机制：透明物体按画家算法从远到近排序渲染，互相穿插时谁在前无法正确判定，就会出排序错乱。再答为什么难解：物体间没有确定的深度关系。给出实战处理：拆碎穿插模型、适当用深度写入或 Additive 混合、代价高的 OIT 仅作备选。',
  },
  { id: 33, category: '渲染与图形学', difficulty: 2, question: '什么是 Overdraw？如何定位与优化？', points: [
    'Overdraw = 同一像素被多次绘制，移动端填充率（fillrate）受限时是主要瓶颈',
    '定位：Frame Debugger/Scene 视图 Overdraw 模式（暖色越浓越严重）',
    '优化：减少全屏后处理、粒子发射量、半透明层叠；缩小屏幕空间特效范围、LOD 减面',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '定义先行：Overdraw 是同一像素被多次绘制，移动端填充率瓶颈下尤其致命。定位手段直接报工具：Scene 视图切 Overdraw 模式看暖色浓度，或 Frame Debugger 查批次。优化方向给全：降全屏后处理、控粒子与半透明层叠、缩小屏幕特效范围、LOD 减面。',
  },

  // ============ 资源与内存 ============
  { id: 34, category: '资源与内存', difficulty: 2, question: 'Resources、AssetBundle、Addressables 的关系？', points: [
    'Resources 是内置资源目录，简单但有包体/内存不可控问题，官方不推荐大量使用',
    'AssetBundle 是资源打包单元，可远程下载与按需加载，但要自己管理依赖与生命周期',
    'Addressables 是基于 AssetBundle 的现代资源管理框架：可寻址加载、自动依赖、引用计数、远程/本地混合',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '建议按演进史答：Resources 简单但包体与内存不可控，官方不推荐大量使用；AssetBundle 解决远程下载与按需加载，但要自己管依赖和生命周期；Addressables 在 AB 之上封装寻址、自动依赖与引用计数，是当前推荐方向。最后落到自己的选型经验会更有说服力。',
  },
  { id: 35, category: '资源与内存', difficulty: 2, question: 'AssetBundle 加载与卸载的正确姿势？依赖怎么处理？', points: [
    '用 manifest 记录依赖，加载 Asset 前先加载其依赖包；释放用 AssetBundle.Unload(false/true) 区分卸载资源',
    'Unload(true) 强制卸载已加载 Asset 会令引用失效（白物体）；一般业务层先 Release 再 Unload(false)',
    'Addressables 用 Addressables.Release 按引用计数释放，避免手写依赖管理出错',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '要点顺序：先依赖后资源——通过 manifest 确认依赖包并先行加载；释放时区分 Unload(false) 与 Unload(true)，后者强制卸载会令已加载 Asset 引用失效，表现为物体变白。如果项目用 Addressables，补一句用引用计数的 Release 而不是手搓依赖，是加分表达。',
  },
  { id: 36, category: '资源与内存', difficulty: 2, question: 'Unity 常见内存泄漏来源有哪些？', points: [
    '静态字段/单例长期持有对象引用（如事件 += 未 -=）',
    '协程未结束但引用大对象；AssetBundle/资源 Load 后不 Unload',
    '场景切换时 DontDestroyOnLoad 累积、闭包捕获大对象、UI 事件回调挂在已销毁物体',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按来源归类讲不容易漏：静态字段与单例长期持有、事件委托 += 后未 -=、资源 Load 后不释放、场景切换时 DontDestroyOnLoad 与协程累积。最后落到工具——用 Memory Profiler 抓堆快照 diff 看引用链，比凭感觉猜靠谱。',
  },
  { id: 37, category: '资源与内存', difficulty: 2, question: 'Resources.UnloadUnusedAssets 和 GC.Collect 何时用？', points: [
    'UnloadUnusedAssets 卸载无引用的资源（纹理/网格等），异步执行有开销，适合切场景后低频调用',
    'GC.Collect 强制托管堆回收，可能造成卡顿；不要每帧调用',
    '移动端谨慎：切场景、回主界面等低频时机配合使用即可',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '两者分开讲再给时机：UnloadUnusedAssets 清理无引用的原生资源，异步且有成本，适合切场景后低频调用；GC.Collect 回收托管堆，可能卡顿，绝不能每帧调。收尾给移动端实践：只在切场景、回主界面这类低风险时机配合使用。',
  },
  { id: 38, category: '资源与内存', difficulty: 1, question: '对象池解决什么问题？核心实现要点？', points: [
    '复用频繁创建销毁的对象（子弹、怪物、特效），减少 Instantiate/Destroy 的 CPU 与 GC 压力',
    '要点：预创建/懒创建、Get 时重置状态并 SetActive(true)、Release 时回收并 SetActive(false)',
    '配合预制体引用池化；注意池内对象事件监听/协程要随回收清理',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲它解决的两件事：频繁 Instantiate/Destroy 的 CPU 开销与 GC 分配。实现要点报清单：预创建或懒创建、Get 时重置状态并激活、Release 时回收隐藏，容量可动态扩。工程坑也要提：池内对象的事件监听与协程必须在回收时清理干净。',
  },
  { id: 39, category: '资源与内存', difficulty: 3, question: '大规模场景如何做资源异步加载与实例化优化？', points: [
    'Addressables.LoadAssetAsync 加载资源，InstantiateAsync（或分批 Instantiate）避免主线程卡顿',
    '分帧/分块初始化：先加载核心、后加载外围，使用加载进度条与对象池预创建',
    '用 Profiler 看加载峰值：纹理/网格/Shader 首帧编译（ShaderVariantCollection、AsyncShaderCompilation）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '从加载与实例化两头讲：Addressables 异步加载资源，实例化用 InstantiateAsync 或分批进行，避免主线程一次卡顿。接着说分优先级初始化——核心先加载、外围渐进，配合进度条。最后点出隐藏峰值：Shader 首帧编译，用 ShaderVariantCollection 预热可消掉。',
  },
  { id: 40, category: '资源与内存', difficulty: 2, question: '用 Profiler 定位内存问题的基本步骤？', points: [
    '先看 Memory 分类：Managed Heap（C# 托管）与 Native（资源、引擎）分开看',
    'Managed：GC Alloc 定位每帧分配热点；用 Memory Profiler 抓堆快照 diff 找泄漏引用链',
    'Native：按资源类型排序找大纹理/网格/AudioClip 是否未卸载；检查 AssetBundle 是否残留',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '给出可复制的排查路径：先切分 Managed 与 Native 两块内存，避免混为一谈。托管侧用 Profiler 的 GC Alloc 找每帧分配热点，配合 Memory Profiler 堆快照 diff 定位泄漏引用链；原生侧按资源类型排序找大纹理、网格与 AudioClip，重点查 AssetBundle 是否残留未卸载。',
  },

  // ============ 物理与碰撞 ============
  { id: 41, category: '物理与碰撞', difficulty: 2, question: '为什么刚体运动要放在 FixedUpdate？', points: [
    '物理引擎按固定步长（默认 0.02s）模拟，FixedUpdate 与其同步，保证物理稳定与确定性',
    '在 Update 里改 transform 移动刚体物体，会与物理插值打架导致抖动/穿透',
    '用 Rigidbody.MovePosition/AddForce 等 API 让物理接管，而不是直接改 transform',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '核心一句：物理引擎按固定步长模拟，FixedUpdate 与它同频，保证稳定与确定性。反例要讲透：在 Update 里直接改 transform 会和物理插值打架，出现抖动甚至穿透。正确做法是让物理接管——用 MovePosition、AddForce 等 API 驱动刚体。',
  },
  { id: 42, category: '物理与碰撞', difficulty: 2, question: '高频 Physics.Raycast 怎么优化？', points: [
    '用 LayerMask 过滤，避免打到无关物体；尽量用非 alloc 版本（RaycastNonAlloc）',
    '控制频率：分帧检测、降低检测密度；用 SphereCast/BoxCast 代替多条 Raycast',
    '大世界用物理查询优化（碰撞体按区域管理），或改用自定义空间结构',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '优化手段排优先级：先加 LayerMask 过滤掉无关层，改用 RaycastNonAlloc 免分配版本；再降频率——分帧检测或降低检测密度；能用 SphereCast、BoxCast 一根顶多根就不要撒射线。最后补大世界思路：碰撞体按区域管理或自建空间结构。',
  },
  { id: 43, category: '物理与碰撞', difficulty: 2, question: 'CharacterController 与 Rigidbody 怎么选？', points: [
    'CharacterController 提供胶囊体移动/爬坡/台阶处理，适合传统第三人称/第一人称主角控制，自己写重力',
    'Rigidbody 走真实物理，适合受外力影响、可被推挤的角色/载具',
    '两者都可用于角色，关键看是否需要物理交互；不要同一物体同时启用两者冲突控制',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按角色需求选型：CharacterController 内置胶囊体碰撞、爬坡与台阶处理，适合人形主角，重力需自己实现；Rigidbody 走真实物理，适合会被外力推动的角色、载具与物理交互多的物体。补一条红线：别在同一物体上同时用两者做控制，会产生冲突。',
  },
  { id: 44, category: '物理与碰撞', difficulty: 2, question: 'Kinematic Rigidbody 是什么？常用在哪？', points: [
    'Kinematic = 不受物理力/碰撞影响、由代码直接控制运动，但会推动其他动态刚体',
    '用于移动平台、传送带、动画驱动的角色、触发器区域等',
    'Kinematic 物体与动态物体碰撞可产生推力；两个 Kinematic 之间不产生物理碰撞响应',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '定义先行：Kinematic 刚体不受力与碰撞影响，由代码直接驱动，但运动时会推动动态刚体。典型用途报出来：移动平台、传送带、动画驱动角色、触发器区域。边界条件也讲清：两个 Kinematic 之间不产生碰撞响应，Kinematic 与静态物体也不会互相推。',
  },

  // ============ 热更与工程 ============
  { id: 45, category: '热更与工程', difficulty: 2, question: 'IL2CPP 和 Mono 的区别？为什么正式包常用 IL2CPP？', points: [
    'IL2CPP 把 IL 转成 C++ 再编译成原生码：性能更好、更难反编译、支持剪裁减小包体',
    'Mono 是 JIT/AOT 混合，启动快、迭代方便，但 iOS 限制 JIT、易被反编译',
    'IL2CPP 缺点：包体更大（含运行时）、构建慢、泛型/反射受限需处理（link.xml、代码裁剪）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '一句话差异：IL2CPP 把 IL 转成 C++ 再编成原生码，Mono 以 JIT/AOT 解释运行 IL。正式包常用 IL2CPP 的理由给三点：性能与安全性更高、iOS 允许、可裁剪减小包体。反面代价也主动说：包体更大、构建慢、泛型与反射受裁剪限制需要用 link.xml 保留。',
  },
  { id: 46, category: '热更与工程', difficulty: 2, question: 'Lua 热更的原理？xlua/tolua 为什么需要生成代码？', points: [
    '把可热更逻辑写成 Lua，运行时解释执行；C# 侧通过绑定层互调，改 Lua 不用重发客户端包',
    'tolua/xlua 生成 C#↔Lua 的绑定胶水代码（Wrap/委托桥），提升调用性能并处理生命周期',
    'iOS 审核对热更敏感：Lua 属解释执行可热更逻辑，需合规考量',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '原理一句话：热更逻辑写成 Lua 由解释器执行，改 Lua 不必重新发包，C# 与 Lua 通过绑定层互相调用。再答为什么 tolua/xlua 要生成代码：手写绑定性能差，生成的胶水代码把高频调用路径做快并管理好对象生命周期。最后补合规意识：iOS 对解释执行热更敏感，方案要评估政策风险。',
  },
  { id: 47, category: '热更与工程', difficulty: 3, question: 'AssetBundle 分包策略怎么设计？', points: [
    '按模块/场景分 Bundle：公共资源（UI 图集、Shader、公共模型）独立包，减少重复下载',
    '控制 Bundle 粒度：太小文件多、依赖复杂，太大下载/内存浪费；同屏同功能资源放一组',
    '首包 vs 热更包划分：核心战斗/进场景必需入首包，活动/后续内容走远程包',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给分层原则：公共资源独立成包——UI 图集、Shader、公共模型单独打，避免随模块重复下载；业务按模块或场景聚合，同屏同玩法资源放一组。粒度要讲权衡：太碎导致文件多依赖复杂，太大则下载与内存浪费。最后落到首包与远程包的划分策略。',
  },
  { id: 48, category: '热更与工程', difficulty: 3, question: '客户端热更/版本管理基本流程？', points: [
    '客户端启动请求版本清单（远程 json/manifest），对比本地版本号',
    '差异文件走增量下载（AssetBundle 按 hash 比对），校验完整性后加载替换',
    '注意断点续传、失败重试、热更窗口管理（下载中禁进关键玩法）、资源版本与代码版本解耦',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '把链路讲完整：启动后拉版本清单，与本地版本对比出差异清单；按 hash 增量下载资源包并校验完整性；下载中管理重试与断点续传，同时做热更窗口控制——更新未完成前不进关键玩法。最后点出资源版本与代码版本要解耦，才能各自独立迭代。',
  },
  { id: 49, category: '热更与工程', difficulty: 3, question: 'C# 代码在 iOS 上为什么不能 JIT？热更方案怎么绕？', points: [
    'iOS 禁止运行时生成可执行代码（JIT），只允许系统加载器已签名代码',
    '绕法：解释执行（Lua/HotReload 解释器）、AOT 全量编译、混合模式（IL2CPP + 解释器字节码）',
    'hybridclr（原 Huatuo）走 AOT+补充元数据，可让 C# 逻辑以解释模式热更，属较新方案',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先答原因：iOS 只允许执行系统加载并签名的代码，禁止运行时生成可执行代码，所以 JIT 被卡死。绕法按代际给：Lua 这类解释器把逻辑当数据处理、IL2CPP 全 AOT 编译，再到 hybridclr 的思路——AOT 主包加补充元数据，让新 C# 逻辑以解释模式热更。',
  },

  // ============ 网络与同步 ============
  { id: 50, category: '网络与同步', difficulty: 2, question: '帧同步和状态同步的区别？各自适用场景？', points: [
    '帧同步：只同步输入，各端本地模拟整局，流量小、表现一致（适合格斗/RTS/多人同屏竞技）',
    '状态同步：服务器算权威状态，客户端同步位置/属性，安全可控（适合 MMO/需要防作弊/复杂交互）',
    '帧同步难点在确定性（浮点/随机/逻辑一致），状态同步难点在延迟与服务器性能',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给核心差异：帧同步只同步输入，各端本地推演整局，流量小、手感一致，适合格斗与 RTS，但难点在确定性——浮点、随机、逻辑都要逐帧对齐；状态同步以服务器为权威，同步结果状态，适合 MMO 与防作弊场景，难点在延迟体验与服务器承载。补一句反作弊取舍会显得有架构观。',
  },
  { id: 51, category: '网络与同步', difficulty: 3, question: '帧同步如何保证多端确定性？', points: [
    '统一浮点：用定点数（如 long 定点）替代 float，避免不同平台指令差异',
    '随机数种子统一、逻辑与表现分离：只依赖同步输入与固定步长，不依赖本地时间/物理引擎',
    '禁止在战斗逻辑里用 Time.deltaTime、Unity 物理随机、字典遍历顺序等不确定源',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按确定性来源逐条排：第一，统一数值精度，用定点数替代 float，避开平台指令差异；第二，统一随机种子，战斗逻辑只用同步输入与固定步长驱动，不碰本地时间；第三，把 Time.deltaTime、Unity 物理、字典遍历序这类不确定源全部禁出战斗逻辑。答完可补一句：验证确定性靠多端帧回放比对。',
  },
  { id: 52, category: '网络与同步', difficulty: 3, question: '网络延迟高时如何保证手感？（预测/回滚/插值）', points: [
    '客户端预测：本地立刻执行操作，服务器确认后校正',
    '延迟补偿：服务器按玩家操作时刻的“过去状态”判定命中（FPS 常用）',
    '插值：对他人位置做缓冲插值平滑显示；回滚：冲突时把本地状态回退到服务器快照重演',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '建议把三个技术拆开讲：客户端预测解决自己操作的回包延迟，本地先执行再校正；延迟补偿是服务器视角，按玩家操作时刻的过去状态判定，FPS 命中常用；插值平滑他人位置，回滚则在状态冲突时回到服务器快照重演。最后说明这组技术通常会组合使用。',
  },
  { id: 53, category: '网络与同步', difficulty: 2, question: '断线重连/弱网处理要做什么？', points: [
    '心跳检测、超时判定、自动重连退避；重连后拉取服务器快照同步状态',
    '战斗中断线：帧同步用“断线后补帧/服务器托管”，状态同步靠服务器权威继续推进',
    '客户端要做弱网表现降级（降低同步频率、显示重连中），避免假死与状态错乱',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按阶段给方案：断线前用心跳与超时判定，断线后自动重连并退避，重连成功先拉服务器快照对齐状态。分同步类型补差异：帧同步断线要补帧或服务器托管，状态同步靠服务器权威继续推进。最后提弱网降级：降同步频率、显示重连状态，避免假死与错乱。',
  },

  // ============ 架构与设计模式 ============
  { id: 54, category: '架构与设计模式', difficulty: 1, question: 'Unity 中单例模式的正确姿势与坑？', points: [
    '泛型单例封装 Instance；常用场景：全局管理器（音频、事件、数据）',
    '坑：场景切换单例被销毁后 Instance 悬空、多实例重复、静态引用导致场景无法卸载',
    '改进：用 ScriptableObject 服务/依赖注入/事件中心，限制单例滥用；需要跨场景常驻用 DontDestroyOnLoad 并防重复',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给正确封装：泛型单例提供 Instance，适合音频、事件这类全局管理器。坑要主动说：场景切换后实例被销毁导致悬空、热重载或重复加载产生多实例、静态引用阻止场景卸载。再给进阶思路——用 ScriptableObject 服务或依赖注入收敛单例数量，需要跨场景就用 DontDestroyOnLoad 且做防重。',
  },
  { id: 55, category: '架构与设计模式', difficulty: 2, question: '游戏 UI 架构常用 MVC/MVP 吗？怎么组织？', points: [
    '大项目常用分层：View（界面表现）与 Model（数据）分离，Controller/Presenter 处理交互与数据绑定',
    'UI 框架核心：界面栈管理（打开/关闭/层级）、事件分发、数据绑定（观察者）',
    '过度拆分会让小功能变重；按团队规模选 MVVM 式绑定或轻量事件驱动',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '建议答出分层意图：View 只做表现，Model 管数据，中间层处理交互与绑定，核心收益是可测试、可换皮。再讲工程要点：界面栈管理开合与层级、事件分发解耦模块、数据变更驱动刷新。最后补一句平衡观：小功能别硬套重型分层，按团队规模选择 MVVM 式绑定还是轻量事件驱动，反而显成熟。',
  },
  { id: 56, category: '架构与设计模式', difficulty: 2, question: '事件中心/观察者模式怎么设计？注意什么？', points: [
    '定义事件类型与参数，中心管理注册与广播，解耦发布者与订阅者',
    '注意：忘记注销导致泄漏、事件参数装箱/分配、回调异常影响其他订阅者、层级混乱难调试',
    '增强：泛型事件减少装箱、支持优先级/异步、Debug 面板查看谁监听了谁',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给设计骨架：定义事件类型与参数，中心负责注册、广播、注销，发布者与订阅者互不感知。坑是重点：忘记注销造成泄漏与幽灵回调、参数传递产生装箱与分配、单个订阅者异常会拖垮整条广播链。加分做法：泛型事件消装箱、回调隔离 try/catch、提供调试面板查看监听关系。',
  },
  { id: 57, category: '架构与设计模式', difficulty: 2, question: '状态机在游戏开发中的应用？', points: [
    '角色状态（Idle/Run/Attack/Die）、AI 状态、UI 流程状态都可建模为状态机',
    '实现：switch 简单版 / 状态模式类 + 状态转换表 / Animator 是引擎内置状态机',
    '复杂状态多时避免巨大 switch，用状态类与转换条件集中管理，防止状态泄漏与非法跳转',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先列适用面：角色状态、AI 状态、UI 流程都能用状态机表达。再按实现演进讲：switch 适合少状态；状态类加转换条件表适合复杂系统，集中管理避免巨型 switch 与非法跳转。最后提 Animator 就是引擎内置的层级状态机，能回答它与代码状态机的关系会显体系。',
  },
  { id: 58, category: '架构与设计模式', difficulty: 1, question: '工厂模式在游戏开发里的典型应用？', points: [
    '把“创建对象”的细节集中：按类型/配置生成不同敌人、武器、技能、UI 面板',
    '好处：新增类型不改调用方、配合对象池统一入口、便于依赖注入',
    'Unity 场景：工厂返回预制体实例，创建逻辑（加载、初始化、入池）收敛在工厂',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '一句话点题：工厂把创建逻辑收敛到一处，按类型或配置产出不同实例。收益讲三条：新增类型不侵入调用方、配合对象池统一出入口、便于注入与替换。落到 Unity 场景：工厂负责加载预制体、初始化、注册回收，生产出来的对象从哪里来到哪里去都清楚。',
  },
  { id: 59, category: '架构与设计模式', difficulty: 2, question: '游戏主循环里常见架构分层有哪些？', points: [
    '逻辑层（玩法规则）、表现层（动画特效相机）、数据层（配置存档）分离，逻辑不直接依赖表现',
    '驱动层：管理器统一驱动（UpdateManager 批量调用模块 Tick），避免到处 Update',
    '好处：逻辑可单测、可帧同步回放、表现可换皮',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给三层划分：玩法逻辑层、表现层、数据配置层，逻辑不直接依赖表现，才能支持单测与回放。再讲驱动方式：用管理器统一 Tick，替代脚本各自 Update 满天飞，顺序可控、开销可见。落点收益：逻辑可单测、帧同步回放、表现可整体替换。',
  },
  { id: 60, category: '架构与设计模式', difficulty: 3, question: 'ECS 和面向对象相比的核心优势？Unity DOTS 了解吗？', points: [
    'ECS = Entity（实体）+ Component（纯数据）+ System（逻辑），数据连续排布提升缓存命中与多线程（Job）并行',
    '适合大量同构实体：子弹海、群体 AI、大世界；缓存友好、无 GC 压力（可 Burst 编译）',
    '代价：上手门槛高、调试难、与现成 MonoBehaviour 生态割裂；适合性能瓶颈明确的系统局部使用',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲核心差异：ECS 把实体拆成纯数据与处理逻辑的 System，数据按组件类型连续存放，缓存命中率高且可多线程并行。再给适用场景：海量同构实体、子弹群、群体 AI、大世界。最后诚实说代价：调试难、与 MonoBehaviour 生态割裂、上手成本高，适合瓶颈明确的局部系统先引入。',
  },

  // ============ 扩展批1 ============
  { id: 61, category: 'C#基础', difficulty: 1, question: '一个方法想返回多个值，有哪些做法？', points: [
    'out/ref 参数：适合少量值；ref 需先初始化，out 不用',
    '元组（ValueTuple）：(int, string) 或带名字 (int code, string msg)，轻量、语法糖解构方便',
    '自定义 struct/class 或泛型容器；struct 更省堆分配',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按场景选型答：少量返回值用 out 或 ref，注意 ref 要先初始化；一组轻量结果用带名字的元组，解构用起来最顺手；结构化数据自定义 struct 或 class。补一句工程判断：返回值语义不清晰时，用带字段名的小结构体比裸元组更可读。',
  },
  { id: 62, category: 'C#基础', difficulty: 1, question: 'foreach 的原理是什么？为什么迭代中不能修改集合？', points: [
    'foreach 是语法糖：调用 GetEnumerator() 拿 IEnumerator，循环 MoveNext() + 取 Current，最后 Dispose()',
    '迭代中修改集合会使枚举器失效抛 InvalidOperationException（List 内部有 version 校验）',
    '要边遍历边删除：倒序 for、收集待删再统一删，或用支持修改的结构',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '原理要答透：foreach 是语法糖，展开成拿枚举器、循环 MoveNext 取 Current、结束 Dispose。再解释为什么迭代中改集合会炸：List 内部用版本号校验，集合一变枚举器立刻失效。最后给正确姿势：倒序 for 删除、先收集再统一删、或换成本身支持修改的结构。',
  },
  { id: 63, category: 'C#基础', difficulty: 2, question: 'LINQ 的延迟执行（延迟加载）是什么？哪些操作会立即执行？', points: [
    'Select/Where/OrderBy 等返回 IEnumerable 的操作是延迟的：真正遍历时才逐个执行',
    'ToList/ToArray/Count/First/Any 等会立即执行（拉取数据），Aggregate/Sum 也立即',
    '延迟执行的好处：链式组合不产生中间集合；坑：底层数据在遍历前被改会影响结果、重复遍历重复计算',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给判断标准：返回 IEnumerable 的中间操作是延迟执行，真正遍历才逐个算；ToList、Count、First、Any 这类触发遍历的会立即执行。坑要讲清楚：延迟链的底层数据在遍历前被改动会影响结果，同一枚举对象重复遍历会重复计算，所以昂贵计算要尽早物化。',
  },
  { id: 64, category: 'C#基础', difficulty: 1, question: 'using 语句和 IDisposable 是什么关系？', points: [
    'using 语法糖展开为 try/finally 并调用 Dispose()（值类型用泛型约束不装箱）',
    '用于管理非托管资源：文件流、网络连接、数据库连接；Unity 中 AssetBundle 加载器、WWW 等',
    'using 声明（C# 8）：作用域结束自动释放；注意 Dispose 不等于 GC，只释放非托管资源',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '一句话关系：using 是编译器糖，展开成 try/finally 保证调用 Dispose。适用对象讲清：管理非托管资源的类型，文件流、网络连接、数据库连接，Unity 里的资源加载器也算。补两个进阶点：Dispose 不等于 GC，它只释放非托管资源；C# 8 的 using 声明在作用域结束时自动释放。',
  },
  { id: 65, category: 'C#基础', difficulty: 2, question: '反射是什么？有什么代价？', points: [
    '运行时通过 Type/Assembly 检查类型信息并动态创建对象、调用成员',
    '代价：慢（类型查找/方法绑定）、IL2CPP 下需 link.xml 或特性保留类型，否则被裁剪',
    '替代：泛型、接口多态、委托、表达式树、源码生成器（Source Generator）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给定义：反射在运行时用 Type、Assembly 检查元数据并动态调成员。代价要讲实：动态绑定慢、IL2CPP 下类型可能被裁剪，需要 link.xml 或特性保留。最后给替代方案梯度：能编译期解决就别反射——泛型、接口多态、委托、表达式树，新项目还可考虑源码生成器。',
  },
  { id: 66, category: 'C#基础', difficulty: 2, question: 'Dictionary 底层如何实现？查找复杂度？', points: [
    '基于哈希桶数组 + 冲突链（开放寻址/链表法），用 key 的 GetHashCode 定位桶，再 Equals 精确比较',
    '平均 O(1) 查找，最坏 O(n)（哈希冲突严重）；扩容会重新哈希，有瞬时开销',
    '自定义 key 要正确重写 GetHashCode/Equals：相等的对象哈希必须一致；避免用可变对象当 key',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲结构：哈希桶数组加冲突处理，用 GetHashCode 定位桶、Equals 精确定位。复杂度给结论：平均 O(1)、最坏 O(n)，扩容要重新哈希有瞬时开销。坑是高频考点：自定义类型作 key 必须同步重写 GetHashCode 与 Equals，相等对象哈希必须一致；别拿可变对象当 key，改了哈希就找不到了。',
  },
  { id: 67, category: 'C#基础', difficulty: 2, question: '多线程安全共享数据有哪些手段？什么是死锁？', points: [
    'lock（Monitor）/Mutex/Semaphore 互斥；Interlocked 做原子加减；volatile 控制可见性（不保证原子）',
    'lock 本质是 Monitor.Enter/Exit + try/finally；建议锁私有对象而非 this/字符串',
    '死锁 = 两个线程互相持有对方需要的锁且不释放；避免：锁顺序一致、超时锁、减少嵌套锁',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '手段分强度讲：临界区用 lock 或 Monitor；简单计数用 Interlocked 原子操作；可见性问题用 volatile，但要强调它不保证原子。锁的最佳实践点一下：锁私有对象而非 this 或字符串。死锁给完整画面：两个线程各持对方要的锁互不释放，规避手段是统一锁顺序、加超时、少嵌套。',
  },
  { id: 68, category: 'C#基础', difficulty: 1, question: '你知道哪些 C# 较新的语法糖？', points: [
    '模式匹配 switch 表达式、is not、属性模式；record/with 表达式做不可变数据',
    '可空引用类型（? 注解）在编译期帮助防空引用；字符串插值 $、原始字符串、using 声明',
    'lambda 自然类型、局部函数、元组解构、索引/范围运算符（^ 和 ..）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '挑几组有代表性的讲比列清单好：模式匹配让 if-else 链变成表达式；record 与 with 做不可变数据；可空引用类型把空引用隐患提前到编译期；原始字符串与插值改善可读性。补一句工程判断：语法糖服务于表达力，团队规范一致比炫技重要。',
  },
  { id: 69, category: 'Unity核心', difficulty: 1, question: '为什么不要在 Update 里频繁 new 对象？', points: [
    '每次 new 都会在托管堆分配，积累后触发 GC 造成卡顿（GC Alloc 是性能关键指标）',
    'Unity 的 GC 在 IL2CPP/移动端频繁回收代价高；每帧分配即便很少也会放大压力',
    '优化：缓存复用对象、避免闭包/LINQ/字符串拼接、用对象池与预分配容器',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '直击本质：每次 new 都产生托管堆分配，累积触发 GC，而 GC 停顿在移动端与 IL2CPP 下代价很高。数据意识要有：Profiler 里 GC Alloc 是评估热点代码的铁指标。手段按热路径给：对象池复用、容器预分配、避免闭包与 LINQ 的隐式分配、字符串拼接改 StringBuilder。',
  },
  { id: 70, category: 'Unity核心', difficulty: 1, question: 'SetActive(false) 和脚本 enabled=false 有什么区别？', points: [
    'SetActive 控制 GameObject 激活态：失活时其所有组件回调停止（Update 不执行），且子物体一并失活',
    'enabled=false 只停用单个脚本：Update/协程仍跑吗？——MonoBehaviour.enabled=false 时 Update 停止，协程继续执行（除非物体失活/销毁）',
    'OnDisable：物体失活、脚本被禁用、销毁时都会调用；OnEnable 同理在激活时调用',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '分两条线答：SetActive 管 GameObject 本身，失活后整棵子树组件都不再回调，包括子物体；enabled 只管单个脚本，置 false 后该脚本的 Update 停止，但协程仍在跑——这是高频误区。最后把 OnDisable 的三种触发时机讲全：物体失活、脚本禁用、销毁时都会走。',
  },
  { id: 71, category: 'Unity核心', difficulty: 2, question: '场景切换时普通对象和 DontDestroyOnLoad 对象各经历什么？', points: [
    '普通对象在旧场景卸载时被 Destroy，走 OnDisable→OnDestroy',
    'DontDestroyOnLoad(this.gameObject) 的对象跨场景存活；再次加载含同名单例会重复创建，需防重',
    '常驻对象持有场景引用会导致场景无法卸载/泄漏；退出场景时手动清理事件与资源',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先对比命运：普通对象随旧场景卸载被销毁，走 OnDisable 到 OnDestroy；DontDestroyOnLoad 对象跨场景存活。坑要主动说：常驻单例在场景重复加载时会重复创建，需要防重；常驻对象若持有场景内引用，会阻止场景卸载造成泄漏。收尾给实践：切场景时统一清理常驻对象挂的事件与资源引用。',
  },
  { id: 72, category: 'Unity核心', difficulty: 1, question: 'transform.position 和 transform.localPosition 的区别？', points: [
    'position 是世界坐标；localPosition 相对父节点的本地坐标（父级移动会影响其世界位置）',
    '没有父节点时两者一致；UI 物体常用 localPosition/localScale 在父节点下布局',
    '换算 API：Transform.TransformPoint/InverseTransformPoint 在局部与世界之间转换点',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '一句话分清：position 是世界坐标，localPosition 是相对父节点的本地坐标，父级动则世界位置跟着动。补一句没有父节点时两者相等，UI 布局多用 localPosition 与 localScale。最后给换算 API：TransformPoint 与 InverseTransformPoint 做局部与世界互转，能答出这个说明你真用过坐标系。',
  },
  { id: 73, category: 'Unity核心', difficulty: 1, question: 'Layer 和 Tag 有什么区别？射线过滤用哪个？', points: [
    'Layer 是 0-31 的整型位掩码，用于物理碰撞/射线/相机剔除分组；Tag 是字符串标识，用于 FindWithTag 等逻辑查找',
    '射线 Physics.Raycast 用 LayerMask 过滤层级，避免逐物体判断',
    'Layer 更适合高频/性能敏感筛选（位运算快），Tag 适合低频业务标记',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给本质差异：Layer 是整型位掩码，适合碰撞、射线、相机剔除这类高性能筛选，位运算快；Tag 是字符串标识，适合 FindWithTag 这类低频逻辑查找。直接点结论：射线过滤一定用 LayerMask 而非 Tag，避免把每帧高频判断做成字符串比较。',
  },
  { id: 74, category: 'Unity核心', difficulty: 2, question: 'UI 里的 Canvas 为什么要尽量少、层级要浅？', points: [
    'Canvas 会触发重建（rebuild）：布局变化、属性变化都要重新生成网格；Canvas 多会多次重建与合批切换',
    '层级嵌套深、每帧改 UI 属性会造成 Layout/Graphic 重建开销和 Draw Call 增加',
    '优化：静态部分独立 Canvas、动态部分小范围更新、避免频繁改 RectTransform/Text、用图集与少嵌套',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲 Canvas 的代价：它触发网格重建，布局与属性一变就要重算重发，Canvas 多会导致重建次数与合批切换增加。再说层级深的问题：UI 改动沿层级向上传导，嵌套过深放大开销。给三条实战优化：静态界面独立 Canvas 避免被动态内容拖着重建、动态区域尽量小、避免每帧改 Text 与 RectTransform。',
  },

  // ============ 扩展批2 ============
  { id: 75, category: '协程与异步', difficulty: 2, question: 'StartCoroutine 传字符串和传 IEnumerator 的区别？', points: [
    '字符串版（"MethodName"）按名字启动，可配 StopCoroutine(name) 停止；无编译期类型检查，方法不存在运行时报错',
    'IEnumerator 版更安全，但停止时需持有同一个 IEnumerator 实例引用才有效',
    '生产环境建议用强类型 IEnumerator + Coroutine 句柄保存，便于精确停止',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先答差异：字符串重载按方法名启动，能配同名 StopCoroutine，但没有编译期检查，名字错了运行期才报；IEnumerator 重载类型安全，但停止时得持有同一个实例引用。生产建议给明确结论：保存强类型协程的 Coroutine 句柄，需要精确停止与生命周期管理时才可控。',
  },
  { id: 76, category: '协程与异步', difficulty: 3, question: '如何实现“等待某个条件成立再继续”的协程？', points: [
    '自己写 while (!cond) yield return null 会每帧空转，开销可控但语义弱',
    '封装 WaitUntil/WaitWhile（Unity 内置）实现条件等待；大列表分帧处理常用',
    '复杂异步（多条件/带超时）可用 async/await + UniTask，取消与异常更完善',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给内置方案：WaitUntil 与 WaitWhile 正是为条件等待设计的，语义清晰。再对比手动 while 空转的写法，说明每帧 yield 的开销可控但可读性差。最后给复杂场景升级路径：多条件、要超时与取消时换 async/await 加 UniTask，异常处理也更完整。',
  },
  { id: 77, category: '协程与异步', difficulty: 3, question: '协程的每帧开销来自哪里？大量协程会影响性能吗？', points: [
    '每个协程由引擎每帧/按指令推进：IEnumerator 状态机 + 指令对象（如 WaitForSeconds）会分配',
    'WaitForSeconds 每次 yield 都 new 对象；大量协程会造成 GC 压力与每帧遍历开销',
    '优化：缓存复用等待对象、用统一调度器（如 UniTask）减少协程数量、长任务分片处理',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '把开销拆开讲：每个协程都要由引擎调度推进，yield 的指令对象如 WaitForSeconds 每次都会分配，协程多了就是持续的 GC 压力与每帧遍历成本。优化三板斧：缓存复用等待对象、用统一调度器减少协程数量、长任务分片而非长协程。',
  },
  { id: 78, category: '资源与内存', difficulty: 2, question: 'Resources.Load 为什么被官方不推荐？', points: [
    'Resources 目录内容全部打进包体，无法按需下载、无法做版本热更，包体膨胀',
    'Resources.Load 每次加载没有引用计数概念，容易忘记卸载；资源被 Resources 系统持有难精确释放',
    '推荐 Addressables/AssetBundle：可寻址、可远程、引用计数、按平台优化',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '讲三层理由：一是 Resources 目录全量进包体，无法按需下载与热更；二是加载没有引用计数，资源被 Resources 系统持有，难以精确释放；三是资源与代码版本耦合不利于远程迭代。最后落到官方演进结论：新项目用 Addressables，按需加载、可远程、引用计数自动管理。',
  },
  { id: 79, category: '资源与内存', difficulty: 2, question: '如何判断一个资源（纹理/网格）是否真的卸载了？', points: [
    '用 Profiler Memory 面板看资源列表与引用计数；场景对象、材质引用、已加载 AssetBundle 都会阻止卸载',
    'Resources.UnloadUnusedAssets 只卸载无任何引用的资源；运行时加载的新资源若被静态引用仍不卸载',
    'Addressables 场景可用 Addressables.GetLoadState/引用计数 API 追踪；怀疑泄漏用 Memory Profiler 快照对比',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给工具答案：Profiler 的 Memory 面板能看资源实例与引用，谁还引用它一目了然。再讲卸载逻辑：UnloadUnusedAssets 只回收无任何引用的资源，静态引用、已加载 AB、场景对象都会阻止回收。补 Addressables 视角：用引用计数接口追踪，泄漏用 Memory Profiler 抓前后快照 diff 最直接。',
  },
  { id: 80, category: '资源与内存', difficulty: 3, question: '热更新资源断点续传与校验怎么做？', points: [
    '下载器分块/分段下载，记录已下载偏移量，断线后从断点续传（需要服务端支持 Range）',
    '完整性校验：每个文件/包算 hash（MD5 或更好用 xxhash/SHA），下载完成后对比清单里的 hash',
    '版本清单先校验签名/完整性，防止中间人篡改；下载失败重试要退避，避免无限重试',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按链路给方案：下载侧支持分块与断点续传，记录已下载偏移，靠服务端 Range 续传；完整性用每个文件或整包算 hash，下载完与清单比对；清单本身要先验签名防篡改。工程细节补两点：失败重试要退避、校验失败的文件要能重新下载，避免坏文件被复用。',
  },
  { id: 81, category: '资源与内存', difficulty: 2, question: 'Addressables 的引用计数泄漏常见原因？', points: [
    'LoadAssetAsync 后忘记 Release；InstantiateAsync 生成的实例销毁后没有 ReleaseInstance',
    '重复 Load 同一资源：Addressables 计数递增，每次 Load 都需对应 Release',
    '场景/预制体里引用其他资源：场景释放时子资源计数也要理清，用 Addressables 场景管理可自动处理',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先点最常见的两种：Load 后忘 Release，实例化出来的对象销毁时没 ReleaseInstance。再讲引用计数规则：Addressables 每次 Load 都计数加一，必须一一对应 Release，重复 Load 就重复 Release。最后提醒场景与预制体里的间接引用，用 Addressables 的场景管理能自动理清子资源计数。',
  },
  { id: 82, category: '物理与碰撞', difficulty: 2, question: 'Rigidbody 的 interpolation 和 collision detection 模式何时用？', points: [
    'Interpolation 用于高速/相机跟随时平滑刚体渲染位置，避免“抖动画格”（Extrapolate 可预测未来）',
    'Collision Detection：Discrete（默认快但不精确）；Continuous/Continuous Dynamic 防止高速物体穿透，代价高',
    '子弹/高速弹体建议 Continuous 或自己用射线/球形扫掠检测，避免直接依赖物理引擎漏检',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '分开答再给选型建议：Interpolation 解决渲染抖动，高速运动或相机跟随强烈建议开；Collision Detection 的 Continuous 系列是为防穿透准备的，代价更高。落一个实际经验：高速子弹与其全开 Continuous，不如自己加射线或球形扫掠检测，成本更可控。',
  },
  { id: 83, category: '物理与碰撞', difficulty: 2, question: '物理引擎常见性能杀手有哪些？', points: [
    '碰撞体数量过多、复杂凸包/网格碰撞体、刚体睡眠设置不当（物体一直 awake）',
    '每帧大量 Raycast/Sweep、触发器频繁进出回调、物理步长被改小（fixedDeltaTime 调低会增加模拟次数）',
    '优化：用碰撞体 Layer 矩阵禁用无关碰撞、简化碰撞体、合并静态碰撞体、控制查询频率',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按类型排雷：碰撞体层面，数量过多、复杂凸包或网格碰撞体、静态物体没合并都是问题；刚体层面，物体长期不睡、频繁被唤醒最隐蔽；查询层面，每帧大量 Raycast 与触发器进出；配置层面，把 fixedDeltaTime 调小会让模拟次数成倍上升。优化给四板斧：Layer 碰撞矩阵、简化与合并碰撞体、控制查询频率、让该睡的刚体睡。',
  },
  { id: 84, category: '物理与碰撞', difficulty: 3, question: '刚体穿透/隧道效应（tunneling）如何解决？', points: [
    '高速物体在单步内越过薄碰撞体导致漏检（隧道效应）',
    '解法：调小 fixedDeltaTime 或增大 Collision Detection 到 Continuous；把碰撞体加厚/用射线扫掠检测',
    '移动物体每帧位移不要超过最小碰撞体厚度；关键碰撞用专用检测（OverlapSphere/Raycast）兜底',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲成因：高速物体在一个物理步内整体越过了薄碰撞体，引擎没检测到相交，这就是隧道效应。解法按成本排：调小 fixedDeltaTime、把检测模式提到 Continuous、碰撞体加厚。再补工程经验：移动位移别超过最小碰撞体厚度，关键碰撞用射线或 OverlapSphere 兜底检测。',
  },
  { id: 85, category: '热更与工程', difficulty: 2, question: 'IL2CPP 裁剪（code stripping）会带来什么问题？', points: [
    '未被引用/反射使用的类型可能被裁剪，运行时 Type.GetType/Activator.CreateInstance 返回 null',
    '处理：link.xml 显式保留类型/成员、[Preserve] 特性标记、IL2CPP 的 Managed Stripping Level 调低',
    '序列化/Json 反序列化、反射调用、多态注册表最易踩坑，接入新库要做真机验证',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲原理：裁剪会去掉未被引用和反射使用的类型。风险场景点名：Type.GetType、Activator、Json 反序列化、反射注册表最容易中招。处理手段给全：link.xml 显式保留、[Preserve] 特性标记、必要时降低 Managed Stripping Level。收尾一句经验：接入新库后一定要真机验证，编辑器下不会暴露裁剪问题。',
  },
  { id: 86, category: '热更与工程', difficulty: 2, question: '打 AssetBundle 时如何避免资源冗余重复？', points: [
    '依赖分析：同一资源被多个 Bundle 引用时若不显式分离，会打进每个引用包造成重复',
    '公共资源单独成包（图集/Shader/通用模型），用 AssetBundle Build Report 检查重复项',
    '同名/同路径资源冲突、sub asset 处理不当也会重复；用 Addressables 分组与依赖自动管理',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给根因：资源被多个 Bundle 引用时若不显式归类，会随每个引用包重复打入。解法分两步：做依赖分析，公共资源单独成包；用 AssetBundle Build Report 检查重复项。再提醒两个隐蔽坑：同名同路径资源冲突、sub asset 处理不当。最后给工程结论：Addressables 的分组与依赖自动管理能大幅减少这类手工错误。',
  },
  { id: 87, category: '热更与工程', difficulty: 3, question: 'Unity 工程如何做 CI/CD 自动化打包？', points: [
    '命令行批处理：Unity -batchmode -quit -executeMethod 指定 Build 静态方法，传参数控制平台/版本',
    '配合 Jenkins/GitLab CI 流水线：拉代码、跑单元测试、打 AssetBundle/安装包、上传分发平台',
    '注意 License 激活、Android SDK/NDK 环境变量、构建产物按构建号归档与版本管理',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按链路答：本地侧用 Unity 命令行批处理，-batchmode 加 -executeMethod 调构建静态方法，平台与版本号走参数；流水线侧用 Jenkins 或 GitLab CI 编排拉代码、跑测试、打 AB 与安装包、上传分发。经验提醒给三点：License 激活、Android SDK 环境变量、构建产物按构建号归档，这三个是新手最常踩的坑。',
  },

  // ============ 扩展批3 ============
  { id: 88, category: '网络与同步', difficulty: 3, question: '多人游戏如何降低同步流量？', points: [
    '只同步“变化且关键”的数据：输入/位置差分（delta）而非全量每帧快照；用 BitStream 压缩字段',
    '服务器广播做区域裁剪（Interest Management）：只发给附近玩家；快照按需插值而非高频全量',
    '帧同步里只同步输入与随机种子，客户端本地演算，流量天然最小',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按流量大头逐项优化：数据层面只同步变化量，位置走差分与定点压缩，字段用 BitStream 按位打包；广播层面做区域裁剪，只把快照发给附近玩家；频率层面快照插值代替高频全量。最后点出帧同步是流量最小解——只同步输入与种子，本地演算整局。',
  },
  { id: 89, category: '网络与同步', difficulty: 3, question: '权威服务器（authoritative server）解决什么问题？', points: [
    '由服务器裁定合法状态，客户端只上报输入/意图，杜绝本地修改血量/坐标的作弊',
    '服务器也做碰撞/判定校验，客户端预测+校正；反作弊还要做行为校验与加密',
    '代价：服务器开销大、延迟要求高；纯帧同步可做成“服务器只转发输入”的半权威',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '开门见山：权威服务器让服务器裁定合法状态，客户端只上报输入意图，从根上杜绝改血量、改坐标这类作弊。再讲职责：判定、碰撞校验都在服务端，客户端做预测与校正，反作弊还有行为校验。最后给代价与变体：服务器压力大、要求低延迟，纯帧同步可做成服务器只转发输入的半权威形态。',
  },
  { id: 90, category: '架构与设计模式', difficulty: 2, question: '事件系统和直接方法调用的取舍？什么时候用事件？', points: [
    '直接调用：强耦合但链路清晰、性能好、易调试；适合明确一对一依赖',
    '事件/消息：解耦生产者和消费者，适合一对多、跨模块通知（UI 监听战斗结果、成就系统监听击杀）',
    '过度使用事件会让调用链不可追踪、调试困难；中间层设计要克制',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给判断框架：直接调用强耦合但链路清晰、性能好、易调试，适合明确的一对一依赖；事件解耦生产与消费，适合一对多和跨模块通知，比如 UI 听战斗结果、成就系统听击杀。核心提醒：事件用多了调用链会不可追踪，所以中间层要克制，能直接调用就别绕事件。',
  },
  { id: 91, category: '架构与设计模式', difficulty: 2, question: 'ScriptableObject 在项目里一般怎么用？', points: [
    '做数据配置资产：数值表、技能配置、道具定义，不写死代码且可多人协作',
    '做事件通道/共享数据仓库（不可变配置 + 可变运行时状态分离），减少单例',
    '注意：SO 是资产（Asset），运行期修改会留在编辑器资产上，发布后修改只存在内存；大量 SO 注意内存',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按用途分层答：第一做纯数据配置资产，数值、技能、道具定义放 SO，策划可改且不写死代码；第二做事件通道与共享数据仓库，减少单例；第三可做可复用行为配置，如技能模板。坑要提醒：SO 是资产文件，编辑器下运行期修改会写回资产，发布后修改只存在于内存，大量 SO 也要注意加载与内存占用。',
  },
  { id: 92, category: '架构与设计模式', difficulty: 2, question: '命令模式在游戏里的应用（如技能/操作回放）？', points: [
    '把操作封装成对象（Execute/Undo），可排队、可撤销、可序列化记录',
    '应用：输入缓冲、回放系统、网络输入队列（帧同步里每条输入就是一个命令）',
    '配合状态快照可做“时间回溯/回滚”；实现要点是命令只依赖纯数据，方便序列化',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给模式定义：把操作封装成带执行与撤销的对象，可排队、可记录、可重放。应用场景点名：输入缓冲、回放录像、帧同步的输入队列——每条输入本质就是一条命令。进阶用法讲一句：配合状态快照可以做时间回溯与回滚，但前提是命令只依赖可序列化的纯数据。',
  },
  { id: 93, category: '架构与设计模式', difficulty: 3, question: '大型战斗系统如何做模块拆分？', points: [
    '分层：战斗核心逻辑（纯数据/纯函数，可回放可单测）与表现层（特效/音效/相机）分离',
    '模块化：Buff/技能/伤害计算/目标选择各自成系统，用事件或接口通信，避免巨型 God 类',
    '配置驱动：数值、Buff 效果、技能行为尽量配置化 + 脚本化，降低新增玩法成本',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给最关键的划分：战斗核心逻辑做成纯数据、纯函数的可回放层，与特效音效相机的表现层彻底分离，这是单测与排障的根基。再按领域拆模块：Buff、技能、伤害计算、目标选择各自成系统，接口或事件通信，避免 God 类。最后讲配置驱动：数值与行为配置化加脚本化，新玩法只配不改核心代码。',
  },
  { id: 94, category: '架构与设计模式', difficulty: 3, question: '数据驱动设计（Data-Driven）的好处与实现？', points: [
    '把行为参数从代码抽到配置：数值、掉落、技能、关卡、AI 参数，策划可调不用改代码重发包',
    '实现：ScriptableObject/Json/Excel 工具链导出，运行时统一加载与校验',
    '注意配置校验（缺字段/越界）、版本管理与热更；纯数据驱动避免把逻辑也塞进配置导致“配置即代码”难维护',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '一句话定义：把行为参数从代码抽到配置，让数值与规则可调。收益讲清：策划改配置不用动代码重发包，新增内容成本低。实现链路给完整：ScriptableObject、Json 或 Excel 工具链导出，运行时统一加载校验。坑位提醒两个：配置缺字段与越界要做校验，别把逻辑也塞进配置变成配置即代码，否则比代码还难维护。',
  },

  // ============ 计算机网络 ============
  { id: 95, category: '计算机网络', difficulty: 1, question: 'OSI 七层模型和 TCP/IP 四层模型分别是什么？', points: [
    'OSI：物理/数据链路/网络/传输/会话/表示/应用；TCP/IP：网络接口/网际/传输/应用',
    'TCP/IP 把 OSI 的上三层合并为应用层，网际层对应 IP 路由转发',
    '分层意义：每层只关心相邻层接口，便于实现与排障（如抓包定位到传输层）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先答分层名再讲对应关系：OSI 七层是物理、数据链路、网络、传输、会话、表示、应用；TCP/IP 四层把上三层并进应用层，网际层对应 IP 路由转发。加分点是解释分层意义：每层只依赖相邻层接口，排障时靠抓包定位到传输层还是应用层，思路会清晰很多。',
  },
  { id: 96, category: '计算机网络', difficulty: 1, question: 'TCP 和 UDP 的区别？游戏里怎么选？', points: [
    'TCP：面向连接、可靠有序、有拥塞控制；UDP：无连接、不保证可靠与顺序、开销小延迟低',
    '需要可靠全量数据的登录/下单用 TCP/HTTPS；实时战斗位置/输入用 UDP（可自己加 ACK/序号）',
    '很多游戏“UDP + 自研可靠层”或直接上 QUIC，兼顾低延迟与可靠性',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给核心差异表：TCP 面向连接、可靠有序、有拥塞控制；UDP 无连接、不保证可靠与顺序、头开销小延迟低。选型给结论：登录、下单这类要可靠全量的走 TCP 或 HTTPS；实时战斗的位置与输入走 UDP，可靠性与排序自己补。进阶表达：不少实时游戏用 UDP 加自研可靠层，或直接上 QUIC 兼顾延迟与可靠。',
  },
  { id: 97, category: '计算机网络', difficulty: 2, question: 'TCP 三次握手和四次挥手的过程？为什么挥手要多一次？', points: [
    '握手：SYN → SYN+ACK → ACK，确认双方收发能力并交换初始序号',
    '挥手：FIN → ACK → FIN → ACK；因为 TCP 是全双工，两端要各自关闭自己的发送方向',
    'TIME_WAIT 在主动关闭方停留 2MSL，保证最后一个 ACK 可达、旧报文不串扰新连接',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '过程要背准：三次握手 SYN、SYN 加 ACK、ACK，目的是确认双方收发能力并交换初始序号；四次挥手 FIN、ACK、FIN、ACK。为什么挥手多一次要讲透：TCP 全双工，两端要各自独立关闭自己的发送方向，所以比握手多一轮。补 TIME_WAIT：主动关闭方等 2MSL，保证最后的 ACK 可达并防旧报文串扰新连接。',
  },
  { id: 98, category: '计算机网络', difficulty: 2, question: 'HTTP 和 HTTPS 的区别？HTTPS 握手大致流程？', points: [
    'HTTPS = HTTP + TLS：加密传输、证书校验身份、防篡改；代价是握手开销',
    'TLS 握手：ClientHello → ServerHello+证书 → 客户端验证证书并协商密钥 → 双方用对称密钥加密通信',
    '现代用 TLS1.3 1-RTT 握手，前向安全用 ECDHE 密钥交换；证书链校验防中间人',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '差异一句话：HTTPS 是 HTTP 加 TLS，做加密、证书身份校验与防篡改，代价是握手延迟。握手流程按消息走：ClientHello、ServerHello 带证书、客户端验证证书并协商会话密钥、之后用对称密钥加密通信。加分点：提 TLS 1.3 把握手压到 1-RTT，且用 ECDHE 保证前向安全。',
  },
  { id: 99, category: '计算机网络', difficulty: 1, question: '常见 HTTP 状态码有哪些？各自含义？', points: [
    '2xx：200 OK、204 No Content；3xx：301 永久重定向、302 临时重定向、304 未修改（缓存）',
    '4xx：400 参数错误、401 未认证、403 无权限、404 不存在、429 限流',
    '5xx：500 服务器内部错误、502 网关错误、503 服务不可用、504 网关超时',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '别平铺背诵，按类讲：2xx 成功系，200 与 204 最常用；3xx 重定向系，301 永久、302 临时、304 命中缓存；4xx 客户端错误，401 未认证、403 无权限、404 不存在、429 限流；5xx 服务端错误，500 内部错、502 网关错、503 不可用、504 超时。答完补一句排障口诀：先看 4 开头还是 5 开头，判断问题在前端还是后端。',
  },
  { id: 100, category: '计算机网络', difficulty: 1, question: '从输入 URL 到页面显示，发生了什么？', points: [
    'DNS 解析域名得到 IP → 建立 TCP 连接（HTTPS 加 TLS 握手）→ 发送 HTTP 请求',
    '服务器处理返回 HTML/资源 → 浏览器解析 HTML 构建 DOM、CSSOM，执行 JS，布局与绘制',
    '现代流程还含缓存（浏览器缓存/CDN）、HTTP/2 多路复用、预加载优化等',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按阶段串讲：DNS 解析域名到 IP，建立 TCP 连接，HTTPS 还要过 TLS 握手，然后发 HTTP 请求；服务器返回后浏览器解析 HTML 构建 DOM 与 CSSOM、执行脚本、布局绘制。加分扩展别漏：中间还有浏览器缓存与 CDN 命中、HTTP 版本差异、资源预加载，能体现工程视角而不只是背流程。',
  },
  { id: 101, category: '计算机网络', difficulty: 2, question: 'DNS 解析过程是怎样的？', points: [
    '先查浏览器缓存 → 本机 hosts/系统缓存 → 本地 DNS 服务器（递归查询）',
    '本地 DNS 迭代查询根服务器 → 顶级域（.com）→ 权威服务器，拿到 A/AAAA 记录',
    '优化：CDN 按地理位置返回就近节点 IP；DNS 污染/劫持可用 DoH/DoT',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按缓存层级从上往下答：浏览器缓存、系统 hosts、本地 DNS 递归查询；本地 DNS 再去迭代根服务器、顶级域、权威服务器拿到记录。加分点两个：CDN 场景下 DNS 会按地理位置返回就近节点；对抗污染劫持可提 DoH、DoT，能体现你遇到过真实网络问题。',
  },
  { id: 102, category: '计算机网络', difficulty: 2, question: '什么是 TCP 粘包/拆包？如何处理？', points: [
    'TCP 是字节流无消息边界：多个小包合并（粘包）或大包分片（拆包）都很常见',
    '处理：定长消息、长度字段前置（包头+长度）、分隔符/结束符、或每个消息独立连接（不推荐）',
    'UDP 有消息边界但可能丢包乱序，需要自己加序号、校验与重传',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲本质：TCP 是字节流，没有消息边界，粘包拆包是必然现象而不是 bug。再给三种处理：定长消息、包头带长度字段、分隔符协议，推荐第二种最通用。补一句 UDP 对照：UDP 有天然消息边界但会丢包乱序，要自己补序号、校验与重传。',
  },
  { id: 103, category: '计算机网络', difficulty: 3, question: 'TCP 拥塞控制有哪些算法？慢启动是什么？', points: [
    '慢启动：cwnd 从 1 开始指数增长（每个 RTT 翻倍），达到 ssthresh 进入拥塞避免',
    '拥塞避免：cwnd 线性增长；丢包（超时/3 个重复 ACK）触发快重传/快恢复，阈值减半',
    '现代还有 BBR（基于带宽时延积探测）等算法；拥塞控制目标是公平利用带宽、避免网络崩溃',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲慢启动机制：cwnd 从 1 开始每个 RTT 翻倍，指数增长到 ssthresh 后转拥塞避免线性增长。再讲丢包处理：超时或连续重复 ACK 触发快重传与快恢复，阈值减半。进阶提 BBR 这类基于带宽探测的现代算法，说明拥塞控制的目标是公平利用带宽而不压垮网络。',
  },
  { id: 104, category: '计算机网络', difficulty: 3, question: 'TCP 流量控制和拥塞控制的区别？滑动窗口是什么？', points: [
    '流量控制：接收方通过窗口字段告诉发送方“我能收多少”，防止发送过快压垮接收方（端到端）',
    '拥塞控制：发送方根据网络状况调整 cwnd，防止压垮中间网络（全局）',
    '发送窗口 = min(接收窗口 rwnd, 拥塞窗口 cwnd)；滑动窗口允许批量发送+累计确认，提高吞吐',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '这是高频混淆点，先给一句话区分：流量控制是接收方告诉发送方自己能收多少，端到端的；拥塞控制是发送方感知网络状况自我限速，全局的。再讲滑动窗口：发送窗口取接收窗口与拥塞窗口的较小值，支持批量发送与累计确认。最后点一句：rwnd 管别把接收方撑爆，cwnd 管别把网络挤爆。',
  },
  { id: 105, category: '计算机网络', difficulty: 2, question: 'HTTP/1.1、HTTP/2、HTTP/3 的主要区别？', points: [
    'HTTP/1.1：持久连接 + 管道化（实际队头阻塞严重，一个连接一次一个请求响应）',
    'HTTP/2：二进制分帧 + 多路复用（同连接并发请求）、头部压缩 HPACK、Server Push；TCP 层队头阻塞仍在',
    'HTTP/3：基于 QUIC/UDP，连接迁移、0-RTT、彻底解决队头阻塞；头部用 QPACK',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '按版本递进讲：HTTP/1.1 一个连接一次只能处理一个请求，队头阻塞严重；HTTP/2 用二进制分帧加多路复用解决应用层并发，还有头部压缩，但 TCP 层的队头阻塞仍在；HTTP/3 干脆把传输层换成基于 UDP 的 QUIC，实现 0-RTT 与连接迁移。收尾点出演化主线：每一代都在解决上一代的队头阻塞。',
  },
  { id: 106, category: '计算机网络', difficulty: 2, question: '长连接和短连接的区别？Keep-Alive 是什么？', points: [
    '短连接：每次请求建连-用后即断，握手开销大，适合低频小请求',
    '长连接：连接复用（HTTP Keep-Alive / TCP 连接池），减少握手与慢启动开销，适合高频交互',
    '长连接要处理空闲超时、心跳保活、断线重连与连接数管理；服务端资源占用更高',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给语义：短连接请求一次建连一次断开，握手成本高，适合低频小请求；长连接复用连接，省握手与慢启动，适合高频交互。长连接的代价要讲全：空闲超时、心跳保活、断线重连、连接数管理，服务端资源占用高。最后落到 HTTP Keep-Alive 与 TCP 连接池的关系，能体现你清楚两者层级。',
  },
  { id: 107, category: '计算机网络', difficulty: 2, question: 'Cookie、Session、Token 的区别与关系？', points: [
    'Cookie 是浏览器存储的小数据，随请求自动携带，可存 sessionId 或登录态',
    'Session 在服务端保存用户状态，通过 sessionId 关联；集群部署需共享 Session（Redis）',
    'Token/JWT 是无状态认证：服务端验签即可，适合分布式；注意过期、刷新与吊销机制',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '建议从存储位置切入：Cookie 存在浏览器端随请求携带，适合存会话标识；Session 存在服务端，靠 sessionId 关联，集群要共享存储；Token 尤其 JWT 是无状态的，服务端验签即可，天然适合分布式。最后提醒 JWT 的短板：过期、刷新与吊销机制要设计好，别只看到无状态的好处。',
  },
  { id: 108, category: '计算机网络', difficulty: 2, question: 'WebSocket 和轮询/SSE 的区别？游戏里怎么用？', points: [
    '轮询：定时发 HTTP 请求，实时性差、浪费流量；长轮询改善延迟但连接成本高',
    'WebSocket：全双工长连接，双向实时推送，适合聊天/联机/实时协作',
    'SSE：服务端单向推送（基于 HTTP），简单且自动重连，适合通知类场景；实时游戏通常 WebSocket 或自定义 UDP',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先对比三种实时手段：轮询是定时打 HTTP，实时性差流量浪费；WebSocket 是全双工长连接，双向实时推送；SSE 是服务端单向推送，基于 HTTP 自动重连。落到游戏场景给结论：强实时对战走 WebSocket 或自研 UDP，通知类轻量场景用 SSE 反而更简单。',
  },
  { id: 109, category: '计算机网络', difficulty: 3, question: '什么是负载均衡？有哪些算法？', points: [
    '把请求分发到多台服务器，提升容量与可用性；分 DNS/四层（LVS）/七层（Nginx）负载',
    '算法：轮询、加权轮询、最少连接、IP Hash、一致性哈希（缓存场景减少迁移）',
    '健康检查剔除故障节点、会话保持（sticky session）与无状态化（JWT/Redis）是配套要点',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给分层：DNS 负载、四层 LVS、七层 Nginx 按需选。算法按特点讲：轮询与加权轮询简单公平、最少连接照顾慢请求、IP Hash 与一致性哈希保会话粘性且缓存场景迁移少。配套机制不能漏：健康检查剔除故障节点、业务侧尽量无状态化，用 JWT 或 Redis 会话替代 sticky session，扩容才自由。',
  },
  { id: 110, category: '计算机网络', difficulty: 3, question: '游戏实时对战为什么常不用纯 TCP？QUIC 适合游戏吗？', points: [
    'TCP 的可靠重传带来延迟抖动与队头阻塞，实时操作等不起重传；UDP 低延迟但需自管丢包',
    '实际做法：TCP 用于登录/商店/匹配等可靠业务，UDP/可靠 UDP 用于战斗帧数据',
    'QUIC 基于 UDP 实现可靠传输：0-RTT 建连、无队头阻塞、连接迁移，适合手游弱网对战',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲为什么不用纯 TCP：可靠重传带来延迟抖动，TCP 层的队头阻塞让一个丢包卡住后面所有包，实时对战等不起。再给工程惯例：可靠业务登录商店匹配走 TCP 或 HTTPS，战斗帧数据走 UDP 加自研可靠层。最后答 QUIC：基于 UDP 实现可靠传输，0-RTT 建连、无队头阻塞、连接迁移，弱网手游对战的趋势选项。',
  },

  // ============ 数据结构 ============
  { id: 111, category: '数据结构', difficulty: 1, question: '数组和链表的区别？各自适合什么场景？', points: [
    '数组：连续内存、按下标 O(1) 访问、缓存友好；插入/删除需搬移 O(n)',
    '链表：节点分散、顺序访问 O(n)、插入/删除 O(1)（已知位置）；内存不连续缓存差',
    '读多写少用数组/List；频繁中间插入删除、大小不确定用链表（但 C# 里 LinkedList 实际使用少，常用 List 平衡）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先按维度对比：数组连续内存、O(1) 下标访问、缓存友好，插入删除要搬移；链表节点分散、已知位置增删 O(1)，但访问要遍历且缓存差。选型结论给实际工程经验：读多写少用 List，频繁中间增删才考虑链表，而且 C# 里 LinkedList 因缓存与分配问题实际用得少。',
  },
  { id: 112, category: '数据结构', difficulty: 1, question: '栈和队列的区别？用栈实现队列的思路？', points: [
    '栈：后进先出 LIFO；队列：先进先出 FIFO',
    '双栈实现队列：入队压入 in 栈；出队时若 out 栈空则把 in 全部倒入 out 再弹出',
    '应用：函数调用栈/递归转非递归、表达式求值（栈）；消息队列/任务调度（队列）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先一句话分清：栈后进先出，队列先进先出。双栈实现队列要讲清时机：入队只压 in 栈，出队时 out 栈为空才把 in 全部倒入再弹，倒一次管多次。应用举例补价值：函数调用栈与递归转非递归、表达式求值用栈；消息队列、任务调度、BFS 用队列。',
  },
  { id: 113, category: '数据结构', difficulty: 2, question: '哈希冲突怎么解决？装载因子是什么？', points: [
    '开放寻址：线性/二次探测、再哈希；链表法：同桶挂链表/红黑树（Java 8 HashMap 树化）',
    '装载因子 = 元素数/桶数：越大冲突越多，通常超过阈值（如 0.75）就扩容重哈希',
    '哈希函数要均匀；攻击者可构造碰撞导致 O(n) 退化，需随机种子（如字符串哈希加盐）防护',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '分两块答：冲突解决法，开放寻址的线性与二次探测、链地址法的链表与树化，Java 8 HashMap 同桶超阈值转红黑树是经典例证；装载因子是元素数与桶数之比，越大越容易冲突，超阈值要扩容重哈希。加分点补安全性：攻击者构造同哈希键能拖垮哈希表，随机种子加盐能防这种退化。',
  },
  { id: 114, category: '数据结构', difficulty: 2, question: '二叉搜索树（BST）的特性？为什么会退化？', points: [
    '左子树 < 根 < 右子树，中序遍历有序；查找/插入平均 O(log n)',
    '插入有序序列时 BST 退化成链表，操作退化为 O(n)；需要自平衡（AVL/红黑树）',
    'AVL 严格平衡、红黑树近似平衡（旋转少）；实际系统常用红黑树（TreeMap、C++ map）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给特性：左小右大、中序有序、平均 O(log n)。退化场景要讲清：按有序序列插入时 BST 变链表，操作退 O(n)，所以需要自平衡。对比 AVL 与红黑树：AVL 严格平衡查询更快但旋转多，红黑树近似平衡旋转少更适合动态增删。落实际：TreeMap、C++ map 都用红黑树。',
  },
  { id: 115, category: '数据结构', difficulty: 2, question: '二叉树的前序/中序/后序/层序遍历分别怎么走？', points: [
    '前序：根→左→右；中序：左→根→右（BST 中序有序）；后序：左→右→根；层序：按层 BFS',
    '递归实现简单；工程上深树用迭代（显式栈）防爆栈',
    '用途：前序/中序可重建二叉树、后序适合先释放子节点、层序适合宽度优先搜索/层级处理',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先背遍历序：前序根左右、中序左根右、后序左右根、层序按层。实现注意点：递归简单但深树会爆栈，工程上转显式栈迭代。最后用途是加分项：前序中序可重建树、后序适合先处理子节点、层序天然做宽度优先与层级处理，BST 的中序有序直接能当排序输出。',
  },
  { id: 116, category: '数据结构', difficulty: 2, question: '堆（优先队列）是什么？怎么实现？', points: [
    '堆是完全二叉树：大顶堆根最大、小顶堆根最小；父子满足堆序',
    '插入上浮、删除堆顶下沉，复杂度 O(log n)；建堆 O(n)',
    '应用：TopK、定时器/事件调度、Dijkstra 优先队列；C# 里用 PriorityQueue<T> 或自写数组堆',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给定义：堆是完全二叉树，满足堆序，大顶堆根最大。操作复杂度要背准：插入上浮、删除堆顶下沉都是 O(log n)，建堆 O(n)。应用场景报全：TopK、定时器事件调度、Dijkstra 的优先队列。实现层面提一句 C# 可用 PriorityQueue，或手写数组堆，说明你真落地过。',
  },
  { id: 117, category: '数据结构', difficulty: 2, question: '快排和归并排序的思路？复杂度与稳定性？', points: [
    '快排：选 pivot 分区，递归两侧；平均 O(n log n)，最坏 O(n²)（有序+固定 pivot）；不稳定',
    '归并：分治合并两个有序子数组；稳定 O(n log n)，需 O(n) 额外空间',
    '游戏客户端常用：数据量小用插入排序兜底（快排优化）、引擎内部排序对稳定性有要求时选归并',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '思路分开讲：快排选 pivot 分区后递归两侧，平均 O(n log n)，但有序数据配固定 pivot 会退化 O(n²)，且不稳定；归并稳定且稳定 O(n log n)，代价是 O(n) 额外空间。给工程视角收尾：引擎内部排序常在数据量小时切插入排序兜底，稳定性敏感的场景选归并，游戏客户端排序也遵循这套思路。',
  },
  { id: 118, category: '数据结构', difficulty: 2, question: '二分查找的前提与注意点？', points: [
    '前提：有序数组 + 支持随机访问；每次缩小一半 O(log n)',
    '边界易错：左闭右开/闭区间一致、mid = l + (r-l)/2 防溢出、处理死循环',
    '变体：找第一个/最后一个等于、找大于等于某值的下界（lower_bound）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先说前提：有序且支持随机访问的数组。边界是面试官重点，给出防坑三原则：区间开闭写法全程一致、mid 用 l 加 (r 减 l) 除 2 防溢出、退出条件防死循环。变体主动讲两个：找第一个与最后一个相等元素、lower_bound 求下界，很多题就是这些变体的组合。',
  },
  { id: 119, category: '数据结构', difficulty: 2, question: '图的邻接矩阵和邻接表区别？BFS 和 DFS 分别适合什么？', points: [
    '邻接矩阵：O(V²) 空间、判边 O(1)，适合稠密图；邻接表：O(V+E)、遍历邻居快，适合稀疏图',
    'BFS 按层扩散：最短路（无权）、拓扑层数、迷宫最短路径；用队列实现',
    'DFS 深挖：连通分量、环检测、拓扑排序（逆后序）、回溯搜索；用栈/递归实现',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先按矩阵与邻接表对比：邻接矩阵空间 O(V 平方) 但判边 O(1)，适合稠密图；邻接表空间 O(V 加 E) 遍历邻居快，适合稀疏图，游戏场景基本都稀疏。再答搜索：BFS 按层扩散找无权最短路，队列实现；DFS 深挖做连通分量、环检测、拓扑排序，栈或递归实现。',
  },
  { id: 120, category: '数据结构', difficulty: 3, question: 'Dijkstra 原理？A* 和它的关系？', points: [
    'Dijkstra：从起点出发每次选 dist 最小的未访问节点松弛，处理非负权图最短路 O((V+E)logV)',
    'A* = Dijkstra + 启发式：f = g + h，h 估计到终点代价（如曼哈顿/欧氏距离），更快找到目标',
    'h 可采纳（不高估）时 A* 最优；游戏寻路常用 A* + 导航网格分层，巨大地图用 HPA*/JPS',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '原理一句话：Dijkstra 每轮取未访问最小 dist 节点松弛邻居，处理非负权最短路。A* 的关系要讲透：它是在 Dijkstra 基础上加启发式函数，f 等于 g 加 h，h 估计到终点代价，能引导搜索朝目标方向走。关键边界：h 可采纳时 A* 仍保证最优。落地：游戏寻路 A* 配导航网格，超大地图再上 HPA 或 JPS 分层优化。',
  },
  { id: 121, category: '数据结构', difficulty: 3, question: 'AVL 树和红黑树的区别？为什么很多系统用红黑树？', points: [
    'AVL：任意节点左右子树高度差 ≤1，严格平衡，查询快；插入/删除旋转多',
    '红黑树：近似平衡（最长路径 ≤2×最短），旋转少、插入删除性能好；查找略慢于 AVL',
    '场景：写多读少/动态增删（TreeMap、定时器、Epoll）用红黑树；静态只查可用 AVL/二分',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给平衡程度差异：AVL 要求任意节点左右子树高度差不超过 1，查询最优，但插入删除旋转频繁；红黑树近似平衡，最长路径不超过最短的两倍，旋转少，动态增删性能好。为什么系统多选红黑树：实际业务读多写少的静态查询场景少，动态平衡成本更重要。落点：TreeMap、定时器、Epoll 内部都是红黑树。',
  },
  { id: 122, category: '数据结构', difficulty: 3, question: 'B 树和 B+ 树的区别？为什么数据库/文件系统用 B+ 树？', points: [
    'B/B+ 树是多路平衡搜索树：降低树高，一次磁盘 IO 读一个大节点，减少寻道次数',
    'B+ 树：数据只在叶子、叶子链表相连、内部节点只存索引——范围查询友好、IO 更少',
    '数据库索引/文件系统用 B+ 树：层数低（3-4 层扛千万级）、支持高效范围扫描',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲共同点：都是多路平衡搜索树，用大节点降低树高，一次磁盘 IO 读更多数据。再讲 B+ 树的三点优势：数据全在叶子且叶子链表相连，范围查询天然高效；内部节点只存索引，同样空间能装更多层数；层数低，千万级数据三四层就能覆盖。结论顺理成章：数据库索引与文件系统要扛范围扫描与高 IO 压力，所以选 B+ 树。',
  },
  { id: 123, category: '数据结构', difficulty: 2, question: 'LRU 缓存怎么实现？', points: [
    '哈希表 + 双向链表：哈希 O(1) 定位，链表维护访问顺序',
    'get 命中把节点移到头部；put 新节点放头部，超容量删尾部；O(1) 操作',
    '变体：LFU（按访问频率）、2Q/ARC 等；游戏资源缓存/贴图流送常用 LRU',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给结构：哈希表负责 O(1) 定位，双向链表维护访问顺序。操作讲清：get 命中把节点移到头部，put 新节点插头部，超容量删尾部，全部 O(1)。注意讲清楚为什么用双向链表：删除尾部或任意节点需要前驱指针。最后提变体与场景：LFU 按频率淘汰，游戏贴图流送、资源缓存常用 LRU 思想。',
  },
  { id: 124, category: '数据结构', difficulty: 3, question: 'KMP 算法解决什么问题？核心思想？', points: [
    '字符串匹配：在主串找模式串位置，暴力 O(n×m)，KMP 做到 O(n+m)',
    '核心：预处理 next 数组（模式串自身最长相等前后缀），失配时模式串不回退主串',
    'next 计算与匹配共用“失配跳转”思想；工程里还可配合 BM/Sunday 进一步加速',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先点问题：在主串里找模式串，暴力是 O(n 乘 m)。KMP 的核心一句：失配时主串指针不回退，靠 next 数组让模式串跳到已匹配前缀之后继续。再讲 next 的本质：模式串每个位置的最长相等前后缀长度，预处理与匹配共用同一套失配跳转思想。补一句工程认知：文本编辑器这类场景还会配合 BM、Sunday 加速，KMP 是理论基石。',
  },
  { id: 125, category: '数据结构', difficulty: 3, question: '线段树/树状数组适合解决什么问题？', points: [
    '都是区间问题工具：单点/区间修改、区间求和/最值/异或，O(log n)',
    '线段树：递归分治维护区间信息，支持区间打标（懒更新），功能强实现复杂',
    '树状数组（BIT）：代码极短、常数小，支持前缀和/差分/逆序对，但不便做区间最值与复杂合并',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先总括用途：两者都是区间查询与修改的利器，单点改加区间查或区间改加区间查都能做到 O(log n)。再区分：线段树递归分治，支持区间打标懒更新，能维护最值、和、异或这类可合并信息，功能强但实现复杂；树状数组代码短常数小，前缀和与差分场景飞快，也能算逆序对，但做不了区间最值这类不可减运算。选型结论：够用优先树状数组，信息复杂再上线段树。',
  },
  { id: 126, category: '数据结构', difficulty: 3, question: 'TopK/海量数据求频次怎么做？', points: [
    '内存够：哈希计数 + 大小为 K 的小顶堆（或快排 partition 法）O(n log K)',
    '海量数据：分治（哈希分桶 MapReduce）+ 每桶求 TopK 再归并；近似算法可用 Bloom Filter/Count-Min Sketch',
    '流式场景：蓄水池抽样求随机 TopK；注意“全局频次”要先全局聚合再排序',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先按数据量分场景：内存放得下就哈希计数加大小为 K 的小顶堆，复杂度 O(n log K)，或快排 partition 取 TopK；放不下就哈希分桶分治，各桶求 TopK 再归并，近似场景可用 Count-Min Sketch 这类概率结构。流式追问补一句：蓄水池抽样处理随机 TopK，但全局频次必须先全局聚合再排序。',
  },

  // ============ 渲染扩展 ============
  { id: 127, category: '渲染与图形学', difficulty: 1, question: '渲染管线大致分哪些阶段？', points: [
    '应用阶段（CPU）：剔除、合批、提交渲染命令 → GPU 几何阶段：顶点着色、裁剪、光栅化',
    '片元阶段：片元着色、深度/模板测试、混合，输出到帧缓冲',
    '可编程管线给开发者着色器入口（VS/FS 或计算着色器），管线状态切换是性能关键',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '建议按 CPU 与 GPU 两段讲：应用阶段在 CPU 做剔除、合批与提交渲染命令；GPU 侧过顶点阶段、光栅化、片元阶段，最后深度模板测试与混合输出。加分表达：管线状态切换是性能关键，而可编程管线把 VS、FS、Compute 入口交给开发者，Unity 的 URP 正是在这层做定制。',
  },
  { id: 128, category: '渲染与图形学', difficulty: 2, question: 'Draw Call 是什么？合批（Batching）为什么能提升性能？', points: [
    'Draw Call 是 CPU 向 GPU 提交的一次绘制命令；每批都要绑定资源/切换状态，次数多则 CPU 成为瓶颈',
    '合批：把多个小网格合并成一次提交（Static Batching 合并静态物体、Dynamic Batching 合并小网格）',
    '前提是材质/纹理/Shader 参数一致（可用图集 + 合并网格）；SRP Batcher 减少材质状态切换开销',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给本质：一次 Draw Call 就是一次提交，涉及资源绑定与状态切换，数量上去 CPU 先顶不住。合批的原理是化多次为一次：静态合批在构建期合并网格，动态合批运行时合并小网格。前提条件讲清：同材质同纹理同 Shader 参数，配图集就是为此。进阶一句：SRP Batcher 不合并网格，但减少了材质状态切换，两者要区分开。',
  },
  { id: 129, category: '渲染与图形学', difficulty: 2, question: '前向渲染和延迟渲染的区别与选择？', points: [
    '前向：每物体逐光源光照，多光源开销线性增长；移动端/少光源常用，支持 MSAA',
    '延迟：先渲 G-Buffer（几何信息）再全屏光照，光源与物体数解耦，适合大量光源',
    '延迟缺点：带宽大、难做透明/复杂材质、需专门处理抗锯齿；URP 可按平台与需求切换',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲渲染流程差异：前向渲染逐物体逐光源算光照，光源一多开销线性上涨，优点是透明、MSAA 好做；延迟渲染先渲 G-Buffer 再全屏算光，光源数量与几何解耦，适合多光源大场景。代价如实说：G-Buffer 带宽与显存占用大、透明与复杂材质难处理、MSAA 不便。选型结论：移动端少光源前向，主机 PC 多光源延迟，URP 可按需切。',
  },
  { id: 130, category: '渲染与图形学', difficulty: 2, question: 'GPU 上的坐标系与 Unity 左手系转换注意什么？', points: [
    'Unity 用左手坐标系（相机看 +Z），DX 用左手、OpenGL 用右手；美术工具（Maya）是右手系，导入需转换',
    'Unity 里顶点/法线在模型空间，Shader 中模型空间→世界→观察→裁剪由 MVP 矩阵变换',
    '屏幕空间 UV：Vulkan/DX 原点左上、OpenGL 左下，做全屏后处理时方向要小心（URP 统一向上采样用 flip）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '分三块答：Unity 是左手系相机看向正 Z，DX 同左手、OpenGL 右手，Maya 等美术工具是右手系所以导入有坐标转换；Shader 内顶点经模型、世界、观察、裁剪四层 MVP 变换；屏幕空间 UV 原点 Vulkan 与 DX 在左上、OpenGL 在左下，全屏后处理采样方向要按管线翻转处理，URP 里就有相关 flip 约定。',
  },
  { id: 131, category: '渲染与图形学', difficulty: 2, question: '纹理压缩格式怎么选？为什么移动端用 ASTC/ETC？', points: [
    '桌面常用 BC 系列（BC7/DXT）；移动端传统用 ETC2（免版权、安卓兼容好）、ASTC（灵活、质量更高）',
    '纹理压缩是有损块压缩（4×4 等），直接减小带宽与显存；不要用 PNG 原图当运行时纹理',
    '选择看平台与质量需求：iOS/新安卓可 ASTC，老安卓 ETC2；UI 可保留 RGBA 但用图集控制大小',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给格式地图：桌面用 BC 系列，移动端 ETC2 免版权兼容广，ASTC 压缩比与质量更灵活，iOS 与较新安卓都支持。原理一句话：纹理压缩是硬件可直读的块压缩，省显存省带宽，不能拿 PNG 当运行时纹理。选型收口：按目标平台与质量需求来，老安卓兜底 ETC2，主流走 ASTC，UI 图集视清晰度需求单独权衡。',
  },
  { id: 132, category: '渲染与图形学', difficulty: 3, question: 'Mipmap 是什么？什么时候用、什么时候关？', points: [
    '预生成逐级缩小纹理：采样时按距离选合适层级，减少闪烁（moiré）与带宽',
    '3D 场景/地形基本都开；UI（1:1 采样）和 2D 精灵通常关掉，避免额外内存与模糊',
    '代价：多约 1/3 纹理内存；美术导入设置可改 Mipmap 开关与纹理大小限制',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给定义与收益：Mipmap 预生成逐级缩小的纹理层，采样时按距离选层，消除远处纹理闪烁并省带宽。用不用讲清：3D 场景与地形默认开；UI 与 2D 精灵按 1 比 1 采样时关掉，避免白白多占约三分之一纹理内存还变模糊。最后补工程入口：导入设置的 Mipmap 开关与限制纹理大小要按用途逐类配置。',
  },
  { id: 133, category: '渲染与图形学', difficulty: 3, question: '什么是阴影贴图（Shadow Map）？常见问题与改进？', points: [
    '从光源视角渲深度图，片元比较深度判断是否在阴影中；平行光用正交、点光用立方体贴图',
    '问题：自阴影（shadow acne）用深度偏移解决、边缘锯齿（peter panning）用 bias 调优、PCF 软阴影',
    '改进：级联阴影（CSM）近处高分辨率远处低、屏幕空间接触阴影（SSAO 思路）补充细节',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '原理一句话：从光源视角渲一张深度图，片元着色时比较自身深度与阴影图深度判定是否被遮挡。经典问题逐个给解法：shadow acne 用深度偏移、边缘漏光调 bias、锯齿用 PCF 软阴影。改进方案提两个高级项：级联阴影 CSM 让近处高分辨率远处低，屏幕空间接触阴影补细节。能提到 CSM 说明你做过真实阴影质量调优。',
  },
  { id: 134, category: '渲染与图形学', difficulty: 3, question: 'URP/SRP 相比内置管线的核心改进与迁移注意？', points: [
    'SRP Batcher 减少材质绑定、GPU Instancing 原生支持、单 Pass 正向渲染适配移动端、Shader 用 Shader Graph/URP 语法',
    '内置管线自定义 Shader 迁移需改：改用 SRP 宏与 CBUFFER、Multi_compile 变体减少、光照模式选择',
    '支持 Render Feature 做后处理/描边/URP 全屏；做性能分析时要看 Draw Call、SetPass Call 与带宽',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先说核心改进：SRP Batcher 与 GPU Instancing 大幅降 CPU 提交开销，单 Pass 正向渲染更适合移动端，Shader Graph 降低写 Shader 门槛，Render Feature 让后处理定制更灵活。迁移注意点要具体：内置 Shader 要改 SRP 宏与 CBUFFER 声明、变体要精简、光照模式要重选。最后提醒性能看 Draw Call、SetPass Call 与带宽三件套。',
  },
  { id: 135, category: 'UGUI', difficulty: 1, question: 'RectTransform 和 Transform 有什么区别？锚点/轴心如何影响 UI 布局？', points: [
    'RectTransform 继承 Transform，额外含 anchorMin/anchorMax/pivot/sizeDelta/anchoredPosition，用于相对父节点做自适应布局',
    '锚点决定子物体相对父物体的对齐基准（四角/拉伸），pivot 是自身旋转缩放与定位的原点，sizeDelta 在锚点收缩时是尺寸、拉伸时是偏移量',
    'UI 适配关键：锚点设对，不同分辨率下子物体自动跟随/拉伸，避免写死绝对坐标',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先答继承关系：RectTransform 是 Transform 的子类，多了 anchorMin、anchorMax、pivot、sizeDelta、anchoredPosition 这一整套。再逐个解释：锚点定子物体相对父级的对齐基准，pivot 是自身定位与缩放的中心，sizeDelta 在锚点收拢时表示尺寸、锚点拉伸时表示边距偏移。收口到工程价值：锚点设对才能在不同分辨率下自适应，写死绝对坐标是适配大忌。',
  },
  { id: 136, category: 'UGUI', difficulty: 1, question: 'UGUI 点击事件是怎么命中到 UI 的？EventSystem 和 Raycaster 起什么作用？', points: [
    'EventSystem 每帧轮询当前 Input 模块，把点击/拖拽派发给 Input System；GraphicRaycaster 把屏幕坐标转成射线对 Canvas 下 Graphic 做命中测试',
    '命中条件：Graphic 的 raycastTarget 开启、在有颜色的像素范围且 Canvas 上未被遮挡；先命中者收到事件，可用 EventSystem.current.RaycastAll 取完整命中链',
    'UI 挡住 3D 时：3D 用 PhysicsRaycaster，二者优先级由 EventSystem 内 Raycaster 顺序决定，可通过 Ignore Raycast 层级或两个独立 EventSystem 隔离',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '把链路拆开讲：EventSystem 每帧驱动输入模块，把点击转成射线事件；GraphicRaycaster 用屏幕坐标对 Canvas 下 Graphic 做命中测试，命中条件要 raycastTarget 开启且在可见像素内。再答 UI 与 3D 的冲突：3D 走 PhysicsRaycaster，两类射线命中结果在同一 EventSystem 里按 Raycaster 顺序裁决。隔离方案也提一句：需要 UI 永远吃掉点击时用 Ignore Raycast 或独立 EventSystem。',
  },
  { id: 137, category: 'UGUI', difficulty: 1, question: 'Canvas 的三种渲染模式（Screen Space Overlay / Camera / World Space）怎么选？', points: [
    'Overlay：永远绘制在最上层、无需相机，实现最简但无法与 3D 穿插、后处理难以作用于 UI',
    'Screen Space Camera：UI 挂在指定相机（常用主相机）的平面上，可与 3D 混合、支持后处理与模糊，性能略低',
    'World Space：UI 作为世界物体存在（血条、小地图、VR），受光照/深度影响；选错模式会导致层级错乱或无法被裁剪',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '三种模式各一句话再补取舍：Overlay 永远最上层，实现最简单，但无法和 3D 穿插、后处理覆盖不到 UI；Screen Space Camera 把 UI 放在指定相机近裁剪面上，能和 3D 混合也吃后处理，是通用主选；World Space 让 UI 成为世界物体，血条、小地图、VR 交互用它，受光照深度影响。补充提醒：模式选错会出现层级错乱或 UI 不被相机裁剪的问题。',
  },
  { id: 138, category: 'UGUI', difficulty: 2, question: 'CanvasScaler 做多分辨率适配的原理？刘海屏安全区怎么处理？', points: [
    'ScaleWithScreenSize 按参考分辨率缩放 UI，matchWidthOrHeight 在宽高比间插值；ConstantPixelSize 适合像素精确的 HUD',
    '同一 CanvasScaler 下所有子 Canvas 会叠加缩放，嵌套时需统一 Scale Factor 避免字体/尺寸失控',
    '安全区：用 Screen.safeArea 计算偏移给根节点加 SafeArea 组件或手动 set offset，避开刘海/圆角，横竖屏切换需重新计算',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先答 CanvasScaler 原理：ScaleWithScreenSize 按参考分辨率等比缩放，matchWidthOrHeight 在宽与高两个缩放因子间插值，应对不同宽高比；ConstantPixelSize 适合要像素级精确的 HUD。坑位提醒：子 Canvas 与根 CanvasScaler 叠加会把缩放乘起来，嵌套时统一 Scale Factor 才不失控。安全区处理给具体做法：读 Screen.safeArea 计算偏移，SafeArea 组件或手动设根节点 offset，横竖屏切换要重算。',
  },
  { id: 139, category: 'UGUI', difficulty: 2, question: 'UGUI 的图集与合批规则？什么情况会断批？', points: [
    'UGUI 按 Canvas 下的深度顺序动态合批：相邻且使用同一图集/字体的元素合成一个批次，共用材质与纹理',
    '断批原因：跨图集、中间插入不同材质/文本、顶点数过多、raycastTarget 不影响合批但层级穿插会造成批次切换',
    '优化：把界面按图集分块组织层级，避免两张图集交错排列；动态文字/单独材质放到独立 Canvas 减少整体重建',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给合批规则：UGUI 在 Canvas 内按渲染深度顺序尝试动态合批，相邻元素同图集同材质就能合成一批。断批原因点名：跨图集、中间插了不同材质或 TMP 字体、层级穿插破坏相邻性。优化两条主线：按图集把界面元素组织成连续区块避免交错；动态内容如聊天文字独立放一个 Canvas，减少拖累整屏重建。',
  },
  { id: 140, category: 'UGUI', difficulty: 2, question: 'Canvas 重建（Rebuild）发生在什么时候？为什么每帧改 UI 会卡？', points: [
    'Graphic 的 layout/顶点数据变更会标记脏，在 Canvas.willRenderCanvases 阶段执行 LayoutRebuild 与 GraphicRebuild（重新生成网格、提交合批）',
    '改文本内容/颜色/尺寸会触发整条层级链重建；元素越多、层级越深，Rebuild 越贵，且动态元素会把静态部分一起拖下水',
    '优化：动静分离（静态独立 Canvas 不每帧重建）、减少 SetDirty 调用、复用布局组件、用自定义网格或 TMP 预排版降低更新频率',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先答触发时机：Graphic 的属性或布局变化会标记脏，在 Canvas 即将渲染阶段做 LayoutRebuild 与 GraphicRebuild，重新生成网格并合批。为什么每帧改 UI 卡要讲透：改文本、颜色、尺寸会让该元素所在层级链整体重建，元素越多越贵，一个动态元素会把同 Canvas 的静态部分一起拖下水。优化给结论：动静分离、少触发脏标记、能预排版的别每帧排版。',
  },
  { id: 141, category: 'UGUI', difficulty: 2, question: 'LayoutGroup（水平/垂直/网格布局）的原理和性能坑？大量动态列表怎么优化？', points: [
    'LayoutGroup 在布局阶段根据子物体尺寸/间距计算位置与尺寸，任何子项变化都会触发整套布局重算',
    '坑：动态增删子物体反复触发布局、嵌套多层 LayoutGroup 指数级重算、ContentSizeFitter 参与循环约束会反复驱动重建',
    '大量列表优化：对象池复用 Item、开启池后手动调 LayoutRebuilder.MarkLayoutForRebuild 而非每帧增删、虚拟列表只实例化可视区 Item 并复用滑动偏移',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '原理一句话：LayoutGroup 在布局阶段按子项尺寸间距统一重算位置，任何子项变化都触发整套重算。性能坑报全：动态增删反复重算、多层嵌套指数放大、ContentSizeFitter 与约束循环驱动多次重建。列表优化给三板斧：对象池复用 Item、批量变更后手动 MarkLayoutForRebuild 一次触发、超长列表做虚拟化只实例化可视区 Item，滑动时按索引换数据不重建结构。',
  },
  { id: 142, category: 'UGUI', difficulty: 2, question: 'Mask 和 RectMask2D 的区别？为什么 RectMask2D 性能更好？', points: [
    'Mask 依赖模板缓冲（Stencil）：为子物体生成额外模板层与绘制批次，UI 层级越深模板开销越大；RectMask2D 用矩形范围做剔除，不写模板',
    'RectMask2D 只能矩形裁剪，Mask 支持任意形状（配合 Image 图形），但 Mask 会产生额外 Draw Call 且不能合批',
    '取舍：常规矩形列表/滚动裁剪用 RectMask2D，异形遮罩才用 Mask，并在遮罩内减少 UI 数量',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给实现差异：Mask 用模板缓冲裁剪，每个遮罩会引入模板层与额外批次，层级深模板开销累积；RectMask2D 用矩形范围做剔除，不写模板。能力边界讲清：RectMask2D 只能矩形，Mask 配任意图形可做异形遮罩。选型结论：矩形滚动与列表裁剪一律 RectMask2D，异形遮罩才上 Mask，且遮罩内 UI 数量要控制，因为模板绘制不参与合批。',
  },
  { id: 143, category: 'UGUI', difficulty: 3, question: '超长滚动列表（好友/背包/聊天）性能怎么优化？', points: [
    '不能实例化全部 Item：用对象池 + 视口内按需填充，Item 移出可视区即回收复用，只保活屏幕高度/Item 高度的少量实例',
    '配合 RectMask2D 裁剪 + 关闭离屏元素 raycastTarget，滑动时只更新位置与内容（文本/图标）避免整表重建',
    '虚拟列表需维护数据索引进退：滚动事件里重算首尾索引、复用 Item 的 SetData，避免频繁 Instantiate/Destroy 与 GC 抖动',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '核心思路一句话：绝不实例化全部 Item，用对象池加视口虚拟化，只保活刚好铺满可视区加少量缓冲的实例。滑动处理讲细：重算可视数据范围，移出视口的 Item 回收到池中，新进入的从池取并 SetData，文本图标按需更新，避免整表重建。配套优化：RectMask2D 裁剪、离屏元素关 raycastTarget、滚动中不触发 Layout 重建。最后点明收益：省内存、省 Instantiate 的卡顿与 GC 抖动。',
  },
  { id: 144, category: 'UGUI', difficulty: 2, question: 'TextMeshPro 相比老版 Text 好在哪里？为什么项目普遍要换 TMP？', points: [
    'TMP 用 SDF（有向距离场）字体渲染，缩放/旋转不模糊，支持描边、阴影、渐变色、富文本标签，效果远超位图字体',
    '性能：TMP 字体图集内字符自动打包、同类字重可合批；老版 Text 每帧按需重建字符网格且动态字体改字会重建整块 Canvas',
    '注意：TMP 图集溢出需扩容或分包、需要打图集动态字体供运行时文本（昵称/输入）使用，材质实例别滥用避免断批',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先答渲染原理差异：TMP 用 SDF 有向距离场，缩放旋转不糊，所以效果上限远高于位图字体。功能层面报亮点：描边、阴影、渐变、富文本标签开箱即用。性能是换 TMP 的核心理由：字符按需打包进图集、同字体同材质可合批；老版 Text 动态改字会重建字符网格甚至整块 Canvas。最后提醒 TMP 自己的坑：动态字体图集溢出要扩容分包、运行时文本要用动态字体资产、材质实例别乱建以免断批。',
  },
  { id: 145, category: 'C#基础', difficulty: 2, question: 'abstract 方法、virtual 方法、重写 override 的机制区别？', points: [
    'abstract 方法无实现，必须在非抽象子类 override；virtual 方法带默认实现，子类可选择 override；override 重写父类实现并参与多态分发',
    'abstract 成员只能存在于 abstract 类；类一旦有 abstract 方法就必须标 abstract，不能实例化；sealed 可封死重写链',
    '与接口默认方法对比：abstract 类能保存状态（字段）并提供模板方法骨架，适合“统一流程+子类填充细节”的模板模式',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给三词对照：abstract 是强制契约，没有实现，子类必须 override；virtual 是开放扩展点，有默认实现，子类可选 override；override 是真正改写并参与多态分发。规则细节别漏：abstract 成员只能在抽象类里、类有 abstract 方法必须标 abstract 且不能实例化、sealed 封死后续重写。最后与接口对比：抽象类能持有状态、能给模板方法骨架，适合统一流程加子类填细节的模板模式，接口只给契约。',
  },
  { id: 146, category: 'C#基础', difficulty: 3, question: 'Unity 项目里抽象类和接口分别适合什么设计场景？举个实战例子', points: [
    '抽象类：技能基类/角色基类——有公共字段（伤害、CD）与模板方法（施法流程固定、伤害计算可重写），把变化点留给子类',
    '接口：可交互（IInteractable）、伤害来源（IDamageSource）、事件监听——能力组合、跨继承树复用、便于测试 Mock 与解耦',
    '选型口诀：共享实现+状态用抽象类，契约+多实现组合用接口；结合对象池/工厂/状态机让派生类只写差异部分',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '建议直接用实战例子撑起答案：抽象类做技能基类或角色基类，公共字段与施法模板放父类，伤害计算等变化点留给子类 override；接口做 IInteractable、IDamageSource 这类能力契约，跨继承树组合、便于 Mock 与解耦。给完例子再补选型口诀：有共享实现与状态用抽象类，要契约与多实现组合用接口。收尾点题：配合对象池、工厂与状态机，让派生类只写差异，这是客户端框架设计的常态。',
  },

  // ============ C++ ============
  { id: 147, category: 'C++', difficulty: 1, question: 'C++ 指针和引用的区别？客户端面试里为什么常结合 const 引用一起问？', points: [
    '引用是对象的别名，必须初始化且不可改绑；指针可空可重绑，语义上更接近 C# 的引用但可指向空',
    '传参语义是考点核心：不想拷贝又不改实参用 const T&，与 C# 的 in/ref/readonly 思路一致；引擎与插件接口大量用 const 引用避免大对象拷贝',
    'C# 的引用类型本质像"带 GC 的指针"；理解 C++ 引用/指针能帮助理解 IL2CPP 生成的 C++ 代码与原生插件边界',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给本质区别三句话：引用是别名必初始化不可改绑、指针可空可重绑；再补传参工程结论：const T& 防拷贝、指针用于可空/重绑。加分点是主动对照 C#：引用类型底层像托管指针、in/ref 参数与 const T& 类似，能接住"Unity 客户端为什么也要懂 C++"的追问——因为 IL2CPP 与原生插件都在 C++ 边界上。',
  },
  { id: 148, category: 'C++', difficulty: 2, question: 'new/delete 与 malloc/free 区别？Unity 客户端在什么场景下会遇到 C++ 侧的内存管理？', points: [
    'new 分配+构造、delete 析构+释放，malloc/free 只管原始内存；new[]/delete[] 需配对',
    'C# 侧内存交给 GC，但 IL2CPP 原生堆、NativePlugin、AssetBundle 原生资源都在托管之外，需显式管理',
    '客户端实战：大量小对象频繁 new 会产生堆碎片与分配峰值，游戏常用对象池/帧分配器/自定义 operator new 控制',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先把 new/malloc 本质区别讲清，马上转到客户端场景：哪些内存不在 C# GC 管辖——IL2CPP 原生堆、Native 插件、纹理等 Native 资源句柄。再加一句反例：Unity 里 C# 对象池减少的是 GC 压力，而 C++ 侧的自定义分配器解决的是碎片与分配耗时，两者维度不同，能区分就说明你真处理过内存问题。',
  },
  { id: 149, category: 'C++', difficulty: 2, question: 'unique_ptr/shared_ptr/weak_ptr 与 C# 的引用类型相比，生命周期管理思路有什么不同？循环引用怎么破？', points: [
    'unique_ptr 独占所有权、shared_ptr 共享计数、weak_ptr 弱观察；C# 引用类型全靠 GC 可达性回收，无所有权概念',
    '循环引用：C++ 用 weak_ptr 断环；C# 侧 GC 能收集循环引用，真正泄漏常来自事件/委托未反注册等"可达但不需要"的引用',
    '工程对应：引擎 C++ 层资源多用 RAII/所有权归属管理，Unity 托管层靠生命周期显式释放（场景切换、Resources/AssetBundle Unload）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲 C++ 三种智能指针的所有权差异，再对比 C#：GC 不关心循环引用但关心"仍被引用"的对象——Unity 常见泄漏是静态字段/事件残留导致对象永远可达。加分点是落到 DontDestroyOnLoad、AssetBundle 引用计数等 Unity 生命周期话题，说明你不只背指针，还懂两种内存模型在客户端的实际坑。',
  },
  { id: 150, category: 'C++', difficulty: 2, question: '虚函数与虚表实现多态的底层原理？Unity 的 C# 多态和它是不是一回事？', points: [
    '含虚函数的类有虚表 vtable，对象带 vptr 指向所属类虚表，调用按实际类型间接跳转；代价是不能内联、多一次间接',
    'C# 的 virtual/override 底层类似虚方法表（vtable/接口调度），但方法经 JIT/IL2CPP 编译后同样走间接调用',
    '客户端场景：Update/组件回调、事件分发大量依赖多态调度；热路径上减少不必要的虚调用/接口调用可省分派开销，C# 可用 sealed 辅助去虚化',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲 C++ 虚表+vptr 的机制，主动回答"与 C# 是否一样"：C# virtual 也是虚表分发，接口是另一套表。加分点是落到客户端优化：Unity 每帧调用组件虚方法/接口有分派成本，热点路径用 sealed 让 IL2CPP 去虚化、用 struct+接口或函数指针替代——能讲出这套说明你优化过 Update 密集逻辑，而不是只会背虚表概念。',
  },
  { id: 151, category: 'C++', difficulty: 1, question: 'C++ 程序内存分区有哪些？对照 Unity Profiler 的 Managed/Native 内存，怎么定位客户端内存问题？', points: [
    '代码段/数据段/BSS/堆/栈五区：局部变量进栈、new 进堆、全局静态按初始化分数据段与 BSS、字符串常量只读',
    'Unity Profiler 分 Managed（C# 托管堆）与 Native（引擎/资源原生内存）：纹理、网格、Shader 走 Native，脚本对象走 Managed',
    '客户端定位思路：先看 Native 大块（贴图压缩/网格/Mesh）再查 Managed 泄漏（静态引用、事件未反注册），与 C++ 查堆泄漏思路互补',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '五区报完后直接切 Unity：Managed 堆是 C# 对象，Native 是引擎与资源内存，两者分开统计。面试官想听的是排查顺序：先用 Profiler 看是 Native 纹理堆积还是 Managed 持续增长，再分别用 Memory Profiler/资源引用工具定位。能说出"C++ 手动管堆、Unity 托管堆靠 GC，但 Native 资源仍要手动释放"就证明你懂边界。',
  },
  { id: 152, category: 'C++', difficulty: 2, question: '左值右值与移动语义：std::move 做了什么？游戏数据频繁拷贝为什么会卡？', points: [
    'std::move 只把左值转成右值引用让移动构造/赋值接管资源，不搬运数据；移动后源对象处于可析构/可赋值的有效空态',
    '游戏卡顿点：容器扩容、函数传参、返回大对象若走深拷贝会复制整块数据；正确用 move/返回值优化可省拷贝',
    '对照 Unity：C# struct 按值拷贝、class 按引用，大量 struct 列表排序/遍历也有拷贝成本；C++ 移动语义是主动控制"偷资源"的机制',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先破除误解：move 只是 cast，真正省拷贝的是移动构造把堆指针偷走。举客户端例子：vector<MeshData> 扩容、把大容器传进函数，没 move 就整段深拷贝造成帧尖刺。加分点是双向对照 C#：值类型拷贝开销与托管数组搬运问题类似，你在 Unity 侧用 struct 数组+Span 避免装箱拷贝，说明两种语言的内存模型你都熟练。',
  },
  { id: 153, category: 'C++', difficulty: 3, question: 'C++ 多线程同步有哪些手段？Unity Job System/Burst 的线程模型与之相比有何特点？', points: [
    'mutex/条件变量/atomic/信号量；atomic 适合计数器标志，锁保护临界区，死锁靠固定加锁顺序与超时规避',
    'Job System：主线程按依赖排布 Job，工作线程并行执行，天然避免手工加锁；Burst 编译为高效原生代码并做内存安全检查',
    '客户端要点：真并发写共享数据才需要同步；Job 间用依赖与 NativeContainer 传递数据、避免锁竞争，是"数据驱动并行"思路',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先答 C++ 同步手段的适用场景：原子变量管计数、锁管临界区、条件变量做生产消费。再讲 Job System 为什么不一样：它不是给你一把更好的锁，而是通过依赖关系把并行调度交给系统，从设计上消灭竞争。加分点是提 NativeContainer 的安全检查与 Allocator 选择，说明你理解"并行优先靠数据隔离而非同步"这条客户端多线程核心。',
  },
  { id: 154, category: 'C++', difficulty: 1, question: 'C++ const 的几种用法？对比 C# 的 readonly/const，客户端写代码时如何防意外修改？', points: [
    '顶层 const（指针本身不可改）与底层 const（所指对象不可改）；const 成员函数承诺不修改对象，mutable 是例外',
    'C# const 是编译期常量、static readonly 是运行期只读字段；in/ref readonly 参数可表达"只读引用传参"',
    '工程意义：引擎/插件 API 用 const 声明入参只读，避免大对象拷贝与意外修改；与 C# 用 readonly/不可变数据结构控制副作用同理',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先分清顶层/底层 const 与 const 成员函数，再对照 C#：const 编译期替换、readonly 运行期只读，in 参数近似 const T&。加分点是讲工程实践：客户端做配置/数据表读取时用只读接口与不可变包装，多线程下更安全——把语法问题上升到代码设计，面试官会认可。',
  },
  { id: 155, category: 'C++', difficulty: 2, question: 'C++ static 关键字的作用？Unity 里滥用静态字段会有什么问题？', points: [
    '函数内 static 局部变量生命周期到程序结束且只初始化一次；类内 static 成员属于类；文件级 static 限内部链接',
    'Meyers Singleton 用函数内 static 延迟初始化并保证线程安全，是 C++ 单例惯用法',
    'Unity 对照：静态字段跨场景存活，存场景对象/大资源会造成"泄漏"式常驻；客户端单例要控制生命周期与场景切换清理',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先答 static 三场景（局部/类内/文件级），再抛 Meyers 单例说明 C++ 处理全局初始化顺序的惯用法。加分点是 Unity 的坑：static 字段不随场景卸载，存了 GameObject 或大资源就常驻到进程结束；用静态单例要自己管 Reset/场景切换，最好用 ScriptableObject 或服务定位并显式清理——面试官一问"静态字段为什么泄漏"就能接住。',
  },
  { id: 156, category: 'C++', difficulty: 2, question: 'vector 扩容与迭代器失效？游戏帧内为什么要避免频繁 List/vector 扩容？', points: [
    'vector 连续内存、容量不足按 1.5~2 倍扩容并搬移元素；扩容后所有迭代器/指针/引用失效，insert/erase 后其后失效',
    'C# List 同样数组扩容，扩容是分配+拷贝，密集调用会造成 GC 分配与帧尖刺；预估容量用 Capacity/Capacity 预分配（C++ reserve）',
    '客户端选型：帧内高频增删用对象池+预分配；需要频繁头插用链表/队列结构；Unity 侧可用 NativeList/ArrayPool 减少分配',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '讲扩容机制（增长因子+搬移）与迭代器失效范围后，马上转客户端：C# List 扩容在 Update 里高频出现就是 GC 分配源，养成 reserve/Capacity 预分配习惯。加分点是提对象池与 NativeList：帧内临时容器用池化或非托管容器，避免每帧产生垃圾——这是 Unity 性能面试常考点，结合 C++ vector 一起答会显得体系完整。',
  },
  { id: 157, category: 'C++', difficulty: 2, question: 'map/unordered_map 底层实现？Unity 里 Dictionary 查找很快吗，客户端查找结构怎么选型？', points: [
    'map 红黑树有序 O(log n)；unordered_map 哈希平均 O(1) 最坏 O(n)，需自定义 hash；两者都是节点/桶式布局',
    'C# Dictionary 底层哈希表（桶+链表/开放寻址），GetHashCode 质量差或负载高会退化；元素少时线性数组因缓存命中反而更快',
    '客户端选型：几千内小集合用数组/List 线性查找或排序后二分；配置查表用 Dictionary 预建；追求缓存友好可 SoA/连续数组',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲 C++ 两种容器底层与复杂度，再对照 C# Dictionary 的哈希实现。真正加分点是客户端选型经验：查找量小用线性数组反而快（缓存友好），大表才上哈希，且 key 的 GetHashCode 别用默认反射实现；能举"技能/物品配置用 Dictionary<int,...> 预烘焙"与"帧内高频查找避免字典"就算答出工程深度。',
  },
  { id: 158, category: 'C++', difficulty: 2, question: '深拷贝浅拷贝与拷贝/移动构造时机？C# 的 struct 与 class 在拷贝语义上和 C++ 有何异同？', points: [
    '浅拷贝只复制成员值，指针成员会双释放；深拷贝复制内容；拷贝构造走初始化、拷贝赋值走已存在对象、移动接管资源',
    'C++ Rule of Three/Five：自定义析构/拷贝/赋值通常三者（五者）成套；用 unique_ptr 成员可让编译器代管',
    'C# 对照：struct 按值复制（类似 C++ 值语义，但成员含 class 时只拷引用=浅拷贝）、class 按引用共享；理解后可解释 Unity struct 陷阱',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲 C++ 深浅拷贝与三/五法则，再对照 C#：struct 整体按值拷贝但里面 class 字段只拷引用，容易误当"深拷贝"用。加分点是 Unity 实际案例：把含 class 引用的大 struct 存数组或跨协程传递，改的可能是共享对象；AnimationCurve/List 字段在 struct 里的拷贝行为也是常见面试坑，能举出来就证明踩过。',
  },
  { id: 159, category: 'C++', difficulty: 3, question: '模板与泛型的区别？为什么 IL2CPP 下 Unity 泛型会有 AOT/裁剪限制，客户端热更方案怎么绕？', points: [
    'C++ 模板编译期实例化、可特化偏特化、零成本但无运行时类型信息；C# 泛型运行时/JIT 实例化、有类型安全与泛型缓存',
    'IL2CPP 把泛型编译为原生代码，运行时 new 泛型（反射创建、AOT 未实例化组合）会抛 ExecutionEngineException/裁剪丢失',
    '热更方案：代码热更（HybridCLR 补充元数据/AOT 泛型）或脚本层热更（Lua/JS）；泛型代码要避免运行时实例化新组合',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '答模板与泛型的核心差异：一个编译期文本展开、一个运行期带类型实例化。落点是客户端真实痛点：IL2CPP AOT 下泛型方法用反射或新组合调用会崩，HybridCLR 本质是补充 AOT 元数据与泛型共享；面试里能讲清"热更代码里慎用运行时泛型"比背模板特化更有价值。',
  },
  { id: 160, category: 'C++', difficulty: 2, question: 'RAII 是什么？在引擎资源管理与原生插件（Native Plugin）开发中怎么用？', points: [
    'RAII：资源绑定对象生命周期，构造获取、析构释放；异常/提前 return 也能自动清理，是 C++ 资源管理基石',
    '典型：lock_guard 管锁、智能指针管堆、文件/网络句柄；图形 API（Vulkan/D3D12）对象创建释放繁琐，常用 RAII 包装',
    'Unity 原生插件：用 C++ 创建纹理/网格等句柄，通过 C# 侧封装管理生命周期，配合 Unity 回调（如 OnDestroy）释放，避免泄漏',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先定义 RAII 一句话，给锁/内存/句柄的典型场景。加分点是讲原生插件实践：你在 C++ 侧 RAII 包装 GPU/引擎资源，导出给 C# 用，并说明 Unity 纹理等 Native 资源要显式释放（Destroy/Release）而非等 GC——把 RAII 与 Unity 生命周期管理打通，是客户端岗位的加分回答。',
  },
  { id: 161, category: 'C++', difficulty: 2, question: 'C++ 内存泄漏怎么定位？Unity 客户端常见的"内存泄漏"和 C++ 传统泄漏有什么不同？', points: [
    '定位手段：Valgrind/LSan/ASan、VS CRT 报告、自定义分配器统计；预防靠智能指针与 RAII',
    'Unity 客户端"泄漏"多为：静态字段/事件残留让对象不可达但常驻、AssetBundle/Resources 未卸载、纹理网格未 Destroy',
    '两者本质：C++ 泄漏是"忘释放"，Unity 托管泄漏是"GC 可达但业务上该释放"；用 Memory Profiler 抓快照对比能定位',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先给 C++ 泄漏定位三板斧：ASan/LSan、分配器计数、代码评审习惯。重点讲 Unity 泄漏的特殊性：GC 会回收但静态引用/事件监听让它永不回收，Assets 没 Unload 也占 Native 内存。加分点是具体流程：Memory Profiler 抓两张快照对比、找增长引用链，说明你有过真实线上内存问题排查经验。',
  },
  { id: 162, category: 'C++', difficulty: 3, question: '多继承与菱形继承问题？Unity 的组件式架构为什么避免了这类 C++ 复杂度？', points: [
    '多继承下多个直接基类各有 vptr/vtable、this 需偏移调整；菱形继承产生重复子对象，需虚继承合并，布局与调用更复杂',
    '游戏引擎 C++ 层（如部分老引擎）用多重/虚继承曾带来复杂度，现代方案倾向组合：GameObject 挂 Component 列表',
    'Unity 即组合式：行为通过 AddComponent 组合而非继承树；C# 单继承+接口，接口多实现无菱形问题，代码更可预测',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲多继承布局（每基类一份 vptr、this 调整）与菱形+虚继承的代价，结论是工程上尽量规避。加分点是把它引到架构对比：Unity 组件式组合、C# 单继承+接口，天然规避 C++ 多继承复杂度；能解释"为什么引擎喜欢组合胜过深继承"就说明你不是背语法而是理解对象模型设计。',
  },
  { id: 163, category: '计算机组成原理', difficulty: 1, question: '冯·诺依曼体系结构五大部件？对理解 CPU 与 GPU 的分工有什么帮助？', points: [
    '运算器/控制器/存储器/输入/输出五大部件，核心是存储程序：指令数据同存、逐条取指执行',
    'CPU 是少量强核串行+乱序优化，适合逻辑分支；GPU 是海量弱核并行，适合顶点/像素这类数据并行任务',
    '客户端视角：Unity 渲染把 CPU 准备好的数据（网格/变换/命令）交给 GPU 并行处理，理解分工才能判断瓶颈在 CPU 还是 GPU',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '报五大部件与存储程序思想后，立刻拉高到 CPU/GPU 分工：CPU 重控制流、GPU 重数据并行。面试官问这个通常想听你怎么做性能分析——Unity Profiler 里看"CPU 主线程/渲染线程"与"GPU 时间"，瓶颈在哪边优化手段完全不同：CPU 限就减 DrawCall/合批与逻辑开销，GPU 限就降分辨率/Shader 复杂度。能串起来就赢了。',
  },
  { id: 164, category: '计算机组成原理', difficulty: 2, question: '存储层次为什么分级？"缓存友好的游戏代码"具体指什么？', points: [
    '寄存器-Cache-内存-磁盘：速度与成本矛盾，靠局部性让高层命中率提升整体性能',
    '缓存友好代码：顺序访问连续内存、结构紧凑少指针跳跃、热数据放一起；AoS/SoA 布局影响 Cache 行利用率',
    'Unity 侧例子：Transform/组件数组连续存储、粒子/单位属性用结构数组、避免链表与散列堆遍历，ECS（DOTS）正是缓存友好设计',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲金字塔与局部性原理，核心落点是"缓存友好"。给两个具体手段：连续内存顺序访问、减少指针追逐。加分点是举 Unity 例子：普通 GameObject 组件散落内存访问慢，DOTS/ECS 把同类型组件放连续 chunk 里就是 Cache 优化；面试官问"为什么 ECS 快"你就能从缓存角度答出底层原因。',
  },
  { id: 165, category: '计算机组成原理', difficulty: 3, question: 'Cache 的映射方式与替换策略？游戏大数据结构设计要怎么配合 Cache？', points: [
    '直接映射/全相联/组相联的取舍：组相联是工程折中，现代 CPU 普遍 n 路组相联+伪 LRU',
    '设计配合：把热点数据连续排列让访存落进少数组、避免同一组频繁冲突；步长访问会浪费缓存行',
    '客户端实例：批量单位更新若按列表连续遍历比随机访问 GameObject 快得多；多线程分区数据避免争用同一缓存行',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '把三种映射的"放哪/查多快/冲突多大"讲清，结论是现代 CPU 组相联。工程落点是数据结构设计：连续数组遍历、注意访问步长、冲突别太刻意。加分点是伪共享（多线程写同一缓存行导致行迁移）——Unity Job 里各线程写不同数组元素但若同行也会互相拖慢，按缓存行对齐/分区可解决，能讲出这层就是高级答案。',
  },
  { id: 166, category: '计算机组成原理', difficulty: 3, question: '缓存一致性 MESI 是什么？多线程游戏代码里"伪共享"为什么慢？', points: [
    '多核各自缓存副本，写共享数据需协议同步（写失效），MESI 四状态管理行状态',
    '伪共享：不同线程写不同变量但落在同一缓存行，行频繁失效迁移，性能远低于预期',
    '客户端对策：热点计数按线程分区、结构 padding 对齐到缓存行（DOTS chunk、Job 并行数据分布都考虑这点）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲为什么需要一致性（多核副本分歧）与写失效机制，别逐状态背。核心考点是伪共享：两个线程写相邻变量同缓存行=互相拖慢。加分点是给 Unity 实例：多个 Job 并行写 NativeArray 不同区间，若元素小且密集可能触发伪共享；按缓存行大小分组或 padding。能现场画出"行迁移"模型，说明你深入读过并发性能问题。',
  },
  { id: 167, category: '计算机组成原理', difficulty: 3, question: '指令流水线、分支预测与游戏热路径有什么关系？', points: [
    '流水线把取指/译码/执行/访存/写回并行，理想 IPC≈1；数据冒险靠转发、控制冒险靠分支预测，预测失败要冲刷',
    '游戏代码大多分支密集（逻辑判断、状态机），热路径上难以预测的分支会让流水线反复冲刷',
    '客户端优化：热点循环减少难以预测分支（用查找表/分支拆分）、数据驱动把分支换成查询，配合 Burst 的编译优化',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '讲清流水线三个阶段与分支预测失败代价后，落到客户端：Update 里频繁 if 但走向随机的逻辑会损失流水线效率。加分点是具体手法：把 AI/技能选择的分支用配置表/查找表表达、热点计算尽量写成可预测的线性路径、让 Burst 能向量化；面试官问你"Burst 为什么能快"时，流水线与分支预测是底层答案之一。',
  },
  { id: 168, category: '计算机组成原理', difficulty: 1, question: '大小端字节序是什么？游戏存档与网络同步为什么会踩字节序的坑？', points: [
    '大端高字节存低地址、小端低字节存低地址；x86/ARM 主流小端，网络字节序规定大端',
    '跨平台存档：直接二进制写 int/float 在 PC 与手机字节序不同会读错，需统一转换或用可移植格式',
    'Unity 客户端：C# BitConverter/BinaryWriter 用小端；与 C++ 服务器或原生模块联调网络包、文件格式必须约定字节序',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '一句话讲清大小端定义与判断方法。重点答"为什么游戏会踩"：PC/主机/手机都小端，但网络协议与某些文件格式按大端或自定义序；Unity 导出自定义二进制存档、与 C++ 服务端通信时没统一序就解析错乱。加分点是给解法：自定义存档用明确序的读写辅助、网络协议统一 htonl/ntohl，说明你写过跨端数据通道。',
  },
  { id: 169, category: '计算机组成原理', difficulty: 2, question: '浮点数 IEEE754 表示？Unity 里浮点精度问题会造成哪些实际 bug？', points: [
    '符号位+指数+尾数，0.1 等小数二进制无限循环只能近似，比较浮点要用容差（Mathf.Approximately）',
    '大坐标远离原点精度下降：超大世界坐标的顶点抖动（float 精度不足），大世界常用原点重置/分块',
    '客户端其它坑：时间累加误差、物理微小量漂移、UI 数值显示四舍五入；需要精确时用定点数/int 或 decimal',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先讲 IEEE754 结构与"为什么 0.1+0.2≠0.3"。然后是客户端高频坑：大地图坐标远离原点精度崩坏——float 在 10^5 距离上精度只剩毫米级，表现是物体抖动，解法是分块/原点跟随重置；再补动画/物理里浮点累加误差。能主动举例说明你处理过真实精度 bug，而不仅会背结构。',
  },
  { id: 170, category: '计算机组成原理', difficulty: 2, question: '为什么整数用补码表示？游戏数值计算里整数溢出会造成什么问题？', points: [
    '补码把减法统一成加法、0 唯一、范围比原码多一个负数 [-2^(n-1), 2^(n-1)-1]',
    '溢出是静默回绕：伤害/金币/时间戳用 int 累加可能变负或跳变；Unity Time 用 float 也有精度问题、帧计数大数注意',
    '客户端防范：关键数值用 long/checked/合理上限；网络同步的计数器、存档版本号注意位数与回绕',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '答补码三点好处后直接给溢出案例：伤害计算 int 相乘溢出、在线时长用 int 秒数回绕、时间戳 2038 问题。Unity 里 Random 种子、帧计数、存档版本都可能踩。加分点是解法：用 long 存大数、算术前判范围、C# 可开 checked；说明你有数值安全审查意识，而不是只会背补码公式。',
  },
  { id: 171, category: '计算机组成原理', difficulty: 2, question: '中断与轮询的区别？游戏客户端的异步加载/IO 与主线程帧节奏怎么配合？', points: [
    '中断是设备主动通知 CPU（请求-保存现场-查向量表-处理-恢复）；轮询是 CPU 主动查状态，简单但浪费',
    '客户端类比：加载大资源若在主线程同步等 IO 会卡帧；正确做法是异步加载/子线程读盘，完成回调回到主线程',
    'Unity 具体：Addressables/AssetBundle 异步加载、协程/async 等待不是真并行但避免阻塞主线程；IO 完成类似"中断通知"',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先答中断五步流程与轮询对比：低频设备中断省 CPU、高频大批量用 DMA。落点是客户端 IO：同步 Resources.Load 大包卡主线程，异步加载让 IO 在后台进行，加载完成回调再回主线程（类似中断通知）。加分点是提 Addressables 依赖加载、加载队列与帧预算控制，说明你理解"别让主线程等慢设备"这条原则。',
  },
  { id: 172, category: '计算机组成原理', difficulty: 2, question: 'DMA 是什么？游戏资源加载和纹理上传里哪些地方在跟"数据搬运"较劲？', points: [
    'DMA 控制器在内存与外设间直接搬数据，CPU 只配置与收尾，传输中可干别的；适合磁盘/网卡大块传输',
    '客户端类似瓶颈：磁盘读 AssetBundle 是 IO 带宽问题、纹理上传 CPU→GPU 走 PCIe 带宽、显存带宽决定渲染吞吐',
    '优化方向：压缩资源减少搬运量（ASTC/ETC2 贴图、LZ4 AssetBundle）、异步+预加载隐藏延迟、mipmap 减少显存带宽压力',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '把 DMA 概念（CPU 配置、控制器搬运、完成中断）讲清后立刻类比客户端数据搬运瓶颈：磁盘 IO、CPU→GPU 上传、显存带宽三处。加分点是给优化组合拳：贴图用 ASTC 压缩既省包体又省带宽、AssetBundle 用 LZ4 支持随机读、大纹理 mipmap 与 Streaming 降带宽——能把硬件 DMA 思路翻译成资源加载策略是高级答法。',
  },
  { id: 173, category: '计算机组成原理', difficulty: 3, question: '虚拟内存、分页与 TLB 是什么？游戏大地图加载为什么会"卡一下"？', points: [
    '虚拟内存让进程有独立连续地址空间，MMU 查页表映射物理页；缺页触发异常从磁盘换入',
    'TLB 是页表缓存，命中才快；触页（page fault）代价极高，随机访问大文件映射会连续缺页',
    '客户端实例：大地图/大关卡首次触碰大量未驻留数据会掉帧；mmap/内存映射文件或异步预取能摊平缺页开销',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '讲清虚拟内存→页表→缺页→TLB 链条，指出缺页是隐藏性能杀手。落点客户端：进入新场景访问大量首次加载数据，OS 缺页换入造成瞬时卡顿，Profiler 里表现为 CPU 时间突刺但函数调用不明显。加分点是解法：分帧预加载/流式加载、用 Addressables 提前加载周边区块、避免一次性 mmap 大文件后随机扫——能把"卡顿"归因到缺页，很显功力。',
  },
  { id: 174, category: '计算机组成原理', difficulty: 2, question: '进程地址空间如何布局？拿到原生崩溃日志（野指针/栈溢出）怎么读？', points: [
    '高地址到低地址：内核、栈（向下增长）、共享库、堆（向上增长）、BSS、数据段、代码段',
    '野指针=访问无效地址（空/已释放），栈溢出=递归过深或超大局部数组；崩溃日志给出崩在哪个地址与调用栈',
    'Unity 客户端：Android tombstone/iOS crash 报告里看 signal（SIGSEGV/SIGABRT）与回溯栈；原生插件崩溃常因指针越界/释放后使用',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '报地址空间布局后马上接崩溃分析：SIGSEGV 一般是野指针/越界，栈回溯能定位到崩溃函数。加分点是讲 Unity 实战：接入 CrashSDK（Bugly/Firebase）收集 native 崩溃，把符号化后的栈对应到插件代码；能区分托管异常与原生崩溃、会看 tombstone 的寄存器与栈，说明你真修过线上崩溃。',
  },
  { id: 175, category: '计算机组成原理', difficulty: 2, question: 'CPU 时间 = 指令数 × CPI × 时钟周期 如何指导游戏性能优化？', points: [
    '性能公式：CPU 时间=指令数×CPI×周期；优化分别从算法减指令数、代码质量降 CPI、主频固定不能动',
    'Unity Profiler 定位：CPU 瓶颈看主线程/渲染线程耗时，热点函数里指令数与分支、缓存、分配都是 CPI 来源',
    '客户端常用手段：算法换数据驱动减指令、Burst/SIMD 同时降指令数与 CPI、避免每帧重复计算（缓存结果）',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '写出公式并说优化三路径：减指令数（算法）、降 CPI（缓存/分支）、周期由硬件定。落点是 Profiler：看到某函数 CPU 高，先问是指令太多还是缓存/分支太差——排序、查找这类热点换算法收益最大。加分点是提 Burst：既是编译器优化又启用 SIMD，指令数与 CPI 一起改善；能把公式对应到工具数字，证明你真的做过帧优化。',
  },
  { id: 176, category: '计算机组成原理', difficulty: 3, question: '总线/显存带宽怎么算？为什么贴图压缩（ASTC/ETC2）能同时省包体和提升帧率？', points: [
    '带宽=位宽×频率×每周期传输次数；GPU 渲染要从显存读纹理/顶点，带宽不足就成瓶颈',
    '未压缩 RGBA 每像素 4~8 字节，压缩格式每像素 0.5~1 字节：省显存、省带宽、加载快',
    'Unity 实践：移动端用 ASTC/ETC2（避免 RGBA32）、mipmap 让远处采样小图、减少 overdraw 与超大纹理滥用',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '先口算带宽公式展示会算，再点出"渲染瓶颈常是带宽而非算力"。核心落点是贴图压缩：ASTC 按块压缩可调比特率，比 RGBA32 少读好几倍数据，帧率与显存双赢。加分点是补 mipmap 与 Streaming 策略、UI 图集与 NPOT 注意事项，说明你优化过移动端渲染内存而不只是背压缩格式名。',
  },
  { id: 177, category: '计算机组成原理', difficulty: 2, question: '结构体内存对齐的原因与规则？客户端网络消息/序列化结构为什么必须显式处理布局？', points: [
    'CPU 按字访问，对齐字段一次读全；编译器自动 padding，成员顺序影响结构体大小',
    '跨平台网络消息/存档：C++ struct 直接 memcpy 发送会因 padding 与字节序不一致导致解析错乱，需显式打包或逐字段序列化',
    'Unity 客户端：自定义二进制协议常用显式布局（byte 数组/位拼接）或 MessagePack/Protobuf 等序列化库规避对齐差异',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '答对齐两个原因（访存效率+原子性）与 padding 规则后，重点是工程坑：跨端直接 memcpy struct 会带上 padding 垃圾、字节序不一致，必须显式打包。加分点是客户端经验：自定义存档用逐字段写入、网络协议用 Protobuf/MemoryPack 等成熟方案，且注意 [StructLayout] 与 Pack 参数——能讲清"为什么不能直接结构体转字节流"就证明你写过跨端传输。',
  },
  { id: 178, category: '计算机组成原理', difficulty: 1, question: 'RISC 与 CISC 的区别？为什么 Unity 手游主要面向 ARM（RISC）平台？', points: [
    'CISC 指令复杂变长、x86 代表；RISC 指令精简定长、load/store 架构、ARM 代表；现代 x86 内核把指令译成微操作（类 RISC）',
    'ARM 低功耗高效，统治手机/平板/主机（Switch 等），是 Unity 主要目标平台；iOS 强制 ARM，Android 主流 ARM',
    '客户端意义：ARM 生态的 AOT（IL2CPP）、指令集差异（NEON/SIMD）影响 Burst 优化效果；了解架构便于分析真机性能',
  ],
  /** 面试话术：追问方向 / 组织答案 / 加分落点 */
  talk: '对比两派设计哲学后给关键洞察：现代 x86 也是 RISC 微操作内核。落点是移动端：Unity 手游跑在 ARM 上，IL2CPP 产原生码、Burst 可用 NEON/SIMD；面试官问架构是想看你对目标平台有认知。加分点是能说出 iOS 模拟器/真机架构差异、Android 各 SoC 指令集差异对性能分析的影响，体现真机调优经验。',
  },
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
  'UGUI',
  '协程与异步',
  '渲染与图形学',
  '资源与内存',
  '物理与碰撞',
  '计算机网络',
  '数据结构',
  '热更与工程',
  '网络与同步',
  '架构与设计模式',
  'C++',
  '计算机组成原理',
]
