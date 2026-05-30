import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import brandService from '../services/brandService';
import ProductCard from '../components/ProductCard/ProductCard';
import { FaChevronDown } from 'react-icons/fa';
import '../styles/pages/Products.css';

function Products() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || 'Tất cả');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const priceRef = useRef(null);
  const brandRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const [productData, brandData] = await Promise.all([
          productService.getAllProducts(),
          brandService.getAllBrands(),
        ]);
        setProducts(productData);
        setBrands(brandData);
      } catch (error) {
        console.error('Không tải được danh sách sản phẩm:', error);
        setProducts([]);
        setErrorMessage('Không thể tải danh sách sản phẩm từ API.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryFilter || 'Tất cả');
    setSelectedBrand(null);
    setPriceMin('');
    setPriceMax('');
  }, [categoryFilter]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (priceRef.current && !priceRef.current.contains(e.target)) setShowPriceDropdown(false);
      if (brandRef.current && !brandRef.current.contains(e.target)) setShowBrandDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const categories = ['Tất cả', ...new Set(products.map((p) => p.category).filter(Boolean))];

  // Only brands that have products in the selected category
  const relevantBrands = (() => {
    const pool = selectedCategory === 'Tất cả' ? products : products.filter(p => p.category === selectedCategory);
    const brandNames = new Set(pool.map(p => p.brand).filter(Boolean));
    return brands.filter(b => brandNames.has(b.tenThuongHieu));
  })();

  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
    const matchBrand = !selectedBrand || product.brand === selectedBrand.tenThuongHieu;
    const matchSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const minVal = priceMin ? Number(priceMin) : 0;
    const maxVal = priceMax ? Number(priceMax) : Infinity;
    const matchPrice = product.price >= minVal && product.price <= maxVal;
    return matchCategory && matchBrand && matchPrice && matchSearch;
  });

  const priceLabel = (() => {
    if (priceMin && priceMax) return `${Number(priceMin).toLocaleString('vi-VN')} - ${Number(priceMax).toLocaleString('vi-VN')}đ`;
    if (priceMin) return `Từ ${Number(priceMin).toLocaleString('vi-VN')}đ`;
    if (priceMax) return `Đến ${Number(priceMax).toLocaleString('vi-VN')}đ`;
    return 'Giá';
  })();

  const hasActiveFilters = selectedBrand || priceMin || priceMax;

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="filter-section">
              <h3>Danh mục</h3>
              <ul className="category-list">
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      className={selectedCategory === cat ? 'active' : ''}
                      onClick={() => { setSelectedCategory(cat); setSelectedBrand(null); }}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="products-main" style={{ minHeight: '60vh' }}>
            <div className="products-header">
              <h1>
                {searchQuery 
                  ? `Kết quả tìm kiếm cho: "${searchQuery}"` 
                  : (selectedCategory === 'Tất cả' ? 'Tất cả sản phẩm' : selectedCategory)}
              </h1>
              <p>{isLoading ? 'Đang tải...' : `${filteredProducts.length} sản phẩm`}</p>
            </div>

            {/* Filter Dropdowns */}
            <div className="filter-bar">
              {/* Price Dropdown */}
              <div className="filter-dropdown" ref={priceRef}>
                <button
                  className={`filter-dropdown-btn ${priceMin || priceMax ? 'has-value' : ''}`}
                  onClick={() => { setShowPriceDropdown(!showPriceDropdown); setShowBrandDropdown(false); }}
                >
                  {priceLabel} <FaChevronDown className={`chevron ${showPriceDropdown ? 'open' : ''}`} />
                </button>
                {showPriceDropdown && (
                  <div className="filter-dropdown-menu price-menu">
                    <div className="price-dropdown-row">
                      <input
                        type="number"
                        placeholder="Giá thấp nhất"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        min="0"
                      />
                      <span>—</span>
                      <input
                        type="number"
                        placeholder="Giá cao nhất"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        min="0"
                      />
                    </div>
                    {(priceMin || priceMax) && (
                      <button className="price-clear" onClick={() => { setPriceMin(''); setPriceMax(''); }}>
                        Xóa khoảng giá
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Brand Dropdown */}
              <div className="filter-dropdown" ref={brandRef}>
                <button
                  className={`filter-dropdown-btn ${selectedBrand ? 'has-value' : ''}`}
                  onClick={() => { setShowBrandDropdown(!showBrandDropdown); setShowPriceDropdown(false); }}
                >
                  {selectedBrand ? selectedBrand.tenThuongHieu : 'Hãng'} <FaChevronDown className={`chevron ${showBrandDropdown ? 'open' : ''}`} />
                </button>
                {showBrandDropdown && (
                  <div className="filter-dropdown-menu brand-menu">
                    <button
                      className={`brand-dropdown-item ${!selectedBrand ? 'active' : ''}`}
                      onClick={() => { setSelectedBrand(null); setShowBrandDropdown(false); }}
                    >
                      <span>Tất cả hãng</span>
                    </button>
                    {relevantBrands.map(brand => (
                      <button
                        key={brand.maThuongHieu}
                        className={`brand-dropdown-item ${selectedBrand?.maThuongHieu === brand.maThuongHieu ? 'active' : ''}`}
                        onClick={() => { setSelectedBrand(brand); setShowBrandDropdown(false); }}
                      >
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.tenThuongHieu} />
                        ) : (
                          <span>{brand.tenThuongHieu}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {hasActiveFilters && (
                <button className="filter-reset-btn" onClick={() => { setSelectedBrand(null); setPriceMin(''); setPriceMax(''); }}>
                  ✕ Xóa lọc
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="no-products">
                <p>Đang tải danh sách sản phẩm...</p>
              </div>
            ) : errorMessage ? (
              <div className="no-products">
                <p>{errorMessage}</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>Không có sản phẩm nào phù hợp với bộ lọc.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Products;
