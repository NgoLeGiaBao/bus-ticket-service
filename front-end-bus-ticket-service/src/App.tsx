import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import DefaultLayout from './layout/DefaultLayout';
import Home from './pages/Customer/Home';
import Order from './pages/Customer/Order';
import TableManagement from './pages/Management/Table';
import DishManagement from './pages/Management/Dishes';
import PrivateRoute from './components/PrivateRoute';
import SignIn from './pages/Authentication/SignIn';
import { ShiftBillingSummary } from './pages/Management/ShiftBillingSummary';
import { BillingHistory } from './pages/Management/BillingHistory';
import UnauthorizedPage from './pages/Errors/Unauthorized';
import NotFoundPage from './pages/Errors/NotFound';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    
    <Routes>
      <Route path="*" element={
        <>
          <PageTitle title="Not Found" />
          <NotFoundPage />
        </>
        } 
      />
      <Route
        index
        element={
          <>
            <PageTitle title="Welcome to Your Dining Experience!" />
            <Home />
          </>
        }
      />
      <Route
        path='/sign-in'
        element={
          <>
            <PageTitle title="Sign In | Restaurant Management" />
            <SignIn />
          </>
        }
      />
      <Route
        path="/order"

        element={
          <>
            <PageTitle title="Order" />
            <Order />
          </>
        }
      />
      <Route
        path="/table-management"

        element={
          <>
            <PageTitle title="Table Stautus Page" />
            <PrivateRoute allowedRoles={["3"]}><TableManagement shouldShowHeader={true} /></PrivateRoute>
          </>
        }
      />
      <Route
        path="/dish-management"

        element={
          <>
            <PageTitle title="Dish Management" />
            <PrivateRoute allowedRoles={["2"]}><DishManagement /></PrivateRoute>
          </>
        }
      />

      <Route
        path="/unauthorized"   
        element={
          <>
            <PageTitle title="Unauthorized" />
            <UnauthorizedPage />
          </> 
        }
      />
      <Route element={<DefaultLayout />}>
        <Route path="/bill/shift-billing-summary" 
            element={
              <>
              <PageTitle title="Shift Billing Summary" />
              <PrivateRoute allowedRoles={["1"]}><ShiftBillingSummary /></PrivateRoute>
              </>
            } 
        />
        <Route path="/bill/billing-history" 
            element=
            {<>
              <PageTitle title="Billing History" />
              <PrivateRoute allowedRoles={["1"]}><BillingHistory /></PrivateRoute>
            </>
          } 
        />
        <Route path="/table-management-admin" element={
          <>
            <PageTitle title="Table Management" />
            <TableManagement shouldShowHeader={false} />
          </>
        } />
      </Route>
    </Routes>
  );
}

export default App;
