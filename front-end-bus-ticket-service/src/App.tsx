import { useEffect, useState } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import NotFoundPage from './pages/Errors/NotFound';
import HomePage from './pages/Customer/HomePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './pages/Customer/LoginPage';
import SignupPage from './pages/Customer/SignUpPage';
import LookUpPage from './pages/Customer/LookUpPage';
import BookingTicketPage from './pages/Customer/BookingTicketPage';
import ForgotPasswordPage from './pages/Customer/ForgotPasswordPage';
import ProfileManagementForm from './components/ProfileManagementForm';
import TravelSchedulePage from './pages/Customer/TravelSchedulePage';
import ResultBookingPage from './components/ResultBookingPage';
import DefaultLayout from './layout/DefaultLayout';
import RouteManagement from './pages/Admin/RouteManagementPage';

// Public Layout
const PublicLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);


// Admin Layout
const AdminLayout = () => (
  <>
    <DefaultLayout/>
  </>
);

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000); 
  }, []);

  if (loading) return <Loader />;

  return (
    <Routes>
      {/* Public layout routes */}
      <Route element={<PublicLayout />}>
        <Route index element={
          <>
            <PageTitle title="BHP Bus Line"/>
            <HomePage />
          </>
        } />
        <Route path='/login' element={
           <>
            <PageTitle title="Đăng nhập "/>
            <LoginPage />
           </>
        } />
        <Route path='/signup' element={
          <>
            <PageTitle title="Đăng ký"/>
            <SignupPage />
          </>
        } />
        <Route path ='/lookup-ticket' element={
          <>
            <PageTitle title="Tra cứu vé"/>
            <LookUpPage />
          </>
        }/>
        <Route path ='/forgot-password' element={
          <>
            <PageTitle title="Đặt lại mật khẩu"/>
            <ForgotPasswordPage />
          </>
        }/>
        <Route path ='/booking-ticket' element={
          <>
            <PageTitle title="Đặt vé"/>
            <BookingTicketPage />
          </>
        }/>
        <Route path ='/booking-result' element={
          <>
            <PageTitle title="Kết quả đặt vé"/>
            <ResultBookingPage />
          </>
        }/>
        <Route path ='/account' element={
          <>  
            <PageTitle title="Quản lý tài khoản"/>
            <ProfileManagementForm />
          </>
        }/>
        <Route path ='/search-trip' element={
          <>  
            <PageTitle title="Tìm kiếm chuyến đi"/>
            <TravelSchedulePage />
          </>
        
        }/>
      </Route>

      {/* Admin layout routes */}
      <Route path="/admin" element={<AdminLayout/>}>
        <Route index element={
            <>
              <PageTitle title="BHP Bus Line"/>
              <HomePage />
            </>
          } />
        <Route path='/admin/operation/route-management' element ={
          <>
            <PageTitle title="Quản lý tuyến đường"/>
            <RouteManagement />
          </>
        }
        />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <>
            <PageTitle title="Not Found" />
            <NotFoundPage />
          </>
        }
      />
    </Routes>
  );
}

export default App;
