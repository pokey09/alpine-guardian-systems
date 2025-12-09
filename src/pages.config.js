import Home from './pages/Home';
import CustomLogin from './pages/CustomLogin';
import CustomSignup from './pages/CustomSignup';
import Dashboard from './pages/Dashboard';
import StoreFront from './pages/StoreFront';
import AdminDashboard from './pages/AdminDashboard';
import Checkout from './pages/Checkout';
import UserProfile from './pages/UserProfile';
import ProductDetail from './pages/ProductDetail';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


export const PAGES = {
    "Home": Home,
    "CustomLogin": CustomLogin,
    "CustomSignup": CustomSignup,
    "Dashboard": Dashboard,
    "StoreFront": StoreFront,
    "AdminDashboard": AdminDashboard,
    "Checkout": Checkout,
    "UserProfile": UserProfile,
    "ProductDetail": ProductDetail,
    "OrderHistory": OrderHistory,
    "OrderDetails": OrderDetails,
    "ForgotPassword": ForgotPassword,
    "ResetPassword": ResetPassword,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};