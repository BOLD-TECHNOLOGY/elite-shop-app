import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./elite-shop/pages/layout/Layout";
import { useContext } from 'react';
import { AppContext } from './Context/AppContext';
import ProtectedRoute from "./Components/ProtectedRoute";

import Home from "./elite-shop/pages/Home";
import Login from "./elite-shop/auth/Login";
import Register from "./elite-shop/auth/Register";

import SuperAdmin from "./elite-shop/pages/dashboards/SuperAdmin";

import Vendor from "./elite-shop/pages/dashboards/Vendor";
import ViewProducts from "./elite-shop/pages/vendor/products/ViewProducts";
import ViewShops from "./elite-shop/pages/vendor/shops/ViewShops";

import User from "./elite-shop/pages/dashboards/User";

import Customer from "./elite-shop/pages/dashboards/Customer";
import CustomerOrders from "./elite-shop/pages/customer/orders/CustomerOrders";

import './App.css';

export default function App() { 

  const { user } = useContext(AppContext);

  return <BrowserRouter>

      <Routes>

        <Route path="/" element={ <Layout /> }>
          <Route index element={ <Home /> } />

          <Route path="/login" element={ user ? <Home /> : <Login /> } />
          <Route path="/register" element={ user ? <Home /> : <Register /> } />

          {/* Super Admin Routes */}
          <Route path="/super_admin" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdmin /></ProtectedRoute>} />

          {/* Vendor Routes */}
          <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']}><Vendor /></ProtectedRoute>} />
          <Route path="/vendor/shops" element={<ProtectedRoute allowedRoles={['vendor']}><ViewShops /></ProtectedRoute>} />
          <Route path="/vendor/products" element={<ProtectedRoute allowedRoles={['vendor']}><ViewProducts /></ProtectedRoute>} />

          {/* User Route */}
          <Route path="/user" element={<ProtectedRoute allowedRoles={['user']}><User /></ProtectedRoute>} />

          {/* Customer Routes */}
          <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}><Customer/></ProtectedRoute>} />
          <Route path="/customer/orders" element={<ProtectedRoute allowedRoles={['customer']}><CustomerOrders /></ProtectedRoute>} />

        </Route>

      </Routes>

    </BrowserRouter>
}