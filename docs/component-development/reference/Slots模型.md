---
type: reference
capability: slots
related:
  - recipes/声明插槽.md
  - reference/validateManifest校验规则.md
  - reference/Traits能力模型.md
---
# Slots 模型

Slots 描述组件可被填充的内容区域。插槽是可选能力，只有组件需要承载子内容时才声明。

---

## 插槽类型

| 类型 | 适用场景 | 关键字段 |
|------|----------|----------|
| 命名插槽 | 固定区域，如 header、footer | `title` |
| 作用域插槽 | 子内容需要上下文，如当前行数据 | `scoped`、`scopeDescription` |
| 动态插槽 | 根据 props 数组生成多个插槽 | `dynamic`、`dynamicSource`、`dynamicKey` |

---

## 命名插槽

```ts
slots: {
  header: {
    title: '头部',
  },
}
```

组件消费：

```tsx
const { _slots } = props;
return <header>{_slots?.header}</header>;
```

---

## 作用域插槽

```ts
slots: {
  rowActions: {
    title: '行操作',
    scoped: true,
    scopeDescription: '提供当前行 record 和 rowIndex',
  },
}
```

`scopeDescription` 能帮助设计器用户和 AI 理解可用上下文。

---

## 动态插槽

```ts
slots: {
  columnSlot: {
    title: '列模板',
    dynamic: true,
    dynamicSource: 'columns',
    dynamicKey: 'col:{dataIndex}',
    dynamicTitle: '列：{title}',
    scoped: true,
    scopeDescription: '提供当前行 record',
  },
}
```

动态插槽必须声明 `dynamicSource` 和 `dynamicKey`。

---

## 模型约束摘要

| 约束 | 说明 |
|------|------|
| `title` | 每个 slot 都应有可读显示名 |
| `dynamicSource` / `dynamicKey` | 动态 slot 必须声明来源和稳定 key 模板 |
| `scopeDescription` | 作用域 slot 建议说明可用上下文 |
| `allowedChildren` | 用于限制可插入的子组件类型 |

具体 error / warning 级别见 [validateManifest 校验规则](./validateManifest校验规则.md)。

---

## 选择建议

| 场景 | 推荐 |
|------|------|
| 固定内容区域 | 命名插槽 |
| 表格行操作 | 作用域插槽 |
| 表格列模板 | 动态 + 作用域插槽 |
| 简单展示组件 | 不声明 slots |

---

## 任务路径

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 任务 Recipe：[声明插槽](../recipes/声明插槽.md)
- 校验规则：[validateManifest校验规则](./validateManifest校验规则.md)
- 模型参考：[Traits能力模型](./Traits能力模型.md)
