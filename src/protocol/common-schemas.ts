import type { FromSchema } from 'json-schema-to-ts';

export const OptionItemSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', title: '显示名称' },
    value: { type: 'string', title: '选项值' },
    disabled: { type: 'boolean', title: '是否禁用' },
  },
} as const;

export const OptionsSchema = {
  type: 'array',
  title: '选项列表',
  items: OptionItemSchema,
} as const;

export type OptionItem = FromSchema<typeof OptionItemSchema>;
export type Options = FromSchema<typeof OptionsSchema>;
