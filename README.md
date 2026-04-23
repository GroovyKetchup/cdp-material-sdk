# cdp-material-sdk

`cdp-material-sdk` 是面向独立仓库外部作者的公开 SDK，用于编写真实 React 组件包并向宿主注册 `ComponentManifest`、`EngineComponentPackage` 与 `EngineComponentPlugin`。

## 适用对象

- 在独立仓库中开发第三方 React 组件包的作者
- 需要基于稳定公开边界验证宿主集成的工程团队

## 安装

推荐通过 GitHub Release `.tgz` 安装：

```bash
npm install https://github.com/GroovyKetchup/cdp-material-sdk/releases/download/v0.0.1/cdp-material-sdk-0.0.1.tgz
```

## 仓库维护与发布

- 当前独立仓库中，可通过 `npm run release:check` 执行发布前自检
- 通过 `npm pack` 生成 `cdp-material-sdk-<version>.tgz`
- 可结合 `.github/workflows/release.yml` 上传 GitHub Release artifact

## 推荐入口

- `cdp-material-sdk/portable`
  - 独立仓库作者默认入口
  - 适合直接打入外部 bundle
- `cdp-material-sdk/host-react`
  - 只用于需要与宿主共享 runtime identity 的 helper
  - 不作为独立 bundle 的可移植保证范围
- `cdp-material-sdk`
  - 兼容根入口

## 最小 external package 起步方式

- 安装 `react`、`react-dom` 与 `cdp-material-sdk`
- 从 `cdp-material-sdk/portable` 导入作者 API
- 声明一个真实 React 组件，并把 `slotProps.root` 挂到真实 DOM 根节点
- 导出 `exampleManifest`、`examplePackage`、`examplePlugin` 与默认导出
- 使用 ESM library mode 构建，并 externalize `react` 与 `react/jsx-runtime`
- 在宿主仓或独立 consumer fixture 中完成外部作者安装验证

## 边界说明

- `public/external-packages/*` 在宿主仓库中仍然只承担 transport smoke demo 角色
- 独立仓库作者应优先使用 `cdp-material-sdk/portable`
- `cdp-material-sdk/host-react` 只适用于宿主 runtime identity 已统一的场景
