---
type: reference
capability: traits
related:
  - recipes/声明数据字段组件.md
  - recipes/声明数据容器组件.md
  - recipes/声明布局容器组件.md
  - recipes/声明插槽.md
  - reference/validateManifest校验规则.md
---
# Traits 能力模型

Traits 用于声明组件具备什么能力。它不是样式分类，而是宿主、设计器、表达式和 AI 工具理解组件角色的协议。

Traits 之间不互斥，一个组件可以同时声明多个 trait。例如 Form 同时是 `DATA_CONTAINER`（管理表单值）与 `LAYOUT_CONTAINER`（拖入字段子组件）；ClickableCard 可以同时是 `LAYOUT_CONTAINER` 与 `INTERACTION_CLICKABLE`。

---

## Trait 总览

| Trait | 常量 | 适用组件 | 声明后含义 |
|-------|------|----------|------------|
| `Data.Field` | `COMPONENT_TRAIT.DATA_FIELD` | Input、Select、Switch、DatePicker | 组件是一个数据字段 |
| `Data.Container` | `COMPONENT_TRAIT.DATA_CONTAINER` | Form、Table、List、CardList | 组件管理一组数据作用域 |
| `Layout.Container` | `COMPONENT_TRAIT.LAYOUT_CONTAINER` | 通用容器：Card、Grid、Section；强组合关系：Tabs、Steps、Form（带 `nesting` 类型约束） | 组件具备**默认 children 区域**（与 `manifest.slots` 是两条独立机制） |
| `Interaction.Clickable` | `COMPONENT_TRAIT.INTERACTION_CLICKABLE` | Button、Link、ClickableCard | 组件具备点击交互语义 |
| `Interaction.Drillable` | `COMPONENT_TRAIT.INTERACTION_DRILLABLE` | Chart、Table、CardList | 宿主为组件实例提供受控下钻路径、动作和导航请求事件 |

---

## DATA_FIELD

### 什么时候声明

组件有一个主要业务值，并通过 `value` / `onChange` 与宿主同步。

### 作者要做什么

- 声明 `COMPONENT_TRAIT.DATA_FIELD`。
- 声明 `meta.valueSchema`。
- 组件接收并渲染 `value`，值变化时调用 `onChange(nextValue)`。
- 如组件支持只读/必填/标签语义，分别接收 `readOnly` / `required` / `label`；置于数据容器内时支持 `name`。

下列 props / actions / state / events 由引擎在声明 `DATA_FIELD` 后**自动注入并合并到 manifest**，作者一般**不需要**在自己的 manifest 中重复声明——重复声明会**覆盖**引擎注入的版本（包括 `valueSchema` 自动特化），破坏对外行为一致性。仅当组件**确有特化需求**（例如定制 `setValue.params` 取值规则）时，才建议显式声明覆盖：

#### 自动注入的 props

| Prop | 类型 | 说明 |
|------|------|------|
| `value` | 由 `meta.valueSchema` 决定 | 字段当前值 |
| `readOnly` | `boolean` | 是否只读 |
| `required` | `boolean` | 是否必填 |
| `name` | `string` | 字段名（容器内组织值用） |
| `label` | `string` | 显示标签 |
| `labelStrategy` | 标签策略对象 | 字段级标签策略局部覆盖；未设置时向上继承（FieldLayout / Form / Page / 默认） |

#### 自动注入的 actions

| Action | 说明 |
|--------|------|
| `getValue` | 获取当前值；返回类型由 `valueSchema` 特化 |
| `setValue({ value, triggerEvent? })` | 设置值；返回 `{ newValue, oldValue }`；`triggerEvent` 默认 `true` |
| `getReadOnly` / `setReadOnly({ readOnly })` / `toggleReadOnly` | 只读状态读写与切换 |
| `getRequired` / `setRequired({ required })` / `toggleRequired` | 必填状态读写与切换 |
| `triggerValueChange({ newValue?, oldValue? })` | 手动触发 `valueChange` 事件，用于 `updateFields` / 直写 Store 等绕过 `setValue` 的场景 |

#### 自动注入的 state

| State | Schema | 说明 |
|-------|--------|------|
| `value` | `meta.valueSchema` | 当前值；schema 由 `valueSchema` 自动透传 |
| `readOnly` | `boolean` | 当前只读状态 |
| `required` | `boolean` | 当前必填状态 |

#### 自动注入的 events

| Event | 说明 |
|-------|------|
| `valueChange` | 值变更事件；`onChange(nextValue)` 或 `setValue` 默认触发；可被事件编排消费 |

### 宿主可据此做什么

- 注入和回写字段值，在数据容器内按 `name` 组织值。
- 让表达式、设计器和 AI 工具识别 value 类型与字段语义。
- 基于 `valueSchema` 自动特化 `getValue` / `setValue` / `state.value` 的类型描述。
- 统一管理只读/必填状态，支持事件编排基于 `readOnly` / `required` / `value` 状态联动。

---

## DATA_CONTAINER

### 什么时候声明

组件自身管理子字段的数据空间，例如 Form 或 Table。

### 作者要做什么

- 声明 `COMPONENT_TRAIT.DATA_CONTAINER`。
- 声明 `meta.valueSchema` 描述容器数据结构。
- 在子组件渲染区域用 `DataScope`（从 `cdp-material-sdk/host-react` 导入）建立数据作用域；`DataScope` 不接受 `componentId` 入参，由引擎运行时自动装配。
- 如需读写容器数据，使用 `cdp-material-sdk/host-react` 中的 `useDataContainer` / `useDataContainerApi`。

