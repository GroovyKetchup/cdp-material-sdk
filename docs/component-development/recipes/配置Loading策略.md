---
type: recipe
capability: loading
related:
  - reference/Loading策略模型.md
  - reference/Manifest字段参考.md
  - reference/validateManifest校验规则.md
  - recipes/声明动作与状态.md
---
# 配置 Loading 策略

Loading 策略用于声明宿主如何控制组件加载态。

字段路径：`manifest.engine.render.loading`。

---

## 适用场景

- 组件需要响应外部流程的 `setLoading`。
- 组件已有 loading prop，需要让宿主接管。
- 组件没有 loading 能力，希望宿主用遮罩兜底。

---

## 可以跳过的情况

- 组件不需要被外部流程控制 Loading。
- 组件内部有复杂异步状态，并且不希望宿主接管。
- 组件只是静态展示。

不声明时等价于不启用 Loading Feature。

---

## 策略总览

| 策略 | 适合场景 | 宿主行为 |
|------|----------|----------|
| `native` | 组件已有 loading prop | 注入 `loading` 或 `propName` 指定的 prop |
| `wrapper` | 组件没有 loading prop，但可以整体遮罩 | 渲染外层遮罩或占位 |
| `none` | 组件内部自控 loading | 宿主不接管 |

---

## native

适合 Button、Select、Upload 等已有 loading prop 的组件。

```ts
engine: {
  render: {
    loading: {
      strategy: 'native',
    },
  },
},
```

如果 prop 名不是 `loading`：

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

作者职责：

- 组件必须接收对应 loading prop。
- loading 为 true 时，组件必须阻断用户交互。
- 不要只显示动画但仍允许点击或输入。

---

## wrapper

适合 Card、Chart、PreviewPanel 等没有 loading prop 的展示组件。

```ts
engine: {
  render: {
    loading: {
      strategy: 'wrapper',
      wrapperType: 'spin',
      wrapperProps: {
        size: 'large',
      },
    },
  },
},
```

当前内置 `wrapperType`：

| wrapperType | 说明 |
|-------------|------|
| `wave` | 默认通用遮罩 |
| `spin` | 常规加载中 |
| `skeleton` | 骨架屏占位 |
| 自定义组件 type | 宿主注册过对应 wrapper 组件时使用 |

`spin` 和 `wave` 可使用 `setLoading({ loading: true, text })` 的 `text` 参数。`skeleton` 不使用提示文字。

---

## none

适合 Table、TreeTable、AsyncSelect、复杂业务面板等内部 loading 状态复杂的组件。

```ts
engine: {
  render: {
    loading: {
      strategy: 'none',
    },
  },
},
```

如果仍希望外部流程能控制组件 loading，请自己声明并实现 actions：

```ts
actions: {
  setLoading: {
    title: '设置加载状态',
    params: {
      type: 'object',
      required: ['loading'],
      properties: {
        loading: { type: 'boolean', title: '是否加载中' },
      },
    },
    returns: { type: 'boolean' },
  },
  getLoading: {
    title: '获取加载状态',
    returns: { type: 'boolean' },
  },
},
```

---

## 选择表

| 组件情况 | 推荐策略 |
|----------|----------|
| 已有 `loading` prop，且能禁用交互 | `native` |
| loading prop 名不是 `loading` | `native + propName` |
| 没有 loading prop，但可以整体遮罩 | `wrapper` |
| 适合骨架屏 | `wrapper + skeleton` |
| 内部有复杂异步状态 | `none` |
| 复杂组件仍需外部控制 loading | `none + 自定义 actions` |
| 不确定 | 优先 `wrapper` |

---

## 自检

- [ ] 字段路径写成 `engine.render.loading`。
- [ ] `native` 模式下组件能接收 loading prop，并阻断交互。
- [ ] `propName` 与组件实际 prop 名一致。
- [ ] `wrapper` 模式下组件可以被整体遮罩。
- [ ] `none` 模式下没有误以为宿主会自动注入 loading。
- [ ] `validateManifest()` 没有 error。

---

## 常见错误

### 把 `loading` 写成 `manifest.engine.loading`

正确路径是 `manifest.engine.render.loading`。

### native 模式只显示动画，不阻断交互

这是组件实现问题。`native` 要求组件在 loading 时不可继续触发用户操作。

### Table 使用 wrapper 后局部 loading 体验不符合预期

复杂数据组件通常应使用 `none`，由组件内部管理 loading。

---

## 关联文档

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 模型参考：[Loading策略模型](../reference/Loading策略模型.md)
- 字段参考：[Manifest字段参考](../reference/Manifest字段参考.md)
- 校验规则：[validateManifest校验规则](../reference/validateManifest校验规则.md)
- 任务 Recipe：[声明动作与状态](./声明动作与状态.md)
