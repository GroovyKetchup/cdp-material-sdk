---
type: reference
capability: sdk-boundary
related:
  - getting-started/01-创建或接入组件库工程.md
  - recipes/接入第三方React组件库.md
  - reference/示例代码索引.md
---
# SDK 导入边界

第三方组件作者应只依赖 `cdp-material-sdk` 的公开入口，不应导入宿主内部实现。

---

## 推荐入口

### `cdp-material-sdk/portable`

默认入口，适合绝大多数组件作者。

可用于：

- `ComponentManifest`
- `EngineComponentPackage`
- `EngineComponentPlugin`
- `COMPONENT_TRAIT`
- `COMPONENT_CATEGORY`
- `INJECT_PATH_SLOT_PROPS`
- `BaseUIProps`
- `COMPONENT_STATE_KEY`
- `validateManifest()`
- `diagnoseMissingActionImpls()`
- `diagnoseMissingStateKeys()`

示例：

```ts
import {
  COMPONENT_CATEGORY,
  COMPONENT_TRAIT,
  INJECT_PATH_SLOT_PROPS,
  validateManifest,
  type ComponentManifest,
  type EngineComponentPlugin,
} from 'cdp-material-sdk/portable';
```

---

### `cdp-material-sdk/host-react`

宿主耦合入口，只有在确认组件包与宿主共享 React runtime 和 Context 身份时使用。

可用于：

- `DataScope`
- `useDataContainer`
- `useDataContainerApi`
- `PageContext`

如果不能确认共享 runtime，请不要使用该入口。

---

## 不建议依赖的对象

第三方作者不应导入：

- 宿主源码路径。
- 未从 `cdp-material-sdk/portable` 或 `cdp-material-sdk/host-react` 导出的对象。
- 组件加载、注册、运行时增强、页面状态管理等宿主内部模块。

这些对象属于宿主实现细节，不承诺作为第三方兼容契约。第三方组件包只应面向 SDK 公开入口编程。

---

## 依赖处理

| 依赖 | 建议 |
|------|------|
| `react` | peerDependency + externalize |
| `react-dom` | peerDependency + externalize |
| `react/jsx-runtime` | externalize |
| `cdp-material-sdk/portable` | 普通依赖 |
| `cdp-material-sdk/host-react` | 仅在确认共享 runtime 时使用 |

---

## 安装

推荐从 npm 安装最新版：

```bash
npm install cdp-material-sdk@latest react react-dom
```

如需锁定到精确版本：

```bash
npm install cdp-material-sdk@<version> react react-dom
```

无 npm 访问时，可回退到 GitHub Release `.tgz`：

```bash
npm install https://github.com/GroovyKetchup/cdp-material-sdk/releases/download/v<version>/cdp-material-sdk-<version>.tgz
```

`react` 与 `react-dom` 是 peer dependency，需要由组件作者侧显式安装（建议 19.x）。

---

## 任务路径

本文档只保留本层级职责内容：Recipe 提供任务步骤，Reference 提供稳定模型和规则，validateManifest 文档提供校验级别事实源。

- 关联文档：[01-创建或接入组件库工程](../getting-started/01-创建或接入组件库工程.md)
- 任务 Recipe：[接入第三方React组件库](../recipes/接入第三方React组件库.md)
- 示例索引：[示例代码索引](./示例代码索引.md)
