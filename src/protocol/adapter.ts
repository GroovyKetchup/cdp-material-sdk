import type { CustomEventKey, EventKey, EngineEventProtocol, StandardEventKey } from './events';

export interface ScopeContext {
  [key: string]: unknown;
}

export interface StandardEventBinding<K extends StandardEventKey> {
  propName?: string;
  transform?: (...args: any[]) => EngineEventProtocol[K];
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
