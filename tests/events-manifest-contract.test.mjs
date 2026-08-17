import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COMPONENT_CATEGORY,
  ENGINE_EVENT_TYPE,
  STANDARD_EVENT_DEFINITIONS,
  STANDARD_EVENT_KEYS,
  normalizeManifestEvents,
  resolveComponentManifest,
} from '../dist/portable.js';

const VOID_EVENT_TYPES = [
  ENGINE_EVENT_TYPE.MOUNT,
  ENGINE_EVENT_TYPE.UNMOUNT,
  ENGINE_EVENT_TYPE.CLICK,
  ENGINE_EVENT_TYPE.FOCUS,
  ENGINE_EVENT_TYPE.BLUR,
];

const ITEM_EVENT_TYPES = [
  ENGINE_EVENT_TYPE.ITEM_CLICK,
  ENGINE_EVENT_TYPE.ITEM_DOUBLE_CLICK,
  ENGINE_EVENT_TYPE.ITEM_RIGHT_CLICK,
  ENGINE_EVENT_TYPE.ITEM_LONG_PRESS,
];

const source = {
  type: 'test.EventContract',
  meta: { title: '事件契约', category: COMPONENT_CATEGORY.DATA_ENTRY },
  events: {
    [ENGINE_EVENT_TYPE.CLICK]: { title: '作者点击' },
    [ENGINE_EVENT_TYPE.VALUE_CHANGE]: { description: '作者值变化说明' },
  },
  customEvents: {
    'test:done': {
      title: '完成',
      payloadSchema: {
        type: 'object',
        properties: { result: { type: 'string' } },
      },
    },
  },
};

test('STANDARD_EVENT_DEFINITIONS covers exactly STANDARD_EVENT_KEYS', () => {
  assert.deepEqual(Object.keys(STANDARD_EVENT_DEFINITIONS), STANDARD_EVENT_KEYS);
});

test('every standard event definition has a non-empty title', () => {
  for (const key of STANDARD_EVENT_KEYS) {
    const definition = STANDARD_EVENT_DEFINITIONS[key];
    assert.ok(definition, `definition for ${key} should exist`);
    assert.equal(typeof definition.title, 'string');
    assert.ok(definition.title.length > 0, `title for ${key} should be non-empty`);
  }
});

test('void events omit payloadSchema', () => {
  for (const type of VOID_EVENT_TYPES) {
    assert.equal(STANDARD_EVENT_DEFINITIONS[type].payloadSchema, undefined, `${type} should not declare payloadSchema`);
  }
});

test('valueChange requires newValue/oldValue', () => {
  const schema = STANDARD_EVENT_DEFINITIONS[ENGINE_EVENT_TYPE.VALUE_CHANGE].payloadSchema;
  assert.ok(schema, 'valueChange should declare payloadSchema');
  assert.deepEqual(schema.required, ['newValue', 'oldValue']);
});

test('optionsFetch requires panelCode/fieldName', () => {
  const schema = STANDARD_EVENT_DEFINITIONS[ENGINE_EVENT_TYPE.OPTIONS_FETCH].payloadSchema;
  assert.ok(schema, 'optionsFetch should declare payloadSchema');
  assert.deepEqual(schema.required, ['panelCode', 'fieldName']);
});

test('resolver only fills declared events, not undeclared ones', () => {
  const resolved = resolveComponentManifest(source);
  assert.ok(resolved.events?.[ENGINE_EVENT_TYPE.CLICK], 'click should be present');
  assert.ok(resolved.events?.[ENGINE_EVENT_TYPE.VALUE_CHANGE], 'valueChange should be present');
  assert.equal(resolved.events?.[ENGINE_EVENT_TYPE.MOUNT], undefined, 'mount must not be injected');
});

test('author metadata overrides canonical metadata', () => {
  const resolved = resolveComponentManifest(source);
  assert.equal(resolved.events?.[ENGINE_EVENT_TYPE.CLICK]?.title, '作者点击');
  assert.equal(resolved.events?.[ENGINE_EVENT_TYPE.VALUE_CHANGE]?.description, '作者值变化说明');
});

