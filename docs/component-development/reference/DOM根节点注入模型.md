---
type: reference
capability: rootpath
related:
  - reference/引擎基础能力模型.md
  - recipes/配置DOM根节点注入.md
  - reference/Manifest字段参考.md
  - reference/validateManifest校验规则.md
---
# DOM 根节点注入模型

DOM 根节点注入定义宿主把组件基础能力所需的根节点 props 注入到组件 props 的位置。

字段路径：`manifest.engine.render.injection.rootPath`。

`rootPath` 是 SDK 字段名。对组件作者来说，可以把它理解为“组件真实 DOM 根节点在哪里接收宿主注入”。

DOM 根节点注入不是单纯的 DOM 标记配置。它决定宿主赋予组件的基础能力能否与真实 DOM 对齐，尤其影响设计器选中、路径定位和显隐控制。基础能力模型见 [引擎基础能力模型](./引擎基础能力模型.md)。

---

## 宿主需要注入什么

宿主会向组件根节点注入实现基础能力所需的 props 和 ref。组件作者不需要关心宿主内部使用了哪些 DOM 标记，只需要确保这些 props 最终落到真实 DOM 节点上。

---

## 为什么 DOM 根节点注入是必确认项

| 如果注入位置正确 | 如果注入位置不正确 |
|-------------------|---------------------|
| 设计器能定位和选中组件根节点 | 选中框可能偏移或找不到目标 DOM |
| 路径定位能与真实组件区域对齐 | 路径定位不稳定 |
| 显隐控制能作用于真实组件根节点 | 显隐控制可能只影响 wrapper 或无效节点 |
| ref 和系统属性能进入正确节点 | 运行时能力可能无法与组件 DOM 对齐 |

因此，正式组件开发时应把 DOM 根节点注入当作交付前必须确认的契约，而不是可选优化。

---

## 支持的模式

| rootPath 字段值 | 说明 | 推荐场景 |
|----------|------|----------|
| 不声明 | 宿主外层 `<div>` 兜底 | 黑盒组件、临时接入 |
| `$root` | 直接合并到组件 props 根层 | props 会透传到根 DOM 的原子组件 |
| `slotProps.root` | 注入到 `slotProps.root` | 推荐默认方式 |
| 自定义路径 | 注入到指定 props 路径 | 包装组件或特殊组件 API |

---

## 推荐模式：`slotProps.root`

```tsx
<div {...slotProps?.root}>...</div>
```

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

## 自定义路径

自定义路径不是错误，但作者必须负责透传：

```ts
engine: {
  render: {
    injection: {
      rootPath: 'containerProps.root',
    },
  },
},
```

```tsx
<section {...props.containerProps?.root}>...</section>
```

`validateManifest()` 会提示确认透传是否完成。若已按规则实现，可忽略该 warning。

---

## 选择建议

| 场景 | 建议 |
|------|------|
| 新组件 | `slotProps.root` |
| 包装第三方组件 | wrapper 外层 DOM + `slotProps.root` |
| 原子 DOM 组件 | `$root` |
| 黑盒组件 | 不声明 rootPath |

---

## 模型边界

| 边界 | 说明 |
|------|------|
| 真实 DOM | 宿主系统属性需要最终落到真实 DOM 节点，不能只停留在不会透传 DOM 属性的 React 组件上 |
| 宿主兜底 | 不声明 rootPath 时，宿主可以外层 wrapper 兜底，但可能影响 DOM 结构 |
| 自定义路径 | 合法，但作者必须确认该路径会透传到 DOM |
| 基础能力 | 基础能力由宿主提供，DOM 根节点注入负责让这些能力与真实 DOM 对齐 |

具体 warning 处理建议见 [validateManifest 校验规则](./validateManifest校验规则.md)。

---

## 任务路径

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 模型参考：[引擎基础能力模型](./引擎基础能力模型.md)
- 任务 Recipe：[配置DOM根节点注入](../recipes/配置DOM根节点注入.md)
- 字段参考：[Manifest字段参考](./Manifest字段参考.md)
- 校验规则：[validateManifest校验规则](./validateManifest校验规则.md)
