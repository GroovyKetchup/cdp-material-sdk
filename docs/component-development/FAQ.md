---
type: faq
capability: troubleshooting
related:
  - README.md
  - getting-started/05-自检与排错.md
  - reference/validateManifest校验规则.md
---
# FAQ

本文收集 CDP 组件开发中的高频问题。

---

## 我是第三方组件作者，应该先看哪份文档？

先看 [README](./README.md)。它会按你的场景分流。

第一次接入时，按 `getting-started/` 的顺序阅读。已有组件包新增组件时，直接看 [开发最小可运行组件](./getting-started/03-开发最小可运行组件.md) 和对应 Recipe。

---

## 这套文档应该怎么读？

组件开发现在统一按任务组织：

- `getting-started/`：完成最小接入闭环。
- `recipes/`：按需启用数据、事件、动作、状态、插槽等能力。
- `reference/`：查字段、查模型、查校验规则。
- `FAQ.md`：解决常见问题。

第一次接入时，建议按 `getting-started/` 顺序阅读；已有组件包新增组件时，直接查对应 Recipe 和 Reference。

---

## 事件、动作、状态都必须声明吗？

不是。

| 能力 | 是否必需 | 什么时候需要 |
|------|----------|--------------|
| events | 否 | 组件要通知宿主 |
| actions | 否 | 宿主要命令式调用组件 |
| state | 否 | 外部表达式要读取组件内部状态 |
| slots | 否 | 组件要承载子内容 |
| traits | 否 | 组件具备数据、布局或点击语义时声明 |

最小组件只需要 React 组件、`ComponentManifest`、组件包注册和自检。

---

## 我已经有组件包，只想新增组件，需要看工程搭建吗？

不需要。

建议阅读：

1. [开发最小可运行组件](./getting-started/03-开发最小可运行组件.md)
2. [创建组件包并注册](./getting-started/02-创建组件包并注册.md) 的「往已有组件包新增组件」小节
3. 对应能力 Recipe
4. [自检与排错](./getting-started/05-自检与排错.md)

---

## 我包装 Ant Design 或 ECharts 组件，文档覆盖吗？

覆盖。请从 [接入第三方 React 组件库](./recipes/接入第三方React组件库.md) 开始。

推荐方式是写一层 CDP wrapper，而不是直接裸注册第三方组件。

---

## 组件不是 React 写的怎么办？

当前 CDP 组件 runtime 是 React。非 React 组件需要自行提供 React wrapper。

例如 Web Component：

```tsx
import { forwardRef } from 'react';
import type { BaseUIProps } from 'cdp-material-sdk/portable';

export const MyWebComponentWrapper = forwardRef<HTMLElement, BaseUIProps>((props, ref) => {
  const { slotProps } = props;
  return <my-web-component {...slotProps?.root} ref={ref} />;
});
```

---

## `rootPath` 不声明可以吗？

可以。宿主会外层 `<div>` 兜底。

但正式组件建议显式声明 `engine.render.injection.rootPath`，并把对应 props 透传到真实 DOM 根节点。

推荐写法：

```ts
import { INJECT_PATH_SLOT_PROPS } from 'cdp-material-sdk/portable';

engine: {
  render: {
    injection: {
      rootPath: INJECT_PATH_SLOT_PROPS,
    },
  },
},
```

---

## 自定义 rootPath 出现 warning，是不是一定有问题？

不是。

自定义 rootPath 是合法选择。warning 的含义是提醒作者确认该路径上的 props 已经透传到真实 DOM。如果已经按规则实现，可以忽略。

---

## Loading 应该用 native、wrapper 还是 none？

| 场景 | 推荐 |
|------|------|
| 组件已有 loading prop，且能阻断交互 | `native` |
| loading prop 名不是 `loading` | `native + propName` |
| 组件没有 loading prop，但可以整体遮罩 | `wrapper` |
| 组件内部 loading 很复杂 | `none` |

注意：正确路径是 `engine.render.loading`，不是 `engine.loading`。

---

## 为什么 native 模式下仍然能点击？

这是组件实现问题。`native` 模式只负责注入 loading prop；组件自己必须在 loading 为 true 时阻断用户交互。

---

## DATA_FIELD 和 DATA_CONTAINER 有什么区别？

| Trait | 作用 |
|-------|------|
| `DATA_FIELD` | 单个数据字段，接收 `value` 并调用 `onChange` |
| `DATA_CONTAINER` | 数据容器，管理子字段的数据作用域 |

输入框、选择器用 `DATA_FIELD`。Form、Table、List 这类容器用 `DATA_CONTAINER`。

---

## 声明了 DATA_FIELD 但没有 valueSchema 可以吗？

可以运行，但不推荐。`validateManifest()` 会 warning。

`valueSchema` 能帮助设计器、表达式和 AI 工具理解组件 value 类型。

---

## Action 声明了但调用失败，怎么排查？

检查：

1. `manifest.actions` 中的 key 是否和 ref 方法名一致。
2. 组件是否使用 `forwardRef`。
3. 组件是否通过 `useImperativeHandle` 暴露方法。
4. 使用 `diagnoseMissingActionImpls()` 做运行时诊断。

---

## State 读不到，怎么排查？

检查：

1. `manifest.state` 是否声明了对应 key。
2. 组件是否通过 `COMPONENT_STATE_KEY` 暴露状态。
3. 状态值是否加入 `useImperativeHandle` deps。
4. 使用 `diagnoseMissingStateKeys()` 做运行时诊断。

---

## 可以直接导入宿主内部模块吗？

不可以。

第三方作者只应依赖 `cdp-material-sdk/portable`，必要时使用 `cdp-material-sdk/host-react`。宿主内部模块不作为第三方兼容契约。

---

## `cdp-material-sdk/host-react` 什么时候能用？

只有当外部 bundle 与宿主共享同一份 React runtime 和 Context 身份时才使用。

如果无法确认，请不要使用 `host-react`，优先通过 props、events、actions 与宿主交互。

---

## 关联文档

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 关联文档：[README](./README.md)
- 自检与排错：[05-自检与排错](./getting-started/05-自检与排错.md)
- 校验规则：[validateManifest校验规则](./reference/validateManifest校验规则.md)
