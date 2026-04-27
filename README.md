# cdp-material-sdk

`cdp-material-sdk` 是面向独立仓库外部作者的公开 SDK，用于编写真实 React 组件包并向宿主注册 `ComponentManifest`、`EngineComponentPackage` 与 `EngineComponentPlugin`。

## 适用对象

- 在独立仓库中开发第三方 React 组件包的作者
- 需要基于稳定公开边界验证宿主集成的工程团队

## 安装

从 npm 安装最新版（推荐）：

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

## 推荐入口

- `cdp-material-sdk/portable`
  - 独立仓库作者默认入口
  - 适合直接打入外部 bundle
- `cdp-material-sdk/host-react`
  - 仅用于需要与宿主共享 React runtime / Context identity 的 helper（如 `DataScope`、`useDataContainer`、`useDataContainerApi`）
  - 不作为独立 bundle 的可移植保证范围
- `cdp-material-sdk`
  - 兼容根入口

## 起步与组件开发指南

完整的组件开发流程、能力 Recipe、模型 Reference 与 FAQ 见 [`docs/component-development`](./docs/component-development/README.md)。

新接入作者建议按以下顺序阅读：

1. [创建或接入组件库工程](./docs/component-development/getting-started/01-创建或接入组件库工程.md)
2. [创建组件包并注册](./docs/component-development/getting-started/02-创建组件包并注册.md)
3. [开发最小可运行组件](./docs/component-development/getting-started/03-开发最小可运行组件.md)
4. [构建发布与宿主接入](./docs/component-development/getting-started/04-构建发布与宿主接入.md)
5. [自检与排错](./docs/component-development/getting-started/05-自检与排错.md)

按需启用的能力 Recipe（数据字段 / 数据容器 / 布局容器 / 事件 / 动作与状态 / 插槽 / 设计器元信息 / Adapter / Loading 等）见 [`docs/component-development/recipes`](./docs/component-development/recipes/)，模型与字段参考见 [`docs/component-development/reference`](./docs/component-development/reference/)。

## 仓库维护与发布

- `npm run release:check`：发布前自检（build + `npm pack --dry-run`）
- `npm pack`：生成 `cdp-material-sdk-<version>.tgz` 用于离线分发
- `.github/workflows/release.yml`：在打 `v*` tag 时自动 build、上传 GitHub Release artifact，并通过 `npm publish --provenance --access public` 发布到 npm（依赖仓库 secret `NPM_TOKEN`）

## 边界说明

- `public/external-packages/*` 在宿主仓库中仅承担 transport smoke demo 角色
- 独立仓库作者应优先使用 `cdp-material-sdk/portable`
- `cdp-material-sdk/host-react` 只适用于宿主 React runtime / Context 身份已统一的场景
