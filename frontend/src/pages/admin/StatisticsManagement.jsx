import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../../styles/pages/AdminDashboard.css';

const StatisticsManagement = () => {
  const [activeTab, setActiveTab] = useState('bestseller');
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  const tabLabel = activeTab === 'bestseller' ? 'Sản phẩm bán chạy' : activeTab === 'category' ? 'Doanh thu Danh mục' : 'Doanh thu Thương hiệu';

  const handlePrint = async () => {
    if (!printRef.current) return;

    // Convert all SVGs inside the chart to images
    const container = printRef.current;
    const svgElements = container.querySelectorAll('svg.recharts-surface');
    const chartImages = [];

    for (const svg of svgElements) {
      try {
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = svg.clientWidth * 2;
        canvas.height = svg.clientHeight * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0, svg.clientWidth, svg.clientHeight);
        chartImages.push(canvas.toDataURL('image/png'));
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Error converting SVG', e);
      }
    }

    // Build chart images HTML
    const chartImgHtml = chartImages.map(src =>
      `<div style="text-align:center;margin-bottom:16px;"><img src="${src}" style="max-width:100%;height:auto;" /></div>`
    ).join('');

    // Get table HTML only (exclude chart containers)
    const tables = container.querySelectorAll('table');
    const tableHtml = Array.from(tables).map(t => t.outerHTML).join('');

    const win = window.open('', '_blank', 'width=1000,height=800');
    win.document.write(`
      <html>
      <head>
        <title>Báo cáo thống kê - ${tabLabel}</title>
        <style>
          @page { size: landscape; margin: 12mm; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #000; }
          h2 { text-align: center; margin-bottom: 8px; }
          .print-meta { text-align: center; color: #666; font-size: 13px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #333; padding: 8px 10px; font-size: 13px; }
          th { background: #f0f0f0; font-weight: bold; text-align: center; }
          td { text-align: left; }
        </style>
      </head>
      <body>
        <h2>Báo cáo thống kê: ${tabLabel} (Top ${limit})</h2>
        <div class="print-meta">Ngày xuất: ${new Date().toLocaleString('vi-VN')}</div>
        ${chartImgHtml}
        ${tableHtml}
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 600);
  };

  const fetchAdvancedStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/thong-ke/nang-cao', {
        params: { type: activeTab, limit }
      });
      if (res.data && res.data.code === 200) {
        setData(res.data.data.data);
      }
    } catch (err) {
      console.error('Lỗi lấy thống kê!', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvancedStats();
  }, [activeTab, limit]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#84cc16', '#eab308'];

  const formatCurrency = (value) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

  const formatShortCurrency = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(0)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return String(value);
  };

  const CustomXAxisTick = ({ x, y, payload }) => {
    const maxLen = 18;
    const label = payload.value || '';
    const truncated = label.length > maxLen ? label.substring(0, maxLen) + '...' : label;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0} y={0} dy={10}
          textAnchor="end"
          fill="#64748b"
          fontSize={11}
          transform="rotate(-40)"
        >
          {truncated}
        </text>
      </g>
    );
  };

  const renderContent = () => {
    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</div>;
    if (data.length === 0) return <div style={{ padding: '20px', textAlign: 'center' }}>Không có dữ liệu.</div>;

    if (activeTab === 'bestseller') {
      return (
        <div style={{ marginTop: '20px' }}>
          <div style={{ height: 450 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tenSP" tick={<CustomXAxisTick />} interval={0} height={90} />
                <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" tickFormatter={formatShortCurrency} />
                <Tooltip formatter={(val, name) => [name === 'Doanh thu' ? formatCurrency(val) : val, name]} />
                <Bar yAxisId="left" dataKey="soLuongBan" name="Số lượng bán" fill="#8b5cf6" />
                <Bar yAxisId="right" dataKey="doanhThu" name="Doanh thu" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="data-table" style={{ marginTop: '20px' }}>
            <thead>
              <tr>
                <th>Mã SP</th>
                <th>Tên SP</th>
                <th>Số lượng bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.maSP}</td>
                  <td>{item.tenSP}</td>
                  <td>{item.soLuongBan}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(item.doanhThu)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (activeTab === 'category' || activeTab === 'brand') {
      const nameKey = activeTab === 'category' ? 'tenDanhMuc' : 'tenThuongHieu';
      return (
        <div style={{ marginTop: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px', height: 400 }}>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%" cy="50%"
                    innerRadius={80} outerRadius={120}
                    paddingAngle={2}
                    dataKey="doanhThu"
                    nameKey={nameKey}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div style={{ flex: '1 1 400px' }}>
             <table className="data-table">
               <thead>
                 <tr>
                   <th>{activeTab === 'category' ? 'Danh mục' : 'Thương hiệu'}</th>
                   <th>Doanh thu</th>
                 </tr>
               </thead>
               <tbody>
                 {data.map((item, idx) => (
                   <tr key={idx}>
                     <td>{item[nameKey]}</td>
                     <td style={{ fontWeight: 600 }}>{formatCurrency(item.doanhThu)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-header">
        <h1>Thống kê</h1>
        <p>Phân tích dữ liệu bán hàng chi tiết theo nhiều tiêu chí.</p>
      </div>

      <div className="admin-dashboard-body">

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
             className={activeTab === 'bestseller' ? 'btn-primary' : 'btn-secondary'} 
             onClick={() => setActiveTab('bestseller')}>
            Sản phẩm bán chạy
          </button>
          <button 
             className={activeTab === 'category' ? 'btn-primary' : 'btn-secondary'} 
             onClick={() => setActiveTab('category')}>
            Doanh thu Danh mục
          </button>
          <button 
             className={activeTab === 'brand' ? 'btn-primary' : 'btn-secondary'} 
             onClick={() => setActiveTab('brand')}>
            Doanh thu Thương hiệu
          </button>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handlePrint}
            disabled={loading || data.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', background: '#6366f1', color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 600,
              cursor: 'pointer', fontSize: '0.85rem'
            }}
          >Xuất báo cáo</button>
          <label>Hiển thị (Top): </label>
          <select value={limit} onChange={e => setLimit(Number(e.target.value))} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="chart-card" style={{ padding: '20px' }} ref={printRef}>
         {renderContent()}
      </div>
      </div>
    </div>
  );
};

export default StatisticsManagement;
