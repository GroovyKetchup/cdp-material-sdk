export const NOTIFY_TIMING = {
  BEFORE: 'before',
  AFTER: 'after',
  BOTH: 'both',
} as const;

export const NOTIFY_ERROR_STRATEGY = {
  IGNORE: 'ignore',
  STOP: 'stop',
} as const;

export const ENGINE_EVENT_TYPE = {
  MOUNT: 'mount',
  UNMOUNT: 'unmount',
  CLICK: 'click',
  FOCUS: 'focus',
  BLUR: 'blur',
  VALUE_CHANGE: 'valueChange',
  ITEM_CLICK: 'itemClick',
  ITEM_DOUBLE_CLICK: 'itemDoubleClick',
  ITEM_RIGHT_CLICK: 'itemRightClick',
  ITEM_LONG_PRESS: 'itemLongPress',
  DATA_FETCH: 'dataFetch',
} as const;
