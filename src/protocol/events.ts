import { ENGINE_EVENT_TYPE } from '../constants/event';

export interface EngineEventProtocol {
  [ENGINE_EVENT_TYPE.MOUNT]: void;
  [ENGINE_EVENT_TYPE.UNMOUNT]: void;
  [ENGINE_EVENT_TYPE.CLICK]: void;
  [ENGINE_EVENT_TYPE.FOCUS]: void;
  [ENGINE_EVENT_TYPE.BLUR]: void;
  [ENGINE_EVENT_TYPE.VALUE_CHANGE]: {
    newValue: any;
    oldValue: any;
  };
  [ENGINE_EVENT_TYPE.ITEM_CLICK]: {
    index: number;
    item: Record<string, any>;
  };
  [ENGINE_EVENT_TYPE.ITEM_DOUBLE_CLICK]: {
    index: number;
    item: Record<string, any>;
  };
  [ENGINE_EVENT_TYPE.ITEM_RIGHT_CLICK]: {
    index: number;
    item: Record<string, any>;
  };
  [ENGINE_EVENT_TYPE.ITEM_LONG_PRESS]: {
    index: number;
    item: Record<string, any>;
  };
  [ENGINE_EVENT_TYPE.DATA_FETCH]: {
    panelCode: string;
    condition?: Record<string, any>;
    keyword?: string;
    pageNo?: number;
    pageSize?: number;
    orderBy?: Array<Record<string, unknown>>;
    advancedConditions?: Record<string, unknown>;
  };
  [ENGINE_EVENT_TYPE.OPTIONS_FETCH]: {
    panelCode: string;
    fieldName: string;
    condition?: Record<string, any>;
    keyword?: string;
    extraFieldNames?: string[];
    /**
     * @deprecated 历史字段，等价于 `{ fieldName }`。早期此事件挂在 DATA_FETCH 下，
     * 老的事件指令脚本可能从 payload.fieldInfo.fieldName 取值。
     * 运行时会与 `fieldName` 一并发送以保证向后兼容，新代码请直接读取顶层 `fieldName`。
     */
    fieldInfo?: {
      fieldName: string;
    };
  };
}

export type StandardEventKey = keyof EngineEventProtocol;
export type CustomEventKey = `${string}:${string}`;
export type EventKey = StandardEventKey | CustomEventKey;

export const STANDARD_EVENT_KEYS = Object.values(ENGINE_EVENT_TYPE) as StandardEventKey[];

const standardEventKeySet = new Set<string>(STANDARD_EVENT_KEYS);
const customEventKeyPattern = /^[^:\s]+:[^:\s]+$/;

export function isStandardEventKey(type: string): type is StandardEventKey {
  return standardEventKeySet.has(type);
}

export function isCustomEventKey(type: string): type is CustomEventKey {
  return customEventKeyPattern.test(type) && !standardEventKeySet.has(type);
}

export type EventPayload<K extends StandardEventKey> = EngineEventProtocol[K];

export type EngineEventHandler<K extends StandardEventKey> =
  EngineEventProtocol[K] extends void
    ? () => void
    : (params: EngineEventProtocol[K]) => void;
