import React, { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./pages/Home";
import NotFound from "./pages/not-found";
import "./App.css";
import Footer from "./components/Footer/Footer";
import Headerbottom from "./components/Header/Headerbottom";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Registration from "./pages/Registration/Registration";
import OTPVerification from "./pages/OtpVerification/OtpVerification";
import RegisterComplete from "./pages/RegisterComplete/RegisterComplete";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout/Layout";
import Contact from "./pages/Contact";
import { useDispatch, useSelector } from "react-redux";
import { setupTokenRefresh } from "./functions/tokenRefresh";
import { useTokenRefresh } from "./hooks/useTokenRefresh";
import SuspenseLoading from "./hooks/SuspenseLoading";

// Lazy loaded components
const UserRoute = lazy(() => import("./components/routes/UserRoute"));
const AdminRoute = lazy(() => import("./components/routes/AdminRoute"));

// User pages
const Dashboard = lazy(() => import("./pages/User/Dashboard"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Invest = lazy(() => import("./pages/User/Invest"));
const History = lazy(() => import("./pages/User/History"));
const Profile = lazy(() => import("./pages/User/Profilepage"));
const Deposit = lazy(() => import("./pages/Deposit"));
const Plans = lazy(() => import("./pages/Plans"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Team = lazy(() => import("./pages/Team"));
const TermsAndConditions = lazy(() =>
  import("./pages/legal/TermsAndConditions")
);
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminAnalytics = lazy(() => import("./pages/Admin/AdminAnalytics"));
const AdminTasks = lazy(() => import("./pages/Admin/AdminTasks"));
const TaskVerification = lazy(() => import("./pages/Admin/TaskVerification"));
const AdminDeposits = lazy(() => import("./pages/Admin/AdminDeposits"));
const AdminWithdrawals = lazy(() => import("./pages/Admin/AdminWithdrawals"));
const UserManagement = lazy(() => import("./pages/Admin/UserManagement"));
const ContactMessages = lazy(() => import("./pages/Admin/ContactMessages"));

function App() {
  const { user } = useSelector((state) => ({ ...state }));

  // State for transaction updates
  const [transactionUpdateTrigger, setTransactionUpdateTrigger] = useState(0);

  // Use the token refresh hook (only one token refresh mechanism)
  useTokenRefresh();

  // Handler for transaction updates
  const handleTransactionUpdate = () => {
    setTransactionUpdateTrigger((prev) => prev + 1);
  };

  return (
    <Suspense fallback={<SuspenseLoading />}>
      <Router>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              style: {
                background: "green",
              },
            },
            error: {
              style: {
                background: "red",
              },
            },
          }}
        />
        <Header />
        <Switch>
          {/* Public Routes (Unprotected) */}
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/forgot/password" component={ForgotPassword} />
          <Route exact path="/register" component={Registration} />
          <Route exact path="/otpVerification" component={OTPVerification} />
          <Route exact path="/register/complete" component={RegisterComplete} />
          <Route exact path="/contact" component={Contact} />
          {/* Semi-protected routes (accessible to all, but require login for full functionality) */}
          <Route exact path="/plans" component={Plans} />
          <Route exact path="/tasks" component={Tasks} />
          <Route exact path="/team" component={Team} />
          <Route exact path="/terms" component={TermsAndConditions} />
          <Route exact path="/privacy" component={PrivacyPolicy} />
          <Route exact path="/cookies" component={CookiePolicy} />
          {/* User Protected Routes */}
          <UserRoute exact path="/dashboard">
            <Layout onTransactionUpdate={handleTransactionUpdate}>
              <Dashboard />
            </Layout>
          </UserRoute>
          <UserRoute exact path="/wallet">
            <Layout onTransactionUpdate={handleTransactionUpdate}>
              <Wallet />
            </Layout>
          </UserRoute>
          <UserRoute exact path="/invest">
            <Layout onTransactionUpdate={handleTransactionUpdate}>
              <Invest />
            </Layout>
          </UserRoute>
          <UserRoute exact path="/history">
            <Layout onTransactionUpdate={handleTransactionUpdate}>
              <History refreshTrigger={transactionUpdateTrigger} />
            </Layout>
          </UserRoute>
          <UserRoute exact path="/profile">
            <Layout onTransactionUpdate={handleTransactionUpdate}>
              <Profile />
            </Layout>
          </UserRoute>
          <UserRoute exact path="/deposit">
            <Deposit />
          </UserRoute>
          {/* Admin Protected Routes */}
          <AdminRoute exact path="/admin">
            <AdminDashboard />
          </AdminRoute>
          <AdminRoute exact path="/admin/analytics">
            <AdminAnalytics />
          </AdminRoute>
          <AdminRoute exact path="/admin/tasks">
            <AdminTasks />
          </AdminRoute>
          <AdminRoute exact path="/admin/taskverification">
            <TaskVerification />
          </AdminRoute>
          <AdminRoute exact path="/admin/deposits">
            <AdminDeposits />
          </AdminRoute>
          <AdminRoute exact path="/admin/withdrawals">
            <AdminWithdrawals />
          </AdminRoute>
          <AdminRoute exact path="/admin/users">
            <UserManagement />
          </AdminRoute>
          <AdminRoute exact path="/admin/contact-messages">
            <ContactMessages />
          </AdminRoute>
          {/* 404 Page */}
          <Route path="*" component={NotFound} />
        </Switch>
        <Headerbottom />
        <Footer />
      </Router>
    </Suspense>
  );
}

export default App;
