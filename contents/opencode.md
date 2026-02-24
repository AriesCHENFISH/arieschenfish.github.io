一、开始
1.1 查看README.md
OpenCode 是一个开源的 AI 编程助手，可以在终端或桌面应用中运行
把 LLM 包装成可插拔的 Agent
OpenCode 采用客户端/服务器（C/S）架构，但这个“服务器”默认就运行在你的本机。它不是一个远程服务，而是一个本地进程

OpenCode 内置两种 Agent，可用 Tab 键快速切换：
* build - 默认模式，具备完整权限，适合开发工作
* plan - 只读模式，适合代码分析与探索
    * 默认拒绝修改文件
    * 运行 bash 命令前会询问
    * 便于探索未知代码库或规划改动


另外还包含一个 general 子 Agent，用于复杂搜索和多步任务，内部使用，也可在消息中输入 @general 调用。
1.2 查看AGENT.md（可忽略）
（1）适配Agent开发的流水线优化
1. 并行化优先原则：明确要求“ALWAYS USE PARALLEL TOOLS WHEN APPLICABLE”，最大化利用计算资源；
2. 自动化无确认执行：能自动完成的操作（如SDK构建、测试）无需人工确认，仅在缺失关键信息/有安全风险时介入；
3. 分支管理规范：默认分支为dev，本地无main分支时统一用dev/origin/dev做代码对比，规避协作混乱。

报告价值与Agent开发适配性
* 这是「工程化落地能力」的关键体现：Agent开发涉及多模块（SDK生成、模型推理、工具调用、数据处理），并行化可直接提升多任务流水线效率（比如并行测试不同Agent的能力分支、并行构建多版本Agent API SDK）；
* 自动化原则可迁移到Agent的迭代流程中（如自动生成Agent的交互SDK、自动回归测试Agent核心意图识别能力），减少人工干预的低效环节；
* 清晰的分支规范能解决多团队协作开发Agent时的版本冲突问题（比如dev分支迭代核心逻辑、release分支发布稳定版本），尤其适合Agent从原型到规模化落地的阶段。

（2）TypeScript类型安全实践（调研报告核心亮点：保障Agent逻辑的鲁棒性）
1. 严格禁用any类型，依赖TS自动类型推断，仅在导出/类型模糊时加显式注解；

Agent开发的核心痛点是「输入输出类型复杂」，用户指令解析、模型响应结构化等等，禁用any+类型守卫能大幅降低“类型不匹配导致的Agent行为异常”，比如避免Agent把字符串指令误判为数字参数；
2. 数组过滤时使用「类型守卫」，保证下游代码的类型推断准确性；

Agent迭代节奏快，过度的显式类型注解会增加冗余，此实践可兼顾快速迭代与逻辑鲁棒性；
3. 优先通过逻辑预判规避异常，而非依赖try/catch捕获。

可直接迁移到Agent的异常处理中
（3）简洁可维护的编码范式
1. 变量/函数优先单单词命名，单次使用的值直接内联（减少冗余变量）；
2. 避免else语句，优先提前返回（降低代码嵌套）；
3. 逻辑尽量内聚在单个函数，仅需复用/组合时拆分。

报告价值与Agent开发适配性
* Agent的核心逻辑需要高可读性，单单词命名+提前返回能降低多团队维护成本（新人可快速理解Agent的核心流程）；
* 减少冗余变量、函数内聚的规范，能适配Agent快速迭代的特点（比如新增Agent的“多轮对话记忆”能力时，无需重构大量冗余代码）；
* 对比传统“过度拆分函数”的做法，此范式更贴合Agent的业务逻辑（Agent核心流程线性化程度高，内聚函数更易调试）。

（4）技术选型倾向
优先使用Bun API（如Bun.file()）而非Node.js原生API。
报告价值与Agent开发适配性
Bun是高性能JS运行时，相比Node.js有更快的文件IO、启动速度：
* 可提升Agent的冷启动速度（对云原生部署的Agent至关重要）；
* 优化Agent读取本地配置文件、缓存模型响应的效率，适配高并发的Agent交互场景。


二、快速上手
2.1  环境准备
OpenCode 本质上是一个运行在本地的程序，它需要依赖 Node.js 环境
前往 Node.js 官网 （http://nodejs.org/) 下载 LTS 版本
输入以下命令检查：
chenxi@chenxideMacBook-Pro my_coding % node -v
v24.13.0
chenxi@chenxideMacBook-Pro my_coding % npm -v
11.6.2
2.2 安装与使用open code
curl -fsSL https://opencode.ai/install | bash
完成后输入opencode
[图片]
配置好api后选择对应provider，即可测试命令：
测试build模式
[图片]
自动进行测试运行
[图片]
测试plan模式：
[图片]
输出计划如下：
基于我的分析，我为你制定一个详细的单元测试添加计划：
阶乘程序单元测试添加计划
1. 项目现状分析
- 当前代码: factorial.py 包含两个阶乘实现（迭代和递归）
- 测试框架: 项目中主要使用自定义测试脚本，无标准测试框架
- Python环境: 已确认 unittest 可用，pytest 需要安装
2. 测试策略选择
选项A: 使用 unittest（Python标准库）
- ✅ 无需额外安装
- ✅ 与Python环境完全兼容
- ✅ 语法规范，易于维护
- ❌ 语法相对繁琐
选项B: 使用 pytest（第三方库）
- ✅ 语法简洁，Pythonic风格
- ✅ 丰富的插件生态
- ✅ 更好的错误报告
- ❌ 需要安装依赖
推荐: 鉴于项目简单性和零依赖要求，建议使用 unittest
3. 详细实施步骤
阶段1: 创建测试文件结构
my_coding/
├── factorial.py          # 现有代码
└── test_factorial.py     # 新建测试文件
阶段2: 编写测试用例
测试覆盖范围:
1. 基础功能测试
   - 0! = 1
   - 1! = 1
   - 5! = 120
   - 10! = 3628800
2. 边界情况测试
   - 负数输入 → ValueError
   - 浮点数输入 → TypeError（可选）
3. 实现一致性测试
   - 迭代 vs 递归结果一致性
   - 大数测试（如 20!）
4. 性能测试（可选）
   - 递归深度限制测试
   - 执行时间对比
阶段3: 测试文件模板
import unittest
import sys
import time
from factorial import factorial, factorial_recursive
class TestFactorial(unittest.TestCase):
    # 基础功能测试
    def test_factorial_zero(self):
        self.assertEqual(factorial(0), 1)
        self.assertEqual(factorial_recursive(0), 1)
    
    def test_factorial_one(self):
        self.assertEqual(factorial(1), 1)
        self.assertEqual(factorial_recursive(1), 1)
    
    def test_factorial_five(self):
        self.assertEqual(factorial(5), 120)
        self.assertEqual(factorial_recursive(5), 120)
    
    # 边界情况测试
    def test_negative_input(self):
        with self.assertRaises(ValueError):
            factorial(-1)
        with self.assertRaises(ValueError):
            factorial_recursive(-1)
    
    # 实现一致性测试
    def test_implementations_consistency(self):
        for n in range(0, 10):
            with self.subTest(n=n):
                self.assertEqual(
                    factorial(n),
                    factorial_recursive(n),
                    f"Implementations differ for n={n}"
                )
    
    # 大数测试
    def test_large_number(self):
        self.assertEqual(factorial(10), 3628800)
    
    # 性能测试（可选）
    @unittest.skip("Optional performance test")
    def test_performance_comparison(self):
        n = 100
        start = time.time()
        factorial(n)
        iterative_time = time.time() - start
        
        start = time.time()
        factorial_recursive(n)
        recursive_time = time.time() - start
        
        print(f"\nPerformance comparison for n={n}:")
        print(f"  Iterative: {iterative_time:.6f}s")
        print(f"  Recursive: {recursive_time:.6f}s")
if __name__ == '__main__':
    unittest.main(verbosity=2)
阶段4: 运行和验证
# 运行所有测试
python3 -m unittest test_factorial.py -v
# 运行特定测试类
python3 -m unittest test_factorial.TestFactorial -v
# 运行单个测试方法
python3 -m unittest test_factorial.TestFactorial.test_factorial_five -v
4. 扩展选项
选项A: 最小化实现
- 只包含基础功能测试
- 忽略性能测试
- 保持代码简洁
选项B: 完整测试套件
- 添加文档字符串测试
- 添加类型提示测试
- 添加异常消息验证
- 添加性能基准测试
选项C: 集成到现有项目
- 创建 tests/ 目录
- 添加 __init__.py
- 配置测试运行脚本
5. 质量保证措施
1. 测试覆盖率: 确保所有代码路径都被测试
2. 错误处理: 验证异常类型和消息
3. 可维护性: 使用清晰的测试命名和结构
4. 可读性: 添加有意义的测试描述
6. 预期交付物
1. test_factorial.py - 完整的测试文件
2. 测试运行结果报告
3. 可选：测试覆盖率报告
4. 可选：性能基准数据
7. 时间估算
- 基础实现: 15-20分钟
- 完整套件: 30-45分钟
- 集成优化: 额外15分钟
---
建议: 从选项A（最小化实现）开始，确保基础功能正确，然后根据需求逐步扩展
三、本地跑通
执行环境：Mac OS（Apple Silicon/1M）
3.1前置准备，安装Bun运行时，Agent核心依赖
安装Bun并验证
* 执行命令：

