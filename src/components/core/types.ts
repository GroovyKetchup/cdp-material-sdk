import type { HTMLAttributes, RefAttributes } from 'react';

/**
 * 宿主注入根 DOM 属性时使用的标准路径。
 * 外部作者组件应将 `slotProps.root` 透传到实际渲染的根节点，
 * 以便宿主挂载 ref 和 DOM 属性。
 */
export const INJECT_PATH_SLOT_PROPS = 'slotProps.root';

/**
 * 支持宿主注入 slot props 的基础属性结构。
 */
export interface BaseUIProps<RootDOM extends HTMLElement = HTMLElement> {
  slotProps?: {
    root?: HTMLAttributes<RootDOM> & RefAttributes<RootDOM>;
    [key: string]: any;
  };
}
