---
type: recipe
capability: props
related:
  - reference/Manifest字段参考.md
  - reference/Traits能力模型.md
  - reference/validateManifest校验规则.md
  - recipes/使用Adapter适配组件API.md
  - recipes/声明数据字段组件.md
---
# 声明 props

`props` 是组件向**设计器、表达式、AI 工具**暴露的**可配置项契约**。它使用标准 JSON Schema——具体类型为 `ObjectSchema extends JSONSchema7`，要求 `type: 'object'`，`properties` 内每项是 `ExtendedJSONSchema7`（在标准 JSON Schema 之上加了少量 CDP 设计器扩展字段）。

manifest 的 `props` **不是 React 组件 props 接口的镜像**：前者是面向设计器的声明、用 schema 表达；后者是组件运行时接收的参数、用 TS 类型表达。两者会重叠，但语义和职责不同。

---

## 适用场景

- 组件有用户/设计器**可配置**的输入项（占位符、列配置、模式枚举、阈值）。
- 组件需要让表达式或 AI 工具读取、推断、生成配置。
- 组件需要把第三方 prop 通过设计器暴露给业务用户。

---

## 可以跳过的情况

- 组件是纯展示，没有可配置项 → 整个 `props` 字段省略即可。
- 字段已经由 trait 自动注入（如 `DATA_FIELD` 的 `value` / `readOnly` / `required` / `name` / `label` / `labelStrategy`）→ 不要重复声明。
- 字段是组件**内部运行时状态** → 走 `state`。
- 字段是**命令式调用** → 走 `actions`。
- 字段是**事件**（含回调） → 走 `events` / `customEvents`。

---

## 作者职责

1. 顶层结构是 `{ type: 'object', properties: { ... } }`，遵循 `ObjectSchema`。
2. 每个字段给出合适的 `type` 和 **`title`**（设计器作为字段标签使用，`validateManifest()` 缺失会 warning）。
3. 设计器需要选项的字段，用 `oneOf` 配 `{ const, title }`（更友好）或 `enum`（仅值列表）。
4. 嵌套配置用 `type: 'object' + properties` 或 `type: 'array' + items`。
5. 默认值写在 `default` 字段，**而不是**依赖 React 组件的参数默认值——后者设计器看不到。
6. **不要重复声明 trait 自动注入的 props**，除非确有特化需求并能在 PR / 注释中说明原因。
7. **不要把事件回调、内部状态、宿主注入的运行时数据写进 `props`**。

---

## 基础写法

```ts
props: {
  type: 'object',
  properties: {
    placeholder: { type: 'string', title: '占位提示' },
    maxLength: { type: 'number', title: '最大长度', default: 100 },
    disabled: { type: 'boolean', title: '禁用' },
  },
},
```

---

## title / description / default

| 字段 | 用途 |
|------|------|
| `title` | 设计器中展示的字段标签；建议每个 prop 都写 |
| `description` | 鼠标提示 / AI 上下文；复杂或易误用的字段建议写 |
| `default` | 设计器为字段填入的默认值；写在这里而不是 React 组件的参数默认值上，设计器才能感知 |

```ts
search: {
  type: 'array',
  title: '搜索栏字段',
  description: '在表格上方渲染搜索条件',
  items: {
    type: 'object',
    properties: {
      width: { type: 'number', title: '宽度(px)', default: 180 },
    },
  },
},
```

---

## 枚举：oneOf / enum

需要给设计器下拉选项的字段，**用 `oneOf` 配 `{ const, title }`**——`const` 是值，`title` 是显示文本。比裸 `enum` 更友好，因为可以为每个值单独指定中文标签：

```ts
align: {
  type: 'string',
  title: '对齐',
  oneOf: [
    { const: 'left', title: '左对齐' },
    { const: 'center', title: '居中' },
    { const: 'right', title: '右对齐' },
  ],
},
```

只有值列表、不需要差异化标签时，用 `enum`：

```ts
size: {
  type: 'string',
  title: '尺寸',
  enum: ['small', 'medium', 'large'],
},
```

---

## 嵌套 — 对象与数组

**对象**：

```ts
sort: {
  type: 'object',
  title: '排序',
  properties: {
    enable: { type: 'boolean', title: '启用排序' },
  },
},
```

**数组（`items` 是对象）**：

```ts
columns: {
  type: 'array',
  title: '列配置',
  items: {
    type: 'object',
    properties: {
      title: { type: 'string', title: '列标题' },
      dataIndex: { type: 'string', title: '字段名', format: 'dataField' },
      width: { type: 'number', title: '列宽' },
    },
  },
},
```

数组与对象可以多层嵌套（参见 Table 组件 `props.columns[*].filter.options[*]` 这类三层结构）。设计器会按嵌套结构折叠/展开。

---

## format — 设计器控件提示

`format` 是 JSON Schema 标准字段，CDP 设计器消费它来选择更合适的控件。常见值：

| `format` | 设计器表现 |
|----------|------------|
| `'dataField'` | 字段选择器（可选当前作用域内的数据字段） |
| `'panelButton'` | 按钮选择器 |
| `'color'` | 颜色选择器 |
| `'icon'` | 图标选择器 |
| `'expression'` | 表达式编辑器 |

```ts
dataIndex: { type: 'string', title: '字段名', format: 'dataField' },
```

未列出的 `format` 由设计器/物料各自约定，CDP 不强制。

---

## 与 trait 自动注入 props 的边界

trait 会向 manifest 自动注入一组 props，作者**不要在 `props.properties` 里重复声明**——重复声明会**覆盖**引擎注入版本，丢失自动特化（典型是 `DATA_FIELD` 对 `value` 的 `valueSchema` 特化）。详见 [Traits 能力模型](../reference/Traits能力模型.md)。

