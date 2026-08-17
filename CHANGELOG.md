# Changelog

## Unreleased

- 修复 `valueChange` 的 Adapter `transform` 契约：transform 只返回「新值」，最终 `{ newValue, oldValue }` 引擎 payload 由宿主组装。新增条件类型 `StandardEventTransformResult`：`valueChange` 的 transform 返回新值类型，其余标准事件返回完整引擎 payload。
- canonical 标准事件定义迁移原前端 `GlobalEventMeta` 的全部 description，保证前端删除重复事实源后说明不丢失。
- canonical 定义改为 deep frozen，运行时不可变；`fieldInfo` schema 补充内部 `required: ['fieldName']`。

## 0.1.3

- 新增标准事件事实源 `STANDARD_EVENT_DEFINITIONS`（含 `StandardEventDefinition` / `StandardEventDefinitionMap` 类型），为全部标准 key 提供 canonical title / description / payloadSchema。
  - void 事件（mount / unmount / click / focus / blur）不声明 `payloadSchema`，缺失即表示无 payload。
  - 有 payload 的事件声明完整 JSON Schema（object schema 不封闭额外字段）；`fieldInfo` 仅存在于 `optionsFetch`，标记废弃说明。
- 新增 `resolveComponentManifest()` 与 `ResolvedComponentManifest` / `ResolvedStandardEventDeclaration` / `ResolvedManifestStandardEventMap` 类型：作者态标准事件补齐 canonical metadata，作者 `title` / `description` / `deprecated` 覆盖 canonical，有 payload 的事件强制使用 SDK schema，`customEvents` 原样保留。
  - 兼容边界：作者态 `ComponentManifest.events` 仍不允许声明 `payloadSchema`；`normalizeManifestEvents()` 行为不变，不隐式补默认定义；未知标准事件 key 抛出 `TypeError`。

## 0.1.2

- 新增 `INTERACTION_DRILLABLE` trait 及下钻公共契约，供宿主 Feature 与外置组件通过受控 props、actions、state 和导航请求事件协作。
- 新增《层级下钻能力模型》，明确 SDK、宿主和外置 UI 库的边界。

## 0.1.1
- 删除 `RemoteOptionConfigSchema`

## 0.1.0

- 新增 `OPTIONS_FETCH` 引擎事件（`ENGINE_EVENT_TYPE.OPTIONS_FETCH`），用于远程选项数据拉取
  - `EngineEventProtocol` 新增对应 payload 类型，含 `panelCode` / `fieldName` / `condition` / `keyword` / `extraFieldNames`
  - 保留 `fieldInfo` 字段（标记 deprecated）以兼容历史事件指令脚本
- `RemoteOptionConfigSchema` 新增 `extraFieldNames` 字段，支持随选项返回额外字段（如 code、status 等）

## 0.0.10

- 文档完善（`docs/component-development/`，仅文档变更，无运行时改动）
  - recipe `声明数据字段组件.md`：新增 `placeholder` 可见性约定——**仅在可编辑态显示**，`readOnly` / `disabled` 等非编辑态默认隐藏占位提示，避免与已锁定的真实值混淆。同步更新作者职责、示例代码、自检清单与常见错误。
  - recipe `声明布局容器组件.md` / 相关 reference：厘清 `LAYOUT_CONTAINER` 与 slots 的关系，补全 DSL 场景归类原则（详见 cbe8675）。

## 0.0.9

- 新增 `useFieldRegistry` hook 并从 `cdp-material-sdk/host-react` 导出
  - 与 `DataScope` 配套，给数据容器组件提供引用稳定的字段注册表（`registerField` / `unregisterField` / `getFieldState` / `getAllFieldStates` / `clearRegistry`）
  - 内部用 `useRef` + `useCallback` 实现，避免数据容器在每次 render 重新生成回调；不再暴露 `registryRef`，保持封装
  - 主仓 Form / Wizard 等数据容器已收敛到该 hook，第三方数据容器组件作者可一行接通字段状态聚合
- 文档完善（`docs/component-development/`）
  - 新增 recipe `声明props.md`：阐明 manifest `props` 与 React props 的边界、JSON Schema 用法、与 trait 自动注入字段的协作、`adapter.propMapping` / `mapProps` 的取舍
  - 重写 recipe `使用Adapter适配组件API.md`：明确 adapter / wrapper / mapProps 的决策框架——事件层优先 adapter、props 层 rename 优先 adapter、值变换走 wrapper、结构层永远 wrapper
  - 更新 recipe `声明数据字段组件.md`：补充 `DATA_FIELD` trait 自动注入字段（`value` / `readOnly` / `required` / `name` / `label` / `labelStrategy` 等）的边界，提示作者无需重复声明
  - 更新 recipe `声明数据容器组件.md`：示例改为从 SDK 导入 `useFieldRegistry`，展示 Form 整体校验的标准模式
  - 更新 recipe `配置Loading策略.md`：新增 `useConcurrentLoading` / `useDualLoading` 实战示例与 manifest 策略搭配表
  - 更新 reference `SDK导入边界.md`：portable 入口补 `useConcurrentLoading` / `useDualLoading`，host-react 入口补 `useFieldRegistry` 与完整导出面
  - 更新 reference `Traits能力模型.md`：保持纯契约视角，剥离实现工具描述
  - 微调 reference `Manifest字段参考.md`、组件开发指南 `README.md`

## 0.0.8

- 修复 0.0.7 发布失败：CI 改为直接使用 Node 24（自带 npm 11.x），不再尝试在 Node 22 之上原地升级 npm（原地升级会触发 `Cannot find module 'promise-retry'` 模块解析错误）

## 0.0.7 [发布失败]

- 尝试通过在 CI 里 `npm install -g npm@latest` 升级 npm 以支持 OIDC Trusted Publishing
- 该升级步骤在 Node 22 上失败（npm 自我替换过程中模块树损坏），未走到 publish；由 0.0.8 修复重发

## 0.0.6 [发布失败]

- 切换 npm 发布到 Trusted Publishing：CI 通过 GitHub OIDC 直接认证 npm，不再依赖 `NPM_TOKEN` secret
- 本版本仅用于验证 OIDC 发布链路，无运行时变更
- npm publish 因 CI 中 npm CLI 版本过旧（10.x）而失败，未发布到 npm；由 0.0.7 修复重发

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
