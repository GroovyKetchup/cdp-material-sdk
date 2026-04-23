export const COMPONENT_CATEGORY = {
  GENERAL: 'General',
  FLOAT: 'Float',
  LAYOUT: 'Layout',
  DATA_ENTRY: 'DataEntry',
  DATA_DISPLAY: 'DataDisplay',
  CHART: 'Chart',
  BUSINESS: 'Business',
  SHELL: 'Shell',
  PAGE: 'Page',
  DEV: 'Dev',
  HTML_TEMPLATE: 'HtmlTemplate',
} as const;

export type ComponentCategory = typeof COMPONENT_CATEGORY[keyof typeof COMPONENT_CATEGORY];

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  [COMPONENT_CATEGORY.GENERAL]: '通用',
  [COMPONENT_CATEGORY.FLOAT]: '悬浮',
  [COMPONENT_CATEGORY.LAYOUT]: '布局',
  [COMPONENT_CATEGORY.DATA_ENTRY]: '录入',
  [COMPONENT_CATEGORY.DATA_DISPLAY]: '数据展示',
  [COMPONENT_CATEGORY.CHART]: '图表',
  [COMPONENT_CATEGORY.BUSINESS]: '业务组件',
  [COMPONENT_CATEGORY.SHELL]: '外壳',
  [COMPONENT_CATEGORY.PAGE]: '页面',
  [COMPONENT_CATEGORY.DEV]: '调试',
  [COMPONENT_CATEGORY.HTML_TEMPLATE]: 'HTML 模板',
};
