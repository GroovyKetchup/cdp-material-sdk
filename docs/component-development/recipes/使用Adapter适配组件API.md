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

## wrapper vs adapter 决策框架

接入第三方组件、或组件 prop / 事件名不符合 CDP 约定时，有两条路径：用 manifest 的 **adapter** 在引擎层声明映射、或在 React **wrapper** 内手写转换。**按"层"做选择，不要按"默认优先谁"**——adapter 与 wrapper 各自有原生擅长的层。

### 三层视角

| 层 | 适配诉求 | adapter 原生能力 | 推荐 |
|----|---------|-----------------|------|
| 事件层 | 改 prop 名（`onClick` → `onPress`） | `events[K].propName` / `customEvents[K].propName` | **adapter** |
| 事件层 | reshape payload 到 CDP 标准 payload | `events[K].transform`（默认返回完整引擎 payload；`valueChange` 例外：仅返回新值，宿主补齐 `{ newValue, oldValue }`）/ `customEvents[K].transform` | **adapter** |
| 事件层 | 提取作用域 record / index | `events[K].toScope` / `customEvents[K].toScope` | **adapter** |
| Props 层 | 改 prop 名（`value` → `selectedValue`） | `propMapping` | **adapter** |
| Props 层 | 值转换 / 默认值 / 受控-非受控调谐 | 仅 `mapProps`（**逃生舱**） | **wrapper** |
| 结构层 | children / slots / ref 转发 / 副作用 | — | **wrapper** |

### 事件层为什么是 adapter 的主场

`StandardEventBinding<K>` / `CustomEventBinding` 的能力是 **propName + transform + toScope**，三者合起来覆盖了“换名 + 重塑 payload + 提取作用域”——CDP 标准事件的全部适配诉求。`transform` 的返回类型约束到标准引擎 payload（`valueChange` 例外：仅返回新值，宿主补齐 `{ newValue, oldValue }`），是**类型化**的转换。这正是它的设计目标，**不是逃生舱**。

写在 wrapper 里反而要重新构造一份相同的 payload，丢失类型约束，并把协议形状渗透到组件源码。

### Props 层的分界线在"是否需要值变换"

- **只是改名** → `adapter.propMapping` 一行配置，组件保留原生 API。
- **要做值变换、补默认值、做受控转换、加副作用、需要 ref**：adapter 仅有 `mapProps` 这条路，而 `mapProps` 是真正的逃生舱（无类型、不可静态分析、复杂逻辑藏在 manifest）。这种场景**回到 wrapper**。

### 结构层永远是 wrapper

children/slots 渲染、ref 转发、`useEffect` 副作用、错误边界——这些都不在 adapter 的能力范围。

### 协议解耦

- **wrapper**：把第三方原生 API 锁在内部，对外暴露 CDP 形状。**适配层在 React 里**，组件依赖 `BaseUIProps` / `slotProps` / `cdp-material-sdk/portable` 类型。
- **adapter**：组件保留原生 API，CDP 形状的转换写在 manifest。**适配层在 manifest 里**，组件不引入 CDP 类型依赖，可被非 CDP 项目复用。

两者方向相反，按上面三层选择，不必把协议解耦当作单一论据。

### 同一个组件的混合策略

事件层用 adapter、props 值层用 wrapper 是常见组合——只要 wrapper 输出的 props 能让 adapter 在引擎层补上事件映射即可。**不要在两层都做同样的事**，否则会重复甚至冲突。

---

## 可以跳过 adapter 的情况

- 组件本身已经使用 CDP 约定（`value` / `onChange` / `onClick` / 标准 payload）。
- 全部适配诉求都在结构层或 props 值层 → 走 wrapper 即可。

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

`StandardEventBinding<K>` / `CustomEventBinding` 提供三个原语：

| 字段 | 作用 |
|------|------|
| `propName` | 第三方组件实际触发回调的 prop 名（如 `onPress`、`onSelectedValueChange`） |
| `transform(...args)` | 把第三方回调参数 reshape 成 CDP 标准 payload；标准事件默认返回完整引擎 payload，`valueChange` 例外：仅返回新值，宿主补齐 `{ newValue, oldValue }` |
| `toScope(...args)` | 从回调参数中提取 `{ record, index }`，用于 List/Table 行项事件的作用域 |

