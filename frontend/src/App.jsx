import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Account from "./pages/Account";
import OAuth2RedirectHandler from "./pages/auth/OAuth2RedirectHandler";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import PaymentResult from "./pages/PaymentResult";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./layouts/AdminLayout";
import ProductManagement from "./pages/admin/ProductManagement";
import ProductForm from "./pages/admin/ProductForm";
import CategoryManagement from "./pages/admin/CategoryManagement";
import PostManagement from "./pages/admin/PostManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import CustomerManagement from "./pages/admin/CustomerManagement";
import PromotionManagement from "./pages/admin/PromotionManagement";
import SupplierManagement from "./pages/admin/SupplierManagement";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import AdManagement from "./pages/admin/AdManagement";
import InventoryManagement from "./pages/admin/InventoryManagement";
import CartManagement from "./pages/admin/CartManagement";
import InvoiceManagement from "./pages/admin/InvoiceManagement";
import AccountManagement from "./pages/admin/AccountManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import StatisticsManagement from "./pages/admin/StatisticsManagement";
import BrandManagement from "./pages/admin/BrandManagement";
import Footer from './components/Footer';
import SideBanners from "./components/SideBanners";
import ChatWidget from "./components/ChatWidget/ChatWidget";

const GlobalBanners = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/login') || location.pathname.startsWith('/admin')) {
    return null;
  }
  return <SideBanners />;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <GlobalBanners />
        {children}
      </div>
      <Footer />
      <ChatWidget />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Main Site Routes */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
        <Route path="/products/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
        <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
        <Route path="/checkout" element={<MainLayout><Checkout /></MainLayout>} />
        <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
        <Route path="/account" element={<MainLayout><Account /></MainLayout>} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/posts" element={<MainLayout><Posts /></MainLayout>} />
        <Route path="/posts/:id" element={<MainLayout><PostDetail /></MainLayout>} />
        <Route path="/payment-result" element={<MainLayout><PaymentResult /></MainLayout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/add" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="invoices" element={<InvoiceManagement />} />
          <Route path="carts" element={<CartManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="brands" element={<BrandManagement />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="suppliers" element={<SupplierManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="promotions" element={<PromotionManagement />} />
          <Route path="posts" element={<PostManagement />} />
          <Route path="ads" element={<AdManagement />} />
          <Route path="statistics" element={<StatisticsManagement />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;