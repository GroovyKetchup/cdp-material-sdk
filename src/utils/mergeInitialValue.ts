/**
 * mergeComponentInitialValue — 组件初始值合并工具
 *
 * 从宿主 pageStore 移植的完整合并语义，确保 SDK 中 useDataContainer 的
 * runtime fallback 与宿主 initComponentData 保持一致。
 *
 * 维护要求：任何初始值合并规则的调整都应同步到此处，
 * 避免 SDK 侧 getContainerData()/containerData 与宿主 initComponentData 的语义漂移。
 */

import { cloneDeep, has as lodashHas, set as lodashSet } from 'lodash-es';

const VALUE_KEY = 'value' as const;

const isMergeableComponentValueObject = (
  value: unknown,
): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

const isMergeableComponentValueObjectArray = (
  value: unknown,
): value is Array<Record<string, unknown> | undefined> => Array.isArray(value)
  && value.every(item => item === undefined || isMergeableComponentValueObject(item));

const fillMissingComponentValuePaths = (
  target: { value: unknown },
  source: unknown,
  path: Array<string | number> = [VALUE_KEY],
) => {
  if (!lodashHas(target, path)) {
    lodashSet(target, path, cloneDeep(source));
    return;
  }

  if (isMergeableComponentValueObjectArray(source)) {
    source.forEach((value, index) => {
      fillMissingComponentValuePaths(target, value, [...path, index]);
    });
    return;
  }

  if (!isMergeableComponentValueObject(source)) {
    return;
  }

  for (const [key, value] of Object.entries(source)) {
    fillMissingComponentValuePaths(
      target,
      value,
      [...path, key],
    );
  }
};

export const mergeComponentInitialValue = (existingValue: unknown, initialValue: unknown) => {
  if (initialValue === undefined) {
    return existingValue;
  }

  if (existingValue === undefined) {
    return cloneDeep(initialValue);
  }

  const initialValueIsArray = isMergeableComponentValueObjectArray(initialValue);
  const existingValueIsArray = isMergeableComponentValueObjectArray(existingValue);
  const initialValueIsAnyArray = Array.isArray(initialValue);
  const existingValueIsAnyArray = Array.isArray(existingValue);
  const initialValueIsObject = isMergeableComponentValueObject(initialValue);
  const existingValueIsObject = isMergeableComponentValueObject(existingValue);

  if (initialValueIsAnyArray !== existingValueIsAnyArray || initialValueIsObject !== existingValueIsObject) {
    return cloneDeep(initialValue);
  }

  if (initialValueIsAnyArray || existingValueIsAnyArray) {
    if (!initialValueIsArray || !existingValueIsArray) {
      return cloneDeep(initialValue);
    }
  }

  if (initialValueIsArray !== existingValueIsArray || initialValueIsObject !== existingValueIsObject) {
    return cloneDeep(initialValue);
  }

  if (!initialValueIsArray && !initialValueIsObject) {
    return cloneDeep(initialValue);
  }

  const draft = { value: cloneDeep(initialValue) };
  fillMissingComponentValuePaths(draft, existingValue);
  return draft.value;
};
