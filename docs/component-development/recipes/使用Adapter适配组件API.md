---
type: recipe
capability: adapter
related:
  - reference/Events模型.md
  - reference/validateManifest校验规则.md
  - recipes/接入第三方React组件库.md
---
# 使用 Adapter 适配组件 API

Adapter 用于把组件自身 API 映射到 CDP 约定。它适合接入第三方组件库或历史组件。

---

## 适用场景

- 第三方组件的 prop 名与 CDP 默认名不同。
- 第三方组件的事件 prop 名不同。
- 需要对传入 props 做轻量转换。

---

## 可以跳过的情况

- 你可以在 wrapper 内直接转换 API。
- 组件本身已经使用 `value`、`onChange`、`onClick` 等 CDP 约定。
- 适配逻辑复杂，需要在组件代码中处理。

---

## propMapping

将 CDP prop 名映射为组件实际 prop 名：

```ts
adapter: {
  propMapping: {
    loading: 'spinning',
    value: 'selectedValue',
  },
},
```

适合简单重命名。

---

## events 映射

标准事件映射：

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

自定义事件映射：

```ts
customEvents: {
  'acme:rowClick': {
    title: '行点击',
    payloadSchema: { type: 'object' },
  },
},
adapter: {
  customEvents: {
    'acme:rowClick': {
      propName: 'onRowClick',
    },
  },
},
```

---

## mapProps

当静态映射不够时，可以使用 `mapProps`：

```ts
adapter: {
  mapProps: (props) => ({
    ...props,
    selectedValue: props.value,
    onSelectedValueChange: props.onChange,
  }),
},
```

注意：`mapProps` 是逃生舱。优先使用 wrapper 或 `propMapping`，避免把复杂逻辑藏在 manifest 中。

---

## 自检

- [ ] adapter 标准事件已经先在 `events` 声明。
- [ ] adapter 自定义事件已经先在 `customEvents` 声明。
- [ ] 每个 adapter event 都有 `propName`。
- [ ] `propMapping` 没有和 wrapper 内转换重复冲突。
- [ ] `validateManifest()` 没有 error。

---

## 常见错误

### Adapter 引用了未声明事件

先声明事件，再用 adapter 映射。否则 `validateManifest()` 会报错。

### 把复杂业务逻辑写进 mapProps

`mapProps` 只适合轻量适配。复杂逻辑应该写在 React wrapper 中。

---

## 关联文档

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 模型参考：[Events模型](../reference/Events模型.md)
- 校验规则：[validateManifest校验规则](../reference/validateManifest校验规则.md)
- 任务 Recipe：[接入第三方React组件库](./接入第三方React组件库.md)
