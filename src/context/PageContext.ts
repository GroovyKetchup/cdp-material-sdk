import { createContext } from 'react';
import type { StoreApi } from 'zustand';

/**
 * 宿主页面状态树中每个组件对应的最小状态结构。
 */
export interface MaterialSdkComponentState {
  value?: unknown;
}

/**
 * `cdp-material-sdk/host-react` 辅助函数依赖的宿主页面 store 结构。
 */
export interface MaterialSdkPageStoreState {
  components: Record<string, MaterialSdkComponentState>;
  setComponentData: (componentId: string, data: unknown) => void;
  resetComponentData: (componentId: string) => void;
}

export type MaterialSdkPageStoreApi = StoreApi<MaterialSdkPageStoreState>;

/**
 * 为 host-react 辅助函数暴露宿主页面 store 的 React context 值。
 */
export interface MaterialSdkPageContextValue {
  store: MaterialSdkPageStoreApi | null;
}

/**
 * 供 host-react 辅助函数读写组件数据的 React context。
 */
export const PageContext = createContext<MaterialSdkPageContextValue | null>(null);
