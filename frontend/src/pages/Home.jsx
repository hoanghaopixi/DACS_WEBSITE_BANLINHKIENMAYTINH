import React, { useState, useEffect, useRef, useCallback } from 'react';
import productService from '../services/productService';
import brandService from '../services/brandService';
import ProductCard from '../components/ProductCard/ProductCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../styles/pages/Home.css';

function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [allFeatured, setAllFeatured] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [cpuProducts, setCpuProducts] = useState([]);
  const [mouseProducts, setMouseProducts] = useState([]);
  const [monitorProducts, setMonitorProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const [data, cpuData, mouseData, monitorData, brandData] = await Promise.all([
          productService.getAllProducts(),
          productService.getBestSellingByCategory('CPU', 5),
          productService.getBestSellingByCategory('chuột', 5),
          productService.getBestSellingByCategory('màn hình', 5),
          brandService.getAllBrands(),
        ]);
        const sorted = [...data].sort((a, b) => b.averageRating - a.averageRating || b.soldQuantity - a.soldQuantity);
        setAllProducts(sorted);
        setAllFeatured(sorted.slice(0, 20));
        setFeaturedProducts(sorted.slice(0, 20));
        setCpuProducts(cpuData);
        setMouseProducts(mouseData);
        setMonitorProducts(monitorData);
        setBrands(brandData.filter(b => b.logo));
      } catch (error) {
        console.error('Không tải được danh sách sản phẩm:', error);
        setAllProducts([]);
        setAllFeatured([]);
        setFeaturedProducts([]);
        setCpuProducts([]);
        setMouseProducts([]);
        setMonitorProducts([]);
        setErrorMessage('Không thể tải sản phẩm. Kiểm tra backend/kết nối cơ sở dữ liệu rồi thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleBrandFilter = (brand) => {
    if (selectedBrand && selectedBrand.maThuongHieu === brand.maThuongHieu) {
      setSelectedBrand(null);
      setFeaturedProducts(allFeatured);
    } else {
      setSelectedBrand(brand);
      const filtered = allProducts
        .filter(p => p.brand?.toLowerCase() === brand.tenThuongHieu?.toLowerCase())
        .slice(0, 20);
      setFeaturedProducts(filtered);
    }
  };

  const handleShowAll = () => {
    setSelectedBrand(null);
    setFeaturedProducts(allFeatured);
  };

  // Brand bar scroll
  const brandBarRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = brandBarRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = brandBarRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [brands, checkScroll]);

  const scrollBrands = (dir) => {
    const el = brandBarRef.current;
    if (el) el.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      <div className="container">
        <main className="home-main" style={{ minHeight: '60vh' }}>
          <div className="products-header">
            <h1>Sản phẩm nổi bật</h1>
            {brands.length > 0 && (
              <div className="brand-bar-wrapper">
                {canScrollLeft && (
                  <button className="brand-scroll-btn left" onClick={() => scrollBrands(-1)}>
                    <FaChevronLeft />
                  </button>
                )}
                <div className="brand-logo-bar" ref={brandBarRef}>
                  <button
                    className={`brand-logo-item ${!selectedBrand ? 'active' : ''}`}
                    onClick={handleShowAll}
                  >
                    <span>Tất cả</span>
                  </button>
                  {brands.map(brand => (
                    <button
                      key={brand.maThuongHieu}
                      className={`brand-logo-item ${selectedBrand?.maThuongHieu === brand.maThuongHieu ? 'active' : ''}`}
                      onClick={() => handleBrandFilter(brand)}
                      title={brand.tenThuongHieu}
                    >
                      <img src={brand.logo} alt={brand.tenThuongHieu} />
                    </button>
                  ))}
                </div>
                {canScrollRight && (
                  <button className="brand-scroll-btn right" onClick={() => scrollBrands(1)}>
                    <FaChevronRight />
                  </button>
                )}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="no-products">
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : errorMessage ? (
            <div className="no-products">
              <p>{errorMessage}</p>
            </div>
          ) : (
            <>
              {featuredProducts.length > 0 ? (
                <div className="product-grid">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="no-products">
                  <p>{selectedBrand ? `Không có sản phẩm nổi bật của ${selectedBrand.tenThuongHieu}.` : 'Chưa có sản phẩm nào trong cơ sở dữ liệu.'}</p>
                </div>
              )}

              {/* CPU Bán Chạy */}
              {cpuProducts.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <div className="products-header" style={{ borderBottom: '2px solid #dc3545', paddingBottom: '10px', marginBottom: '20px' }}>
                    <h2 style={{ color: '#dc3545', margin: 0, textTransform: 'uppercase', fontSize: '20px' }}> CPU bán chạy</h2>
                  </div>
                  <div className="product-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {cpuProducts.map((product) => (
                      <ProductCard key={`cpu-${product.id}`} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Chuột Bán Chạy */}
              {mouseProducts.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <div className="products-header" style={{ borderBottom: '2px solid #dc3545', paddingBottom: '10px', marginBottom: '20px' }}>
                    <h2 style={{ color: '#dc3545', margin: 0, textTransform: 'uppercase', fontSize: '20px' }}> Chuột bán chạy</h2>
                  </div>
                  <div className="product-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {mouseProducts.map((product) => (
                      <ProductCard key={`mouse-${product.id}`} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Màn Hình Bán Chạy */}
              {monitorProducts.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <div className="products-header" style={{ borderBottom: '2px solid #dc3545', paddingBottom: '10px', marginBottom: '20px' }}>
                    <h2 style={{ color: '#dc3545', margin: 0, textTransform: 'uppercase', fontSize: '20px' }}> Màn hình bán chạy</h2>
                  </div>
                  <div className="product-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {monitorProducts.map((product) => (
                      <ProductCard key={`monitor-${product.id}`} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Home;

