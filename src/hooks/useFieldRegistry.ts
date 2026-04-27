import { useRef, useCallback } from 'react';
import type { FieldState } from '../context/DataScopeContext';

/**
 * 字段注册表 Hook —— 数据容器组件的便利工具。
 *
 * 与 `DataScope` 配对使用：DataScope 通过 `registerField` / `unregisterField`
 * 把后代字段的实时状态（隐藏、只读、必填等）上报到容器；本 Hook 提供 Ref 支撑的
 * 注册表实现，避免频繁重渲染。
 *
 * 典型用法：
 * ```tsx
 * const { registerField, unregisterField, getAllFieldStates } = useFieldRegistry();
 *
 * return (
 *   <DataScope
 *     registerField={registerField}
 *     unregisterField={unregisterField}
 *     getRecord={getValue}
 *   >
 *     {children}
 *   </DataScope>
 * );
 * ```
 */
export interface UseFieldRegistryResult {
  /** 注册或更新字段状态。建议在子组件 useEffect 中调用。 */
  registerField: (field: FieldState) => void;
  /** 注销字段。建议在子组件卸载时调用。 */
  unregisterField: (id: string) => void;
  /** 读取单个字段状态。 */
  getFieldState: (id: string) => FieldState | undefined;
  /** 读取全部字段状态快照。 */
  getAllFieldStates: () => FieldState[];
  /** 清空注册表。 */
  clearRegistry: () => void;
}

export function useFieldRegistry(): UseFieldRegistryResult {
  const registryRef = useRef<Map<string, FieldState>>(new Map());

  const registerField = useCallback((field: FieldState) => {
    registryRef.current.set(field.id, field);
  }, []);

  const unregisterField = useCallback((id: string) => {
    registryRef.current.delete(id);
  }, []);

  const getFieldState = useCallback((id: string) => {
    return registryRef.current.get(id);
  }, []);

  const getAllFieldStates = useCallback(() => {
    return Array.from(registryRef.current.values());
  }, []);

  const clearRegistry = useCallback(() => {
    registryRef.current.clear();
  }, []);

  return {
    registerField,
    unregisterField,
    getFieldState,
    getAllFieldStates,
    clearRegistry,
  };
}
