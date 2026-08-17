import type { JSONSchema7 } from 'json-schema';
import type { ComponentAdapter } from './adapter';
import { STANDARD_EVENT_DEFINITIONS, isStandardEventKey } from './events';
import type { CustomEventKey, EventKey, StandardEventKey } from './events';
import type { ComponentTrait } from './traits';
import type { ComponentCategory } from '../types/category';

export const DYNAMIC_ENUM_KEY = 'x-dynamic-enum';
export const SLOT_KEY = 'x-slot';
export const INJECT_PATH_ROOT = '$root';

/** useImperativeHandle 中用于暴露组件运行时状态的保留 key */
export const COMPONENT_STATE_KEY = '__state' as const;

export const FIELD_ROLE_KEY = 'x-fieldRole';

export const DATA_FIELD_ROLE = {
  ATTRIBUTE: 'attribute',
  DIMENSION: 'dimension',
  MEASURE: 'measure',
} as const;

export type DataFieldRole = typeof DATA_FIELD_ROLE[keyof typeof DATA_FIELD_ROLE];
export type DataSourceFieldRoleFilter =
  | typeof DATA_FIELD_ROLE.DIMENSION
  | typeof DATA_FIELD_ROLE.MEASURE;
export interface DynamicEnumConfig {
  source: string;
  valueKey: string;
  labelKey: string;
}

export interface ExtendedJSONSchema7 extends JSONSchema7 {
  [DYNAMIC_ENUM_KEY]?: DynamicEnumConfig;
  [SLOT_KEY]?: boolean;
  allowedTabs?: string[];
  'x-editableSelectOptions'?: Array<{ value: string; label: string }>;
  placeholder?: string;
  [FIELD_ROLE_KEY]?: DataSourceFieldRoleFilter;
}

export interface StandardEventDeclaration {
  title?: string;
  description?: string;
  deprecated?: boolean;
}

export interface CustomEventDeclaration extends StandardEventDeclaration {
  payloadSchema: JSONSchema7;
}

export interface EventSpec extends StandardEventDeclaration {
  type: StandardEventKey;
  payloadSchema?: JSONSchema7;
}

export interface CustomEventSpec extends CustomEventDeclaration {
  type: CustomEventKey;
}

export type ManifestStandardEventMap = Partial<Record<StandardEventKey, StandardEventDeclaration>>;
export type ManifestCustomEventMap = Partial<Record<CustomEventKey, CustomEventDeclaration>>;

export interface ManifestEventSource {
  events?: ManifestStandardEventMap;
  customEvents?: ManifestCustomEventMap;
}

export interface NormalizedManifestEvents {
  standard: EventSpec[];
  custom: CustomEventSpec[];
  all: Array<EventSpec | CustomEventSpec>;
  allKeys: EventKey[];
}

function normalizeStandardManifestEvents(events?: ManifestStandardEventMap): EventSpec[] {
  if (!events) {
    return [];
  }

  const normalized: EventSpec[] = [];

  for (const [type, event] of Object.entries(events)) {
    if (!event) {
      continue;
    }

    normalized.push({
      type: type as StandardEventKey,
      ...event,
    });
  }

  return normalized;
}

