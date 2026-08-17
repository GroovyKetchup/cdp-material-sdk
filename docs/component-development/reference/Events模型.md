---
type: reference
capability: events
related:
  - recipes/声明事件.md
  - recipes/使用Adapter适配组件API.md
  - reference/validateManifest校验规则.md
  - reference/示例代码索引.md
---
# Events 模型

Events 用于描述组件会向宿主发出的通知。事件是可选能力，不需要对外通知时可以不声明。

声明事件时优先使用标准事件；只有标准事件无法表达业务语义或 payload 结构时，才声明自定义事件。

---

## 事件类型

| 类型 | 声明位置 | 说明 |
|------|----------|------|
| 标准事件 | `events` | 宿主协议内置事件，例如 `click`、`valueChange` |
| 自定义事件 | `customEvents` | 组件或业务自定义事件，必须 namespaced |
| Adapter 事件 | `adapter.events` / `adapter.customEvents` | 将组件实际事件 prop、回调参数和作用域映射到 manifest 事件 |

---

## 标准事件

```ts
events: {
  click: { title: '点击' },
  valueChange: { title: '值变化' },
}
```

标准事件类型必须属于 SDK 定义的事件协议。

标准事件表：

| type | 含义 | 标准 payload | 标准 props |
|------|------|--------------|------------|
| `mount` | 组件挂载 | 无 | `onMount` |
| `unmount` | 组件卸载 | 无 | `onUnmount` |
| `click` | 点击 | 无 | `onClick` |
| `focus` | 聚焦 | 无 | `onFocus` |
| `blur` | 失焦 | 无 | `onBlur` |
| `valueChange` | 主值变化 | `{ newValue: any; oldValue: any }` | `onChange` |
| `itemClick` | 条目点击 | `{ index: number; item: Record<string, any> }` | `onItemClick` |
| `itemDoubleClick` | 条目双击 | `{ index: number; item: Record<string, any> }` | `onItemDoubleClick` |
| `itemRightClick` | 条目右键点击 | `{ index: number; item: Record<string, any> }` | `onItemRightClick` |
| `itemLongPress` | 条目长按 | `{ index: number; item: Record<string, any> }` | `onItemLongPress` |
| `dataFetch` | 请求数据 | `{ panelCode: string; condition?: Record<string, any>; keyword?: string; pageNo?: number; pageSize?: number; orderBy?: Array<Record<string, unknown>>; advancedConditions?: Record<string, unknown> }` | `onDataFetch` |
| `optionsFetch` | 请求远程选项 | `{ panelCode: string; fieldName: string; condition?: Record<string, any>; keyword?: string; extraFieldNames?: string[]; fieldInfo?: { fieldName: string } }` | `onOptionsFetch` |

这里的标准 props 是组件作者建议暴露的回调 prop 名。第三方组件实际 prop 名不同，或回调参数不符合标准 payload 时，使用 Adapter 映射。

### canonical schema 与 resolved manifest

标准事件的 title / description / payloadSchema 由 SDK 的 `STANDARD_EVENT_DEFINITIONS` 提供事实源。组件作者声明标准事件时**只能**覆盖 `title` / `description` / `deprecated`，不能声明 `payloadSchema`；`payloadSchema` 由宿主在注册期通过 `resolveComponentManifest()` 统一补齐，得到可直接消费的 `ResolvedComponentManifest`。

解析规则：

- void 事件不声明 `payloadSchema`；缺少该字段即表示事件没有 payload。
- 不要用空对象 `{}` 表示无 payload——空 JSON Schema 表示允许任意 payload。
- 也不要使用 `{ type: 'null' }`——它表示 payload 存在且值为 `null`。
- 有 payload 的标准事件最终强制使用 SDK 的 canonical `payloadSchema`，组件无法覆盖。
- object schema 不设置 `additionalProperties: false`，保留向后兼容和协议扩展空间。
- `customEvents` 继续由作者提供 `payloadSchema`，resolver 不改变其语义。

`fieldInfo` 仅存在于 `optionsFetch` 的 canonical payload，已废弃，请直接使用顶层 `fieldName`。

---

## 自定义事件

```ts
customEvents: {
  'acme:rowClick': {
    title: '行点击',
    payloadSchema: {
      type: 'object',
      properties: {
        rowKey: { type: 'string' },
      },
    },
  },
}
```

规则：

- 事件名必须是 namespaced 形态，例如 `acme:rowClick`。
- 必须声明 `payloadSchema`。

---

## Adapter 映射

Adapter 用于把组件实际 props 和回调参数转换为 CDP 事件协议。它适合第三方组件 prop 名不同，或回调参数需要转换成标准 payload 的场景。完整用法见 [使用 Adapter 适配组件 API](../recipes/使用Adapter适配组件API.md)。

标准事件 prop 名不同：

```ts
events: {
  click: { title: '点击' },
},
adapter: {
  events: {
    click: {
      propName: 'onPress',
    },
  },
},
```

标准事件 payload 不同：

```ts
events: {
  valueChange: { title: '值变化' },
},
adapter: {
  events: {
    valueChange: {
      propName: 'onSelectedValueChange',
      transform: (nextValue, previousValue) => ({
        newValue: nextValue,
        oldValue: previousValue,
      }),
    },
  },
},
```

自定义事件映射：

```ts
customEvents: {
  'acme:rowAction': {
    title: '行操作',
    payloadSchema: {
      type: 'object',
      properties: {
        action: { type: 'string' },
        rowKey: { type: 'string' },
      },
    },
  },
},
adapter: {
  customEvents: {
    'acme:rowAction': {
      propName: 'onRowAction',
      transform: (action, record) => ({
        action,
        rowKey: record.id,
      }),
    },
  },
},
```

Adapter 只能映射已经声明过的事件。具体校验级别见 [validateManifest 校验规则](./validateManifest校验规则.md)。

---

## 事件与 actions 的区别

| 对比 | Events | Actions |
|------|--------|---------|
| 方向 | 组件通知宿主 | 宿主调用组件 |
| 触发者 | 组件内部行为 | 外部流程、指令或 AI |
| 示例 | 点击、值变化、行选择 | 刷新、清空、聚焦 |


---

## 任务路径

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 任务 Recipe：[声明事件](../recipes/声明事件.md)
- 任务 Recipe：[使用Adapter适配组件API](../recipes/使用Adapter适配组件API.md)
- 校验规则：[validateManifest校验规则](./validateManifest校验规则.md)
- 示例索引：[示例代码索引](./示例代码索引.md)
