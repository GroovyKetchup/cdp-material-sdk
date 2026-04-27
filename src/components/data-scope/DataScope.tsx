import { useCallback, useContext, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { DataContainerRuntimeContext } from '../../context/DataContainerRuntimeContext';
import {
  DataScopeContext,
  type FieldState,
} from '../../context/DataScopeContext';

const COMPONENTS_KEY = 'components';
const VALUE_KEY = 'value';

/** `components.{id}.value.{field}` —— 与宿主页面 store 字段路径保持一致。 */
const componentFieldPath = (id: string, field: string) =>
  `${COMPONENTS_KEY}.${id}.${VALUE_KEY}.${field}`;

export interface DataScopeProps {
  /**
   * 相对路径函数，决定子字段在数据容器值内的访问位置。
   *
   * 例：
   * - Form: `(childId) => childId`               → `components.X.value.fieldName`
   * - TableRow: `(childId) => `[${i}].${childId}`` → `components.X.value[0].fieldName`
   *
   * 默认值: `(childId) => childId`。
   */
  relativePath?: (childId: string) => string;

  /**
   * 数据实体（适用于会随数据重新 render 的组件，如 Table 行）。
   * 与 `getRecord` 二选一。
   */
  record?: unknown;
  /**
   * 数据实体获取函数（适用于不会随数据重新 render 的组件，如 Form）。
   * 与 `record` 二选一。
   */
  getRecord?: () => unknown;

  /** 当前作用域索引（如表格行索引）。 */
  index?: number;

  /** 字段注册接口，由数据容器组件实现。 */
  registerField?: (field: FieldState) => void;
  unregisterField?: (id: string) => void;

  children: ReactNode;
}

/**
 * `DataScope` 用于建立数据作用域：
 *
 * 1. 路径解析 — 自动用最近一层 `DataContainerRuntimeContext` 的 `componentId`，
 *    结合 `relativePath` 拼接出页面 store 绝对路径。
 * 2. 数据实体注入 — 使用 Ref + Getter 模式，让 `record` 变化不会触发后代重渲染。
 * 3. 索引注入 — 暴露当前作用域索引（排序/增删时合理触发更新）。
 * 4. 字段状态注册 — 透传 `registerField` / `unregisterField`，便于容器聚合字段元信息。
 *
 * 设计约束：
 * - `DataScope` 必须被包裹在数据容器组件内部，由数据容器经
 *   `DataContainerRuntimeContext` 提供 `componentId`。组件作者无需也不应
 *   显式传入 `componentId`。
 */
export const DataScope = ({
  relativePath,
  record,
  getRecord: getRecordProp,
  index,
  registerField,
  unregisterField,
  children,
}: DataScopeProps) => {
  const runtime = useContext(DataContainerRuntimeContext);

  if (!runtime?.componentId) {
    throw new Error(
      '[cdp-material-sdk] DataScope 必须在数据容器组件内部使用，请确保上层提供 DataContainerRuntimeContext。',
    );
  }

  const componentId = runtime.componentId;

  const resolvePath = useCallback(
    (childId: string) => {
      const rel = relativePath ? relativePath(childId) : childId;
      return componentFieldPath(componentId, rel);
    },
    [componentId, relativePath],
  );

  // 使用 Ref 追踪最新的 record，render 阶段直接赋值是安全的，且不会触发下游重渲染。
  const recordRef = useRef<unknown>(record);
  recordRef.current = record;

  const value = useMemo(
    () => ({
      resolvePath,
      inScope: true,
      getRecord: getRecordProp ?? (() => recordRef.current),
      index,
      registerField,
      unregisterField,
    }),
    [resolvePath, getRecordProp, index, registerField, unregisterField],
  );

  return <DataScopeContext.Provider value={value}>{children}</DataScopeContext.Provider>;
};
