/**
 * 面向独立分发物料包的公开 authoring 入口。
 * 第三方组件与插件默认应优先从这里导入。
 */
export * from './plugin';
export * from './hooks/useConcurrentLoading';
export * from './hooks/useDualLoading';
export * from './protocol/adapter';
export * from './protocol/common-schemas';
export * from './protocol/events';
export * from './protocol/manifest';
export * from './protocol/manifest-types';
export * from './protocol/traits';
export { ENGINE_EVENT_TYPE, NOTIFY_ERROR_STRATEGY, NOTIFY_TIMING } from './constants/event';
export { COMPONENT_CATEGORY, CATEGORY_LABELS } from './types/category';
export type { ComponentCategory } from './types/category';
export { INJECT_PATH_SLOT_PROPS } from './components/core/types';
export type { BaseUIProps } from './components/core/types';
