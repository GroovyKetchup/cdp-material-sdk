---
type: recipe
capability: third-party-react
related:
  - recipes/使用Adapter适配组件API.md
  - recipes/配置DOM根节点注入.md
  - recipes/配置Loading策略.md
  - reference/SDK导入边界.md
  - reference/示例代码索引.md
---
# 接入第三方 React 组件库

本文说明如何将 Ant Design、Arco、Material UI、ECharts 或自研 UI Kit 中的组件包装成 CDP 组件。

---

## 适用场景

- 你不是从零写 UI，而是包装已有 React 组件。
- 第三方组件的 props、事件或 loading 名称与 CDP 默认约定不同。
- 第三方组件没有提供宿主根节点属性注入入口。

---

## 可以跳过的情况

如果你完全控制组件源码，并且组件已经按 CDP 契约接收 `value`、`onChange`、`slotProps.root`，可以直接阅读 [开发最小可运行组件](../getting-started/03-开发最小可运行组件.md)。

---

## 推荐方式：写一层 CDP Wrapper

不要直接把第三方组件裸注册给 CDP。推荐写一个 wrapper：

```tsx
import { forwardRef } from 'react';
import { Button } from 'antd';
import type { BaseUIProps } from 'cdp-material-sdk/portable';

export interface AcmeButtonProps extends BaseUIProps<HTMLDivElement> {
  text?: string;
  type?: 'primary' | 'default';
  loading?: boolean;
  onClick?: () => void;
}

export const AcmeButton = forwardRef<HTMLDivElement, AcmeButtonProps>((props, ref) => {
  const { text = '按钮', type = 'default', loading, onClick, slotProps } = props;

  return (
    <div {...slotProps?.root} ref={ref}>
      <Button type={type} loading={loading} onClick={onClick}>
        {text}
      </Button>
    </div>
  );
});
```

这样做的好处：

- CDP 的根节点注入有稳定 DOM 目标。
- 可以把第三方组件 API 转成 CDP 友好的 props。
- 后续添加 actions、state、events 更容易。
- 不需要修改第三方组件源码。

---

## 场景 1：第三方组件 value / onChange 名称不同

例如第三方组件使用：

```tsx
<ThirdSelect selectedValue={value} onSelectedValueChange={onChange} />
```

Wrapper 中转换：

```tsx
export const AcmeSelect = forwardRef<HTMLDivElement, AcmeSelectProps>((props, ref) => {
  const { value, onChange, slotProps } = props;

  return (
    <div {...slotProps?.root} ref={ref}>
      <ThirdSelect
        selectedValue={value}
        onSelectedValueChange={onChange}
      />
    </div>
  );
});
```

如果只是 props 名称映射，也可以参考 [使用 Adapter 适配组件 API](./使用Adapter适配组件API.md)。

---

## 场景 2：第三方组件没有根 DOM 注入入口

推荐外层包一层 DOM：

```tsx
return (
  <div {...slotProps?.root} ref={ref}>
    <ThirdComponent {...thirdProps} />
  </div>
);
```

对应 manifest：

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

如果无法包裹或不想改 wrapper，可不声明 `rootPath`，由宿主外层 `<div>` 兜底。但这通常只适合临时接入或黑盒组件。

---

## 场景 3：第三方组件已有 loading 能力

如果第三方组件支持 `loading`：

```ts
engine: {
  render: {
    loading: {
      strategy: 'native',
    },
  },
},
```

如果第三方组件的 loading prop 叫 `spinning`：

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

注意：`native` 不只是显示动画，组件在 loading 时必须阻断用户交互。

---

## 场景 4：第三方组件没有 loading 能力

使用 wrapper 策略：

```ts
engine: {
  render: {
    loading: {
      strategy: 'wrapper',
      wrapperType: 'spin',
    },
  },
},
```

宿主会在组件外部渲染遮罩或占位效果。

---

## 场景 5：第三方组件事件名不同

例如第三方组件暴露 `onRowClick`，你希望它成为 CDP 的点击事件或自定义事件。

可选方案：

1. Wrapper 内转换为 CDP 默认事件 prop。
2. 使用 `adapter.events` 或 `adapter.customEvents` 映射。

详见 [声明事件](./声明事件.md) 和 [使用 Adapter 适配组件 API](./使用Adapter适配组件API.md)。

---

## 自检

- [ ] Wrapper 根节点透传了 `slotProps.root`。
- [ ] Manifest 声明了正确的 `engine.render.injection.rootPath`。
- [ ] 第三方组件的 value、事件、loading 名称已转换或通过 adapter 映射。
- [ ] `validateManifest()` 无 error。
- [ ] React 相关依赖没有打入 bundle。

---

## 关联文档

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 任务 Recipe：[使用Adapter适配组件API](./使用Adapter适配组件API.md)
- 任务 Recipe：[配置DOM根节点注入](./配置DOM根节点注入.md)
- 任务 Recipe：[配置Loading策略](./配置Loading策略.md)
- SDK 导入边界：[SDK导入边界](../reference/SDK导入边界.md)
- 示例索引：[示例代码索引](../reference/示例代码索引.md)
