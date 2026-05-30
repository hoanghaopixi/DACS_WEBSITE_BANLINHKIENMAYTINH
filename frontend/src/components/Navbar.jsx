import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaShoppingCart, FaLaptop, FaDesktop, FaMicrochip, FaTv, FaMouse, FaSignOutAlt, FaNewspaper, FaServer, FaBolt, FaCube, FaHeadphones, FaKeyboard, FaHdd, FaMemory, FaPlug } from 'react-icons/fa';
import authService from '../services/authService';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import { useCartSession } from '../context/CartSession';
import { useSettings } from '../context/SettingsContext';
import './Navbar.css';

const quickIcons = {
  CPU: <FaMicrochip />,
  GPU: <FaTv />,
  Mainboard: <FaServer />,
  PSU: <FaBolt />,
  'Vỏ Case': <FaCube />,
  Laptop: <FaLaptop />,
  'Tai nghe': <FaHeadphones />,
  RAM: <FaMemory />,
  SSD: <FaHdd />,
  'Màn hình': <FaDesktop />,
  'Phụ kiện': <FaMouse />,
  'Bàn phím': <FaKeyboard />,
  PC: <FaDesktop />,
  'Nguồn': <FaPlug />,
};

const Navbar = () => {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(() => authService.getStoredUser());
  const [categories, setCategories] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const { cart } = useCartSession();
  const { settings } = useSettings();
  const categoryRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const syncAuthUser = () => setAuthUser(authService.getStoredUser());

    window.addEventListener('storage', syncAuthUser);
    window.addEventListener('auth-changed', syncAuthUser);

    return () => {
      window.removeEventListener('storage', syncAuthUser);
      window.removeEventListener('auth-changed', syncAuthUser);
    };
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Không tải được danh mục:', error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    let timeoutId;

    const loadSearchResults = async () => {
      try {
        const data = searchKeyword.trim()
          ? await productService.searchProducts(searchKeyword.trim())
          : await productService.getSuggestions(6);
        setSearchResults(data.slice(0, 6));
      } catch (error) {
        console.error('Không tải được gợi ý tìm kiếm:', error);
        setSearchResults([]);
      }
    };

    if (showSearchDropdown) {
      timeoutId = setTimeout(loadSearchResults, searchKeyword.trim() ? 250 : 0);
    }

    return () => clearTimeout(timeoutId);
  }, [searchKeyword, showSearchDropdown]);

  const handleLogout = () => {
    authService.logout();
    setAuthUser(null);
    window.dispatchEvent(new Event('auth-changed'));
  };

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      setShowSearchDropdown(false);
      navigate(`/products?search=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  return (
    <header className="header-wrapper">
      <div className="top-bar">
        <div className="container top-bar-content">
          <div className="logo-area">
            <Link to="/" className="logo-text">
              <span className="logo-icon-circle">HH</span>
              <span className="logo-copy">
                <strong>HOÀNG HẢO PC</strong>
                <small>Linh kiện máy tính chính hãng</small>
              </span>
            </Link>
          </div>

          <div
            className="search-shell"
            onFocus={() => setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 150)}
          >
            <div className="search-area">
              <input
                type="text"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="Bạn đang cần tìm gì?"
              />
              <button className="search-btn" type="button" onClick={handleSearch}>
                <FaSearch />
              </button>
            </div>

            {showSearchDropdown && (
              <div className="search-dropdown">
                <div className="search-dropdown-head">
                  {searchKeyword.trim() ? 'Kết quả tìm kiếm realtime' : 'Một số sản phẩm bạn sẽ thích'}
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <Link key={product.id} to={`/products/${product.id}`} className="search-item">
                      <img src={product.image} alt={product.name} />
                      <div>
                        <strong>{product.name}</strong>
                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="search-empty">Không có sản phẩm phù hợp.</div>
                )}
              </div>
            )}
          </div>

          <div className="utility-menu">
            <Link to="/posts" className="utility-item">
              <FaNewspaper className="icon" />
              <span>Bài viết</span>
            </Link>

            <Link to="/cart" className="utility-item cart-link">
              <div className="cart-icon-wrap">
                <FaShoppingCart className="icon" />
                <span className="cart-badge">{cart.totalQuantity || 0}</span>
              </div>
              <span>Giỏ hàng</span>
            </Link>

            {authUser ? (
              <div className="utility-user">
                <Link 
                  to={authUser.roles?.some(role => role.toUpperCase() === 'ADMIN') ? "/admin" : "/account"} 
                  className="utility-item active-user"
                >
                  {authUser.anhDaiDien ? (
                    <img src={authUser.anhDaiDien} alt="avatar" className="nav-avatar" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = ''); }} />
                  ) : (
                    <FaUser className="icon" />
                  )}
                  <span>{authUser.fullName || authUser.username}</span>
                </Link>
              </div>
            ) : (
              <Link to="/login" className="utility-item">
                <FaUser className="icon" />
                <span>Tài khoản</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="bottom-bar">
        <div className="container bottom-bar-content">
          <div className="category-hover" ref={categoryRef}>
            <button className="category-btn" type="button" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
              DANH MỤC SẢN PHẨM
            </button>

            {showCategoryDropdown && (
              <div className="category-dropdown" style={{ display: 'block' }}>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link key={category.id} onClick={() => setShowCategoryDropdown(false)} to={`/products?category=${encodeURIComponent(category.name)}`} className="category-dropdown-item">
                    <span>{category.name}</span>
                  </Link>
                ))
              ) : (
                <div className="category-dropdown-item">Đang tải danh mục...</div>
              )}
            </div>
            )}
          </div>

          <nav className="main-nav">
            <ul>
              {categories.slice(0, 7).map((category) => (
                <li key={category.id}>
                  <Link to={`/products?category=${encodeURIComponent(category.name)}`}>
                    {quickIcons[category.name] || <FaMicrochip />} {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
