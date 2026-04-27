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
| `Layout.Container` | `COMPONENT_TRAIT.LAYOUT_CONTAINER` | Card、Grid、Tabs、Collapse | 组件可以承载子组件或插槽内容 |
| `Interaction.Clickable` | `COMPONENT_TRAIT.INTERACTION_CLICKABLE` | Button、Link、ClickableCard | 组件具备点击交互语义 |

---

## DATA_FIELD

### 什么时候声明

组件有一个主要业务值，并通过 `value` / `onChange` 与宿主同步。

### 作者要做什么

- 声明 `COMPONENT_TRAIT.DATA_FIELD`。
- 声明 `meta.valueSchema`。
- 组件接收 `value`。
- 值变化时调用 `onChange(nextValue)`。

### 宿主可据此做什么

- 注入和回写字段值。
- 在数据容器内按字段名组织值。
- 让表达式、设计器和 AI 工具识别 value 类型。
- 基于 `valueSchema` 推断标准 value 状态。

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

组件可以承载子组件、插槽或模板内容。

### 作者要做什么

- 声明 `COMPONENT_TRAIT.LAYOUT_CONTAINER`。
- 在组件实现中渲染 `children`（单一区域）或对应 slot 内容（多具名区域）。
- 需要限制子组件类型、最少/最多数量、或能作为子节点的父组件时，声明 `nesting`。
- 详细任务步骤见 [声明布局容器组件](../recipes/声明布局容器组件.md)。

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
| 表单 | `DATA_CONTAINER` + `LAYOUT_CONTAINER` |
| 表格、列表 | `DATA_CONTAINER`，按需加 `LAYOUT_CONTAINER` |
| 卡片、栅格、Tabs | `LAYOUT_CONTAINER` |
| 按钮、链接 | `INTERACTION_CLICKABLE` |
| 普通文本展示 | 可不声明 |

---

## 模型边界

| 边界 | 说明 |
|------|------|
| `DATA_FIELD` | 仅用于有主要业务值且能回写的组件 |
| `DATA_CONTAINER` | 用于管理子字段数据作用域；必须在子组件渲染区域提供 `DataScope`。与 `LAYOUT_CONTAINER` 不互斥，Form 这类容器应同时声明 |
| `LAYOUT_CONTAINER` | 表示可承载子内容；有明确区域时建议同时声明 slots |
| `INTERACTION_CLICKABLE` | 表示具备点击语义；需要编排响应时再声明 click event |

数据 trait 与 `meta.valueSchema` 的校验级别见 [validateManifest 校验规则](./validateManifest校验规则.md)。

---

## 任务路径

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 任务 Recipe：[声明数据字段组件](../recipes/声明数据字段组件.md)
- 任务 Recipe：[声明数据容器组件](../recipes/声明数据容器组件.md)
- 任务 Recipe：[声明布局容器组件](../recipes/声明布局容器组件.md)
- 任务 Recipe：[声明插槽](../recipes/声明插槽.md)
- 校验规则：[validateManifest校验规则](./validateManifest校验规则.md)
