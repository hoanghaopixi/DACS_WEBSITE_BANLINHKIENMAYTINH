import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard/ProductCard';
import { FaShoppingCart, FaStar, FaCamera, FaVideo, FaTimes, FaPlay } from 'react-icons/fa';
import { useCartSession } from '../context/CartSession';
import authService from '../services/authService';
import api from '../services/api';
import '../styles/pages/ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartSession();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [activeImage, setActiveImage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewStars, setReviewStars] = useState(5);
  const [hoverStar, setHoverStar] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Media upload states
  const [imageFiles, setImageFiles] = useState([]); // max 3
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null); // max 1
  const [videoPreview, setVideoPreview] = useState('');
  const [videoDurationError, setVideoDurationError] = useState('');
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [myReviewId, setMyReviewId] = useState(null);
  const [existingMedia, setExistingMedia] = useState([]);

  const user = authService.getStoredUser();
  const isLoggedIn = !!user?.accessToken;

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const [productDetail, allProducts] = await Promise.all([
          productService.getProductById(id),
          productService.getAllProducts(),
        ]);

        setProduct(productDetail);
        setActiveImage(productDetail.image);
        setRelatedProducts(
          allProducts
            .filter((item) => item.category === productDetail.category && item.id !== productDetail.id)
            .slice(0, 4)
        );

        // Random products (exclude current + related)
        const relatedIds = new Set(
          allProducts
            .filter((item) => item.category === productDetail.category && item.id !== productDetail.id)
            .slice(0, 4)
            .map(p => p.id)
        );
        relatedIds.add(productDetail.id);
        const others = allProducts.filter(p => !relatedIds.has(p.id));
        // Shuffle and pick 12
        const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 12);
        setRandomProducts(shuffled);
        
        try {
          const revRes = await api.get(`danh-gia/san-pham/${id}`);
          if (revRes.data && revRes.data.code === 200) {
             setReviews(revRes.data.data);
          }
        } catch(e) {
          console.error("Error fetching reviews", e);
        }

        if (authService.getStoredUser()?.accessToken) {
          try {
            const myRevRes = await api.get(`danh-gia/me/san-pham/${id}`, { preventRedirect: true });
            if (myRevRes.data && myRevRes.data.code === 200 && myRevRes.data.data) {
              const myRev = myRevRes.data.data;
              setMyReviewId(myRev.maDanhGia);
              setReviewText(myRev.noiDung);
              setReviewStars(myRev.diemSao);
              if (myRev.hinhAnhDanhGias) {
                setExistingMedia(myRev.hinhAnhDanhGias.map(m => ({url: m.url, loai: m.loai})));
              }
            }
          } catch (e) {
            console.log("No existing review found.");
          }
        }

      } catch (error) {
        console.error('Không tải được chi tiết sản phẩm:', error);
        setProduct(null);
        setRelatedProducts([]);
        setErrorMessage('Không thể tải chi tiết sản phẩm từ API.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  // ---- Image handling ----
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const existingImagesCount = existingMedia.filter(m => m.loai === 'IMAGE').length;
    const remaining = 3 - (imageFiles.length + existingImagesCount);
    
    if (remaining <= 0) {
      alert('Bạn đã đạt tối đa 3 ảnh.');
      e.target.value = '';
      return;
    }

    const toAdd = files.slice(0, remaining);
    
    if (files.length > remaining) {
      alert(`Chỉ được tối đa 3 ảnh. Bạn chỉ có thể thêm ${remaining} ảnh nữa.`);
    }

    const newPreviews = toAdd.map(f => URL.createObjectURL(f));
    setImageFiles(prev => [...prev, ...toAdd]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(imagePreviews[idx]);
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // ---- Video handling ----
  const handleVideoSelect = (e) => {
    const existingVideo = existingMedia.find(m => m.loai === 'VIDEO');
    if (existingVideo) {
       alert('Bạn đã có 1 video. Vui lòng xóa video cũ trước khi thêm mới.');
       e.target.value = '';
       return;
    }
    const file = e.target.files[0];
    if (!file) return;

    setVideoDurationError('');
    
    // Check duration with a hidden video element
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.onloadedmetadata = () => {
      URL.revokeObjectURL(videoEl.src);
      if (videoEl.duration > 20) {
        setVideoDurationError(`Video dài ${Math.round(videoEl.duration)}s, tối đa 20 giây.`);
        e.target.value = '';
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    };
    videoEl.src = URL.createObjectURL(file);
    e.target.value = '';
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview('');
    setVideoDurationError('');
  };

  // ---- Upload files then submit review ----
  const uploadMedia = async () => {
    const mediaList = [];

    // Upload images
    for (const imgFile of imageFiles) {
      const formData = new FormData();
      formData.append('file', imgFile);
      const res = await api.post('/upload/review-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.code === 200) {
        mediaList.push({ url: res.data.data.url, loai: 'IMAGE' });
      }
    }

    // Upload video
    if (videoFile) {
      const formData = new FormData();
      formData.append('file', videoFile);
      const res = await api.post('/upload/review-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.code === 200) {
        mediaList.push({ url: res.data.data.url, loai: 'VIDEO' });
      }
    }

    return mediaList;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    try {
      setIsSubmittingReview(true);
      
      const newMediaList = await uploadMedia();
      const mediaList = [...existingMedia, ...newMediaList];

      if (myReviewId) {
        const res = await api.put(`danh-gia/${myReviewId}`, {
          maSP: product.id,
          diemSao: reviewStars,
          noiDung: reviewText,
          mediaList
        });
        if (res.data && res.data.code === 200) {
          alert("Cập nhật đánh giá thành công!");
          setExistingMedia(mediaList);
          setImageFiles([]);
          setImagePreviews([]);
          removeVideo();
          try {
            const revRes = await api.get(`danh-gia/san-pham/${id}`);
            if (revRes.data?.code === 200) setReviews(revRes.data.data);
          } catch(_) {}
        }
      } else {
        const res = await api.post('danh-gia', {
          maSP: product.id,
          diemSao: reviewStars,
          noiDung: reviewText,
          mediaList
        });
        if (res.data && res.data.code === 201) {
          alert("Đăng đánh giá thành công!");
          setMyReviewId(res.data.data.maDanhGia);
          setExistingMedia(mediaList);
          setImageFiles([]);
          setImagePreviews([]);
          removeVideo();
          try {
            const revRes = await api.get(`danh-gia/san-pham/${id}`);
            if (revRes.data?.code === 200) setReviews(revRes.data.data);
          } catch(_) {}
        }
      }
    } catch (err) {
       alert(err.response?.data?.message || "Lỗi khi đăng đánh giá.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-5" style={{ minHeight: '60vh' }}>
        <h1>Đang tải sản phẩm...</h1>
      </div>
    );
  }

  if (errorMessage || !product) {
    return (
      <div className="container mt-5" style={{ minHeight: '60vh' }}>
        <h1>{errorMessage || 'Không tìm thấy sản phẩm'}</h1>
        <Link to="/products">← Quay lại danh sách</Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity, { name: product.name, image: product.image });
    } catch (error) {
      console.error('Không thể thêm vào giỏ hàng:', error);
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(product.id, quantity, { name: product.name, image: product.image });
      navigate('/checkout');
    } catch (error) {
      console.error('Không thể thêm vào giỏ hàng:', error);
    }
  };

  const allImages = [product.image, ...(product.mediaList?.map(m => m.url) || [])];
  
  const avgStars = reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.diemSao, 0) / reviews.length).toFixed(1)
      : 0;

  const apiBase = ''; // Vite proxy handles /api routing

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> / <Link to="/products">Sản phẩm</Link> / <span>{product.name}</span>
        </div>

        <div className="product-detail-layout">
          {/* Product Image Carousel */}
          <div className="product-images">
            <div className="main-image">
              <img src={activeImage} alt={product.name} />
            </div>
            {allImages.length > 1 && (
                <div className="thumbnail-list">
                  {allImages.map((img, idx) => (
                      <div key={idx} className={`thumb-item ${activeImage === img ? 'active' : ''}`} onClick={() => setActiveImage(img)}>
                        <img src={img} alt="thumb" />
                      </div>
                  ))}
                </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-red">
            <h1 className="product-title-red">{product.name}</h1>
            
            <div className="product-meta-row-red">
              <span className="star-rating">
                 <FaStar color="#ffc107" /> {avgStars} ({reviews.length} đánh giá)
              </span>
            </div>
            
            <div className="product-status-row-red">
              <span>Bảo hành: <span className="red-text">{product.warranty > 0 ? `${product.warranty} tháng` : '36 tháng'}</span></span>
              <span className="divider-red">|</span>
              <span>Tình trạng: <span className="green-text">{product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span></span>
            </div>

            <div className="product-price-container-red" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '15px' }}>
              {product.hasDiscount ? (
                <>
                  <div className="original-price-strike" style={{ textDecoration: 'line-through', color: '#999', fontSize: '16px', marginBottom: '4px' }}>
                    {new Intl.NumberFormat('vi-VN').format(product.originalPrice)} đ
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="product-price-red" style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                      {new Intl.NumberFormat('vi-VN').format(product.price)} đ
                    </span>
                    <span className="detail-discount-badge" style={{ padding: '2px 8px', fontSize: '14px', border: '1px solid #dc3545', color: '#dc3545', borderRadius: '4px', backgroundColor: '#fff', fontWeight: 'bold' }}>
                      -{product.discountPercent}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="product-price-red" style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                  {new Intl.NumberFormat('vi-VN').format(product.price)} đ
                </div>
              )}
            </div>

            <div className="product-description-box-red">
              <h3>Mô tả sản phẩm:</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
            </div>

            <div className="product-actions-red">
              <div className="quantity-wrapper-red">
                <span className="qty-label-red">Số lượng:</span>
                <div className="quantity-buttons-red">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <input type="text" value={quantity} readOnly />
                  <button type="button" onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>
              <button className="btn-add-to-cart-red" type="button" onClick={handleAddToCart}>
                <FaShoppingCart /> Thêm vào giỏ hàng
              </button>
            </div>

            <button className="btn-buy-now-red" type="button" onClick={handleBuyNow}>
              <strong>ĐẶT MUA NGAY</strong>
              <span>Giao hàng tận nơi nhanh chóng</span>
            </button>
          </div>
        </div>
        
        {/* Reviews Section */}
        <section className="product-reviews-section">
           <h2>Đánh giá sản phẩm</h2>

           {/* Review Form — only for logged-in users */}
           {isLoggedIn ? (
             <div className="review-form-container">
               <h3>{myReviewId ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá của bạn'}</h3>
               <form onSubmit={handleReviewSubmit}>
                  {/* Star selector — interactive */}
                  <div className="star-selector-row">
                     <label>Đánh giá:</label>
                     <div className="star-selector">
                        {[1,2,3,4,5].map(s => (
                           <FaStar 
                              key={s} 
                              size={28}
                              className="star-clickable"
                              color={(hoverStar || reviewStars) >= s ? '#ffc107' : '#e4e5e9'}
                              onClick={() => setReviewStars(s)}
                              onMouseEnter={() => setHoverStar(s)}
                              onMouseLeave={() => setHoverStar(0)}
                           />
                        ))}
                        <span className="star-label">
                          {reviewStars === 5 ? 'Tuyệt vời' : reviewStars === 4 ? 'Tốt' : reviewStars === 3 ? 'Bình thường' : reviewStars === 2 ? 'Kém' : 'Tệ'}
                        </span>
                     </div>
                  </div>
                  
                  <textarea 
                     placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..." 
                     rows="4" 
                     value={reviewText}
                     onChange={e => setReviewText(e.target.value)}
                     required
                  />

                  {/* Media upload area */}
                  <div className="review-media-upload">
                     <div className="upload-actions">
                        <button 
                           type="button" 
                           className="upload-btn upload-img-btn" 
                           onClick={() => imageInputRef.current?.click()} 
                           disabled={(imageFiles.length + existingMedia.filter(m => m.loai === 'IMAGE').length) >= 3}
                        >
                           <FaCamera /> Thêm ảnh ({imageFiles.length + existingMedia.filter(m => m.loai === 'IMAGE').length}/3)
                        </button>
                        <button 
                           type="button" 
                           className="upload-btn upload-vid-btn" 
                           onClick={() => videoInputRef.current?.click()} 
                           disabled={!!videoFile || existingMedia.some(m => m.loai === 'VIDEO')}
                        >
                           <FaVideo /> Thêm video ({videoFile || existingMedia.some(m => m.loai === 'VIDEO') ? '1' : '0'}/1)
                        </button>
                        <span className="upload-hint">Tối đa 3 ảnh, 1 video ≤ 20 giây</span>
                     </div>
                     
                     <input ref={imageInputRef} type="file" accept="image/*" multiple hidden onChange={handleImageSelect} />
                     <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={handleVideoSelect} />

                     {videoDurationError && (
                        <div className="media-error">{videoDurationError}</div>
                     )}

                     {/* Previews */}
                     {(existingMedia.length > 0 || imagePreviews.length > 0 || videoPreview) && (
                        <div className="media-preview-grid">
                           {existingMedia.map((m, idx) => (
                              <div key={`exist-${idx}`} className={`media-preview-item ${m.loai==='VIDEO' ? 'video-preview' : ''}`}>
                                 {m.loai === 'VIDEO' ? (
                                     <>
                                        <video src={m.url} muted />
                                        <div className="video-overlay"><FaPlay /></div>
                                     </>
                                 ) : (
                                     <img src={m.url} alt={`exist-preview-${idx}`} />
                                 )}
                                 <button type="button" className="media-remove-btn" onClick={() => setExistingMedia(prev => prev.filter((_, i) => i !== idx))}><FaTimes /></button>
                              </div>
                           ))}
                           {imagePreviews.map((src, idx) => (
                              <div key={`new-${idx}`} className="media-preview-item">
                                 <img src={src} alt={`preview-${idx}`} />
                                 <button type="button" className="media-remove-btn" onClick={() => removeImage(idx)}><FaTimes /></button>
                              </div>
                           ))}
                           {videoPreview && (
                              <div className="media-preview-item video-preview">
                                 <video src={videoPreview} muted />
                                 <div className="video-overlay"><FaPlay /></div>
                                 <button type="button" className="media-remove-btn" onClick={removeVideo}><FaTimes /></button>
                              </div>
                           )}
                        </div>
                     )}
                  </div>

                  <button type="submit" className="btn-submit-review" disabled={isSubmittingReview}>
                     {isSubmittingReview ? 'Đang gửi...' : (myReviewId ? 'Cập nhật đánh giá' : 'Gửi đánh giá')}
                  </button>
               </form>
             </div>
           ) : (
              <div className="review-login-prompt">
                 <p>Bạn cần <button type="button" className="link-btn" onClick={() => navigate('/login')}>đăng nhập</button> để viết đánh giá.</p>
              </div>
           )}
           
           <div className="review-list">
              {reviews.length === 0 ? (
                 <p className="no-reviews-text">Chưa có đánh giá nào cho sản phẩm này.</p>
              ) : (
                 reviews.map(r => (
                    <div key={r.maDanhGia} className="review-item">
                       <div className="review-header">
                          <strong>{r.khachHang?.hoTen || 'Người dùng ẩn danh'}</strong>
                          <span className="review-stars">
                             {[...Array(5)].map((_, i) => (
                                <FaStar key={i} color={i < r.diemSao ? '#ffc107' : '#e4e5e9'} />
                             ))}
                          </span>
                       </div>
                       <div className="review-date">
                          {new Date(r.ngayDanhGia).toLocaleString('vi-VN')}
                          {r.daChinhSua && <span className="edited-label"> (đã chỉnh sửa)</span>}
                       </div>
                       <p className="review-content">{r.noiDung}</p>
                       
                       {/* Display review media */}
                       {r.hinhAnhDanhGias && r.hinhAnhDanhGias.length > 0 && (
                          <div className="review-media-gallery">
                             {r.hinhAnhDanhGias.map((m, idx) => (
                                m.loai === 'VIDEO' ? (
                                   <video key={idx} src={`${apiBase}${m.url}`} controls className="review-media-video" />
                                ) : (
                                   <img key={idx} src={`${apiBase}${m.url}`} alt="review" className="review-media-img" />
                                )
                             ))}
                          </div>
                       )}
                    </div>
                 ))
              )}
           </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2>Sản phẩm liên quan</h2>
            <div className="product-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Random Products You Might Like */}
        {randomProducts.length > 0 && (
          <section className="related-products" style={{ marginTop: '12px' }}>
            <h2>Sản phẩm có thể bạn sẽ thích</h2>
            <div className="product-grid">
              {randomProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
