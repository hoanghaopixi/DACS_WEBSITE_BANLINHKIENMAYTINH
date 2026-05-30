import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaPlus, FaEye, FaTimes, FaBoxOpen, FaClipboardList, FaMoneyBillWave, FaTrash } from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/pages/CommonAdmin.css';

const InventoryManagement = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showDetail, setShowDetail] = useState(null); // hold the phieuNhap object
  const [detailItems, setDetailItems] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add Mode payload
  const [showAddForm, setShowAddForm] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [addPayload, setAddPayload] = useState({ maNCC: '', items: [] });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [addQty, setAddQty] = useState(1);
  const [addPrice, setAddPrice] = useState(0);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchInventories();
    fetchExtras();
  }, []);

  const fetchInventories = async () => {
    try {
      setLoading(true);
      const res = await api.get('phieu-nhap');
      if (res.data?.code === 200) setInventories(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchExtras = async () => {
    try {
      const [resNcc, resSp] = await Promise.all([
        api.get('nha-cung-cap'),
        api.get('san-pham')
      ]);
      if (resNcc.data?.code === 200) setSuppliers(resNcc.data.data || []);
      if (resSp.data?.code === 200) setProducts(resSp.data.data || []);
    } catch (e) {
      console.error('Lỗi tải danh sách NCC/SP', e);
    }
  };

  const filteredInventories = useMemo(() => {
    let list = inventories;
    if (searchTerm.trim()) {
      const t = searchTerm.trim().toLowerCase();
      list = list.filter(p => 
        String(p.maPhieuNhap).includes(t) || 
        p.nhaCungCap?.tenNCC?.toLowerCase().includes(t)
      );
    }
    return list;
  }, [inventories, searchTerm]);

  const handleViewDetail = async (p) => {
    setShowDetail(p);
    setDetailLoading(true);
    setDetailItems([]);
    try {
      const res = await api.get(`phieu-nhap/${p.maPhieuNhap}/chi-tiet`);
      if (res.data?.code === 200) {
        setDetailItems(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setShowDetail(null);
    setDetailItems([]);
  };

  const openAdd = () => {
    setAddPayload({ maNCC: '', items: [] });
    setSelectedProduct('');
    setAddQty(1);
    setAddPrice(0);
    setShowAddForm(true);
  };

  const handleAddItemToForm = () => {
    if (!selectedProduct || addQty <= 0 || addPrice < 0) {
      alert('Vui lòng điền đúng thông tin sản phẩm nhập.');
      return;
    }
    const sp = products.find(p => String(p.maSP) === String(selectedProduct));
    if (!sp) return;

    // Check duplicate map
    const existing = addPayload.items.find(i => String(i.maSP) === String(selectedProduct));
    if (existing) {
      alert('Sản phẩm này đã được thêm vào danh sách, vui lòng xóa đi thêm lại nếu muốn sửa.');
      return;
    }

    setAddPayload(prev => ({
      ...prev,
      items: [...prev.items, {
        maSP: sp.maSP,
        tenSP: sp.tenSP,
        soLuong: Number(addQty),
        donGia: Number(addPrice),
        thanhTien: Number(addQty) * Number(addPrice)
      }]
    }));

    setSelectedProduct('');
    setAddQty(1);
    setAddPrice(0);
  };

  const handleRemoveItemForm = (maSP) => {
    setAddPayload(prev => ({
      ...prev,
      items: prev.items.filter(i => i.maSP !== maSP)
    }));
  };

  const submitAddForm = async () => {
    if (!addPayload.maNCC) {
      alert('Vui lòng chọn Nhà cung cấp.');
      return;
    }
    if (addPayload.items.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm vào phiếu nhập.');
      return;
    }

    const tongTien = addPayload.items.reduce((sum, item) => sum + item.thanhTien, 0);

    const data = {
      maNCC: addPayload.maNCC,
      tongTien: tongTien,
      items: addPayload.items.map(i => ({
        maSP: i.maSP,
        soLuong: i.soLuong,
        donGia: i.donGia
      }))
    };

    try {
      setAddLoading(true);
      await api.post('phieu-nhap', data);
      alert('Tạo phiếu nhập thành công! Số lượng sản phẩm và giá nhập đã được cập nhật.');
      setShowAddForm(false);
      fetchInventories();
      fetchExtras(); // Refresh products
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    } finally {
      setAddLoading(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  return (
    <div className="admin-page">
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý phiếu nhập hàng</h1>
        <button className="btn-primary" onClick={openAdd}>
          <FaPlus /> Tạo phiếu nhập mới
        </button>
      </div>

      <div className="admin-page-body">

      <div className="admin-card">
        <div className="table-actions" style={{ marginBottom: '24px' }}>
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo mã PN, tên NCC..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 100 }}>Mã PN</th>
                <th>Nhà cung cấp</th>
                <th>Ngày nhập</th>
                <th>Tổng tiền</th>
                <th style={{ width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : filteredInventories.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu</td></tr>
              ) : filteredInventories.map(p => (
                <tr key={p.maPhieuNhap}>
                  <td style={{ fontWeight: 600 }}>#{p.maPhieuNhap}</td>
                  <td>{p.nhaCungCap?.tenNCC || '—'}</td>
                  <td>{formatDate(p.ngayNhap)}</td>
                  <td style={{ fontWeight: 600, color: '#dc2626' }}>{formatMoney(p.tongTien)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon" title="Xem chi tiết" onClick={() => handleViewDetail(p)}>
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {showDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Chi tiết Phiếu Nhập #{showDetail.maPhieuNhap}</h2>
              <button onClick={closeDetail} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#64748b' }}><FaTimes /></button>
            </div>
            
            <div style={{ padding: 24, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}><FaBoxOpen style={{marginRight:6}}/>Nhà cung cấp</div>
                  <div style={{ fontWeight: 600 }}>{showDetail.nhaCungCap?.tenNCC}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}><FaMoneyBillWave style={{marginRight:6}}/>Tổng tiền</div>
                  <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '1.1rem' }}>{formatMoney(showDetail.tongTien)}</div>
                </div>
              </div>

              <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><FaClipboardList /> Danh sách sản phẩm nhập</h4>
              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: 20 }}>Đang tải chi tiết...</div>
              ) : (
                <table className="admin-table" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th style={{ textAlign: 'center' }}>Số lượng</th>
                      <th style={{ textAlign: 'right' }}>Giá nhập</th>
                      <th style={{ textAlign: 'right' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailItems.map(item => (
                      <tr key={item.sanPham?.maSP}>
                        <td style={{ fontWeight: 500 }}>{item.sanPham?.tenSP}</td>
                        <td style={{ textAlign: 'center' }}>{item.soLuong}</td>
                        <td style={{ textAlign: 'right' }}>{formatMoney(item.donGia)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatMoney(item.thanhTien)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Tạo phiếu nhập mới</h2>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#64748b' }}><FaTimes /></button>
            </div>
            
            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              <div className="form-group">
                <label className="form-label">Chọn Nhà Cung Cấp *</label>
                <select className="form-select" value={addPayload.maNCC} onChange={e => setAddPayload(p => ({ ...p, maNCC: e.target.value }))}>
                  <option value="">-- Chọn Nhà Cung Cấp --</option>
                  {suppliers.map(s => <option key={s.maNCC} value={s.maNCC}>{s.tenNCC}</option>)}
                </select>
              </div>

              <div style={{ padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20, background: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem' }}>Thêm sản phẩm vào phiếu</h4>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: 4 }}>Sản phẩm</label>
                    <select className="form-select" value={selectedProduct} onChange={e => {
                      setSelectedProduct(e.target.value);
                      const sp = products.find(p => String(p.maSP) === e.target.value);
                      // Suggest old buy price if exists, or 0
                      if (sp) setAddPrice(sp.giaNhap || 0);
                    }}>
                      <option value="">-- Chọn sản phẩm --</option>
                      {products.map(p => <option key={p.maSP} value={p.maSP}>{p.tenSP}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: 4 }}>Số lượng</label>
                    <input type="number" min="1" className="form-input" value={addQty} onChange={e => setAddQty(e.target.value)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: 4 }}>Giá nhập (VND)</label>
                    <input type="number" min="0" className="form-input" value={addPrice} onChange={e => setAddPrice(e.target.value)} />
                  </div>
                  <button className="btn-primary" type="button" onClick={handleAddItemToForm} style={{ padding: '9px 16px', height: 42 }}>
                    Thêm
                  </button>
                </div>
              </div>

              {addPayload.items.length > 0 && (
                <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th style={{ textAlign: 'center' }}>SL</th>
                      <th style={{ textAlign: 'right' }}>Giá nhập</th>
                      <th style={{ textAlign: 'right' }}>Thành tiền</th>
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {addPayload.items.map(i => (
                      <tr key={i.maSP}>
                        <td style={{ fontWeight: 500 }}>{i.tenSP}</td>
                        <td style={{ textAlign: 'center' }}>{i.soLuong}</td>
                        <td style={{ textAlign: 'right' }}>{formatMoney(i.donGia)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatMoney(i.thanhTien)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="btn-icon btn-delete" onClick={() => handleRemoveItemForm(i.maSP)}><FaTrash size={12}/></button>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: '#fef2f2' }}>
                      <td colSpan="3" style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>TỔNG CỘNG:</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626', fontSize: '1rem' }}>
                        {formatMoney(addPayload.items.reduce((s, i) => s + i.thanhTien, 0))}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setShowAddForm(false)}>Hủy</button>
              <button className="btn-primary" disabled={addLoading} onClick={submitAddForm}>
                {addLoading ? 'Đang tạo...' : 'Xác nhận tạo Phiếu Nhập'}
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
</div>
  );
};

export default InventoryManagement;
