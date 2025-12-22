import Home from './pages/Home';
import CustomLogin from './pages/CustomLogin';
import CustomSignup from './pages/CustomSignup';
import Dashboard from './pages/Dashboard';
import StoreFront from './pages/StoreFront';
import AdminDashboard from './pages/AdminDashboard';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import UserProfile from './pages/UserProfile';
import ProductDetail from './pages/ProductDetail';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';


export const PAGES = {
    "Home": Home,
    "CustomLogin": CustomLogin,
    "CustomSignup": CustomSignup,
    "Dashboard": Dashboard,
    "StoreFront": StoreFront,
    "AdminDashboard": AdminDashboard,
    "Checkout": Checkout,
    "CheckoutSuccess": CheckoutSuccess,
    "CheckoutCancel": CheckoutCancel,
    "UserProfile": UserProfile,
    "ProductDetail": ProductDetail,
    "OrderHistory": OrderHistory,
    "OrderDetails": OrderDetails,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};