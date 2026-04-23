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

export const RemoteOptionConfigSchema = {
  type: 'object',
  title: '远程选项配置',
  properties: {
    panelCode: { type: 'string', title: '面板代码' },
    fieldName: { type: 'string', title: '字段名称' },
    condition: {
      type: 'object',
      title: '查询条件',
      description: '声明式查询条件，支持表达式绑定。',
      additionalProperties: { type: 'string' },
    },
  },
} as const;

export type OptionItem = FromSchema<typeof OptionItemSchema>;
export type Options = FromSchema<typeof OptionsSchema>;
export type RemoteOptionConfig = FromSchema<typeof RemoteOptionConfigSchema>;