### 标准事件 — 仅改名

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

### 标准事件 — 改名 + payload 重塑

第三方组件回调签名是 `(event, value) => void`。`valueChange` 特殊：`transform` 只负责提取「新值」，最终 `{ newValue, oldValue }` 由宿主组装（`oldValue` 来自宿主 value ref）：

```ts
events: {
  valueChange: { title: '值变化' },
},
adapter: {
  events: {
    valueChange: {
      propName: 'onSelectedValueChange',
      transform: (event, value) => value,
    },
  },
},
```

`transform` 的返回类型由 SDK 条件类型约束：`valueChange` 返回「新值」类型，其余标准事件返回完整引擎 payload 类型，少写错。

### 自定义事件 — 改名 + payload + scope

行项点击常见形态：第三方 List 的 `onItemTap(item, index)`，CDP 侧声明为带作用域的自定义事件：

```ts
customEvents: {
  'acme:rowClick': {
    title: '行点击',
    payloadSchema: {
      type: 'object',
      properties: {
        rowId: { type: 'string' },
      },
    },
  },
},
adapter: {
  customEvents: {
    'acme:rowClick': {
      propName: 'onItemTap',
      transform: (item) => ({ rowId: item.id }),
      toScope: (item, index) => ({ record: item, index }),
    },
  },
},
```

`toScope` 让事件编排能基于"哪一行"组织上下文，无需在 wrapper 中手写作用域注入。

---

## propMapping

将 CDP prop 名映射为组件实际 prop 名（**只重命名，不变换值**）：

```ts
adapter: {
  propMapping: {
    loading: 'spinning',
    value: 'selectedValue',
  },
},
```

---

## mapProps（逃生舱）

`propMapping` 不能做值变换、默认值、受控调谐等。adapter 在 props 层只剩 `mapProps` 这条路：

```ts
adapter: {
  mapProps: (props) => ({
    ...props,
    selectedValue: props.value,
    onSelectedValueChange: props.onChange,
  }),
},
```

`mapProps` 无类型约束、不可静态分析，是真正的逃生舱。需要在 props 层做超出"改名"的事情时，**优先回到 wrapper**，不要把复杂逻辑藏在 manifest 中。

---

## 自检

- [ ] adapter 标准事件已经先在 `events` 声明，自定义事件已经先在 `customEvents` 声明。
- [ ] adapter event 的 `propName` 与第三方组件实际回调 prop 名一致。
- [ ] 需要 reshape payload 时使用 `transform`，类型对齐到标准引擎 payload（`valueChange` 例外：仅返回新值）或 `payloadSchema`（自定义事件）。
- [ ] 需要作用域的事件（List / Table 行项）使用 `toScope` 提取 `{ record, index }`。
- [ ] `propMapping` 只用于纯重命名；值变换 / 默认值 / 受控转换走 wrapper。
- [ ] `mapProps` 仅在没有 wrapper 控制权且必须保留 manifest 即真相时使用。
- [ ] `validateManifest()` 没有 error。

---

## 常见错误

### Adapter 引用了未声明的事件

`adapter.events` / `adapter.customEvents` 中的 key，必须先在 manifest 的 `events` / `customEvents` 中声明，否则 `validateManifest()` 会报错。

### 在 wrapper 里再 reshape 一次 payload

如果已经用 `adapter.events.transform` 做了 payload 重塑，wrapper 不要再做一次——会出现两层映射叠加，或者 wrapper 输出的 payload 与标准引擎 payload 形状不匹配。`valueChange` 的 transform 同样只交付新值，不要在 wrapper 里补 `{ newValue, oldValue }`。事件层适配只在一处做。

### 用 `mapProps` 做改名

改名用 `propMapping`；`mapProps` 留给真正需要值变换的场景。把改名塞进 `mapProps` 会让校验和阅读都变难。

### 把 `mapProps` 当主力

`mapProps` 无类型、藏逻辑，应该是逃生舱而不是主力。出现复杂值变换、默认值或受控-非受控转换时，回到 wrapper，让组件作者用 TS 类型表达约束。

---

## 关联文档

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 模型参考：[Events模型](../reference/Events模型.md)
- 校验规则：[validateManifest校验规则](../reference/validateManifest校验规则.md)
- 任务 Recipe：[接入第三方React组件库](./接入第三方React组件库.md)