test('canonical payloadSchema wins and void events cannot gain schema', () => {
  const withForcedSchema = {
    ...source,
    events: {
      ...source.events,
      [ENGINE_EVENT_TYPE.CLICK]: { title: '点击', payloadSchema: { type: 'string' } },
      [ENGINE_EVENT_TYPE.VALUE_CHANGE]: {
        title: '值改变',
        payloadSchema: { type: 'string' },
      },
    },
  };
  const resolved = resolveComponentManifest(withForcedSchema);
  assert.equal(
    resolved.events?.[ENGINE_EVENT_TYPE.CLICK]?.payloadSchema,
    undefined,
    'void events must not gain a schema from untyped author input',
  );
  const canonicalValueChange = STANDARD_EVENT_DEFINITIONS[ENGINE_EVENT_TYPE.VALUE_CHANGE].payloadSchema;
  assert.deepEqual(
    resolved.events?.[ENGINE_EVENT_TYPE.VALUE_CHANGE]?.payloadSchema,
    canonicalValueChange,
    'canonical schema should win over author-provided schema',
  );
});

test('customEvents stay author-owned and the input object is not mutated', () => {
  const input = structuredClone(source);
  const resolved = resolveComponentManifest(input);
  assert.deepEqual(resolved.customEvents?.['test:done']?.payloadSchema, {
    type: 'object',
    properties: { result: { type: 'string' } },
  });
  assert.deepEqual(input, source, 'input manifest must not be mutated');
});

test('normalizeManifestEvents still does not inject canonical fields', () => {
  const normalized = normalizeManifestEvents(source);
  assert.equal(normalized.standard.length, 2);
  const valueChange = normalized.standard.find((event) => event.type === ENGINE_EVENT_TYPE.VALUE_CHANGE);
  assert.equal(valueChange?.title, undefined, 'normalize must not add canonical title');
  assert.equal(valueChange?.description, '作者值变化说明');
  assert.equal(valueChange?.payloadSchema, undefined, 'normalize must not add canonical payloadSchema');
});

test('unknown standard event key throws', () => {
  assert.throws(
    () => resolveComponentManifest({ ...source, events: { 'not:a-standard-event': {} } }),
    (error) => error instanceof TypeError && /Unknown standard event: not:a-standard-event/.test(error.message),
  );
});

test('item events declare index/item payload with titles', () => {
  for (const type of ITEM_EVENT_TYPES) {
    const schema = STANDARD_EVENT_DEFINITIONS[type].payloadSchema;
    assert.ok(schema, `${type} should declare payloadSchema`);
    assert.deepEqual(schema.required, ['index', 'item']);
    assert.equal(schema.properties?.index?.title, '索引');
    assert.equal(schema.properties?.item?.title, '数据项');
  }
});

test('canonical definitions migrated descriptions from GlobalEventMeta', () => {
  assert.equal(STANDARD_EVENT_DEFINITIONS[ENGINE_EVENT_TYPE.CLICK].description, '组件被点击时触发');
  assert.equal(STANDARD_EVENT_DEFINITIONS[ENGINE_EVENT_TYPE.VALUE_CHANGE].description, '输入值发生变化时触发');
  assert.equal(STANDARD_EVENT_DEFINITIONS[ENGINE_EVENT_TYPE.ITEM_LONG_PRESS].description, '长按单项时触发（桌面端和移动端）');
  assert.equal(STANDARD_EVENT_DEFINITIONS[ENGINE_EVENT_TYPE.MOUNT].description, '组件挂载完成时触发');
  assert.equal(STANDARD_EVENT_DEFINITIONS[ENGINE_EVENT_TYPE.DATA_FETCH].description, '组件触发数据查询时触发');
  assert.ok(STANDARD_EVENT_DEFINITIONS[ENGINE_EVENT_TYPE.OPTIONS_FETCH].description?.includes('panelCode/fieldName/condition/keyword/extraFieldNames'));
});

test('fieldInfo schema requires fieldName and is deprecated', () => {
  const fieldInfo = STANDARD_EVENT_DEFINITIONS[ENGINE_EVENT_TYPE.OPTIONS_FETCH].payloadSchema?.properties?.fieldInfo;
  assert.ok(fieldInfo, 'fieldInfo should exist in optionsFetch payload');
  assert.deepEqual(fieldInfo.required, ['fieldName']);
});

test('canonical definitions are deep frozen', () => {
  assert.ok(Object.isFrozen(STANDARD_EVENT_DEFINITIONS), 'map should be frozen');
  assert.ok(Object.isFrozen(STANDARD_EVENT_DEFINITIONS[ENGINE_EVENT_TYPE.CLICK]), 'event definition should be frozen');
  assert.ok(
    Object.isFrozen(STANDARD_EVENT_DEFINITIONS[ENGINE_EVENT_TYPE.VALUE_CHANGE].payloadSchema),
    'payloadSchema should be frozen',
  );
  assert.throws(
    () => { STANDARD_EVENT_DEFINITIONS[ENGINE_EVENT_TYPE.CLICK].title = '被修改'; },
    TypeError,
    'mutating a frozen definition should throw',
  );
});
