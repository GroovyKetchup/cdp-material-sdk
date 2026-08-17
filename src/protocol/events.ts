import type { JSONSchema7 } from 'json-schema';
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

export interface StandardEventDefinition {
  title: string;
  description?: string;
  deprecated?: boolean;
  payloadSchema?: JSONSchema7;
}

export type StandardEventDefinitionMap = Readonly<{
  [K in StandardEventKey]: StandardEventDefinition;
}>;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

const itemEventPayloadSchema: JSONSchema7 = deepFreeze({
  type: 'object',
  properties: {
    index: { type: 'number', title: '索引' },
    item: { type: 'object', title: '数据项' },
  },
  required: ['index', 'item'],
});

/**
 * 标准事件的 canonical 元数据事实源（deep frozen，运行时不可变）。
 * void 事件不声明 payloadSchema（缺失即表示事件没有 payload），
 * 有 payload 的事件声明完整 JSON Schema（object schema 不封闭额外字段）。
 * description 迁移自原前端 GlobalEventMeta，保证前端删除重复事实源后说明不丢失。
 */
export const STANDARD_EVENT_DEFINITIONS: StandardEventDefinitionMap = deepFreeze({
  [ENGINE_EVENT_TYPE.MOUNT]: { title: '挂载', description: '组件挂载完成时触发' },
  [ENGINE_EVENT_TYPE.UNMOUNT]: { title: '卸载', description: '组件卸载时触发' },
  [ENGINE_EVENT_TYPE.CLICK]: { title: '点击', description: '组件被点击时触发' },
  [ENGINE_EVENT_TYPE.FOCUS]: { title: '获取焦点' },
  [ENGINE_EVENT_TYPE.BLUR]: { title: '失去焦点' },
  [ENGINE_EVENT_TYPE.VALUE_CHANGE]: {
    title: '值改变',
    description: '输入值发生变化时触发',
    payloadSchema: {
      type: 'object',
      properties: {
        newValue: { title: '新值' },
        oldValue: { title: '旧值' },
      },
      required: ['newValue', 'oldValue'],
    },
  },
  [ENGINE_EVENT_TYPE.ITEM_CLICK]: { title: '项点击', description: '点击单项时触发', payloadSchema: itemEventPayloadSchema },
  [ENGINE_EVENT_TYPE.ITEM_DOUBLE_CLICK]: { title: '项双击', description: '双击单项时触发', payloadSchema: itemEventPayloadSchema },
  [ENGINE_EVENT_TYPE.ITEM_RIGHT_CLICK]: { title: '项右键', description: '右键点击单项时触发', payloadSchema: itemEventPayloadSchema },
  [ENGINE_EVENT_TYPE.ITEM_LONG_PRESS]: {
    title: '项长按',
    description: '长按单项时触发（桌面端和移动端）',
    payloadSchema: itemEventPayloadSchema,
  },
  [ENGINE_EVENT_TYPE.DATA_FETCH]: {
    title: '数据查询',
    description: '组件触发数据查询时触发',
    payloadSchema: {
      type: 'object',
      properties: {
        panelCode: { type: 'string', title: '面板编码' },
        condition: { type: 'object', title: '查询条件' },
        keyword: { type: 'string', title: '关键字' },
        pageNo: { type: 'number', title: '页码' },
        pageSize: { type: 'number', title: '每页条数' },
        orderBy: { type: 'array', items: { type: 'object' }, title: '排序' },
        advancedConditions: { type: 'object', title: '高级条件' },
      },
      required: ['panelCode'],
    },
  },
  [ENGINE_EVENT_TYPE.OPTIONS_FETCH]: {
    title: '选项查询',
    description: '下拉类组件需要刷新选项时触发（挂载、搜索、condition 变化、refresh 调用）。payload 包含 panelCode/fieldName/condition/keyword/extraFieldNames',
    payloadSchema: {
      type: 'object',
      properties: {
        panelCode: { type: 'string', title: '面板编码' },
        fieldName: { type: 'string', title: '字段名' },
        condition: { type: 'object', title: '查询条件' },
        keyword: { type: 'string', title: '关键字' },
        extraFieldNames: { type: 'array', items: { type: 'string' }, title: '额外字段' },
        fieldInfo: {
          type: 'object',
          properties: { fieldName: { type: 'string', title: '字段名' } },
          required: ['fieldName'],
          title: '字段信息',
          description: '已废弃：历史字段，等价于 { fieldName }，请直接使用顶层 fieldName',
        },
      },
      required: ['panelCode', 'fieldName'],
    },
  },
});

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
