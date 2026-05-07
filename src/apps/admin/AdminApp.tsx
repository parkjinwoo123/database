import { format } from 'date-fns';
import { LayoutDashboard, Users, Activity, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { LanguageToggle } from '../../components/LanguageToggle';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export const AdminApp = () => {
  const { t } = useTranslation();

  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    completed: 0
  });

  // 🔥 데이터 가져오기
  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/requests");
      const data = await res.json();

      setRequests(data.requests);

      const total = data.requests.length;
      const pending = data.requests.filter((r: any) => r.status === 'pending').length;
      const assigned = data.requests.filter((r: any) => r.status === 'assigned').length;
      const completed = data.requests.filter((r: any) => r.status === 'completed').length;

      setStats({ total, pending, assigned, completed });

    } catch (err) {
      console.error("데이터 가져오기 실패:", err);
    }
  };

  // 🔥 상태 변경 (핵심 추가)
  const handleStatusChange = async (id: number, status: string) => {
    try {
      await fetch(`http://localhost:3000/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      fetchData(); // 바로 갱신
    } catch (err) {
      console.error("상태 변경 실패:", err);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container" style={{ maxWidth: '1400px' }}>
      <div className="page-header">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* 통계 */}
      <div className="grid-cols-4 mb-8">
        <div className="card p-6">총 요청: {stats.total}</div>
        <div className="card p-6">Pending: {stats.pending}</div>
        <div className="card p-6">Assigned: {stats.assigned}</div>
        <div className="card p-6">Completed: {stats.completed}</div>
      </div>

      {/* 테이블 */}
      <table>
        <thead>
          <tr>
            <th>시간</th>
            <th>상품</th>
            <th>상태</th>
            <th>관리</th> {/* 🔥 추가 */}
          </tr>
        </thead>
        <tbody>
          {requests.map((r, i) => (
            <tr key={i}>
              <td>{format(new Date(r.requestTime), 'HH:mm:ss')}</td>
              <td>{r.productName}</td>

              {/* 상태 */}
              <td>
                <span className={`status-badge ${r.status}`}>
                  {r.status}
                </span>
              </td>

              {/* 🔥 버튼 추가 */}
              <td style={{ display: 'flex', gap: '6px' }}>
                {r.status === 'pending' && (
                  <button
                    style={{ background: '#22c55e', color: 'white', padding: '4px 8px', borderRadius: '6px' }}
                    onClick={() => handleStatusChange(r.requestId, 'completed')}
                  >
                    완료
                  </button>
                )}

                {r.status === 'completed' && (
                  <button
                    style={{ background: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '6px' }}
                    onClick={() => handleStatusChange(r.requestId, 'pending')}
                  >
                    되돌리기
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};