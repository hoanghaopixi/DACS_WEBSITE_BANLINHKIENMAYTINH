import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { FaShoppingCart, FaUsers, FaBox, FaDollarSign } from 'react-icons/fa';
import dashboardService from '../services/dashboardService';
import orderService from '../services/orderService';
import '../styles/pages/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const statsPayload = await dashboardService.getStats();
      const ordersPayload = await orderService.getAllOrders();

      if (statsPayload.code === 200) setStats(statsPayload.data);
      if (ordersPayload.code === 200) setRecentOrders(ordersPayload.data.slice(0, 5));
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
      setError('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

  if (loading) {
    return <div className="admin-dashboard-page" style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu thực tế...</div>;
  }

  if (error) {
    return (
      <div className="admin-dashboard-page" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
        <button className="btn-primary" onClick={fetchData}>Thử lại</button>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Tổng doanh thu', value: formatCurrency(stats.totalRevenue), icon: <FaDollarSign />, color: '#6366f1', bg: '#e0e7ff', trend: '+12.5%' },
    { label: 'Tổng đơn hàng', value: stats.totalOrders, icon: <FaShoppingCart />, color: '#8b5cf6', bg: '#ede9fe', trend: '+5.4%' },
    { label: 'Tổng khách hàng', value: stats.totalCustomers, icon: <FaUsers />, color: '#ec4899', bg: '#fce7f3', trend: '+8.2%' },
    { label: 'Tổng sản phẩm', value: stats.totalProducts, icon: <FaBox />, color: '#f59e0b', bg: '#fef3c7', trend: '-2.1%' },
  ];

  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-header">
        <h1>Tổng quan</h1>
        <p>Chào mừng bạn trở lại! Đây là tóm tắt hoạt động kinh doanh gần đây.</p>
      </div>

      <div className="admin-dashboard-body">

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{card.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="stat-value">{card.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Doanh thu 7 ngày qua</h3>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            {stats.salesTrend.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={stats.salesTrend}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                Chưa có doanh thu trong 7 ngày qua.
              </div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Doanh thu theo danh mục</h3>
          </div>
          {stats.categoryStats.length > 0 ? (
            <>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={stats.categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', maxHeight: '160px', overflowY: 'auto' }}>
                {stats.categoryStats.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }} />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, color: '#94a3b8' }}>
              Chưa có dữ liệu doanh thu theo danh mục.
            </div>
          )}
        </div>
      </div>


      <div className="recent-orders-card">
        <div className="table-header">
          <h3>Đơn hàng mới nhất gần đây</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Chưa có đơn hàng nào.</td></tr>
              ) : recentOrders.map((order) => (
                <tr key={order.maDonHang}>
                  <td>#{order.maDonHang}</td>
                  <td>{order.tenNguoiNhan}</td>
                  <td>{new Date(order.ngayDat).toLocaleDateString('vi-VN')}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(order.tongTien)}</td>
                  <td>
                    <span className={`status-badge ${order.trangThai === 'Hoàn thành' ? 'completed' : order.trangThai === 'Đã hủy' ? 'cancelled' : order.trangThai === 'Đang giao' ? 'shipping' : 'pending'}`}>
                      {order.trangThai}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
