import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useConcurrentLoading } from './useConcurrentLoading';

/**
 * 将动作触发的 loading 与后台数据 loading 分离建模，
 * 同时仍然对外暴露统一的组合 loading 状态。
 */
export interface UseDualLoadingReturn {
  actionLoading: boolean;
  actionLoadingText: string | undefined;
  startActionLoading: (text?: string) => boolean;
  stopActionLoading: () => boolean;
  getActionLoading: () => boolean;
  resetActionLoading: () => void;
  dataLoading: boolean;
  setDataLoading: (loading: boolean) => void;
  isLoading: boolean;
  isLoadingRef: RefObject<boolean>;
}

/**
 * 将 `useConcurrentLoading` 与显式的数据 loading 标记组合起来，
 * 让 UI 代码可以区分动作 loading 与后台数据获取。
 */
export const useDualLoading = (): UseDualLoadingReturn => {
  const {
    isLoading: actionLoading,
    loadingText: actionLoadingText,
    startLoading: startActionLoading,
    stopLoading: stopActionLoading,
    getLoading: getActionLoading,
    resetLoading: resetActionLoading,
  } = useConcurrentLoading();

  const [dataLoading, setDataLoading] = useState(false);
  const isLoading = useMemo(() => actionLoading || dataLoading, [actionLoading, dataLoading]);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  return useMemo(() => ({
    actionLoading,
    actionLoadingText,
    startActionLoading,
    stopActionLoading,
    getActionLoading,
    resetActionLoading,
    dataLoading,
    setDataLoading,
    isLoading,
    isLoadingRef,
  }), [
    actionLoading,
    actionLoadingText,
    dataLoading,
    getActionLoading,
    isLoading,
    resetActionLoading,
    startActionLoading,
    stopActionLoading,
  ]);
};
