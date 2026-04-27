---
type: reference
capability: manifest
related:
  - getting-started/03-开发最小可运行组件.md
  - recipes/声明布局容器组件.md
  - recipes/配置设计器元信息.md
  - reference/validateManifest校验规则.md
  - reference/示例代码索引.md
---
# Manifest 字段参考

`ComponentManifest` 是 CDP 组件的静态描述。组件作者通过它声明组件的身份、能力、配置项、事件、动作、状态和渲染策略。

---

## 顶层字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | `string` | 是 | 组件唯一标识，建议带组织前缀 |
| `alias` | `string[]` | 否 | 历史别名或兼容名 |
| `meta` | `object` | 是 | 基本信息 |
| `traits` | `ComponentTrait[]` | 否 | 能力声明 |
| `props` | `ObjectSchema` | 否 | 可配置 props 的 JSON Schema |
| `events` | `EventSpec[]` | 否 | 标准事件声明 |
| `customEvents` | `Record<string, CustomEventSpec>` | 否 | 自定义事件声明 |
| `actions` | `Record<string, ActionSpec>` | 否 | 组件动作声明 |
| `state` | `Record<string, StateSpec>` | 否 | 运行时状态声明 |
| `slots` | `Record<string, SlotDefinition>` | 否 | 插槽声明 |
| `adapter` | `ComponentAdapter` | 否 | API 适配器 |
| `engine` | `EnginePolicies` | 否 | 宿主渲染策略 |
| `nesting` | `object` | 否 | 嵌套约束 |
| `usage` | `AIUsageSpec` | 否 | 面向 AI 的使用提示 |

---

## meta

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | `string` | 是 | 组件显示名 |
| `category` | `ComponentCategory` | 是 | 组件分类 |
| `valueSchema` | `JSONSchema7` | 否 | 组件 value 类型描述 |
| `icon` | `string` | 否 | 图标 |
| `description` | `string` | 否 | 组件说明 |
| `hiddenInComponentList` | `boolean` | 否 | 是否在物料面板隐藏 |
| `subGroup` | `string` | 否 | 物料面板子分组 |

设计器相关字段（`icon` / `subGroup` / `hiddenInComponentList`）的选型与示例见 [配置设计器元信息](../recipes/配置设计器元信息.md)。

---

## engine.render.injection

```ts
engine: {
  render: {
    injection: {
      rootPath: INJECT_PATH_SLOT_PROPS,
    },
  },
},
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `rootPath` | `string` | 宿主根节点属性注入位置 |

详见 [DOM 根节点注入模型](./DOM根节点注入模型.md)。

---

## engine.render.loading

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

| 字段 | 类型 | 说明 |
|------|------|------|
| `strategy` | `'native' \| 'wrapper' \| 'none'` | Loading 接管策略 |
| `propName` | `string` | `native` 模式下注入的 prop 名 |
| `wrapperType` | `'spin' \| 'skeleton' \| 'wave' \| string` | `wrapper` 模式的遮罩类型 |
| `wrapperProps` | `Record<string, any>` | 传给 wrapper 的额外参数 |

详见 [Loading 策略模型](./Loading策略模型.md)。

---

## actions

```ts
actions: {
  refresh: {
    title: '刷新',
    description: '重新加载数据',
    params: { type: 'object' },
    returns: { type: 'boolean' },
  },
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 动作显示名 |
| `description` | 否 | 动作说明 |
| `params` | 否 | 参数 JSON Schema，声明时 `type` 必须是 `object` |
| `returns` | 否 | 返回值 JSON Schema，建议声明 |

---

## state

```ts
state: {
  selectedRowKeys: {
    title: '选中行',
    schema: { type: 'array', items: { type: 'string' } },
  },
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 状态显示名 |
| `description` | 否 | 状态说明 |
| `schema` | 是 | 状态值 JSON Schema |

---

## slots

```ts
slots: {
  header: {
    title: '头部',
    description: '头部内容',
  },
}
```

| 字段 | 说明 |
|------|------|
| `title` | 插槽显示名，必填 |
| `description` | 插槽说明 |
| `defaultEnabled` | 是否默认启用 |
| `allowedChildren` | 允许的子组件类型 |
| `scoped` | 是否作用域插槽 |
| `scopeDescription` | 作用域数据说明 |
| `dynamic` | 是否动态插槽 |
| `dynamicSource` | 动态插槽来源 props 路径 |
| `dynamicFilter` | 动态插槽过滤字段 |
| `dynamicKey` | 动态插槽 key 模板 |
| `dynamicTitle` | 动态插槽标题模板 |

---

## nesting

`nesting` 用于约束容器与子组件的嵌套关系。

```ts
nesting: {
  allowedChildren: ['acme.TabPane'],
  allowedParents: ['acme.Tabs'],
  minChildren: 1,
  maxChildren: 12,
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `allowedChildren` | `string[]` | 允许放入的子组件 `type` 列表 |
| `allowedParents` | `string[]` | 限制本组件只能作为这些父组件的子节点 |
| `minChildren` | `number` | 最少子组件数量 |
| `maxChildren` | `number` | 最多子组件数量 |

`nesting` 约束面向默认 `children` 区域；具名插槽另有 `slots[*].allowedChildren` 独立约束。

任务步骤见 [声明布局容器组件](../recipes/声明布局容器组件.md)。

---

## usage

`usage` 用于给 AI 或设计器提供额外提示，建议组件从最小实现开始就声明。

```ts
usage: {
  tips: ['适合展示短文本'],
  warnings: ['不建议用于长篇富文本'],
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `tips` | `string[]` | 使用建议、适用场景等正向提示 |
| `warnings` | `string[]` | 不适用场景、常见误用提醒 |

---

## 最小示例

```ts
import {
  COMPONENT_CATEGORY,
  INJECT_PATH_SLOT_PROPS,
  type ComponentManifest,
} from 'cdp-material-sdk/portable';

export const manifest = {
  type: 'acme.Text',
  meta: {
    title: '文本',
    category: COMPONENT_CATEGORY.GENERAL,
  },
  engine: {
    render: {
      injection: {
        rootPath: INJECT_PATH_SLOT_PROPS,
      },
    },
  },
  props: {
    type: 'object',
    properties: {
      text: { type: 'string', title: '文本内容' },
    },
  },
} satisfies ComponentManifest;
```

---

## 任务路径

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 关联文档：[03-开发最小可运行组件](../getting-started/03-开发最小可运行组件.md)
- 任务 Recipe：[声明布局容器组件](../recipes/声明布局容器组件.md)
- 任务 Recipe：[配置设计器元信息](../recipes/配置设计器元信息.md)
- 校验规则：[validateManifest校验规则](./validateManifest校验规则.md)
- 示例索引：[示例代码索引](./示例代码索引.md)
