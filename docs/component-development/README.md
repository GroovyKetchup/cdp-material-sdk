# CDP 组件开发入口

本文档面向 **CDP 组件作者**，包括内部组件开发者、第三方组件包作者，以及基于已有 UI 组件库做二次封装的团队。

如果你要开发、接入、扩展或排查一个组件包，请从这里开始。

---

## 1. 先确认你的场景

### 我是第一次接入 CDP，要从零创建组件库工程

按顺序阅读：

1. [创建或接入组件库工程](./getting-started/01-创建或接入组件库工程.md)
2. [创建组件包并注册](./getting-started/02-创建组件包并注册.md)
3. [开发最小可运行组件](./getting-started/03-开发最小可运行组件.md)
4. [构建发布与宿主接入](./getting-started/04-构建发布与宿主接入.md)
5. [自检与排错](./getting-started/05-自检与排错.md)

### 我已经有一个组件包，要往里面加新组件

适合团队协作场景：组件包工程已经存在，当前任务只是新增一个组件。

建议阅读：

1. [开发最小可运行组件](./getting-started/03-开发最小可运行组件.md)
2. [创建组件包并注册](./getting-started/02-创建组件包并注册.md) 的「往已有组件包新增组件」小节
3. 按需选择 `recipes/` 下的能力文档
4. [自检与排错](./getting-started/05-自检与排错.md)

### 我要把第三方 React 组件库接入 CDP

适合包装 Ant Design、Arco、Material UI、ECharts、自研 UI Kit 等场景。

建议阅读：

1. [接入第三方 React 组件库](./recipes/接入第三方React组件库.md)
2. [使用 Adapter 适配组件 API](./recipes/使用Adapter适配组件API.md)
3. [配置 DOM 根节点注入](./recipes/配置DOM根节点注入.md)
4. [配置 Loading 策略](./recipes/配置Loading策略.md)
5. [自检与排错](./getting-started/05-自检与排错.md)

### 我要让组件参与表单或数据流

阅读：

- [声明数据字段组件](./recipes/声明数据字段组件.md)
- [声明数据容器组件](./recipes/声明数据容器组件.md)
- [Traits 能力模型](./reference/Traits能力模型.md)

### 我要让组件承载子组件（布局容器）

阅读：

- [声明布局容器组件](./recipes/声明布局容器组件.md)
- [声明插槽](./recipes/声明插槽.md)
- [Traits 能力模型](./reference/Traits能力模型.md)

### 我要声明组件对外的可配置项（props）

`props` 是组件向设计器、表达式和 AI 工具暴露的可配置项契约（标准 JSON Schema）。

阅读：

- [声明 props](./recipes/声明props.md)
- [Manifest 字段参考](./reference/Manifest字段参考.md)
- [Traits 能力模型](./reference/Traits能力模型.md)（理解 trait 自动注入 props 的边界）

### 我要调整组件在设计器中的展示

阅读：

- [配置设计器元信息](./recipes/配置设计器元信息.md)
- [Manifest 字段参考](./reference/Manifest字段参考.md)

### 我要让组件对外触发事件

事件是可选能力。只有组件需要通知宿主或编排系统时才需要声明。

阅读：

- [声明事件](./recipes/声明事件.md)
- [Events 模型](./reference/Events模型.md)

### 我要让组件支持层级下钻

阅读：

- [声明层级下钻能力](./recipes/声明层级下钻能力.md)
- [层级下钻能力模型](./reference/层级下钻能力模型.md)

### 我要让流程或 AI 调用组件方法

阅读：

- [声明动作与状态](./recipes/声明动作与状态.md)
- [Actions / State 模型](./reference/ActionsState模型.md)

### 我要给组件提供可拖入区域或模板区域

阅读：

- [声明插槽](./recipes/声明插槽.md)
- [Slots 模型](./reference/Slots模型.md)

### 我要处理根节点注入、Loading 或渲染策略

阅读：

- [配置 DOM 根节点注入](./recipes/配置DOM根节点注入.md)
- [配置 Loading 策略](./recipes/配置Loading策略.md)
- [DOM 根节点注入模型](./reference/DOM根节点注入模型.md)
- [Loading 策略模型](./reference/Loading策略模型.md)

