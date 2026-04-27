---
type: reference
capability: loading
related:
  - recipes/配置Loading策略.md
  - reference/Manifest字段参考.md
  - recipes/声明动作与状态.md
---
# Loading 策略模型

Loading 策略定义在 `manifest.engine.render.loading`，用于声明宿主如何控制组件加载态。

---

## 字段定义

```ts
engine: {
  render: {
    loading: {
      strategy: 'native' | 'wrapper' | 'none',
      propName?: string,
      wrapperType?: 'spin' | 'skeleton' | 'wave' | string,
      wrapperProps?: Record<string, any>,
    },
  },
},
```

---

## 策略能力表

| strategy | 注入 props | 自动 actions | Overlay | `setLoading.text` |
|----------|------------|--------------|---------|-------------------|
| `native` | 是，默认 `loading` | `getLoading` / `setLoading` | 否 | 否 |
| `wrapper + spin` | 否 | `getLoading` / `setLoading` | 是 | 是 |
| `wrapper + wave` | 否 | `getLoading` / `setLoading` | 是 | 是 |
| `wrapper + skeleton` | 否 | `getLoading` / `setLoading` | 是 | 否 |
| `none` | 否 | 否 | 否 | 否 |

---

## native

`native` 表示组件自己支持 loading prop。

```ts
engine: {
  render: {
    loading: {
      strategy: 'native',
      propName: 'spinning',
    },
  },
},
```

规则：

- `propName` 不填时，宿主注入 `loading`。
- `propName` 填写后，宿主会将 `loading` 映射到该 prop。
- 组件必须在 loading 为 true 时阻断交互。

---

## wrapper

`wrapper` 表示宿主在组件外部提供遮罩或占位。

```ts
engine: {
  render: {
    loading: {
      strategy: 'wrapper',
      wrapperType: 'wave',
      wrapperProps: {},
    },
  },
},
```

内置 wrapper：

| wrapperType | 说明 |
|-------------|------|
| `wave` | 默认遮罩 |
| `spin` | 旋转加载 |
| `skeleton` | 骨架屏 |

自定义 `wrapperType` 会按组件 type 查找宿主已注册组件。未找到时，开发环境会提示并回退到 `wave`。

---

## none

`none` 表示宿主不接管 loading。

适合：

- Table。
- TreeTable。
- AsyncSelect。
- 内部有复杂请求状态的业务组件。

如需外部控制，请自行声明并实现 `setLoading` / `getLoading` actions。

---

## 与 actions 的关系

当 strategy 为 `native` 或 `wrapper` 时，宿主会自动提供：

- `getLoading`
- `setLoading`

当 strategy 为 `none` 或不声明 loading 时，宿主不会自动提供这些 actions。

---

## 模型边界

| 边界 | 说明 |
|------|------|
| 字段路径 | Loading 策略位于 `engine.render.loading`，不是 `engine.loading` |
| `native` | 宿主注入 loading prop，组件自身必须阻断交互 |
| `wrapper` | 宿主在组件外部提供遮罩或占位，不注入 loading prop |
| `none` | 宿主不接管 loading，也不自动提供 loading actions |

任务选型和自检步骤见 [配置 Loading 策略](../recipes/配置Loading策略.md)。

---

## 任务路径

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 任务 Recipe：[配置Loading策略](../recipes/配置Loading策略.md)
- 字段参考：[Manifest字段参考](./Manifest字段参考.md)
- 任务 Recipe：[声明动作与状态](../recipes/声明动作与状态.md)
