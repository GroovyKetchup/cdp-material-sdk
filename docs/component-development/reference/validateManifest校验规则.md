---
type: reference
capability: validation
related:
  - reference/Manifest字段参考.md
  - reference/Events模型.md
  - reference/ActionsState模型.md
  - reference/Slots模型.md
  - reference/DOM根节点注入模型.md
  - reference/Loading策略模型.md
  - reference/Traits能力模型.md
  - getting-started/05-自检与排错.md
---
# validateManifest 校验规则

`validateManifest()` 是 `cdp-material-sdk/portable` 提供的纯函数校验工具，可在第三方组件包工程中直接使用。

---

## 使用方式

```ts
import {
  validateManifest,
  validateManifests,
  printValidationResult,
} from 'cdp-material-sdk/portable';

const result = validateManifest(manifest);
printValidationResult(result);
```

返回结构：

```ts
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}
```

---

## 基础字段

| 规则 | 级别 |
|------|------|
| 缺少 `type` | error |
| 缺少 `meta` | error |
| 缺少 `meta.title` | error |
| 缺少 `meta.category` | error |
| `meta.category` 不合法 | error |
| `meta.valueSchema.type` 不合法 | error |

---

## Traits 与 valueSchema

| 规则 | 级别 |
|------|------|
| 声明 `DATA_FIELD` 或 `DATA_CONTAINER`，但缺少 `meta.valueSchema` | warning |

---

## Events

模型说明见 [Events 模型](./Events模型.md)，任务步骤见 [声明事件](../recipes/声明事件.md)。

| 规则 | 级别 |
|------|------|
| 标准事件缺少 `type` | error |
| 标准事件类型不属于协议 | error |
| 自定义事件缺少 `type` | error |
| 自定义事件名不是 namespaced 形态 | error |
| 自定义事件缺少 `payloadSchema` | error |

---

## Adapter Events

| 规则 | 级别 |
|------|------|
| adapter 标准事件缺少 `type` | error |
| adapter 标准事件类型不属于协议 | error |
| adapter 标准事件未先在 `events` 声明 | error |
| adapter 标准事件缺少 `propName` | error |
| adapter 自定义事件名不是 namespaced 形态 | error |
| adapter 自定义事件未先在 `customEvents` 声明 | error |
| adapter 自定义事件缺少 `propName` | error |

---

## Actions

模型说明和诊断工具见 [Actions / State 模型](./ActionsState模型.md)，任务步骤见 [声明动作与状态](../recipes/声明动作与状态.md)。

| 规则 | 级别 |
|------|------|
| action 缺少 `title` | error |
| action 缺少 `returns` | warning |
| action 声明了 `params`，但 `params.type !== 'object'` | error |

---

## State

模型说明和诊断工具见 [Actions / State 模型](./ActionsState模型.md)。

| 规则 | 级别 |
|------|------|
| state 缺少 `title` | error |
| state 缺少 `schema` | error |
| state `schema.type` 不合法 | error |

---

## Slots

模型说明见 [Slots 模型](./Slots模型.md)，任务步骤见 [声明插槽](../recipes/声明插槽.md)。

| 规则 | 级别 |
|------|------|
| slot 缺少 `title` | error |
| 动态 slot 缺少 `dynamicSource` | error |
| 动态 slot 缺少 `dynamicKey` | error |
| 作用域 slot 缺少 `scopeDescription` | warning |
| `allowedChildren` 不是字符串数组 | error |

---

## rootPath

模型说明见 [DOM 根节点注入模型](./DOM根节点注入模型.md)，任务步骤见 [配置 DOM 根节点注入](../recipes/配置DOM根节点注入.md)。

| 规则 | 级别 | 说明 |
|------|------|------|
| 未声明 `engine.render.injection.rootPath` | warning | 宿主会外层 `<div>` 兜底，建议显式声明 |
| 使用自定义 rootPath | warning | 提醒作者确认该路径 props 已透传到真实 DOM |

自定义 rootPath 是合法选择。若组件已经按规则透传，可以忽略该提示。

---

## Loading

当前校验工具主要覆盖 manifest 结构、events、actions、state、slots 和 rootPath。`engine.render.loading` 的策略选择需作者按 [Loading 策略模型](./Loading策略模型.md) 自检。

---

## Error 与 Warning 处理建议

| 级别 | 建议 |
|------|------|
| error | 必须修复 |
| warning | 需要确认是否符合预期；确认后可接受 |

---

## 任务路径

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 字段参考：[Manifest字段参考](./Manifest字段参考.md)
- 模型参考：[Events模型](./Events模型.md)
- 模型参考：[ActionsState模型](./ActionsState模型.md)
- 模型参考：[Slots模型](./Slots模型.md)
- 模型参考：[DOM根节点注入模型](./DOM根节点注入模型.md)
- 模型参考：[Loading策略模型](./Loading策略模型.md)
- 模型参考：[Traits能力模型](./Traits能力模型.md)
- 自检与排错：[05-自检与排错](../getting-started/05-自检与排错.md)
