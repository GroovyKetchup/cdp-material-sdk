import { useCallback, useContext } from 'react';
import { useStore } from 'zustand';
import { DataContainerRuntimeContext, type DataContainerRuntimeContextValue } from '../context/DataContainerRuntimeContext';
import { PageContext } from '../context/PageContext';

/**
 * 面向数据容器的命令式访问接口。
 * 可通过显式 `componentId`，或最近一层 `DataContainerRuntimeContext`
 * 自动解析目标数据容器。
 */
export interface UseDataContainerApiResult<T = any> {
  /**
   * 获取当前数据容器的值。
   */
  getContainerData: () => T | undefined;
  /**
   * 设置数据容器的值。
   */
  setContainerData: (data: T) => void;
  /**
   * 将数据容器的值重置到初始状态。
   */
  resetContainerData: () => void;
}

/**
 * 响应式的数据容器访问结果，并附带 `useDataContainerApi` 返回的
 * 命令式辅助函数。
 */
export interface UseDataContainerResult<T = any> extends UseDataContainerApiResult<T> {
  /**
   * 当前数据容器的值。
   */
  containerData: T | undefined;
}

/**
 * 判断主机 React 数据容器辅助函数当前是否应临时回退到运行时提供的
 * 初始默认值。
 *
 * 只有当运行时上下文匹配，且容器尚未把首个值写入 store 时，才会触发
 * 这一路径。
 */
export const shouldUseDataContainerRuntimeFallback = (
  componentId: string | undefined,
  runtimeContext: DataContainerRuntimeContextValue | null,
  currentValue: unknown,
) => {
  if (!componentId || !runtimeContext) {
    return false;
  }

  if (componentId !== runtimeContext.componentId || runtimeContext.hasInitializedRef.current) {
    return false;
  }

  if (runtimeContext.initialDefaultValueRef.current === undefined) {
    return false;
  }

  return currentValue === undefined;
};

/**
 * 解析当前应对外可见的数据容器值。
 * 优先使用页面 store 中的值；若尚不可用，则回退到运行时默认值。
 */
export const resolveDataContainerRuntimeValue = <T = any>(
  componentId: string | undefined,
  runtimeContext: DataContainerRuntimeContextValue | null,
  currentValue: T | undefined,
): T | undefined => {
  if (!shouldUseDataContainerRuntimeFallback(componentId, runtimeContext, currentValue)) {
    return currentValue;
  }

  return runtimeContext?.initialDefaultValueRef.current as T | undefined;
};

/**
 * 提供对数据容器值的命令式读取、写入与重置能力。
 * 如果未传入 `componentId`，则自动使用最近一层
 * `DataContainerRuntimeContext` 中的目标组件。
 */
export function useDataContainerApi<T = any>(): UseDataContainerApiResult<T>;
export function useDataContainerApi<T = any>(componentId: string): UseDataContainerApiResult<T>;
export function useDataContainerApi<T = any>(componentId?: string | undefined): UseDataContainerApiResult<T>;
export function useDataContainerApi<T = any>(componentId?: string | undefined): UseDataContainerApiResult<T> {
  const pageContext = useContext(PageContext);
  const runtimeContext = useContext(DataContainerRuntimeContext);
  const store = pageContext?.store ?? null;
  const resolvedComponentId = componentId ?? runtimeContext?.componentId;

  const getContainerData = useCallback((): T | undefined => {
    const currentValue = store && resolvedComponentId
      ? store.getState().components[resolvedComponentId]?.value as T | undefined
      : undefined;
    return resolveDataContainerRuntimeValue(resolvedComponentId, runtimeContext, currentValue);
  }, [resolvedComponentId, runtimeContext, store]);

  const setContainerData = useCallback((data: T) => {
    if (!store || !resolvedComponentId) return;
    store.getState().setComponentData(resolvedComponentId, data);
  }, [resolvedComponentId, store]);

  const resetContainerData = useCallback(() => {
    if (!store || !resolvedComponentId) return;
    store.getState().resetComponentData(resolvedComponentId);
  }, [resolvedComponentId, store]);

  return { getContainerData, setContainerData, resetContainerData };
}

/**
 * 订阅数据容器值，并同时返回当前值与 `useDataContainerApi` 提供的
 * 命令式辅助函数。
 * 如果未传入 `componentId`，则自动使用最近一层
 * `DataContainerRuntimeContext` 中的目标组件。
 */
export function useDataContainer<T = any>(): UseDataContainerResult<T>;
export function useDataContainer<T = any>(componentId: string): UseDataContainerResult<T>;
export function useDataContainer<T = any>(componentId?: string | undefined): UseDataContainerResult<T>;
export function useDataContainer<T = any>(componentId?: string | undefined): UseDataContainerResult<T> {
  const api = useDataContainerApi<T>(componentId);
  const pageContext = useContext(PageContext);
  const runtimeContext = useContext(DataContainerRuntimeContext);
  const store = pageContext?.store ?? null;
  const resolvedComponentId = componentId ?? runtimeContext?.componentId;

  const containerData = store
    ? resolveDataContainerRuntimeValue(
      resolvedComponentId,
      runtimeContext,
      useStore(store, (state) => resolvedComponentId ? state.components[resolvedComponentId]?.value as T | undefined : undefined),
    )
    : undefined;

  return {
    containerData,
    ...api,
  };
}