curl -fsSL https://bun.sh/install | bash
# 刷新环境变量
source ~/.zshrc
# 验证Bun安装成功
bun --version
[图片]
3.2源码拉取与依赖安装
克隆OpenCode源码并进入根目录
* 执行命令：

git clone https://github.com/anomalyco/opencode.git
cd opencode
安装源码依赖
* 执行命令：

bun install
[图片]
无报错，终端显示“installed X packages in Yms”（X为依赖数量，Y为耗时）；
源码根目录会生成node_modules目录，执行ls -l | grep node_modules可验证，输出应为“drwxr-xr-x  X [用户名]  staff  XXXXX 日期 node_modules”。
3.3源码级运行OpenCode Agent
配置中转商环境变量
* 执行命令：

# 配置foxcode AWS特价线路
export ANTHROPIC_BASE_URL="https://dm-fox.rjj.cc/claude/aws"
export ANTHROPIC_AUTH_TOKEN=""
# 验证
echo $ANTHROPIC_BASE_URL
echo $ANTHROPIC_AUTH_TOKEN
* 理想输出&备注：
echo $ANTHROPIC_BASE_URL输出“https://dm-fox.rjj.cc/claude/aws”；`echo $ANTHROPIC_AUTH_TOKEN`输出完整的组内共享API Key，无截断、空格或乱码。

运行OpenCode Agent源码
* 执行命令：

bun run --conditions=browser ./src/index.ts
执行后正常显示opencode终端界面
[图片]
3.4 类型检查与测试执行
TypeScript类型检查
* 执行命令：

# 官方指定的类型检查命令
bun run typecheck
# 查看更详细级别检查
bun turbo typecheck --verbosity=1
输出如下，没有错误
chenxi@chenxideMacBook-Pro opencode % bun run typecheck
$ tsgo --noEmit
chenxi@chenxideMacBook-Pro opencode % bun turbo typecheck --verbosity=1
turbo 2.5.6

• Packages in scope: opencode
• Running typecheck in 1 packages
• Remote caching disabled
opencode:typecheck: cache hit, replaying logs 827c443bf6dcf18d
opencode:typecheck: 
opencode:typecheck: $ tsgo --noEmit

 Tasks:    1 successful, 1 total
Cached:    1 cached, 1 total
  Time:    293ms >>> FULL TURBO

执行全量测试用例
* 执行命令：

bun test
部分结果
[图片]
[图片]
终端列出所有测试用例执行情况，最终显示“880 passed, 3 failed, 1 skipped, 1 error”
失败原因说明：
1. Bedrock 测试超时：Bedrock 是 AWS 官方大模型服务，本地未配置 AWS 访问凭证，且我使用 foxcode 中转商而非直接对接 AWS，该用例非核心功能，超时属于环境配置问题，非代码逻辑错误；
2. tool.registry 两个测试超时：本地缺少.opencode/tool自定义工具目录，或外部依赖加载路径权限问题，属于本地环境配置类问题，不影响 Agent 核心功能运行；
3. 1 个 error 为超时关联的衍生提示，无独立代码逻辑错误。

执行单个测试文件，Tool模块
* 执行命令：

bun test test/tool/skill.test.ts
[图片]

