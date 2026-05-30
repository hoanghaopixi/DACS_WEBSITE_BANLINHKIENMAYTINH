import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaPen, FaImage, FaUpload, FaAlignLeft, FaArrowUp, FaArrowDown, FaBold, FaItalic, FaUnderline, FaLink } from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/pages/CommonAdmin.css';

// --- Custom Rich Text Editor Native ---
const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  // Sync value from props only on mount or when external change occurs
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (cmd, arg = null) => {
    document.execCommand(cmd, false, arg);
    editorRef.current.focus();
    if (onChange) onChange(editorRef.current.innerHTML);
  };

  const handleLink = () => {
    const url = prompt('Nhập đường dẫn (URL):', 'https://');
    if (url) exec('createLink', url);
  };

  return (
    <div style={{ border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '6px', background: 'var(--bg-card, #fff)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '8px', padding: '8px', borderBottom: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-card-hover, #f8fafc)', borderRadius: '6px 6px 0 0' }}>
        <button type="button" onClick={() => exec('bold')} style={{ padding: '6px 10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-primary, #333)' }} title="In đậm"><FaBold /></button>
        <button type="button" onClick={() => exec('italic')} style={{ padding: '6px 10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '4px', cursor: 'pointer', fontStyle: 'italic', color: 'var(--text-primary, #333)' }} title="In nghiêng"><FaItalic /></button>
        <button type="button" onClick={() => exec('underline')} style={{ padding: '6px 10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '4px', cursor: 'pointer', textDecoration: 'underline', color: 'var(--text-primary, #333)' }} title="Gạch chân"><FaUnderline /></button>
        <div style={{ width: 1, background: 'var(--border-color, #cbd5e1)', margin: '0 4px' }}></div>
        <button type="button" onClick={handleLink} style={{ padding: '6px 10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary, #333)' }} title="Chèn link"><FaLink /></button>
        <button type="button" onClick={() => exec('fontSize', '5')} style={{ padding: '6px 10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary, #333)' }} title="Chữ To">T</button>
        <button type="button" onClick={() => exec('fontSize', '3')} style={{ padding: '6px 10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary, #333)' }} title="Chữ Thường">t</button>
      </div>
      <div 
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        style={{ minHeight: '160px', padding: '12px', outline: 'none', lineHeight: '1.6', color: 'var(--text-primary, #333)' }}
        placeholder="Viết nội dung vào đây..."
      />
    </div>
  );
};
// ----------------------------------------

const emptyForm = {
  tieuDe: '',
  nguoiViet: '',
  noiDung: '',
  hinhAnh: ''
};

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  
  // Mảng linh động (Block Builder)
  const [blocks, setBlocks] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('bai-viet');
      if (res.data?.code === 200) setPosts(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    let list = posts;
    if (searchTerm.trim()) {
      const t = searchTerm.trim().toLowerCase();
      list = list.filter(p => p.tieuDe?.toLowerCase().includes(t) || p.nguoiViet?.toLowerCase().includes(t));
    }
    return list;
  }, [posts, searchTerm]);

  const parseBlocks = (content) => {
    if (!content) return [{ id: Date.now(), type: 'text', content: '' }];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map(b => ({ ...b, id: b.id || Math.random() }));
      }
    } catch (e) {
      // Content cũ là text/html thuần
    }
    return [{ id: Date.now(), type: 'text', content: content }];
  };

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyForm);
    setThumbnailFile(null);
    setThumbnailPreview('');
    setBlocks([{ id: Date.now(), type: 'text', content: '' }]);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    const combinedNoiDung = p.chiTietBaiViet?.noiDung || p.noiDung || '';
    setFormData({
      tieuDe: p.tieuDe || '',
      nguoiViet: p.nguoiViet || '',
      noiDung: combinedNoiDung,
      hinhAnh: p.chiTietBaiViet?.hinhAnh || ''
    });
    setThumbnailFile(null);
    setThumbnailPreview(p.chiTietBaiViet?.hinhAnh || '');
    setBlocks(parseBlocks(combinedNoiDung));
    setShowForm(true);
  };

  const uploadImage = async (file) => {
    const fData = new FormData();
    fData.append('file', file);
    const res = await api.post('upload/post-image', fData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);

      // Upload Thumbnail
      let finalThumbUrl = formData.hinhAnh;
      if (thumbnailFile) {
         finalThumbUrl = await uploadImage(thumbnailFile);
      }

      // Upload Images in Blocks
      const finalizedBlocks = await Promise.all(
        blocks.map(async (b) => {
          if (b.type === 'image' && b.file) {
            const uploadedUrl = await uploadImage(b.file);
            return { type: 'image', url: uploadedUrl, title: b.title };
          }
          if (b.type === 'image') return { type: 'image', url: b.url, title: b.title };
          return { type: 'text', content: b.content };
        })
      );

      const finalData = {
        ...formData,
        hinhAnh: finalThumbUrl,
        noiDung: JSON.stringify(finalizedBlocks) // Lưu chuỗi JSON
      };

      if (editing) {
        await api.put(`bai-viet/${editing.maBaiViet}`, finalData);
      } else {
        await api.post('bai-viet', finalData);
      }
      setShowForm(false);
      fetchPosts();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xóa bài viết "${title}"?`)) return;
    try {
      await api.delete(`bai-viet/${id}`);
      fetchPosts();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    }
  };

  const formatDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // --- HTML Builder Functions ---
  const addBlock = (type) => {
    setBlocks([...blocks, { id: Date.now(), type, content: '', title: '', url: '', file: null }]);
  };

  const updateBlock = (id, field, value) => {
    setBlocks(prevBlocks => prevBlocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index, direction) => {
    const newBlocks = [...blocks];
    if (direction === 'up' && index > 0) {
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    } else if (direction === 'down' && index < newBlocks.length - 1) {
      [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
    }
    setBlocks(newBlocks);
  };

  const handleThumbSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
      setThumbnailPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleImageBlockSelect = (id, file) => {
    if (file) {
      updateBlock(id, 'file', file);
      updateBlock(id, 'url', URL.createObjectURL(file)); // preview
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý bài viết</h1>
        <button className="btn-primary" onClick={openAdd}>
          <FaPlus /> Viết bài mới
        </button>
      </div>

      <div className="admin-page-body">

      <div className="admin-card">
        <div className="table-actions" style={{ marginBottom: '24px' }}>
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm tên tác giả, tiêu đề..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 100 }}>Mã bài</th>
                <th style={{ width: 120 }}>Thumbnail</th>
                <th>Tiêu đề</th>
                <th>Tác giả</th>
                <th>Ngày đăng</th>
                <th style={{ width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : filteredPosts.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Chưa có bài viết nào</td></tr>
              ) : filteredPosts.map(p => (
                <tr key={p.maBaiViet}>
                  <td>#{p.maBaiViet}</td>
                  <td>
                    {p.chiTietBaiViet?.hinhAnh ? (
                      <img src={p.chiTietBaiViet.hinhAnh} alt="thumb" style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                    ) : '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.tieuDe}</td>
                  <td>{p.nguoiViet}</td>
                  <td>{formatDate(p.ngayDang)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-edit" title="Sửa" onClick={() => openEdit(p)}><FaEdit /></button>
                      <button className="btn-icon btn-delete" title="Xóa" onClick={() => handleDelete(p.maBaiViet, p.tieuDe)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card, #fff)', borderRadius: '16px', width: '100%', maxWidth: '850px',
              height: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 28px', borderBottom: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-card-hover, #f8fafc)', borderRadius: '16px 16px 0 0'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary, #0f172a)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <FaPen color="#3b82f6" /> {editing ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #64748b)', fontSize: '1.2rem'
                }}
              ><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Tiêu đề bài viết *</label>
                    <input className="form-input" required value={formData.tieuDe}
                      placeholder="Bài viết hay về linh kiện PC..."
                      onChange={e => setFormData(p => ({ ...p, tieuDe: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tác giả</label>
                    <input className="form-input" value={formData.nguoiViet}
                      placeholder="Nguyễn Hoàng Hảo..."
                      onChange={e => setFormData(p => ({ ...p, nguoiViet: e.target.value }))} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ảnh đại diện (Thumbnail)</label>
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    border: '2px dashed #cbd5e1', borderRadius: '8px', height: '140px', cursor: 'pointer',
                    background: thumbnailPreview ? 'transparent' : 'var(--bg-card-hover, #f8fafc)', position: 'relative', overflow: 'hidden'
                  }}>
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <FaUpload size={24} color="#94a3b8" style={{ marginBottom: 10 }} />
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Chọn tải ảnh lên</span>
                      </>
                    )}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleThumbSelect} />
                  </label>
                </div>
              </div>

              <div style={{ borderTop: '2px solid var(--border-color, #e2e8f0)', paddingTop: '20px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1.1rem', marginBottom: '16px' }}>
                  Xây dựng Nội dung (Block Builder)
                </label>
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <button type="button" onClick={() => addBlock('text')} className="btn-add-text-block"><FaAlignLeft /> Thêm đoạn văn bản</button>
                  <button type="button" onClick={() => addBlock('image')} className="btn-add-image-block"><FaImage /> Thêm hình ảnh mới</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {blocks.map((block, index) => (
                    <div key={block.id} style={{ 
                      border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', background: 'var(--bg-card, #fff)', 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)', padding: '16px', position: 'relative' 
                    }}>
                      {/* Block Controls */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dashed var(--border-color, #e2e8f0)', paddingBottom: '12px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary, #475569)', fontSize: '0.95rem' }}>
                          Khối {index + 1}: {block.type === 'text' ? 'Văn bản (Rich Text)' : 'Hình ảnh'}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" title="Lên" onClick={() => moveBlock(index, 'up')} disabled={index === 0} style={{ padding: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', background: 'none', border: 'none', color: 'var(--text-muted, #64748b)' }}><FaArrowUp /></button>
                          <button type="button" title="Xuống" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} style={{ padding: '4px', cursor: index === blocks.length - 1 ? 'not-allowed' : 'pointer', background: 'none', border: 'none', color: 'var(--text-muted, #64748b)' }}><FaArrowDown /></button>
                          <button type="button" title="Xóa khối" onClick={() => removeBlock(block.id)} style={{ padding: '4px', cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444', marginLeft: 8 }}><FaTrash /></button>
                        </div>
                      </div>

                      {/* Block Content */}
                      {block.type === 'text' && (
                        <div style={{ marginBottom: '8px' }}>
                          <RichTextEditor 
                            value={block.content} 
                            onChange={(val) => updateBlock(block.id, 'content', val)}
                          />
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 300px) 1fr', gap: '20px', alignItems: 'start' }}>
                          {/* Khu vực chọn ảnh */}
                          <label style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            border: '2px dashed #cbd5e1', borderRadius: '8px', height: '160px', cursor: 'pointer',
                            background: block.url ? 'transparent' : 'var(--bg-card-hover, #f8fafc)', position: 'relative', overflow: 'hidden'
                          }}>
                            {block.url ? (
                              <img src={block.url} alt="block" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <>
                                <FaUpload size={24} color="#94a3b8" style={{ marginBottom: 10 }} />
                                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Chọn ảnh</span>
                              </>
                            )}
                            <input type="file" accept="image/*" style={{ display: 'none' }} 
                              onChange={(e) => handleImageBlockSelect(block.id, e.target.files[0])} />
                          </label>

                          {/* Khu vực điền tiêu đề ảnh */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="form-label" style={{ fontSize: '0.95rem' }}>Tiêu đề / Caption ảnh (Tùy chọn)</label>
                            <input className="form-input" placeholder="Ví dụ: Hình ảnh minh họa PC..." 
                              value={block.title || ''}
                              onChange={e => updateBlock(block.id, 'title', e.target.value)}
                            />
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', marginTop: '10px' }}>
                              Tiêu đề này sẽ được gắn phía dưới hình ảnh khi hiển thị cho người đọc. Ảnh sẽ được tự động Upload vào kho lưu trữ nội bộ.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {blocks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card-hover, #f8fafc)', borderRadius: '8px', border: '1px dashed var(--border-color, #cbd5e1)', color: 'var(--text-muted, #94a3b8)' }}>
                      Bài viết chưa có nội dung nào. Hãy thêm Đoạn văn bản hoặc Hình ảnh!
                    </div>
                  )}
                </div>
              </div>

              <div className="post-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Đóng</button>
                <button type="submit" className="btn-primary" disabled={formLoading} style={{ minWidth: '140px' }}>
                  {formLoading ? 'Đang lưu & Upload...' : (editing ? 'Lưu cập nhật' : 'Đăng bài viết')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
          </div>
</div>
  );
};

export default PostManagement;
