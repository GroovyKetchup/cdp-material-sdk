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

## 自实现 loading 的 hook

`none` 策略下组件得自己维护 loading state。SDK 在 `cdp-material-sdk/portable` 提供两个**纯 React、无宿主耦合**的便利 hook，避免每家组件重复实现引用计数与 dual-loading 合并逻辑。

### useConcurrentLoading：并发动作 loading

适合按钮上同时挂多个异步动作、或同一组件可能并发触发多次请求的场景。返回的 `startLoading` / `stopLoading` 是**引用计数式**的——后到的 stop 不会误清先到的 start。

```tsx
import { useConcurrentLoading } from 'cdp-material-sdk/portable';

export function AcmePanel() {
  const { isLoading, loadingText, startLoading, stopLoading } = useConcurrentLoading();

  const handleSave = async () => {
    startLoading('保存中…');
    try {
      await saveToServer();
    } finally {
      stopLoading();
    }
  };

  return (
    <button disabled={isLoading} onClick={handleSave}>
      {isLoading ? loadingText ?? '处理中…' : '保存'}
    </button>
  );
}
```

返回值要点：

- `isLoading` 是触发重渲染的状态值，可直接驱动 UI。
- `getLoading()` 是 ref 读取，适合放进 `useCallback`、事件处理器中按需读取，无需进依赖列表。
- `loadingText` 由最近一次 `startLoading(text)` 设置；不传 `text` 则保持上次值。

### useDualLoading：动作 loading 与数据 loading 分离

适合 Table、查询面板这类**同时存在「按钮触发的动作」与「后台数据请求」**的组件。两类 loading 单独建模，但对外仍暴露统一的 `isLoading`。

```tsx
import { useEffect } from 'react';
import { useDualLoading } from 'cdp-material-sdk/portable';

export function AcmeTable({ query }) {
  const {
    actionLoading,         // 动作触发的 loading（引用计数）
    startActionLoading,
    stopActionLoading,
    dataLoading,           // 数据请求 loading（布尔）
    setDataLoading,
    isLoading,             // 二者的 OR
    isLoadingRef,          // 引用稳定的最新值
  } = useDualLoading();

  // 数据请求：标记 dataLoading
  useEffect(() => {
    let cancelled = false;
    setDataLoading(true);
    fetchRows(query).finally(() => {
      if (!cancelled) setDataLoading(false);
    });
    return () => { cancelled = true; };
  }, [query, setDataLoading]);

  // 行内动作：标记 actionLoading
  const handleRowDelete = async (id: string) => {
    startActionLoading('删除中…');
    try {
      await deleteRow(id);
    } finally {
      stopActionLoading();
    }
  };

  return <TableUi loading={isLoading} onDelete={handleRowDelete} />;
}
```

要点：

- 用 `dataLoading` 表达「后台拉数据」，用 `actionLoading` 表达「用户动作触发的并发任务」，二者互不污染。
- 对外通过 `isLoading` 对接 UI 即可，不必在外层组合两个布尔。
- `isLoadingRef.current` 提供引用稳定的最新值，方便在事件回调里判断「当前是否仍处于 loading」而不必把状态加进依赖列表。

### 与 manifest loading 策略的搭配

| 场景 | manifest 策略 | hook |
|------|---------------|------|
| 完全交给宿主 | `native` 或 `wrapper` | 不需要 |
| 宿主只接管视觉、组件内部仍想细分 loading | `wrapper` + 这两个 hook | `useConcurrentLoading` 或 `useDualLoading`，组件内部用 hook 状态驱动局部 UI，宿主负责整体遮罩 |
| 完全自管 | `none` + 自定义 `setLoading` / `getLoading` actions | 推荐 `useConcurrentLoading`；用 hook 的 `getLoading` 实现 action 的 `getLoading`，用 `startLoading` / `stopLoading` 实现 action 的 `setLoading` |

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
