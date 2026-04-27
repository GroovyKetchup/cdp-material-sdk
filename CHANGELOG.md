# Changelog

## 0.0.5

- 新增 `DataScope` helper 与 `DataScopeContext` 导出（`cdp-material-sdk/host-react`）
  - 数据容器组件可通过 `DataScope` 一行接通字段路径解析、`record` 注入、字段状态注册
  - 自动从最近一层 `DataContainerRuntimeContext` 取 `componentId`，无需手动透传
- `validateManifest`：组件未声明事件时不再产生 warning（事件本就是可选能力，避免噪音）
- `validateManifest`：修正 rootPath 缺失提示中的「兆底」错别字为「兜底」
- 启用 npm publish：通过 GitHub Actions OIDC + provenance 自动发布到 npm
  - `package.json` 加入 `publishConfig` (access: public, provenance: true)
  - `.github/workflows/release.yml` 在打 `v*` tag 时自动 `npm publish`
  - 安装方式由 GitHub Release `.tgz` 切换为 `npm install cdp-material-sdk@latest`
- 新增组件开发指南 `docs/component-development/`
  - getting-started 5 篇：从工程接入到自检排错
  - recipes 11 篇：数据字段 / 数据容器 / 布局容器 / 事件 / 动作与状态 / 插槽 / 设计器元信息 / Adapter / Loading / DOM 注入 / 第三方库接入
  - reference 11 篇：Manifest 字段、Traits、Events、Actions+State、Slots、Loading、DOM 注入、SDK 导入边界、validateManifest 校验规则等
  - 含 FAQ 与示例索引

## 0.0.4

- 新增 `COMPONENT_STATE_KEY` 常量导出（`'__state'`），第三方作者可用于 `useImperativeHandle` 暴露运行时状态
- `validateManifest` rootPath 校验调整：自定义路径改为指引性提示（"请确保透传到根 DOM 节点，若已实现可忽略"），不再暗示拼写错误
- trait-valueSchema 交叉校验：`DATA_FIELD` / `DATA_CONTAINER` trait 未声明 `valueSchema` 时产生 warning

## 0.0.3

- 新增 `validation/validateManifest` 校验模块，纯函数、零宿主依赖
  - actions 校验：title 必填、returns 建议补充、params.type 必须为 object
  - state 校验：title + schema 必填、schema.type 合法性检查
  - 完整的 events / customEvents / adapter 对齐校验（从主仓迁入统一）
- 新增运行时诊断函数 `diagnoseMissingActionImpls` / `diagnoseMissingStateKeys`
- 从 `portable` 入口导出所有校验 API，第三方开发者可直接使用

## 0.0.2

- 完成 SDK 公共边界整理（P3-1）
  - `portable` 入口覆盖类型、常量、协议、hooks
  - `host-react` 入口提供 PageContext / DataContainerRuntimeContext 宿主耦合导出
- SDK 分发与类型策略（P3-5）
  - GitHub Release `.tgz` 自动发布流水线
  - 主仓 `sdk-mode.mjs` 支持 local / release 双模式切换
  - Vite alias 自动检测本地 SDK 源码
- 文档更新：sdk-convergence.md、第三方开发指南、组件物料开发白皮书

## 0.0.1

- Establish the standalone `cdp-material-sdk` package proof with ESM outputs for `index`, `portable`, and `host-react`.
- Add GitHub Release `.tgz` consumption guidance and the independent external author template proof.
- Add package build, public surface, portable boundary, external author template, and docs consistency verification.
