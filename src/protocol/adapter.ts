import { ENGINE_EVENT_TYPE } from '../constants/event';
import type { CustomEventKey, EventKey, EngineEventProtocol, StandardEventKey } from './events';

/**
 * 作用域上下文 — 包含所在作用域数据及索引。
 *
 * 例如在表格行或列表项中，record 为当前行/项数据，index 为其索引。
 */
export interface ScopeContext {
  record: any;
  index?: number;
}

/**
 * 标准事件 transform 的返回类型。
 * `valueChange` 是特殊事件：transform 只负责从回调参数提取「新值」，
 * 最终 `{ newValue, oldValue }` 引擎 payload 由宿主组装（oldValue 来自宿主 value ref）。
 * 其余标准事件 transform 返回完整引擎 payload。
 */
export type StandardEventTransformResult<K extends StandardEventKey> =
  K extends typeof ENGINE_EVENT_TYPE.VALUE_CHANGE
    ? EngineEventProtocol[typeof ENGINE_EVENT_TYPE.VALUE_CHANGE]['newValue']
    : EngineEventProtocol[K];

export interface StandardEventBinding<K extends StandardEventKey> {
  propName?: string;
  transform?: (...args: any[]) => StandardEventTransformResult<K>;
  toScope?: (...args: any[]) => ScopeContext | undefined;
}

export interface CustomEventBinding {
  propName?: string;
  transform?: (...args: any[]) => unknown;
  toScope?: (...args: any[]) => ScopeContext | undefined;
}

export interface EventAdapter<K extends StandardEventKey> extends StandardEventBinding<K> {
  type: K;
}

export interface CustomEventAdapter extends CustomEventBinding {
  type: CustomEventKey;
}

export type ComponentAdapterStandardEventMap = Partial<{
  [K in StandardEventKey]: StandardEventBinding<K>
}>;

export type ComponentAdapterCustomEventMap = Partial<Record<CustomEventKey, CustomEventBinding>>;

export type StandardEventAdapter = {
  [K in StandardEventKey]: EventAdapter<K>
}[StandardEventKey];

export interface AdapterEventSource {
  events?: ComponentAdapterStandardEventMap;
  customEvents?: ComponentAdapterCustomEventMap;
}

export interface NormalizedAdapterEvents {
  standard: StandardEventAdapter[];
  custom: CustomEventAdapter[];
  all: Array<StandardEventAdapter | CustomEventAdapter>;
  allKeys: EventKey[];
}

function normalizeStandardAdapterEvents(events?: ComponentAdapterStandardEventMap): StandardEventAdapter[] {
  if (!events) {
    return [];
  }

  const normalized: StandardEventAdapter[] = [];

  for (const [type, event] of Object.entries(events)) {
    if (!event) {
      continue;
    }

    normalized.push({
      type: type as StandardEventKey,
      ...event,
    } as StandardEventAdapter);
  }

  return normalized;
}

function normalizeCustomAdapterEvents(customEvents?: ComponentAdapterCustomEventMap): CustomEventAdapter[] {
  if (!customEvents) {
    return [];
  }

  const normalized: CustomEventAdapter[] = [];

  for (const [type, event] of Object.entries(customEvents)) {
    if (!event) {
      continue;
    }

    normalized.push({
      type: type as CustomEventKey,
      ...event,
    });
  }

  return normalized;
}

export function normalizeAdapterEvents(source?: AdapterEventSource | null): NormalizedAdapterEvents {
  const standard = normalizeStandardAdapterEvents(source?.events);
  const custom = normalizeCustomAdapterEvents(source?.customEvents);

  return {
    standard,
    custom,
    all: [...standard, ...custom],
    allKeys: [...standard.map((event) => event.type), ...custom.map((event) => event.type)],
  };
}

export interface ComponentAdapter {
  events?: ComponentAdapterStandardEventMap;
  customEvents?: ComponentAdapterCustomEventMap;
  propMapping?: Record<string, string>;
  mapProps?: (props: any) => any;
}
