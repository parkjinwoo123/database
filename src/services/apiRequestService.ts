import type { IRequestService } from './requestService';
import type {
  FittingRequest,
  FittingStatus,
  CreateSingleRequestBody,
  GetRequestsResponse,
  AdminStats,
} from '../types/request';

const BASE_URL = 'http://localhost:3000';

// 백엔드 응답 구조
interface ApiRequestItem {
  request_id: string;
  product_id: string;
  product_name: string;
  color: string;
  size: string;
  fitting_room_id: string;
  status: FittingStatus;
  request_time: string;
  session_id: string;
}

interface ApiCreateRequestBody {
  product_id: string;
  product_name: string;
  color: string;
  size: string;
  fitting_room_id: string;
  status: FittingStatus;
  session_id: string;
}

// 응답 → 프론트 변환
function mapApiResponseToRequest(item: ApiRequestItem): FittingRequest {
  return {
    requestId: item.request_id,
    productId: item.product_id,
    productName: item.product_name,
    color: item.color,
    size: item.size,
    fittingRoomId: item.fitting_room_id,
    status: item.status,
    requestTime: new Date(item.request_time).getTime(),
    sessionId: item.session_id,
  };
}

// 프론트 → API 요청 바디 변환
function mapRequestToApiBody(body: CreateSingleRequestBody): ApiCreateRequestBody {
  return {
    product_id: body.productId,
    product_name: body.productName,
    color: body.color,
    size: body.size,
    fitting_room_id: body.fittingRoomId,
    status: body.status,
    session_id: body.sessionId,
  };
}

export const apiRequestService: IRequestService = {
  async createRequest(body: CreateSingleRequestBody): Promise<FittingRequest> {
    console.log('[API] createRequest payload:', body);

    const response = await fetch(`${BASE_URL}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapRequestToApiBody(body)),
    });

    if (!response.ok) {
      throw new Error(`createRequest failed: ${response.status}`);
    }

    const apiData: ApiRequestItem = await response.json();
    return mapApiResponseToRequest(apiData);
  },

  async getRequests(): Promise<GetRequestsResponse> {
    const response = await fetch(`${BASE_URL}/api/requests`);

    if (!response.ok) {
      throw new Error(`getRequests failed: ${response.status}`);
    }

    const apiData: { requests: ApiRequestItem[] } = await response.json();

    return {
      requests: apiData.requests.map(mapApiResponseToRequest),
    };
  },

  async updateStatus(
    requestId: string,
    status: FittingStatus
  ): Promise<FittingRequest> {
    const response = await fetch(
      `${BASE_URL}/api/requests/${requestId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error(`updateStatus failed: ${response.status}`);
    }

    const apiData: ApiRequestItem = await response.json();
    return mapApiResponseToRequest(apiData);
  },

  async getAdminStats(): Promise<AdminStats> {
    const response = await fetch(`${BASE_URL}/admin/stats`);

    if (!response.ok) {
      throw new Error(`getAdminStats failed: ${response.status}`);
    }

    return response.json();
  },
};