### 宿主可据此做什么

- 为容器分配独立数据空间。
- 支持子字段写入容器 value。
- 让表达式和 AI 工具理解容器数据结构。
- 基于 `DataScope` 提供的作用域，在表达式、设计器、表单校验中准确定位子字段。

---

## LAYOUT_CONTAINER

### 什么时候声明

组件需要一个**默认 children 区域**：设计器中拖入的子节点会被宿主递归渲染并作为 React `children` 传入。

只通过命名 / 作用域 / 动态插槽承载子内容的组件**不需要**声明此 trait，直接通过 `manifest.slots` 即可。

### 作者要做什么

- 声明 `COMPONENT_TRAIT.LAYOUT_CONTAINER`。
- 在组件实现中渲染 `children`。
- 需要限制默认 children 区域的子组件类型、最少/最多数量、或能作为子节点的父组件时，声明 `nesting`。
- 详细任务步骤见 [声明布局容器组件](../recipes/声明布局容器组件.md)。

### 与 slots 的关系

宿主在运行时独立判断 `LAYOUT_CONTAINER` trait 与 `manifest.slots`：前者控制默认 children 区域，后者控制具名插槽。两者可以并存，也可以独立使用。

### 宿主可据此做什么

- 在设计器中允许拖入子组件。
- 根据 `nesting` 约束过滤可拖入的组件与数量。
- 识别组件的布局容器语义。

---

## INTERACTION_CLICKABLE

### 什么时候声明

组件的核心行为是点击，例如 Button、Link、IconButton 或可点击卡片。

### 作者要做什么

- 声明 `COMPONENT_TRAIT.INTERACTION_CLICKABLE`。
- 如果需要触发编排，声明 `events: { click: { title: '点击' } }`。
- 组件实际触发点击时调用对应 `onClick`。

### 宿主可据此做什么

- 识别组件具备点击交互能力。
- 将点击能力展示给设计器、事件系统或 AI 工具。

---

## INTERACTION_DRILLABLE

### 什么时候声明

组件能够沿数据层级进入下一层并返回历史层，例如图表维度下钻、表格或卡片列表的下一级记录。

### 作者要做什么

- 声明 `COMPONENT_TRAIT.INTERACTION_DRILLABLE`。
- 接收宿主注入的 `drillPath`，并以适合自身布局的方式展示路径。
- 用户选择历史层时调用 `onDrillNavigateRequest({ index })`。
- 不在组件内部维护第二份路径状态，也不在 manifest 重复声明 trait 自动提供的 props、event、actions 和 state。

完整契约与编排边界见 [层级下钻能力模型](./层级下钻能力模型.md)。

---

## Traits 与 valueSchema

声明 `DATA_FIELD` 或 `DATA_CONTAINER` 时，建议同时声明 `meta.valueSchema`。

```ts
traits: [COMPONENT_TRAIT.DATA_FIELD],
meta: {
  title: '输入框',
  category: COMPONENT_CATEGORY.DATA_ENTRY,
  valueSchema: { type: 'string', default: '' },
},
```

如果声明了数据 trait 但缺少 `valueSchema`，`validateManifest()` 会给出 warning。

---

## 选择表

| 组件场景 | 推荐 traits |
|----------|-------------|
| 输入框、选择器、开关 | `DATA_FIELD` |
| 表单 | `DATA_CONTAINER` + `LAYOUT_CONTAINER`（搭配 `nesting.allowedChildren` 锁定 FormItem 等） |
| 表格、列表 | `DATA_CONTAINER`，列/行模板用动态 / 作用域 `slots` |
| 卡片、栅格、Section（通用 children 区域） | `LAYOUT_CONTAINER` |
| Tabs / Steps / Collapse（强组合关系） | `LAYOUT_CONTAINER` + `nesting`（子/父类型约束） |
| Modal / Card 的多具名扩展区（header / footer） | `slots` |
| 按钮、链接 | `INTERACTION_CLICKABLE` |
| 普通文本展示 | 可不声明 |

---

## 模型边界

| 边界 | 说明 |
|------|------|
| `DATA_FIELD` | 仅用于有主要业务值且能回写的组件 |
| `DATA_CONTAINER` | 用于管理子字段数据作用域；必须在子组件渲染区域提供 `DataScope`。与 `LAYOUT_CONTAINER` 不互斥，Form 这类容器应同时声明 |
| `LAYOUT_CONTAINER` | 控制**默认 children 区域**开关，仅影响 `schema.children` 是否被宿主递归渲染。具名子区域走 `manifest.slots`，与本 trait 互不依赖 |
| `INTERACTION_CLICKABLE` | 表示具备点击语义；需要编排响应时再声明 click event |
| `INTERACTION_DRILLABLE` | 表示具备层级下钻语义；宿主维护路径状态，组件只做受控展示与导航请求 |

数据 trait 与 `meta.valueSchema` 的校验级别见 [validateManifest 校验规则](./validateManifest校验规则.md)。

---

## 任务路径

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 任务 Recipe：[声明数据字段组件](../recipes/声明数据字段组件.md)
- 任务 Recipe：[声明数据容器组件](../recipes/声明数据容器组件.md)
- 任务 Recipe：[声明布局容器组件](../recipes/声明布局容器组件.md)
- 任务 Recipe：[声明插槽](../recipes/声明插槽.md)
- 校验规则：[validateManifest校验规则](./validateManifest校验规则.md)