### 我遇到了 warning、error 或接入后不生效

阅读：

- [自检与排错](./getting-started/05-自检与排错.md)
- [validateManifest 校验规则](./reference/validateManifest校验规则.md)
- [FAQ](./FAQ.md)

### 我要找可复制的模板或示例代码

阅读：

- [示例代码索引](./reference/示例代码索引.md)

---

## 2. 文档分层

| 层级 | 作用 | 读者 |
|------|------|------|
| `getting-started/` | 完成一个可交付组件包的最小闭环 | 新接入作者、团队负责人 |
| `recipes/` | 按需启用某项组件能力 | 正在实现具体组件能力的作者 |
| `reference/` | 查字段、查模型、查校验规则 | 所有作者、AI Skill |
| `FAQ.md` | 高频问题与排错入口 | 所有作者 |

---

## 3. 最小必需路径和可选能力

组件接入 CDP 的最小必需路径只有 5 件事：

1. 使用 React 或 React wrapper 暴露组件。
2. 为组件编写 `ComponentManifest`。
3. 将组件和 manifest 放入 `EngineComponentPackage.components`。
4. 在 `EngineComponentPlugin.install()` 中调用 `api.registerPackage(pkg)`。
5. 使用 `validateManifest()` 自检，确保没有 error。

以下能力都不是强制的：

| 能力 | 什么时候需要 | 不需要时 |
|------|--------------|----------|
| `events` | 组件需要通知宿主，例如点击、值变化、行选择 | 不声明 |
| `actions` | 外部流程需要命令式调用组件 | 不声明 |
| `state` | 外部表达式需要读取组件内部运行时状态 | 不声明 |
| `DATA_FIELD` | 组件参与数据值管理 | 不声明该 trait |
| `DATA_CONTAINER` | 组件要管理子字段的数据作用域 | 不声明该 trait |
| `LAYOUT_CONTAINER` | 组件作为布局容器承载子组件 | 不声明该 trait |
| `slots` | 组件需要可拖入或模板化区域 | 不声明 |
| `nesting` | 需要限制子组件类型、最少/最多数量、或者只能作为某些父组件的子节点 | 不声明 |
| `meta.icon` / `subGroup` / `hiddenInComponentList` | 需要调整设计器中的展示 | 不声明 |
| `usage` | 给 AI 与设计器提供使用提示 | 不声明 |
| `adapter` | 组件 API 与 CDP 默认约定不一致 | 不声明 |
| `engine.render.loading` | 组件需要被流程控制 Loading | 不声明或使用 `none` |

---

## 4. 面向未来 Skill 的约定

本文档按「任务路径 + 可选能力 Recipe + 模型参考 + 自检排错 + FAQ」组织。每个 Recipe 都尽量包含：

- **适用场景：** 什么时候需要。
- **可以跳过的情况：** 避免把可选能力误认为必做流程。
- **输入：** 作者已有的组件、manifest 或组件包。
- **输出：** 完成后应该得到什么。
- **步骤：** 可人工执行，也可由 AI Skill 执行。
- **自检：** 使用 `validateManifest()` 或运行时诊断确认结果。

`reference/` 只维护稳定事实源：字段语义、模型边界、约束摘要和校验入口，不维护完整任务流程。

`reference/validateManifest校验规则.md` 是校验级别事实源：哪些规则是 error、哪些规则是 warning，应优先在这里维护。

`recipes/`、`reference/`、`getting-started/` 和 `FAQ.md` 文档顶部使用 frontmatter 声明：

- `type`：文档层级，例如 `recipe`、`reference`、`getting-started` 或 `faq`。
- `capability`：能力标识，例如 `events`、`actions-state`、`rootpath`。
- `related`：相关文档路径，供作者和 AI Skill 建立任务、模型和校验之间的导航关系。

每篇能力文档末尾应保留「关联文档」或「任务路径」区块。AI Skill 应先读取目标任务的 Recipe，再读取对应 Reference 和 validateManifest 校验规则。