| trait | 自动注入的 props | 写进 `props.properties`？ |
|-------|------------------|--------------------------|
| `DATA_FIELD` | `value` / `readOnly` / `required` / `name` / `label` / `labelStrategy` | **否**（除非确有特化需求） |

`props.properties` 只写**业务专属**字段（如 `placeholder` / `maxLength` / 枚举选项 / 嵌套配置）。

---

## 与 adapter.propMapping 的协作

`props.properties` 的 key 是**面向设计器的 CDP 名**；如果 React 组件实际接收的 prop 名不同（如第三方组件使用 `selectedValue`），通过 `adapter.propMapping` 在引擎层映射，**`props.properties` 不需要跟着改名**：

```ts
props: {
  type: 'object',
  properties: {
    value: { type: 'string', title: '值' },
  },
},
adapter: {
  propMapping: {
    value: 'selectedValue',
  },
},
```

完整决策见 [使用 Adapter 适配组件 API · wrapper vs adapter 决策框架](./使用Adapter适配组件API.md#wrapper-vs-adapter-决策框架)。

---

## ExtendedJSONSchema7 扩展字段

CDP 在标准 JSON Schema 之上加了少量 `x-` 字段（`ExtendedJSONSchema7`），用于设计器特定能力：

| 字段 | 用途 |
|------|------|
| `'x-dynamic-enum'` | 动态枚举来源配置（运行时拉取选项） |
| `'x-slot'` | 标记该字段对应一个插槽 |
| `'x-editableSelectOptions'` | 可编辑下拉选项 |
| `placeholder` | 设计器输入框的占位文本 |
| `allowedTabs` | 多 tab 设计器面板中允许出现该字段的 tab 列表 |

具体语义和触发条件由设计器维护，本文档不展开。

---

## 完整示例

```ts
import {
  COMPONENT_CATEGORY,
  COMPONENT_TRAIT,
  INJECT_PATH_SLOT_PROPS,
  type ComponentManifest,
} from 'cdp-material-sdk/portable';

export const acmeInputManifest = {
  type: 'acme.Input',
  traits: [COMPONENT_TRAIT.DATA_FIELD],
  meta: {
    title: '输入框',
    category: COMPONENT_CATEGORY.DATA_ENTRY,
    valueSchema: { type: 'string', default: '' },
  },
  engine: {
    render: { injection: { rootPath: INJECT_PATH_SLOT_PROPS } },
  },
  // value / readOnly / required / name / label / labelStrategy 由 DATA_FIELD trait 自动注入，不在此声明
  props: {
    type: 'object',
    properties: {
      placeholder: { type: 'string', title: '占位提示' },
      maxLength: { type: 'number', title: '最大长度' },
      align: {
        type: 'string',
        title: '对齐',
        oneOf: [
          { const: 'left', title: '左对齐' },
          { const: 'center', title: '居中' },
          { const: 'right', title: '右对齐' },
        ],
      },
    },
  },
} satisfies ComponentManifest;
```

---

## 自检

- [ ] 顶层是 `{ type: 'object', properties: { ... } }`。
- [ ] 每个字段都有 `title`。
- [ ] 枚举类字段用 `oneOf` 配 `{ const, title }` 或 `enum`。
- [ ] 嵌套结构正确使用 `type: 'object' + properties` 或 `type: 'array' + items`。
- [ ] 默认值写 `default`，不依赖 React 组件参数默认值。
- [ ] **没有**重复声明 trait 自动注入的 props（除非确有特化需求并能说明）。
- [ ] **没有**把事件回调或运行时状态写进 `props`。
- [ ] `validateManifest()` 没有 error。

---

## 常见错误

### 把所有 React props 都搬进 manifest

manifest `props` 是**对外可配置项契约**，不是 React props 接口的镜像。运行时回调（`onChange`）、内部状态、宿主注入的运行时数据都不该出现在这里。

### 重复声明 trait 自动注入的 props

`DATA_FIELD` 已自动注入 `value` / `readOnly` / `required` / `name` / `label` / `labelStrategy`。再写一遍会**覆盖**引擎版本，丢失 `valueSchema` 特化。仅在确有特化需求（收窄类型、补更具体的 `title` / `description`）时显式覆盖，并在 PR / 注释中说明原因。

### 默认值写在 React 组件而不是 `default`

React 组件参数默认值设计器看不到，物料面板也无法预填。把面向设计器的默认值写在 `props.properties.X.default`。

### 把 manifest props key 当成 React prop 名

`props.properties` 的 key 是**面向设计器的 CDP 名**。第三方组件实际接收的 prop 名不同时，用 `adapter.propMapping` 在引擎层映射，不要为了贴合第三方而改 manifest key——manifest key 才是表达式、AI、配置 UI 看到的稳定名字。

### 缺 `title`

`validateManifest()` 会 warning。设计器没有 `title` 时会 fallback 到 key 名，体验差且不利于 i18n。

### 用 `enum` 代替 `oneOf` 失去差异化标签

`enum` 只有值列表，设计器只能直接显示值字符串。需要每个选项有中文标签时改用 `oneOf` 配 `{ const, title }`。

---

## 关联文档

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 字段参考：[Manifest 字段参考](../reference/Manifest字段参考.md)
- 模型参考：[Traits 能力模型](../reference/Traits能力模型.md)
- 校验规则：[validateManifest 校验规则](../reference/validateManifest校验规则.md)
- 任务 Recipe：[使用 Adapter 适配组件 API](./使用Adapter适配组件API.md)
- 任务 Recipe：[声明数据字段组件](./声明数据字段组件.md)