function normalizeCustomManifestEvents(customEvents?: ManifestCustomEventMap): CustomEventSpec[] {
  if (!customEvents) {
    return [];
  }

  const normalized: CustomEventSpec[] = [];

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

export function normalizeManifestEvents(source?: ManifestEventSource | null): NormalizedManifestEvents {
  const standard = normalizeStandardManifestEvents(source?.events);
  const custom = normalizeCustomManifestEvents(source?.customEvents);

  return {
    standard,
    custom,
    all: [...standard, ...custom],
    allKeys: [...standard.map((event) => event.type), ...custom.map((event) => event.type)],
  };
}

export interface ObjectSchema extends JSONSchema7 {
  type: 'object';
  properties: Record<string, ExtendedJSONSchema7>;
}

export interface ActionSpec {
  title: string;
  description?: string;
  params?: ObjectSchema;
  returns?: JSONSchema7;
  ai?: {
    scenario?: string;
    tips?: string[];
  };
}

export interface StateSpec {
  title: string;
  description?: string;
  schema: JSONSchema7;
}

export interface AIUsageSpec {
  tips?: string[];
  warnings?: string[];
}

export const LOADING_STRATEGY = {
  NATIVE: 'native',
  WRAPPER: 'wrapper',
  NONE: 'none',
} as const;

export type LoadingStrategy = typeof LOADING_STRATEGY[keyof typeof LOADING_STRATEGY];

export const LOADING_WRAPPER_TYPE = {
  SPIN: 'spin',
  SKELETON: 'skeleton',
  WAVE: 'wave',
} as const;

export type LoadingWrapperType = typeof LOADING_WRAPPER_TYPE[keyof typeof LOADING_WRAPPER_TYPE] | (string & {});

export const LOADING_PROP_NAME = 'loading';

export interface EnginePolicies {
  render?: {
    injection?: {
      rootPath?: string;
    };
    loading?: {
      strategy: LoadingStrategy;
      propName?: string;
      wrapperType?: LoadingWrapperType;
      wrapperProps?: Record<string, any>;
    };
  };
}

export interface SlotDefinition {
  title: string;
  description?: string;
  defaultEnabled?: boolean;
  allowedChildren?: string[];
  scoped?: boolean;
  scopeDescription?: string;
  dynamic?: boolean;
  dynamicSource?: string;
  dynamicFilter?: string;
  dynamicKey?: string;
  dynamicTitle?: string;
}

export interface ComponentManifest {
  type: string;
  alias?: string[];
  adapter?: ComponentAdapter;
  engine?: EnginePolicies;
  meta: {
    title: string;
    category: ComponentCategory;
    valueSchema?: JSONSchema7;
    icon?: string;
    description?: string;
    hiddenInComponentList?: boolean;
    subGroup?: string;
  };
  traits?: ComponentTrait[];
  nesting?: {
    allowedChildren?: string[];
    allowedParents?: string[];
    maxChildren?: number;
    minChildren?: number;
  };
  props?: ObjectSchema;
  slots?: Record<string, SlotDefinition>;
  events?: ManifestStandardEventMap;
  customEvents?: ManifestCustomEventMap;
  actions?: Record<string, ActionSpec>;
  _componentActionKeys?: readonly string[];
  state?: Record<string, StateSpec>;
  usage?: AIUsageSpec;
}

export interface ResolvedStandardEventDeclaration extends StandardEventDeclaration {
  title: string;
  payloadSchema?: JSONSchema7;
}

export type ResolvedManifestStandardEventMap = Partial<
  Record<StandardEventKey, ResolvedStandardEventDeclaration>
>;

export type ResolvedComponentManifest = Omit<ComponentManifest, 'events'> & {
  events?: ResolvedManifestStandardEventMap;
};

function cloneEventPayloadSchema(schema: JSONSchema7): JSONSchema7 {
  return JSON.parse(JSON.stringify(schema)) as JSONSchema7;
}

/**
 * 将作者态 manifest 解析为可直接消费的 resolved manifest。
 * 标准事件从 canonical 事实源补齐 title/description/payloadSchema，
 * 作者声明的 title/description/deprecated 覆盖 canonical；
 * 有 payload 的标准事件强制使用 SDK payloadSchema，void 事件不会获得 schema。
 * customEvents 原样保留，不被改写。
 */
export function resolveComponentManifest(
  manifest: ComponentManifest,
): ResolvedComponentManifest {
  const { events: manifestEvents, ...rest } = manifest;
  if (manifestEvents === undefined) return rest;

  const events: ResolvedManifestStandardEventMap = {};
  for (const [type, declaration] of Object.entries(manifestEvents)) {
    if (!declaration) continue;
    if (!isStandardEventKey(type)) {
      throw new TypeError(`Unknown standard event: ${type}`);
    }
    const canonical = STANDARD_EVENT_DEFINITIONS[type];
    events[type] = {
      ...canonical,
      ...(declaration.title !== undefined ? { title: declaration.title } : {}),
      ...(declaration.description !== undefined ? { description: declaration.description } : {}),
      ...(declaration.deprecated !== undefined ? { deprecated: declaration.deprecated } : {}),
      ...(canonical.payloadSchema !== undefined
        ? { payloadSchema: cloneEventPayloadSchema(canonical.payloadSchema) }
        : {}),
    };
  }
  return { ...rest, events };
}
