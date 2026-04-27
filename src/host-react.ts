/**
 * 宿主耦合的辅助导出，要求与宿主应用共享 React context 与运行时实例。
 * 除非你明确需要接入 `PageContext` 或 `DataContainerRuntimeContext`，
 * 否则应优先使用 `cdp-material-sdk/portable`。
 */
export { PageContext } from './context/PageContext';
export type { MaterialSdkPageContextValue, MaterialSdkPageStoreApi, MaterialSdkPageStoreState } from './context/PageContext';
export { DataContainerRuntimeContext } from './context/DataContainerRuntimeContext';
export type { DataContainerRuntimeContextValue } from './context/DataContainerRuntimeContext';
export { useDataContainer, useDataContainerApi, resolveDataContainerRuntimeValue, shouldUseDataContainerRuntimeFallback } from './hooks/useDataContainer';
export type { UseDataContainerApiResult, UseDataContainerResult } from './hooks/useDataContainer';
export { DataScope } from './components/data-scope/DataScope';
export type { DataScopeProps } from './components/data-scope/DataScope';
export { DataScopeContext } from './context/DataScopeContext';
export type { DataScopeContextValue, FieldState, LazyScope, PathResolver } from './context/DataScopeContext';
export { useFieldRegistry } from './hooks/useFieldRegistry';
export type { UseFieldRegistryResult } from './hooks/useFieldRegistry';
