import { createContext } from 'react';
import type { RefObject } from 'react';

/**
 * 由宿主数据容器组件提供的运行时元数据。
 *
 * 它让 host-react 辅助函数能够推断当前生效的 `componentId`，并在
 * 容器首次把值写入页面 store 之前，先暴露初始默认值。
 */
export interface DataContainerRuntimeContextValue<T = unknown> {
  componentId: string;
  initialDefaultValueRef: RefObject<T | undefined>;
  hasInitializedRef: RefObject<boolean>;
}

/**
 * 承载当前数据容器运行时元数据的 React context。
 */
export const DataContainerRuntimeContext = createContext<DataContainerRuntimeContextValue | null>(null);
