import { createContext } from 'react';

/**
 * 把 DataScope 内部使用的相对字段名解析为页面 store 绝对路径。
 */
export type PathResolver = (childId: string) => string;

/**
 * 用于在组件间传递的延迟作用域，避免在数据频繁变化时触发下游重渲染。
 */
export interface LazyScope {
  /** 数据实体获取器。 */
  getRecord: () => unknown;
  /** 当前作用域索引（如表格行索引）。 */
  index?: number;
}

/**
 * 由数据字段组件向上注册的字段状态。
 * 数据容器组件可以据此聚合字段元信息，例如校验态、读写态、显隐态等。
 */
export interface FieldState {
  /** 字段唯一 ID，可能是组件 ID 或嵌套字段 fullPath。 */
  id: string;
  /** props 上的字段名。 */
  name?: string;
  /** props 上的字段标签。 */
  label?: string;
  hidden: boolean;
  /** 组件内部 readOnly 状态，不包含 Form 全局状态。 */
  readOnly: boolean;
  /** 组件 props 上的 required 可能被动作修改，需要上报。 */
  required?: boolean;
}

/**
 * DataScope 提供给后代组件的上下文值。
 */
export interface DataScopeContextValue {
  resolvePath: PathResolver;
  inScope: boolean;
  /**
   * 数据实体获取函数，引用稳定，避免数据变化触发下游重渲染。
   */
  getRecord: () => unknown;
  /** 当前作用域索引（如表格行索引）。 */
  index?: number;
  /** 字段注册接口，由数据容器组件提供。 */
  registerField?: (field: FieldState) => void;
  unregisterField?: (id: string) => void;
}

/**
 * 当前数据作用域的 React context。
 * 数据字段组件通过它解析字段路径、读取记录和注册字段状态。
 */
export const DataScopeContext = createContext<DataScopeContextValue | null>(null);
