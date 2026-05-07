// ============================================================
// KEEP — useRequests Hook (API 연동 버전)
// ============================================================

import { useCallback, useState } from 'react';
import { useFittingStore } from '../store/useFittingStore';
import { requestService } from '../services';
import type {
  FittingStatus,
  CreateFittingRequestBody,
  CreateSingleRequestBody,
} from '../types/request';

export const useRequests = () => {
  const requests = useFittingStore(state => state.requests);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ 핵심 추가 (GET)
  const getRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestService.getRequests();

      // 👉 store에 넣어줘야 Admin에서 보임
      useFittingStore.getState().setRequests(res.requests);

      console.log("[useRequests] DB 데이터 불러옴:", res.requests);
      return res.requests;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'getRequests 실패';
      setError(message);
      console.error('[useRequests] getRequests 에러:', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 기존 createRequest
  const createRequest = useCallback(
    async (body: CreateSingleRequestBody) => {
      setLoading(true);
      setError(null);
      try {
        return await requestService.createRequest(body);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'createRequest 실패';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 기존 createRequests
  const createRequests = useCallback(
    async (body: CreateFittingRequestBody) => {
      if (body.products.length === 0) return [];

      setLoading(true);
      setError(null);

      try {
        const results = await Promise.all(
          body.products.map((product) => {
            const singleBody: CreateSingleRequestBody = {
              productId: product.productId,
              productName: product.productName,
              color: product.color,
              size: product.size,
              fittingRoomId: body.fittingRoomId,
              status: body.status,
              sessionId: body.sessionId,
            };

            return requestService.createRequest(singleBody);
          })
        );

        return results;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'createRequests 실패';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // PATCH
  const updateStatus = useCallback(
    async (requestId: string, status: FittingStatus) => {
      setLoading(true);
      setError(null);
      try {
        return await requestService.updateStatus(requestId, status);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'updateStatus 실패';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    requests,
    loading,
    error,
    getRequests,   // ✅ 이거 추가됨
    createRequest,
    createRequests,
    updateStatus,
  };
};

// 관리자 통계
export const useAdminStats = () => {
  const requests = useFittingStore(state => state.requests);

  return {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    assigned: requests.filter(r => r.status === 'assigned').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };
};