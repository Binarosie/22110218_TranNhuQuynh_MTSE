import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/routing/ProtectedRoute';
import RoleBasedRoute from './components/routing/RoleBasedRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard & Profile
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Apartment pages
import ApartmentBrowse from './pages/apartments/ApartmentBrowse';
import ApartmentDetail from './pages/apartments/ApartmentDetail';
import MyApartments from './pages/apartments/MyApartments';
import ApartmentManagement from './pages/apartments/ApartmentManagement';
import CreateApartment from './pages/apartments/CreateApartment';

// Cart page
import Cart from './pages/cart/Cart';

// Booking pages
import MyBookings from './pages/bookings/MyBookings';
import BookingDetail from './pages/bookings/BookingDetail';
import CreateBooking from './pages/bookings/CreateBooking';
import BookingManagement from './pages/bookings/BookingManagement';

// Facility pages
import FacilityManagement from './pages/facilities/FacilityManagement';
import FacilityEdit from './pages/facilities/FacilityEdit';

// User management
import UserList from './pages/users/UserList';
import UserCreate from './pages/users/UserCreate';
import UserEdit from './pages/users/UserEdit';

// Building management
import BlockList from './pages/blocks/BlockList';
import BlockCreate from './pages/blocks/BlockCreate';
import BuildingManagement from './pages/buildings/BuildingManagement';

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// App Layout Component with Sidebar
const AppLayout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex bg-gray-50">
            {user && <Navbar />}
            {user && <Sidebar />}
            
            {/* Content wrapper với margin-left để tránh sidebar và padding-top để tránh navbar */}
            <div className={user ? "ml-64 pt-16 flex flex-col w-full min-h-screen" : "w-full"}>
                {/* Main content */}
                <main className={user ? "flex-1 p-8" : ""}>
                    {children}
                </main>
                
                {/* Footer nằm trong flow, không bị sidebar che */}
                {user && <Footer />}
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <AppLayout>
                        <Routes>
                        {/* ---------- PUBLIC ---------- */}
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            }
                        />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />

                        {/* ---------- COMMON PROTECTED ---------- */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />

                        {/* ---------- PUBLIC BROWSE ---------- */}
                        <Route path="/browse" element={<ApartmentBrowse />} />
                        <Route path="/apartments/:id" element={<ApartmentDetail />} />

                        {/* ---------- CART ---------- */}
                        <Route
                            path="/cart"
                            element={
                                <ProtectedRoute>
                                    <Cart />
                                </ProtectedRoute>
                            }
                        />

                        {/* ---------- USER ROUTES ---------- */}
                        <Route
                            path="/cart"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles="User">
                                        <Cart />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-apartments"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles="User">
                                        <MyApartments />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-bookings"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles={['User', 'Technician']}>
                                        <MyBookings />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/bookings/create"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles="User">
                                        <CreateBooking />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/bookings/:id"
                            element={
                                <ProtectedRoute>
                                    <BookingDetail />
                                </ProtectedRoute>
                            }
                        />

                        {/* ---------- ADMIN ROUTES ---------- */}
                        <Route
                            path="/apartments"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles="Admin">
                                        <ApartmentManagement />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/apartments/create"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles="Admin">
                                        <CreateApartment />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/apartments/:id/edit"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles="Admin">
                                        <CreateApartment />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/bookings"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles="Admin">
                                        <BookingManagement />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/facilities"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles="Admin">
                                        <FacilityManagement />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/facilities/:id/edit"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles="Admin">
                                        <FacilityEdit />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />

                        {/* ---------- BLOCK / BUILDING MANAGEMENT ---------- */}
                        <Route
                            path="/buildings"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                                        <BuildingManagement />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/blocks"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                                        <BlockList />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/blocks/create"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles="Admin">
                                        <BlockCreate />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />

                        {/* ---------- USER MANAGEMENT ---------- */}
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                                        <UserList />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/users/create"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles="Admin">
                                        <UserCreate />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/users/edit/:id"
                            element={
                                <ProtectedRoute>
                                    <RoleBasedRoute allowedRoles="Admin">
                                        <UserEdit />
                                    </RoleBasedRoute>
                                </ProtectedRoute>
                            }
                        />

                        {/* ---------- DEFAULT ---------- */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>

                    {/* Toast Notifications */}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                duration: 3000,
                                iconTheme: {
                                    primary: '#28a745',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                duration: 5000,
                                iconTheme: {
                                    primary: '#dc3545',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                </AppLayout>
            </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;