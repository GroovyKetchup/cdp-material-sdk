import type { ComponentType } from 'react';
import type { ComponentManifest } from './protocol/manifest';

/**
 * 将组件清单与其对应的 React 实现绑定在一起。
 */
export interface EngineComponentRegistration {
  manifest: ComponentManifest;
  component: ComponentType<any>;
}

/**
 * 可选的版本兼容提示，供消费方判断当前 SDK 或引擎版本是否可接受。
 */
export interface EngineComponentPackageCompatibility {
  sdkVersion?: string;
  engineVersion?: string;
}

/**
 * 由作者定义组件组成、可作为一个物料包统一分发的发布单元。
 */
export interface EngineComponentPackage {
  id: string;
  version: string;
  components: EngineComponentRegistration[];
  compatibility?: EngineComponentPackageCompatibility;
}

/**
 * 插件在安装阶段可以调用的宿主侧回调。
 */
export interface EnginePluginAPI {
  registerComponent: (manifest: ComponentManifest, component: ComponentType<any>) => void;
  registerPackage: (pkg: EngineComponentPackage) => void;
  unregisterPackage: (packageId: string) => void;
}

/**
 * 可被宿主运行时消费的插件入口。
 *
 * 插件通常会在 `install` 中注册一个或多个组件，或直接注册整个
 * `EngineComponentPackage`。
 */
export interface EngineComponentPlugin {
  id: string;
  version: string;
  compatibility?: EngineComponentPackageCompatibility;
  install: (api: EnginePluginAPI) => void | Promise<void>;
}
