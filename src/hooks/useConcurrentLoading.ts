import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * 面向重叠异步操作的引用计数式 loading 控制器。
 */
export interface useConcurrentLoadingReturn {
  isLoading: boolean;
  loadingText: string | undefined;
  startLoading: (text?: string) => boolean;
  stopLoading: () => boolean;
  getLoading: () => boolean;
  resetLoading: () => void;
}

/**
 * 在多次并发 `startLoading` / `stopLoading` 调用之间维护 loading 状态，
 * 并为当前活跃任务暴露共享的 loading 文案。
 */
export const useConcurrentLoading = (): useConcurrentLoadingReturn => {
  const [loadingCount, setLoadingCount] = useState(0);
  const [loadingText, setLoadingText] = useState<string | undefined>(undefined);
  const countRef = useRef(0);

  useEffect(() => {
    countRef.current = loadingCount;
  }, [loadingCount]);

  const getLoading = useCallback(() => countRef.current > 0, []);

  const startLoading = useCallback((text?: string) => {
    setLoadingCount((prev) => prev + 1);
    if (text) {
      setLoadingText(text);
    }
    return getLoading();
  }, [getLoading]);

  const stopLoading = useCallback(() => {
    setLoadingCount((prev) => {
      const nextCount = Math.max(0, prev - 1);
      if (nextCount === 0) {
        setLoadingText(undefined);
      }
      return nextCount;
    });
    return getLoading();
  }, [getLoading]);

  const resetLoading = useCallback(() => {
    setLoadingCount(0);
    setLoadingText(undefined);
  }, []);

  return useMemo(() => ({
    isLoading: loadingCount > 0,
    loadingText,
    startLoading,
    stopLoading,
    getLoading,
    resetLoading,
  }), [getLoading, loadingCount, loadingText, resetLoading, startLoading, stopLoading]);
};
