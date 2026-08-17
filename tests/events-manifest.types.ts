import {
  resolveComponentManifest,
  type ComponentManifest,
  type ResolvedComponentManifest,
  type StandardEventDeclaration,
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
