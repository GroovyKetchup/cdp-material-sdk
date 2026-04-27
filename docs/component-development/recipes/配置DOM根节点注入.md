---
type: recipe
capability: rootpath
related:
  - reference/引擎基础能力模型.md
  - reference/DOM根节点注入模型.md
  - reference/Manifest字段参考.md
  - reference/validateManifest校验规则.md
  - recipes/接入第三方React组件库.md
---
# 配置 DOM 根节点注入

DOM 根节点注入用于告诉宿主：组件真实 DOM 根节点应该从 props 的哪个位置接收宿主注入。

字段路径：`manifest.engine.render.injection.rootPath`。

`rootPath` 是 SDK 字段名。对正式组件来说，DOM 根节点注入是必须确认的交付点。它影响宿主赋予的基础能力能否准确落到组件真实根节点，尤其是设计器选中、路径定位和显隐控制。

---

## 适用场景

- 组件需要被设计器选中、定位或控制显隐。
- 组件希望宿主把基础能力所需的 props 和 ref 注入到真实 DOM 根节点。
- 组件包装了第三方组件，需要决定注入到 wrapper 还是内部根节点。
- 组件需要可靠响应宿主基础显隐能力，例如 `setHidden` 和 `toggleHidden`。

---

## 可以跳过的情况

如果组件是完全黑盒组件，或只是临时接入，可以不声明 `rootPath`。宿主会在外层套 `<div>` 兜底。

但正式组件建议显式声明并透传根节点属性。

---

## 引擎基础能力与 DOM 根节点

宿主会为所有组件补充基础能力，包括：

| 能力 | 说明 | 组件作者要确认什么 |
|------|------|-------------------|
| `hidden` prop | 当前组件是否隐藏 | 不要把它误覆盖成其他语义 |
| `getHidden` / `setHidden` / `toggleHidden` | 获取、设置、切换显隐状态 | 不要在 manifest 中重复声明同名 action |
| `hidden` state | 暴露当前显隐状态 | 不要在 manifest 中重复声明同名 state |
| `mount` / `unmount` events | 基础生命周期事件 | 不需要为普通组件重复声明 |

组件作者不需要关心宿主内部如何实现这些能力，只需要确认 DOM 根节点注入位置正确。若 `rootPath` 没有指向真实根节点，显隐、选中框和调试定位都可能偏移。

完整模型见 [引擎基础能力模型](../reference/引擎基础能力模型.md)。

---

## 推荐方式：slotProps.root

组件：

```tsx
import { forwardRef } from 'react';
import type { BaseUIProps } from 'cdp-material-sdk/portable';

export const MyCard = forwardRef<HTMLDivElement, BaseUIProps<HTMLDivElement>>((props, ref) => {
  const { slotProps } = props;

  return (
    <div {...slotProps?.root} ref={ref}>
      内容
    </div>
  );
});
```

Manifest：

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

确认点：

- `slotProps.root` 必须展开到真实 DOM 节点。
- `ref` 应落到同一个根 DOM，避免系统属性和 ref 分离。
- 不要只把 `slotProps.root` 传给不会透传 DOM 属性的第三方 React 组件。

---

## 直接注入根 props

如果组件本身的 props 会直接透传到根 DOM，可以使用 `$root`：

```ts
engine: {
  render: {
    injection: {
      rootPath: '$root',
    },
  },
},
```

适合简单原子组件，但要确认组件不会把系统属性传给错误的内部节点。

确认点：

- 组件根 props 必须最终透传到真实 DOM。
- 如果组件内部还有 wrapper 或第三方组件，优先改用 `slotProps.root`。

---

## 自定义 rootPath

如果组件的根 DOM 注入入口在自定义路径上，也可以声明：

```ts
engine: {
  render: {
    injection: {
      rootPath: 'containerProps.root',
    },
  },
},
```

组件必须确保该路径最终透传到真实 DOM：

```tsx
const { containerProps } = props;

return <section {...containerProps?.root}>内容</section>;
```

自定义路径是合法选择。`validateManifest()` 可能会给出提示，提醒作者确认透传是否完成；如果已经按规则实现，可以忽略该提示。

---

## 不声明 DOM 根节点注入

不声明时，宿主会外层包裹 `<div>` 兜底。

适合：

- 黑盒第三方组件。
- 临时验证组件。
- 作者无法控制组件根节点。

不适合：

- 长期维护的正式组件。
- 对 DOM 结构、布局、选择态有严格要求的组件。
- 需要精确显隐控制的组件。

---

## 选择表

| 场景 | 推荐 |
|------|------|
| 组件可改源码 | `INJECT_PATH_SLOT_PROPS` |
| props 会直接透传到根 DOM | `$root` |
| 第三方组件外层 wrapper | `INJECT_PATH_SLOT_PROPS` |
| 注入入口是自定义路径 | 自定义 `rootPath` |
| 完全黑盒组件 | 不声明，使用宿主兜底 |

如果不确定，正式组件优先选择 `INJECT_PATH_SLOT_PROPS`，并在组件根 DOM 展开 `slotProps.root`。

---

## 验收步骤

1. 在 manifest 中声明 `engine.render.injection.rootPath`。
2. 在组件实现中把对应 props 展开到真实根 DOM。
3. 在宿主中选中该组件，确认选中框与真实视觉区域一致。
4. 触发显隐控制，确认目标组件的显示/隐藏效果符合预期。
5. 如果使用自定义路径，确认路径上的 props 没有被中间组件吞掉。

---

## 自检

- [ ] rootPath 指向的 props 最终透传到了真实 DOM。
- [ ] 设计器选中框、路径定位和真实 DOM 区域一致。
- [ ] `setHidden` / `toggleHidden` 后，目标组件的显示/隐藏效果符合预期。
- [ ] 没有在 manifest 中重复声明宿主基础 `hidden` action / state。
- [ ] 不需要 rootPath 时，确认接受宿主外层 `<div>` 兜底。
- [ ] `validateManifest()` 没有 error。

---

## 常见错误

### 声明了 `INJECT_PATH_SLOT_PROPS`，但组件没有透传 `slotProps.root`

设计器可能无法选中组件，或显隐控制不符合预期。

### rootPath 只落到了第三方 React 组件

如果第三方组件不透传未知 DOM 属性，宿主注入无法到达真实 DOM。请在外层加 wrapper DOM，并把 `slotProps.root` 展开到 wrapper 上。

### 自定义 rootPath 指向了非 DOM 组件

系统属性必须最终落到真实 DOM 节点。不要只传给不会透传 DOM 属性的第三方组件。

---

## 关联文档

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 模型参考：[DOM根节点注入模型](../reference/DOM根节点注入模型.md)
- 模型参考：[引擎基础能力模型](../reference/引擎基础能力模型.md)
- 字段参考：[Manifest字段参考](../reference/Manifest字段参考.md)
- 校验规则：[validateManifest校验规则](../reference/validateManifest校验规则.md)
- 任务 Recipe：[接入第三方React组件库](./接入第三方React组件库.md)