仅执行skill.test.ts文件，终端显示“2 passed 0 fail”
这个测试文件包含两个主要的测试用例：
1.description lists skill location URL
目的是测试技能工具的描述是否包含正确的技能位置URL
流程是创建临时目录，在其中创建 .opencode/skill/tool-skill/SKILL.md 文件
初始化技能工具
验证工具描述中是否包含技能文件的正确URL路径
2.execute returns skill content block with files
目的是测试技能执行功能是否正确工作
流程是创建包含技能文档和示例文件的技能目录
模拟权限请求处理
执行技能工具并验证：是否正确触发了权限请求、是否返回了包含技能内容的正确结构、是否包含了技能目录和文件的正确信息
Use this skill.
`,
        )
        // 创建技能相关的示例文件，测试文件包含功能
        await Bun.write(path.join(skillDir, "scripts", "demo.txt"), "demo")
      },
    })

    // 设置测试环境
    const home = process.env.OPENCODE_TEST_HOME
    process.env.OPENCODE_TEST_HOME = tmp.path

    try {
      await Instance.provide({
        directory: tmp.path,
        fn: async () => {
          // 核心,初始化技能工具
          const tool = await SkillTool.init()
          // 跟踪权限请求，用于验证权限机制
          const requests: Array<Omit<PermissionNext.Request, "id" | "sessionID" | "tool">> = []
          // 创建测试上下文，模拟权限请求回调
          const ctx: Tool.Context = {
            ...baseCtx,
            ask: async (req) => {
              requests.push(req)
            },
          }

          // 核心,执行技能工具
          const result = await tool.execute({ name: "tool-skill" }, ctx)
          const dir = path.join(tmp.path, ".opencode", "skill", "tool-skill")
          const file = path.resolve(dir, "scripts", "demo.txt")

          // 验证权限请求机制
          expect(requests.length).toBe(1)
          expect(requests[0].permission).toBe("skill")
          expect(requests[0].patterns).toContain("tool-skill")
          expect(requests[0].always).toContain("tool-skill")

          // 验证执行结果格式和内容
          expect(result.metadata.dir).toBe(dir)  // 确认返回了正确的技能目录
          expect(result.output).toContain(`<skill_content name="tool-skill">`)  // 验证内容块格式
          expect(result.output).toContain(`Base directory for this skill: ${pathToFileURL(dir).href}`)  // 验证基础目录信息
          expect(result.output).toContain(`<file>${file}</file>`)  // 验证文件包含功能
        },
      })
    } finally {
      // 清理测试环境
      process.env.OPENCODE_TEST_HOME = home
    }
  })
})


四、项目全面梳理
Repo: https://github.com/anomalyco/opencode
Docs: https://opencode.ai/docs/

4.1 概念、数据流、框架
概念
为什么opencode可以做到真的创建文件的？普通的DeepSeek为什么做不到？
你 ──────► DeepSeek ──────► 回复文字
              │
              │ （只有嘴，没有手）
              │
              └──► 无法操作文件
              └──► 无法执行命令
              └──► 无法联网搜索
传统的聊天AI，本质上就是一个文字生成器。
你给它输入，它给你输出文字，完事了。
它不知道你的电脑长什么样。
它是在线的，或者本地聊天机器人窗口，它不知道你的文件放在哪里。
它不知道今天是几号、发生了什么新闻。
它只是个被困在网页里的大脑。
但是Ai Agent中，它不仅有手脚，OpenCode赋予了这样的黑盒工具箱：
你 ──────► OpenCode ──────► AI 大脑 ──────► 决策
              │                              │
              │                              ▼
              │                         ┌─────────┐
              │                         │  工具箱  │
              │                         └─────────┘
              │                              │
              ▼                              ▼
         ┌─────────────────────────────────────┐
         │              执行层                  │
         ├─────────┬─────────┬─────────────────┤
         │ 文件读写 │ 命令执行 │ 网络请求/搜索   │
         └─────────┴─────────┴─────────────────┘
                          │
                          ▼
                    你的电脑/文件系统
其本质是：AI大脑 + 一套工具。
数据流
理解monorepo结构
monorepo结构，指的是一个大仓库里放多个小项目，每个小项目负责不同功能，互不干扰、方便管理
先看懂这个项目的组织方式
packages/
├── opencode/          # 核心服务端（最重要）
├── app/               # Web UI (SolidJS)
├── ui/                # 组件库
├── sdk/js/            # JavaScript SDK
├── plugin/            # 插件系统
├── desktop/           # Tauri桌面应用
└── util/              # 共享工具
理解数据流向：
用户输入->TUI/web->SDK->Server->LLM->Tool执行->返回结果

tui就是『package/tui』文件夹里的终端界面，和用户直接交互
sdk是翻译和连接工具，相当于客户端和服务端之间的服务员，客户端也就是tui/web不能直接和server沟通，sdk把输入的要求翻译成服务端能看懂的格式，反之亦然
server是负责干活的核心，也是agent大本营。接受到sdk传递来的翻译后需求，拆解需求并调度对应的agent，协调后续环节，session、llm、tool执行，整个数据流的中转站+指挥，也就是packeges/opencode文件夹里的核心逻辑


系统框架梳理
flowchart LR
  %% ========== Client Side ==========
  subgraph CLIENT["客户端 Client"]
    U["用户输入<br/>Prompt / 命令 / 点击"]
    TUI["TUI / CLI UI<br/>packages/opencode/src/cli/cmd/tui/<br/>例如 app.tsx"]
    CLI["CLI Commands<br/>packages/opencode/src/cli/cmd/<br/>例如 auth.ts / models.ts"]
    U --> TUI
    U --> CLI
  end

  %% ========== Transport ==========
  subgraph TRANSPORT["客户端 <-> 服务端 通信 / 传输层"]
    ACP["ACP 事件流 / 会话协议（线索）<br/>packages/opencode/src/acp/"]
    HTTPX["HTTP / Fetch（线索）<br/>packages/opencode/src/util/fetch.ts（issue线索）"]
  end

  TUI -->|"发起请求/操作"| TRANSPORT
  CLI -->|"发起请求/操作"| TRANSPORT

  %% ========== Server Side ==========
  subgraph SERVER["服务端 Server / Core Runtime"]
    ORCH["会话与编排层 Session Orchestration<br/>packages/opencode/src/session/<br/>system.ts / prompt.ts"]
    AGENT["Agent 决策层（由 session prompt/配置驱动）<br/>packages/opencode/src/session/prompt.ts（强相关）"]
    TOOL["Tools 执行层<br/>packages/opencode/src/tool/<br/>例如 read.ts"]
    EXT["扩展层 Extensibility<br/>MCP: packages/opencode/src/mcp/<br/>Plugins: packages/opencode/src/plugin/<br/>Skills: 待定位"]
    PROV["Providers / Models 层<br/>packages/opencode/src/provider/<br/>Auth: packages/opencode/src/auth/"]
  end

  %% ========== External ==========
  subgraph EXTERNAL["外部依赖 External"]
    FS["本地文件系统 / 项目工作区"]
    LLM["LLM Provider APIs<br/>Claude / OpenAI / Gemini / ..."]
    MCPS["MCP Servers"]
  end

  %% ========== Flow ==========
  TRANSPORT -->|"请求/事件"| ORCH
  ORCH --> AGENT
  AGENT -->|"调用工具"| TOOL
  TOOL --> FS
  AGENT -->|"调用模型"| PROV
  PROV --> LLM
  AGENT --> EXT
  EXT --> MCPS

  %% ========== Return path ==========
  TOOL -->|"tool result"| ORCH
  PROV -->|"model response"| ORCH
  EXT -->|"ext result"| ORCH
  ORCH -->|"增量事件/最终响应"| TRANSPORT
  TRANSPORT -->|"渲染/展示"| TUI
  TRANSPORT -->|"输出"| CLI
总入口：
packages/
├── opencode/  
├──src
├──index.ts
这里关键事：注册命令：.command(RunCommand) .command(ServeCommand) .commad(WebCommand)
本质上是命令路由器，将不同的cli参数路由到对应功能模块

4.2 TUI捕获输入并调用sdk
位置：/packages/opencode/src/cli/cmd/tui/component/prompt/index.tsx  
submit()
终端输入Prompt并敲击回车
// 第515-646行：submit() 函数
async function submit() {
  // 1. 检查是否有输入内容
  if (!store.prompt.input) return
  
  // 2. 获取选中的模型
  const selectedModel = local.model.current()  // ← 获取providerID和modelID
  if (!selectedModel) {
    promptModelWarning()
    return
  }
  
  // 3. 获取或创建sessionID
  const sessionID = props.sessionID 
    ? props.sessionID 
    : await sdk.client.session.create({}).then((x) => x.data!.id)
  
  // 4. 生成messageID
  const messageID = Identifier.ascending("message")
  
  // 5. 准备输入文本（处理粘贴的内容）
  let inputText = store.prompt.input
  // ... 处理extmarks（粘贴的文件等）
  
  // 6. ★★★ 关键：调用SDK发送prompt ★★★
  sdk.client.session.prompt({
    sessionID,
    messageID,
    agent: local.agent.current().name,
    model: selectedModel,  // ← 你选中的模型信息
    variant,
    parts: [
      {
        id: Identifier.ascending("part"),
        type: "text",
        text: inputText,  // ← 你的输入内容
      },
      // ... 其他parts（如引用的文件）
    ],
  })
  
  // 7. 清空输入框
  setStore("prompt", { input: "", parts: [] })
}

这里有这样几个关键的变量：
local.modal.current() 获取用户选中的provider_id/model_id
sdk.client.session.prompt() sdk调用入口，把数据发给server
sdk可以类比成，付钱的时候直接用支付宝就可以调取各个银行卡，而无需专门打开各个银行卡的app
银行卡指的就是各种底层协议，http、websocket协议、认证机制等
sessionID 会话id，没有的话就新建，此id会在当前进程中一直被保留
messageID 消息id，仅限于该条Prompt

4.3 sdk发送http请求给server
位置：/packages/sdk/js/src/v2/gen/sdk.gen.ts  
TUI调用 sdk.client.session.prompt后：
// 第1462-1511行：prompt() 方法
public prompt<ThrowOnError extends boolean = false>(
  parameters: {
    sessionID: string
    messageID?: string
    model?: {
      providerID: string        // ← 选中的provider
      modelID: string           // ← 选中的model
    }
    agent?: string
    variant?: string
    parts?: Array<TextPartInput | FilePartInput...>  // ← 你的输入内容
  },
  options?: Options<never, ThrowOnError>,
) {
  // 1. 构建请求参数
  const params = buildClientParams([parameters], [...])
  
  // 2. ★★★ 发送 POST 请求 ★★★
  return (options?.client ?? this.client).post<SessionPromptResponses, SessionPromptErrors, ThrowOnError>({
    url: "/session/{sessionID}/message",  // ← API端点！
    ...options,
    ...params,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
      ...params.headers,
    },
  })
}
连同对话id一起发送
请求体本身：messgaeID, model, agent, variant, parts
{
  sessionID: sess_xxx,
  messageID: msg_xxx,
  model: {
    providerID: openai,      // 你选的provider
    modelID: gpt-4           // 你选的模型
  },
  agent: opencode,           // 使用的agent
  variant: claude-sonnet-4-20250514,  // 模型变体
  parts: [
    {
      id: part_xxx,
      type: text,
      text: 帮我解释一下这段代码...   // ← 你的自然语言prompt！
    },
    {
      id: part_yyy,
      type: file,
      mime: text/typescript,
      filename: index.ts,
      url: file:///path/to/file
    }
  ]
}
调试
此处我们可以进行一个调试，显现地查看一下这个请求体：
目标：理解在 OpenCode TUI 中输入 prompt 后，数据是如何从 TUI 传输到 Server 的。
核心问题：
* sessionID 是如何传递的？因为这涉及到上下文
* prompt 是以什么形式传输的？
* 模型信息是如何传递的？

第一步：TUI 层捕获输入
文件位置：/packages/opencode/src/cli/cmd/tui/component/prompt/index.tsx
const requestBody = {
  sessionID,
  ...selectedModel,
  messageID,
  agent: local.agent.current().name,
  model: selectedModel,
  variant,
  parts: [
    {
      id: Identifier.ascending("part"),
      type: "text",
      text: inputText, // 用户的自然语言输入
    },
    ...nonTextParts.map((x) => ({
      id: Identifier.ascending("part"),
      ...x,
    })),
  ],
}

// 调试输出到文件
await Bun.write("/tmp/opencode_prompt_debug.json", JSON.stringify(requestBody, null, 2))

sdk.client.session.prompt(requestBody)
结果：在终端2使用 tail -f /tmp/opencode_prompt_debug.json 查看。
第二步：SDK 层发送请求
文件位置：/packages/sdk/js/src/v2/gen/sdk.gen.ts
// DEBUG: SDK发送请求前
const debugInfo = {
  timestamp: new Date().toISOString(),
  method: "POST",
  urlTemplate: "/session/{sessionID}/message",
  urlParams: params.url, // { sessionID: "sess_xxx" }
  body: params.body, // 包含 model, parts 等
  headers: {
    "Content-Type": "application/json",
    ...options?.headers,
    ...params.headers,
  },
}

// 写入文件
const fs = require("fs")
fs.writeFileSync("/tmp/opencode_sdk_debug.json", JSON.stringify(debugInfo, null, 2))
查看方法：
bun run --conditions=browser src/index.tsx
tail -f /tmp/opencode_sdk_debug.json
实际调试输出
{
  "timestamp": "2026-02-11T08:55:00.000Z",
  "method": "POST",
  "urlTemplate": "/session/{sessionID}/message",
  "urlParams": {
    "sessionID": "sess_xxx" // sessionID 在 URL 参数中
  },
  "body": {
    "messageID": "msg_xxx",
    "model": {
      "modelID": "kimi-k2.5-free" // 选中的模型
    },
    "parts": [
      {
        "id": "prt_c4bf61e35002dxTF1TGqxRxS0N",//这个id指的是在一次对话里，文本部分，比如可能还会有image部分
        "type": "text",
        "text": "简单介绍一下你自己" // 自然语言 prompt
      }
    ]
  },
  "headers": {
    "Content-Type": "application/json"
  }
}
 SessionID 的传递方式
问题
答案
sessionID 传了吗？
✅ 
在哪里？
urlParams.sessionID
怎么传的？
URL 路径参数 /session/{sessionID}/message
Prompt 的形式
问题
答案
prompt 是什么形式？
纯文本字符串
结构化的吗？
包装在 parts 数组中，每个 part 有 type 和 text
传输格式？
JSON 格式，但内容仍是自然语言
{
  "type": "text",
  "text": "简单介绍一下你自己" // 纯自然语言
}
完整数据流
┌─────────────────────────────────────────────────────────────┐
│ 1. TUI 层 (prompt/index.tsx)                                
│    - 用户输入: "简单介绍一下你自己"                             
│    - 封装成 requestBody: { sessionID, model, parts }         
│    - 写入 /tmp/opencode_prompt_debug.json                    
└─────────────────────────────────────────────────────────────┘
                            ↓
                            ↓ SDK 调用
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. SDK 层 (sdk.gen.ts)                                      
│    - 构造 HTTP 请求:                                        
│      POST /session/{sessionID}/message                      
│      Body: { model, agent, variant, parts }                 
│    - 写入 /tmp/opencode_sdk_debug.json                      
│    - 发送 HTTP POST 请求                                    
└─────────────────────────────────────────────────────────────┘
                            ↓
                            ↓ HTTP 传输
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Server 层 (server/routes/session.ts)                     
│    - 从 URL 提取: sessionID                                 
│    - 从 Body 提取: model, parts 等                          
│    - 查询数据库加载历史消息                                  
│    - 合并: 历史消息 + 新消息                                 
│    - 传给 LLM 处理                                           
└─────────────────────────────────────────────────────────────┘
数据的存储
先捋一下数据的结构
父级容器：project，project 是由项目目录路径的哈希值标识的工作空间，就是你在哪个路径下打开的opencode
一个project下session，可以创建多个会话
一个session下多个message，一次问/答就是一个message，message分不同的role：user/assistance
一个message下多个part，tool/reasoning/text就是一个part

session级别ses_xxx
[图片]
message级别msg_xxx
[图片]
这个title在哪里生成：
两个层级，都在server层
session层级：/packages/opencode/src/session/prompt.ts
ensureTitle()  new session第一条消息发出就生成了，step==1的时候，llm开始处理以前
message级别：/packages/opencode/src/session/summary.ts
summarizeMessage() 
这个agent会把需要summarize的内容整合好发给llm（provider.getSmallModel()）
assistance响应完毕，case"finish-step"，整个消息处理完毕，所以这个title其实是包含了llm回答的
finish-step是llm流式响应的结束事件
[图片]
[图片]
根据我的系统规则，我会在以下情况创建 todo：
复杂多步骤任务 - 需要3个或更多步骤
非平凡复杂任务 - 需要仔细规划或多操作
用户明确要求 todo 列表
用户提供多个任务（列表形式）
开始新任务时 - 立即捕获为 todo 并标记 in_progress
完成任务后 - 标记完成并添加后续任务
如果任务简单（少于3步）或纯粹是问答，我不会创建 todo。
[图片]

4.4 Server收到请求
现在可以从刚刚的src/cli模块进入到src/server模块
 在server/routes/session.ts 查看这个处理会话的路由：
.post("/:sessionID/message", async (c) => {
  const sessionID = c.req.valid("param").sessionID  // ← 从 URL 获取
  const body = c.req.valid("json")                   // ← 从 body 获取
  const msg = await SessionPrompt.prompt({ ...body, sessionID })
})
下面看SessionPrompt.prompt()这个函数，它在src/session模块下的prompt.ts中
这个文件里有几个关键，在此处 opencode的会话系统就已经进行了Plugin、tool、title的很多管理
我们先看还没和llm交互的时候：
// 1. 获取 session 信息
const session = await Session.get(input.sessionID)
// 2. ★★★ 创建并保存用户消息到本地 JSON ★★★
const message = await createUserMessage(input)
// 3. 进入核心处理循环
return loop(input.sessionID)
这边createUserMessage把message保存到刚刚我们查看的本地记录里
await Session.updateMessage(info)      // 保存到 message/{sessionID}/{messageID}.json
for (const part of parts) {
  await Session.updatePart(part)       // 保存到 part/{messageID}/{partID}.json
}
具体的updataMessage()和updatePart()定义在session模块下的index.ts里
其中前者会区分message的role，后者会区分type
在此之后消息会保存到/Users/chenxi/.local/share/opencode/storage/下

loop进入核心循环
 loop() 函数的核心逻辑：会话系统的核心
每次迭代处理一个step
逆向扫描所有messege，收集三类关键信息
export const loop = fn(Identifier.schema("session"), async (sessionID) => {
  let step = 0  // Step计数器
  const session = await Session.get(sessionID)
  
  while (true) {  // ← 无限循环，直到break
    SessionStatus.set(sessionID, { type: "busy" })
    log.info("loop", { step, sessionID })
    if (abort.aborted) break
    
    // 1. 加载所有消息历史
    let msgs = await MessageV2.filterCompacted(MessageV2.stream(sessionID))
    
    // 2. 逆向扫描：找出最后用户消息、助手消息、待处理任务
    let lastUser, lastAssistant, lastFinished
    let tasks: (CompactionPart | SubtaskPart)[] = []
    
    for (let i = msgs.length - 1; i >= 0; i--) {  // ← 从后往前遍历！
      const msg = msgs[i]
      if (!lastUser && msg.info.role === "user") lastUser = msg.info
      if (!lastAssistant && msg.info.role === "assistant") lastAssistant = msg.info
      if (!lastFinished && msg.info.role === "assistant" && msg.info.finish) {
        lastFinished = msg.info  // 上一个完成的对话回合
        break  // 找到就停止
      }
      
      // 关键：收集待处理任务（在当前回合和上一完成回合之间）
      const task = msg.parts.filter(part => part.type === "compaction" || part.type === "subtask")
      if (task && !lastFinished) {
        tasks.push(...task)  // ← 收集到tasks数组
      }
    }
    
    // 3. 检查是否结束
    if (lastAssistant?.finish && !["tool-calls", "unknown"].includes(lastAssistant.finish)) {
      if (lastUser.id < lastAssistant.id) {
        log.info("exiting loop", { sessionID })
        break  // 正常结束
      }
    }
    
    step++
    const task = tasks.pop()  // ← 取出最后一个待处理任务（LIFO栈）
    
    // 4. 任务调度优先级
    // 优先级1：Subtask（子任务）
    if (task?.type === "subtask") {
      // 执行子任务代理
      await executeSubtask(task)
      continue  // 执行完继续循环
    }
    
    // 优先级2：Compaction（上下文压缩）
    if (task?.type === "compaction") {
      await SessionCompaction.process({...})
      continue
    }
    
    // 优先级3：上下文溢出检查
    if (await SessionCompaction.isOverflow({tokens, model})) {
      await SessionCompaction.create({sessionID, auto: true})
      continue
    }
    
    // 优先级4：正常处理（调用LLM）
    const maxSteps = agent.steps ?? Infinity
    const isLastStep = step >= maxSteps
    
    const result = await processor.process({
      messages,
      tools, 
      model,
    })
    
    if (result === "stop") break
    if (result === "compact") {
      await SessionCompaction.create({auto: true})
      continue
    }
    continue  // 继续下一轮
  }
})
任务收集逻辑：
消息历史（msgs）：
[Msg1-User] → [Msg2-Assistant(finish)] → [Msg3-User] → [Msg4-Assistant(no finish)] → [Msg5-User(current)]
从后往前遍历（i从4到0）：
1. i=4 (Msg5-User): lastUser = Msg5
2. i=3 (Msg4-Assistant): 无finish，检查parts

    * 发现subtask part → tasks.push(subtask)

3. i=2 (Msg3-User): 已找到lastUser，跳过
4. i=1 (Msg2-Assistant): 有finish！lastFinished = Msg2，break

结果：
* lastUser: Msg5
* lastFinished: Msg2
* tasks: [subtask from Msg4]  ← 只有Msg3-4之间的任务

优先级栈（LIFO）：
tasks = [
{type: "subtask", agent: "code-review", prompt: "..."},    
{type: "subtask", agent: "test-writer", prompt: "..."},    
{type: "compaction", auto: true}                        
]
task = tasks.pop()  // 取出最后一个：compaction先执行！
1. Compaction（上下文压缩）- 最先压入，最后弹出
2. Subtask（子任务）- 可以多个，按创建顺序逆序执行
3. Normal Processing（正常LLM调用）- 无待处理任务时执行

看到这里我觉得和todo很像，因为也是有优先级的一个调度的问题
但是todo其实可以想成是一个Tool，当llm觉得现在这个task需要去做这样优先级的拆解的时候才会去调用这个tool，todo的状态管理是完全交给llm自主决策的，这一部分其实属于llm自己决定如何规划任务。
而关于loop里的task调度，是属于整个opencode运作的框架，因为llm本身不具备执行能力，我们需要把执行的结果、情况单独拿出来去做处理，在真正接触llm之前。
For example:
用户要求"实现用户登录功能"
// 第1轮循环（step=1）
用户输入："实现用户登录功能"
  ↓
msgs = [UserMsg] 
tasks = [] 
  ↓
进入正常处理（processor.process）
  ↓
LLM看到需要规划，调用todowrite([
  {id:"1", content:"设计数据库表", status:"pending", priority:"high"},
  {id:"2", content:"实现API接口", status:"pending", priority:"high"},
  {id:"3", content:"前端登录页面", status:"pending", priority:"medium"},
  {id:"4", content:"测试登录功能", status:"pending", priority:"medium"}
])
  ↓
LLM调用TaskTool: {agent: "database-designer", prompt: "设计用户表..."}  // 创建子任务
  ↓
Loop添加subtask part到msg
  ↓
continue（继续循环）
// 第2轮循环（step=2）
msgs = [UserMsg, AssistantMsg(with subtask part)]
  ↓
逆向扫描：
  lastUser = UserMsg
  tasks = [{type:"subtask", agent:"database-designer", ...}]
  ↓
task = tasks.pop()  // 取出subtask
  ↓
执行subtask：切换到database-designer代理
  ↓
子代理执行完成，添加结果到消息
  ↓
continue
// 第3轮循环（step=3）
msgs = [..., SubtaskResultMsg]
  ↓
tasks = []（subtask已处理）
  ↓
进入正常处理
  ↓
LLM看到数据库设计完成，更新todo：
  todowrite([{id:"1", status:"completed"}, {id:"2", status:"in_progress"}, ...])
  ↓
LLM继续调用read/write/edit工具实现API
  ↓
如果token超过限制，自动创建compaction任务
  ↓
Loop继续...
// ……
所有todo completed
  ↓
LLM设置finish = "stop"
  ↓
Loop检测到finish，break退出


组装 Prompt 并调用 LLM
// 组装完整 Prompt 并调用 LLM
const result = await processor.process({
  user: lastUser,
  agent,
  abort,
  sessionID,
  system: [...],  // 系统提示词
  messages: [
    ...MessageV2.toModelMessages(sessionMessages, model),  // 历史消息 + 新消息
  ],
  tools,           // 可用工具
  model,           // 模型配置
})

梳理到这里我注意到，server组装好送进process的元素包含了tools
于是我们回头看一下获得tools的这个分支
这里提前注明：skill的注入本身就是一个Tool，所以有关skill的pipeline的起点是包含在注册tool这一步骤的
4.5 关于工具
同样是在src/session模块下的prompt.ts中，有一个resolveTools()
在调用 processor.process() 之前，代码调用了 resolveTools()
resolveTools 是一个异步函数，负责解析和配置AI会话中可用的工具。
接收以下参数：
* agent: 代理信息，包含权限配置、模型设置等
* model: 提供者模型配置，这个是因为不同的模型可能会需要不同的api工具
* session: 会话信息，虽然传入了，但是其实最后选tool和会话无关
* tools: 工具启用状态（可选）
* processor: 会话处理器信息
* bypassAgentCheck: 是否绕过代理检查
* messages: 消息列表

1. 工具上下文创建
const context = (args: any, options: ToolCallOptions): Tool.Context
创建工具执行上下文，包含会话ID、中止信号、消息ID、权限检查等功能。

下面则是获取、注册和返回工具的具体细节
首先，从哪里获取工具？
    * ToolRegistry.tools() - 从工具注册表获取（内置）
    * MCP.tools() - 从 MCP获取

工具如何构建？
    * 每个工具都有 schema
    * 使用 tool() 函数包装
    * 包含 execute 方法

返回什么？
    * 返回 tools 对象，是一个 Record<string, AITool>

这里我在想，那难道是所有的message发出后都要把所有工具都注册到吗？因为有的会话根本不需要工具
答案是：是的，在和llm交互以前，并没有对tool做筛选，而是全部加载了
下面我们进入scr/tool模块：
【关键结论】
几乎所有工具都会传给 LLM，由 LLM 自己决定调用哪些。
但是，在resolveTools()的过程中，工具是要做初始化的，这个时候，skill的工具就已经获取了skill列表
OpenCode 在这一阶段不会根据对话内容智能筛选工具，而是采用"全量传递 + LLM 决策"的模式。

第 1 层：ToolRegistry.all() - 加载所有可用工具
/packages/opencode/src/tool/registry.ts
async function all(): Promise<Tool.Info[]> {
  const custom = await state().then((x) => x.custom)
  const config = await Config.get()

  return [
    InvalidTool,
    BashTool, // 执行命令
    ReadTool, // 读文件
    GlobTool, // 文件搜索
    GrepTool, // 内容搜索
    EditTool, // 编辑文件
    WriteTool, // 写文件
    TaskTool, // 任务管理
    WebFetchTool, // 网页获取
    TodoWriteTool, // TODO 列表
    WebSearchTool, // 网页搜索
    CodeSearchTool, // 代码搜索
    SkillTool, // 技能系统
    ApplyPatchTool, // 应用补丁
    ...(Flag.OPENCODE_EXPERIMENTAL_LSP_TOOL ? [LspTool] : []),
    ...(config.experimental?.batch_tool === true ? [BatchTool] : []),
    ...(Flag.OPENCODE_EXPERIMENTAL_PLAN_MODE && Flag.OPENCODE_CLIENT === "cli" ? [PlanExitTool, PlanEnterTool] : []),
    ...custom, // 插件和 MCP 外部工具
  ]
}
包含工具类型：
* 内置工具：约 15-20 个（bash, read, write, edit, glob, grep 等）
* 自定义工具：插件注册的工具
* MCP 工具：通过 Model Context Protocol 集成的外部工具


第 2 层：ToolRegistry.tools() - 模型相关筛选（非常少量）
/packages/opencode/src/tool/registry.ts
筛选逻辑：
.filter((t) => {
  // 1. codesearch/websearch 权限控制
  if (t.id === "codesearch" || t.id === "websearch") {
    return model.providerID === "opencode" || Flag.OPENCODE_ENABLE_EXA
  }

  // 2. apply_patch vs edit/write（二选一，基于模型类型）
  const usePatch = model.modelID.includes("gpt-") &&
                   !model.modelID.includes("oss") &&
                   !model.modelID.includes("gpt-4")
  if (t.id === "apply_patch") return usePatch
  if (t.id === "edit" || t.id === "write") return !usePatch

  return true  // 其他工具全部保留！
})
重要：这一层不根据对话内容筛选，只根据模型类型和配置标志。

第 3 层：resolveTools() - 构建最终 tools 对象
现在我们回到/packages/opencode/src/session/prompt.ts
export async function resolveTools(input: {
  agent: Agent.Info
  model: Provider.Model
  session: Session.Info
  tools?: Record<string, boolean>
  processor: SessionProcessor.Info
  bypassAgentCheck: boolean
  messages: MessageV2.WithParts[]
}) {
  const tools: Record<string, AITool> = {}

  // 遍历所有工具并构建 execute 包装器
  for (const item of await ToolRegistry.tools(...)) {
    const schema = ProviderTransform.schema(input.model, z.toJSONSchema(item.parameters))

    tools[item.id] = tool({
      id: item.id,
      description: item.description,
      inputSchema: jsonSchema(schema),

      // 注意，这里定义的是 execute 函数，但此时不会执行！
      execute: async (args, options) => {
        const ctx = context(args, options)

        // 权限检查
        await ctx.ask({
          permission: item.id,
          ruleset: PermissionNext.merge(input.agent.permission, input.session.permission ?? [])
        })

        // 执行实际工具
        return await item.execute(args, ctx)
      }
    })
  }

  return tools
}

权限系统的位置
关键发现，权限检查在工具执行阶段，不是在工具选择阶段。
// execute 函数内部（执行时检查）
execute: async (args, options) => {
  const ctx = context(args, options)

  // 🔒 权限检查在这里！不是在工具选择时
  await ctx.ask({
    permission: key,
    ruleset: PermissionNext.merge(input.agent.permission, input.session.permission ?? []),
  })

  // 执行工具
  return await item.execute(args, opts)
}
这意味着： LLM 能看到所有工具的定义（description, schema），LLM 可以决定调用任何工具，但实际执行时，可能因权限不足被拒绝。被拒绝时会提示用户授权
这种设计的优缺点
优点
✅ 简单直接：无需复杂的工具选择逻辑
✅ 灵活性强：LLM 有完整上下文，可以做出最佳决策
✅ 易于扩展：新增工具自动生效，无需修改选择逻辑
✅ LLM 友好：现代 LLM（Claude, GPT-4）能很好地处理多工具场景
缺点
❌ Token 开销：工具多时会占用大量 token，每个工具都有 description + schema
❌ 潜在干扰：LLM 可能被不相关工具干扰
❌ 权限延迟：权限拒绝发生在执行阶段，用户体验稍差
❌ 上下文长度：工具定义可能超出模型上下文限制

调试：查看实际传递的工具
先看一下内置的Tool有哪些（在opencode/src/tool目录下用ts写的，附带txt的description）
[图片]
添加调试代码到 /packages/opencode/src/session/prompt.ts：
// 在 resolveTools 返回前添加
const toolList = Object.keys(tools)
console.log(`\n🔧 AVAILABLE TOOLS (${toolList.length}):`)
toolList.forEach((id, i) => {
  console.log(`  ${i + 1}. ${id}`)
})
console.log("=========================================\n")
plan agent和build Agent注册的工具是一样的，但是权限有区别。不同的agent会有不同的permission规则。
[图片]
调试：尝试手动添加一个tool
创建工具实现文件
文件: /packages/opencode/src/tool/test.ts
import z from "zod"
import { Tool } from "./tool"
import DESCRIPTION from "./test.txt"

export const TestTool = Tool.define("test", {
  description: DESCRIPTION,
  parameters: z.object({
    message: z.string().describe("A message to echo back"),
  }),
  async execute(params) {
    return {
      title: "Test Tool",
      metadata: {
        received: params.message,
        timestamp: Date.now(),
      },
      output: `Test tool is working! Received message: "${params.message}"`,
    }
  },
})

创建工具描述文件
文件: /packages/opencode/src/tool/test.txt
- A test tool to verify tool registration is working properly
- Returns a simple greeting message with any input provided
- Use this tool to test if custom tools are being registered correctly
注册到 ToolRegistry
文件: /packages/opencode/src/tool/registry.ts
1: 导入工具
import { {ToolName}Tool } from "./test"
2: 添加到工具列表
return [
  InvalidTool,
  BashTool,
  // ... 其他工具
  {test}Tool,  // ← 在这里添加
  ...custom,
]
验证工具是否注册成功
[图片]
可以看到多加载了一个工具test
[图片]

4.6 Processor 和 LLM 调用详解
build agent和react：不是react在提示词层面强调推理结构，而是通过一个system prompt进行指导，应用层主要是负责循环控制和上下文管理，可以理解成应用层只管理做的部分并和llm做交互，llm只负责想
从 prompt 到 processor 的完整链路
当 resolveTools() 构建好 tools 对象后，进入核心处理阶段：
resolveTools() 完成
    ↓
processor.process(streamInput) (prompt.ts)
    ↓
LLM.stream(streamInput) (processor.ts)
    ↓
streamText() (llm.ts) ← 真正调用 AI
    ↓
处理流式响应事件
processor.process() 工作流程
用一个例子来梳理
用户输入『读取package.json的内容』
文件: processor.ts:55-337
for await (const value of stream.fullStream) {
  switch (value.type) {
    // ========== 开始事件 ==========
    case "start": {
      SessionStatus.set(input.sessionID, { type: "busy" })
      break
    }
    
    // ========== 思考过程 ==========
    case "reasoning-start": {
      // 创建 reasoning part
      reasoningMap[value.id] = {
        type: "reasoning",
        text: "",
        id: value.id,
      }
      break
    }
    
    case "reasoning-delta": {
      // 累积思考文本
      if (value.text && reasoningMap[value.id]) {
        reasoningMap[value.id].text += value.text
      }
      break
    }
    
    case "reasoning-end": {
      // 保存思考结果到 storage
      if (reasoningMap[value.id]) {
        await Session.updatePart(reasoningMap[value.id])
        delete reasoningMap[value.id]
      }
      break
    }
    
    // ========== 文本生成 ==========
    case "text-start": {
      currentText = {
        type: "text",
        text: "",
        id: Identifier.ascending("part"),
      }
      break
    }
    
    case "text-delta": {
      // 实时累积文本
      if (value.text) {
        currentText.text += value.text
        
        // 实时保存到 storage（TUI 可以立即显示）
        await Session.updatePart({
          ...currentText,
          messageID: input.assistantMessage.id,
        })
      }
      break
    }
    
    case "text-end": {
      // 文本生成结束
      break
    }
    
    // ========== 工具调用（关键！） ==========
    case "tool-input-start": {
      // 开始准备调用工具
      break
    }
    
    case "tool-call": {
      // LLM 正式发起工具调用
      const match = toolcalls[value.toolCallId]
      
      if (match) {
        // 更新 part 状态为 running
        await Session.updatePart({
          ...match,
          state: {
            status: "running",
            input: value.input,  // 参数如 { path: "package.json" }
            time: { start: Date.now() },
          },
        })
        
        // ⚠️ 注意：这里不直接执行工具！
        // Vercel SDK 在 streamText 内部自动调用 tool.execute()
      }
      break
    }
    
    case "tool-result": {
      // 工具执行完成（由 Vercel SDK 返回结果）
      const match = toolcalls[value.toolCallId]
      
      if (match) {
        // 更新 part 为 completed
        await Session.updatePart({
          ...match,
          state: {
            status: "completed",
            output: value.output,  // 工具返回的结果
            time: { end: Date.now() },
          },
        })
        
        delete toolcalls[value.toolCallId]
      }
      break
    }
    
    // ========== 步骤完成 ==========
    case "start-step": {
      // 开始新一轮（当工具调用后，会有新一轮）
      await Session.updatePart({
        type: "step-start",
        messageID: input.assistantMessage.id,
        // ...
      })
      break
    }
    
    case "finish-step": {
      // 一轮生成完成
      const usage = Session.getUsage({
        model: input.model,
        usage: value.usage,  // token 使用情况
      })
      
      // 更新 assistant message
      input.assistantMessage.finish = value.finishReason  // "stop" 或 "tool-calls"
      input.assistantMessage.tokens = usage.tokens
      input.assistantMessage.cost += usage.cost
      
      await Session.updatePart({
        type: "step-finish",
        reason: value.finishReason,
        tokens: usage.tokens,
        cost: usage.cost,
      })
      
      await Session.updateMessage(input.assistantMessage)
      
      // 检查是否需要上下文压缩
      if (await SessionCompaction.isOverflow({...})) {
        needsCompaction = true
        return "compact"  // 返回特殊结果，外层会处理
      }
      
      break
    }
  }
}
// 返回结果给外层 loop
if (needsCompaction) return "compact"
if (input.abort.aborted) return "stop"
return "continue"  // 正常完成

文件: /packages/opencode/src/session/processor.ts
export function create(input: {
  assistantMessage: MessageV2.Assistant
  sessionID: string
  model: Provider.Model
  abort: AbortSignal
}) {
  return {
    async process(streamInput: LLM.StreamInput) {
      // 循环处理直到对话完成
      while (true) {
        const stream = await LLM.stream(streamInput) // ← 调用 LLM

        // 处理流式响应
        for await (const value of stream.fullStream) {
          switch (value.type) {
            case "start":
              // LLM 开始生成
              break
            case "text-delta":
              // 接收文本片段
              currentText.text += value.text
              break
            case "tool-call":
              // LLM 决定调用工具
              await executeTool(value)
              break
            case "tool-result":
              // 工具执行完成
              await saveToolResult(value)
              break
            case "finish-step":
              // 一轮生成完成
              await updateMessageStats(value)
              break
          }
        }
      }
    },
  }
}
关键事件处理
事件类型
触发时机
处理逻辑
start
LLM 开始生成
设置状态为 busy
text-start/delta/end
文本生成过程中
累积文本回复
tool-input-start/call
LLM 决定调用工具
创建 tool part，准备执行
tool-result
工具执行完成
保存执行结果
tool-error
工具执行失败
保存错误信息
start-step/finish-step
每轮生成开始/结束
追踪 token 使用、成本
finish
整个生成完成
清理状态
LLM.stream() - 组装 AI 请求
文件: /packages/opencode/src/session/llm.ts
export async function stream(input: StreamInput) {
  // 获取模型配置
  const [language, cfg, provider, auth] = await Promise.all([
    Provider.getLanguage(input.model),
    Config.get(),
    Provider.getProvider(input.model.providerID),
    Auth.get(input.model.providerID),
  ])

  // 组装 system prompt
  const system = [
    input.agent.prompt ?? SystemPrompt.provider(input.model),
    ...input.system,
    ...(input.user.system ? [input.user.system] : []),
  ]

  // 处理工具，权限过滤
  const tools = await resolveTools(input)
  // 移除被禁用或无权限的工具
  for (const tool of Object.keys(input.tools)) {
    if (disabled.has(tool)) delete input.tools[tool]
  }

  // 
  return streamText({
    model: wrapLanguageModel({ model: language }),
    messages: [
      ...system.map((x) => ({ role: "system", content: x })),
      ...input.messages, // 历史消息 + 新消息
    ],
    tools, // 所有可用工具
    activeTools: Object.keys(tools).filter((x) => x !== "invalid"),
    temperature,
    topP,
    maxOutputTokens,
    headers: {
      "x-opencode-project": Instance.project.id,
      "x-opencode-session": input.sessionID,
      // ...
    },
  })
}
streamText() - 真正的 AI 调用入口
来源: import { streamText } from "ai"
位置: /packages/opencode/src/session/llm.ts
return streamText({
  // 模型配置
  model: wrapLanguageModel({
    model: language,  // 比如 openai("gpt-4") / anthropic("claude-3-opus")
  }),

  // 完整对话历史
  messages: [
    { role: "system", content: "系统提示词..." },
    { role: "user", content: "历史消息1..." },
    { role: "assistant", content: "AI回复1..." },
    { role: "user", content: "当前消息..." },
  ],

  // 工具定义
  tools: {
    bash: { description: "...", parameters: {...}, execute: fn },
    read: { description: "...", parameters: {...}, execute: fn },
    write: { description: "...", parameters: {...}, execute: fn },
    // ...
  },

  // 生成参数
  temperature: 0.7,
  maxOutputTokens: 32000,

  // 流式处理回调
  onError(error) { ... },
  experimental_repairToolCall(failed) { ... },
})

关于function call 的核心问题
api层面：llm返回的是什么
OpenAI格式下的结构化数据
{
  choices: [{
    message: {
      role: assistant,
      content: null,  // ← 没有文本内容
      tool_calls: [{  // ← 关键：工具调用指令！
        id: call_abc123,
        type: function,
        function: {
          name: read,
          arguments: {"path": "package.json"}
        }
      }]
    },
    finish_reason: tool_calls  // ← 因为调用了工具而停止
  }]
}

Vercel AI SDK 的转换
API返回: tool_calls=[{name: "read", arguments: {...}}]
    ↓
Vercel SDK解析
    ↓
转换为JavaScript事件流：
    { type: "tool-call", toolCallId: "...", toolName: "read", input: {...} }
    ↓
关键：自动调用 tools.read.execute(input)（在streamText)
这是vercel sdk的功能，不是应用层面的代码调用（可以在resolvetool哪里看到对应的execute
⭐️ vercel sdk处理了工具执行的错误和重试
⭐️ 如果llm一次调用多个工具，vercel sdk也是自动并行执行
整个过程中，opencode应用层只是时间的观察者和状态记录者
    ↓
执行完成后，发送事件：
    { type: "tool-result", toolCallId: "...", output: "..." }

3. OpenCode如何"知道"并处理
文件: processor.ts:126-194
case "tool-call": {
  // 事件数据来自Vercel SDK
  const match = toolcalls[value.toolCallId]
  
  if (match) {
    // 1. 更新UI状态为"running"
    await Session.updatePart({
      ...match,
      state: {
        status: "running",  // ← 用户看到"正在执行read工具"
        input: value.input,  // { path: "package.json" }
        time: { start: Date.now() }
      }
    })
    
    // 注意：这里不直接执行！
    // Vercel SDK已经在streamText内部自动调用了tool.execute()
    // 我们只需要等待"tool-result"事件
  }
  break
}
case "tool-result": {
  // 工具执行完成，Vercel SDK返回结果
  const match = toolcalls[value.toolCallId]
  
  if (match) {
    await Session.updatePart({
      ...match,
      state: {
        status: "completed",
        output: value.output,  // 工具返回的内容
        time: { end: Date.now() }
      }
    })
    
    delete toolcalls[value.toolCallId]
  }
  break
}
4. 关键流程

发送 HTTP 请求到 LLM API 
流式接收响应 (SSE)
如果 LLM 要调用工具，自动执行 tool.execute()
将工具结果再传给 LLM
继续接收最终回复
工具执行的具体流程
当 LLM 决定调用工具时，Vercel SDK 会触发：
// 在 streamText 内部,以下是伪代码
if (llmResponse.tool_calls) {
  for (const call of llmResponse.tool_calls) {
    const tool = tools[call.name]  // 找到对应工具

    // 执行工具
    const result = await tool.execute(call.arguments, {
      toolCallId: call.id,
      abortSignal,
    })

    // 将结果返回给 LLM
    messages.push({
      role: "tool",
      content: result.output,
      tool_call_id: call.id,
    })
  }

  // 再次调用 LLM，让它基于工具结果继续回复
  return streamText({ messages, ... })
}
实际执行流程：
LLM 返回 tool_call
    ↓
case "tool-call":
    ↓
更新 part 状态为 "running"
    ↓
Vercel SDK 自动调用 tool.execute() (在 streamText 内部)
    ↓
tool.execute 内部：
    ├── Plugin.trigger("tool.execute.before")
    ├── PermissionNext.ask() 权限检查
    ├── 实际执行工具逻辑 (bash/read/write/...)
    └── Plugin.trigger("tool.execute.after")
    ↓
case "tool-result":
    ↓
更新 part 状态为 "completed" + 保存结果
    ↓
LLM 基于结果继续生成回复
完整数据流
1. TUI 发送 prompt
        ↓
2. Server 接收 POST /session/{sessionID}/message
        ↓
3. SessionPrompt.prompt() (prompt.ts:149)
   ├── createUserMessage() - 保存到本地 JSON
   │   └── ~/.local/share/opencode/storage/message/{sessionID}/
   └── loop() (prompt.ts:256)
        ↓
4. loop() 内部：
   ├── MessageV2.stream(sessionID) - 加载历史消息
   │   └── 从 ~/.local/share/opencode/storage/ 读取
   ├── resolveTools() - 构建 tools 对象
   │   ├── ToolRegistry.tools() 获取 40+ 个工具
   │   └── 包装 execute 函数（仅定义，不执行！）
   └── processor.process() (prompt.ts:614)
        ↓
5. processor.process() (processor.ts:45)
   └── LLM.stream(streamInput) (processor.ts:53)
        ↓
6. LLM.stream() (llm.ts:46)
   ├── 组装 system prompt
   ├── 设置 temperature, topP 等参数
   ├── resolveTools() - LLM 层工具过滤（权限检查）
   └── ★★★ streamText() (llm.ts:183) ★★★
        ↓
7. Vercel AI SDK (streamText)
   ├── 发送 HTTP 请求到 LLM API
   ├── 流式返回 AI 响应
   │   ├── "text-delta" - 文本片段
   │   ├── "tool-call" - 工具调用请求
   │   └── "finish-step" - 完成标记
   └── 自动处理 tool calling
        ↓
8. processor 处理流式响应 (processor.ts:55-337)
   ├── "text-delta" - 累积文本回复
   │   └── 实时保存到 storage/part/
   ├── "tool-call" - 执行工具
   │   └── 调用 tool.execute() → 权限检查 → 实际执行
   │       └── 如: bash("ls -la") / read("/path/to/file")
   └── "finish-step" - 保存 token 使用量、成本
        ↓
9. 返回结果给 TUI
   └── 显示 AI 回复 + 工具执行结果

调试：查看 AI 请求详情
在 llm.ts添加调试：
// 在 streamText 调用前添加
const debugRequest = {
  timestamp: new Date().toISOString(),
  model: input.model.id,
  provider: input.model.providerID,
  messageCount: input.messages.length,
  toolsCount: Object.keys(tools).length,
  toolList: Object.keys(tools),
  systemLength: system.join("\n").length,
  messages: input.messages.map((m) => ({
    role: m.role,
    contentLength: typeof m.content === "string" ? m.content.length : JSON.stringify(m.content).length,
  })),
}

require("fs").appendFileSync("/tmp/opencode_llm_request.log", JSON.stringify(debugRequest, null, 2) + "\n\n")

输出示例：
{
  "timestamp": "2026-02-11T10:00:00.000Z",
  "model": "kimi-k2.5-free",
  "provider": "opencode",
  "messageCount": 5,
  "toolsCount": 42,
  "toolList": ["bash", "read", "write", "edit", ...],
  "systemLength": 1500,
  "messages": [
    { "role": "system", "contentLength": 1500 },
    { "role": "user", "contentLength": 25 },
    { "role": "assistant", "contentLength": 150 },
    ...
  ]
}

执行的环境？
没有沙箱，直接在本机执行
const proc = spawn(params.command, {
  shell,                    // 系统默认 shell (bash/zsh/pwsh)
  cwd,                      // 项目目录或指定目录
  env: {
    ...process.env,         // ← 继承当前进程的所有环境变量
    ...shellEnv.env,
  },
  stdio: ["ignore", "pipe", "pipe"],
  detached: process.platform !== "win32",
})
- 直接在宿主机上 spawn 子进程
- 继承 OpenCode 进程的所有环境变量（PATH、HOME 等）
- 可以访问任何有权限的目录（通过 workdir 参数控制）
- 可以访问网络（无网络隔离）
- 以运行 OpenCode 的用户身份执行
4.7 Agent Skill 系统详解
什么是 Agent Skill？
Agent Skill 是 OpenCode 中的一种领域特定指令系统
详见agent skills从原理到使用
Skill 的核心架构
文件位置: /packages/opencode/src/skill/skill.ts
这是一个ts模块，定义了opencode的技能管理系统，负责扫描、加载和管理ai技能配置文件
数据结构：
export const Info = z.object({
  name: z.string(), // Skill 名称（唯一标识）
  description: z.string(), // Skill 描述，显示给 AI 看
  location: z.string(), // SKILL.md 文件的绝对路径
  content: z.string(), // SKILL.md 文件的内容
})
Skill 的发现和加载路径
扫描优先级，后加载的覆盖先加载的：
优先级
路径
范围
说明
1
~/.claude/skills/**/SKILL.md
Global
Claude Code 兼容
2
~/.agents/skills/**/SKILL.md
Global
Agents 目录
3
./.claude/skills/**/SKILL.md
Project
项目级 Claude
4
./.agents/skills/**/SKILL.md
Project
项目级 Agents
5
.opencode/skill/**/SKILL.md
Project
OpenCode 专用 
6
config.skills.paths[]
Custom
配置中指定的路径
7
config.skills.urls[]
Remote
远程 URL 下载
会异步扫描文件系统，查找所有的SKILL.md文件
会有一个专门的函数去解析SKILL.md文件里前置的元数据

那么默认安装带skill吗？答案是不。

配置方式 (~/.config/opencode/config.json)：
{
  "skills": {
    "paths": ["/path/to/custom/skills", "~/my-skills"],
    "urls": ["https://example.com/.well-known/skills/"]
  }
}
SkillTool - 调用机制
文件: /packages/opencode/src/tool/skill.ts
export const SkillTool = Tool.define("skill", async (ctx) => {
  const skills = await Skill.all()

  // 根据 agent 权限过滤 Skill
  const accessibleSkills = agent
    ? skills.filter((skill) => {
        const rule = PermissionNext.evaluate("skill", skill.name, agent.permission)
        return rule.action !== "deny"
      })
    : skills

  return {
    description: `Load a specialized skill...
    
    Available skills:
    ${accessibleSkills.map((s) => `- ${s.name}: ${s.description}`).join("\n")}
    `,
    parameters: z.object({
      name: z.string().describe("Skill name from available_skills"),
    }),
    execute: async (params, ctx) => {
      const skill = await Skill.get(params.name)

      // 1. 权限检查
      await ctx.ask({ permission: "skill", patterns: [params.name] })

      // 2. 读取 Skill 目录下的其他文件
      const files = await Ripgrep.files({ cwd: dir })

      // 3. 返回 Skill 内容
      return {
        title: `Loaded skill: ${skill.name}`,
        output: `
          <skill_content name="${skill.name}">
          ${skill.content}
          <skill_files>${files}</skill_files>
          </skill_content>
        `,
      }
    },
  }
})
Skill 调用流程
用户输入: "帮我写一个文件操作的功能"
    ↓
LLM 识别到可能需要 file-io 相关的 Skill
    ↓
LLM 调用 skill tool: { name: "bun-file-io" }
    ↓
SkillTool.execute()
    ├── 检查权限
    ├── 读取 SKILL.md 内容
    ├── 扫描 Skill 目录下的其他文件（脚本、模板等）
    └── 返回完整 Skill 内容
    ↓
Skill 内容被注入到对话上下文
    ↓
LLM 基于 Skill 指导继续回复
如何创建一个新的 Skill
详见agent skills从原理到使用
4.8 创新
ai助手不是云端服务，而是本地操作系统的一部分
用户拥有所有数据，而不是租赁服务
session、消息历史、配置文件全部放在本地用json存储，包括上下文也在本地组装
skill系统让ai行为可扩展

未与任何提供商耦合。虽然我们推荐我们通过OpenCode Zen提供的模型，但OpenCode可以与Claude、OpenAI、Google甚至本地模型一起使用。随着模式的发展，它们之间的差距将缩小，价格将下降，因此与提供商无关很重要。

什么是提供商无关？
claude code 用anthropic的claude，硬编码调用anthropic api
opencode是通过provider接口调用

为什么只有opencode可以完美做到这一点：
【设计理念】
/ 核心假设：所有 LLM 都遵循相同的模式
// 1. 接收 messages
// 2. 返回 text/tool_calls
// 3. 有 token 限制
因此可以抽象出统一接口
interface LLM {
  generate(messages: Message[]): Promise<Response>
  stream(messages: Message[]): AsyncIterable<Chunk>
  tools: Tool[]  // Function Calling 标准化
}
其他工具的假设：claude code(claude artifacts）、copilot（codex）、cursor（UI）

Continue（开源插件）
 也能做到提供商无关
支持：OpenAI、Anthropic、Google、本地模型等
架构：类似的Provider抽象层
但为什么 Continue 没有 OpenCode 流行？
Continue是IDE插件，OpenCode是独立工具
OpenCode有TUI和更好的交互设计
OpenCode的Skill系统更完善（skill纯文本指令，每个模型都能懂）

开箱即用的LSP支持
lsp是微软开发的协议，能让ide通过统一接口获取代码智能提示
在opencode中，lsp是一个tool

传统的ai编程工具：ai使用grep工具查找，无法准确知道具体是哪个定义
opencode
// 用户：这个函数在哪里定义的？
// AI 调用 LSP Tool：
LSP.goToDefinition({
  filePath: "/project/src/app.ts",
  line: 45,
  character: 12
})
// 返回：精确定义位置，包括类型信息

用户：重构这个函数，把它移到另一个文件
AI 的思考过程：
先找到函数定义 → LSP.goToDefinition()
查找所有引用位置 → LSP.findReferences()
检查调用层次 → LSP.incomingCalls()
确认移动后不会影响其他代码
执行重构操作
vs 传统方式（只用 grep）：
搜索函数名
可能漏掉动态调用
可能误改同名函数
没有类型信息支持

Cursor/Copilot：
* LSP 是给人类用的（IDE功能）
* AI 仍然基于文本搜索

OpenCode：
* LSP 是给AI用的（Tool）
* AI 可以进行语义级代码分析


亮点：
// lsp/server.ts 自动识别逻辑，用户什么都不用做
if (await Bun.file(path.join(root, "package.json")).exists()) {
  return "typescript"  // 启动 TS LSP
}
if (await Bun.file(path.join(root, "Cargo.toml")).exists()) {
  return "rust"  // 启动 Rust LSP
}
if (await Bun.file(path.join(root, "go.mod")).exists()) {
  return "go"  // 启动 Go LSP
}

專注於TUI。OpenCode是由neovim用户和terminal.shop的创建者构建的；我们将突破终端中可能的极限。

客戶端/伺服器架构。例如，当您从移动应用程序远程驾驶OpenCode时，这可以允许OpenCode在您的计算机上运行，这意味着TUI前端只是可能的客户端之一。

开发者收益（这是 Claude Code 很难等价替代的部分）：
可以在 Node 脚本/服务里把 OpenCode 当作“AI 编程后端服务”调用，而不是只能交互式用 CLI。
能做自动化：比如你们内部平台触发 OpenCode 进行代码生成/修复/审查，再把结果回写 PR。
可以写“产品级集成”，而不只是“命令行助手”。
