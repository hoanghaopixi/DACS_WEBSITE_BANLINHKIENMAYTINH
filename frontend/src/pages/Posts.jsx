import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/pages/Products.css'; // Mượn tạm CSS của lưới sản phẩm nếu cần, hoặc tự code inline

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('bai-viet');
        if (res.data?.code === 200) {
           setPosts(res.data.data || []);
        }
      } catch (error) {
        console.error('Lỗi khi tải bài viết:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  // Helper to extract a short snippet from the blocks JSON or plain text
  const getSnippet = (post) => {
    const content = post.chiTietBaiViet?.noiDung || post.noiDung || '';
    try {
      const blocks = JSON.parse(content);
      if (Array.isArray(blocks)) {
         const firstText = blocks.find(b => b.type === 'text');
         if (firstText) {
            // Strip HTML tags
            const stripped = firstText.content.replace(/(<([^>]+)>)/gi, "");
            return stripped.length > 120 ? stripped.substring(0, 120) + '...' : stripped;
         }
      }
    } catch(e) {
      // Not JSON
      const stripped = content.replace(/(<([^>]+)>)/gi, "");
      return stripped.length > 120 ? stripped.substring(0, 120) + '...' : stripped;
    }
    return '';
  };

  return (
    <div className="container" style={{ padding: '60px 0', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '10px', color: '#0f172a', textAlign: 'center' }}>Góc Tin Tức Công Nghệ</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem', textAlign: 'center', marginBottom: '40px' }}>
        Cập nhật xu hướng, đánh giá linh kiện và thủ thuật máy tính mới nhất
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#64748b' }}>Đang tải bài viết...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Chưa có bài viết nào được xuất bản.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {posts.map(post => (
            <div key={post.maBaiViet} style={{ 
              border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#fff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s'
            }}>
              <Link to={`/posts/${post.maBaiViet}`} style={{ display: 'block', height: '200px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                {post.chiTietBaiViet?.hinhAnh ? (
                  <img src={post.chiTietBaiViet.hinhAnh} alt={post.tieuDe} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    Không có ảnh
                  </div>
                )}
              </Link>
              
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>
                  <span><strong style={{color: '#3b82f6'}}>{post.nguoiViet || 'Admin'}</strong></span>
                  <span>{formatDate(post.ngayDang)}</span>
                </div>
                
                <h2 style={{ fontSize: '1.25rem', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                  <Link to={`/posts/${post.maBaiViet}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                    {post.tieuDe}
                  </Link>
                </h2>

                <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, flex: 1, lineHeight: 1.5 }}>
                  {getSnippet(post)}
                </p>

                <div style={{ marginTop: '20px' }}>
                  <Link to={`/posts/${post.maBaiViet}`} style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>
                    Đọc tiếp →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;
