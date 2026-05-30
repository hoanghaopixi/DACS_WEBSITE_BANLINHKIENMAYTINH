import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaChevronLeft, FaClock, FaUser } from 'react-icons/fa';
import api from '../services/api';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`bai-viet/${id}`);
        if (res.data?.code === 200) {
          setPost(res.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải bài viết:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const formatDate = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Hàm render nội dung linh hoạt hỗ trợ cấu trúc Block JSON
  const renderContent = () => {
    if (!post) return null;
    const content = post.chiTietBaiViet?.noiDung || post.noiDung || '';
    
    // Thử Parse JSON (nếu là bài viết hệ thống mới)
    let blocks = null;
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) blocks = parsed;
    } catch (e) {
      // Bỏ qua nếu nội dung là text cũ
    }

    if (blocks) {
      return blocks.map((block, index) => {
        if (block.type === 'text') {
          return (
            <div 
              key={index} 
              style={{ marginBottom: '24px', lineHeight: '1.8', fontSize: '1.1rem', color: '#334155' }}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        }
        if (block.type === 'image') {
          return (
            <figure key={index} style={{ margin: '30px 0', textAlign: 'center' }}>
              <img 
                src={block.url} 
                alt={block.title || 'Ảnh minh họa'} 
                style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
              />
              {block.title && (
                <figcaption style={{ marginTop: '10px', fontSize: '0.95rem', color: '#64748b', fontStyle: 'italic' }}>
                  {block.title}
                </figcaption>
              )}
            </figure>
          );
        }
        return null;
      });
    }

    // Nếu bài viết được lập từ Editor thuần trước đây
    return (
      <div 
        style={{ marginBottom: '24px', lineHeight: '1.8', fontSize: '1.1rem', color: '#334155' }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem', color: '#64748b' }}>Đang tải nội dung...</div>;
  }

  if (!post) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <h2>Không tìm thấy bài viết!</h2>
        <Link to="/posts" style={{ color: '#2563eb' }}>Quay lại danh sách bài viết</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <Link to="/posts" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '24px', fontWeight: 500 }}>
          <FaChevronLeft /> Trở về Danh sách
        </Link>
        
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
          {post.chiTietBaiViet?.hinhAnh && (
            <div style={{ width: '100%', height: '350px' }}>
              <img src={post.chiTietBaiViet.hinhAnh} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          
          <div style={{ padding: '40px' }}>
            <h1 style={{ fontSize: '2.4rem', color: '#0f172a', margin: '0 0 20px 0', lineHeight: 1.3 }}>
              {post.tieuDe}
            </h1>
            
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.95rem' }}>
                <FaUser color="#3b82f6" /> 
                <strong style={{ color: '#334155' }}>{post.nguoiViet || 'Ban Biên Tập'}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.95rem' }}>
                <FaClock /> 
                {formatDate(post.ngayDang)}
              </div>
            </div>
            
            <article className="post-content-body">
              {renderContent()}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
