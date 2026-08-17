import {
  resolveComponentManifest,
  type ComponentManifest,
  type ResolvedComponentManifest,
  type StandardEventDeclaration,
  type StandardEventTransformResult,
} from '../src/portable';

const invalidAuthorDeclaration: StandardEventDeclaration = {
  // @ts-expect-error 标准事件 payloadSchema 由 SDK 定义
  payloadSchema: { type: 'string' },
};

const resolved: ResolvedComponentManifest = resolveComponentManifest({
  type: 'test.TypeContract',
  meta: { title: '类型契约', category: 'DataEntry' },
  events: { valueChange: {} },
} as ComponentManifest);

resolved.events?.valueChange?.payloadSchema;
void invalidAuthorDeclaration;

// valueChange transform 返回「新值」；其余标准事件 transform 返回完整引擎 payload
const valueChangeTransformResult: StandardEventTransformResult<'valueChange'> = 'new-value';
const itemClickTransformResult: StandardEventTransformResult<'itemClick'> = {
  index: 1,
  item: { id: 'row-1' },
};
void valueChangeTransformResult;
void itemClickTransformResult;
