---
type: reference
capability: actions-state
related:
  - recipes/声明动作与状态.md
  - reference/validateManifest校验规则.md
  - reference/示例代码索引.md
---
# Actions / State 模型

Actions 和 State 共用 React ref 通道：组件通过 `useImperativeHandle` 暴露方法和只读运行时状态。

---

## Actions

Action 是宿主调用组件的方法。

Manifest：

```ts
actions: {
  refresh: {
    title: '刷新',
    returns: { type: 'boolean' },
  },
}
```

实现：

```tsx
useImperativeHandle(ref, () => ({
  refresh: async () => true,
}), []);
```

规则：

- `actions.*.title` 必填。
- `params` 如果声明，`type` 必须是 `object`。
- `returns` 建议声明。
- action key 必须和 ref 方法名一致。

---

## State

State 是组件暴露给宿主的只读运行时快照。

Manifest：

```ts
state: {
  highlighted: {
    title: '高亮状态',
    schema: { type: 'boolean' },
  },
}
```

实现：

```tsx
import { COMPONENT_STATE_KEY } from 'cdp-material-sdk/portable';

useImperativeHandle(ref, () => ({
  [COMPONENT_STATE_KEY]: {
    highlighted,
  },
}), [highlighted]);
```

规则：

- `state.*.title` 必填。
- `state.*.schema` 必填。
- state key 必须出现在 `COMPONENT_STATE_KEY` 对象中。
- state 是只读的；修改组件应通过 action。

---

## 诊断工具

```ts
import {
  COMPONENT_STATE_KEY,
  diagnoseMissingActionImpls,
  diagnoseMissingStateKeys,
} from 'cdp-material-sdk/portable';

const missingActions = diagnoseMissingActionImpls(
  Object.keys(manifest.actions ?? {}),
  ref.current,
);

const missingStates = diagnoseMissingStateKeys(
  manifest,
  ref.current?.[COMPONENT_STATE_KEY],
);
```

---

## 模型边界

| 边界 | 说明 |
|------|------|
| action key 与 ref 方法 | manifest 中声明的 action key 是宿主调用 ref 方法的名称 |
| action params | 声明参数时，`params.type` 必须是 `object` |
| state 写操作 | State 是只读运行时快照，需要修改组件时应通过 action |
| 诊断工具 | 实现一致性检查见任务文档和 `diagnoseMissingActionImpls()` / `diagnoseMissingStateKeys()` |

具体 error / warning 级别见 [validateManifest 校验规则](./validateManifest校验规则.md)。

---

## 任务路径

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 任务 Recipe：[声明动作与状态](../recipes/声明动作与状态.md)
- 校验规则：[validateManifest校验规则](./validateManifest校验规则.md)
- 示例索引：[示例代码索引](./示例代码索引.md)
