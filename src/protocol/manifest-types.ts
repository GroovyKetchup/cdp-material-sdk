import type { FromSchema, JSONSchema } from 'json-schema-to-ts';

export type ManifestProps<S extends JSONSchema> = FromSchema<S>;

export type ExtractManifestProps<
  M extends { props?: { type: 'object'; properties: Record<string, unknown> } }
> = M extends { props: infer S extends JSONSchema }
  ? FromSchema<S>
  : Record<string, never>;
