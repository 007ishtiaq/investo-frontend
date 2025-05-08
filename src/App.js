import React, { Suspense } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./pages/Home";
import NotFound from "./pages/not-found";
import "./App.css";
import Footer from "./components/Footer/Footer";
import Headerbottom from "./components/Header/Headerbottom";
import Tasks from "./pages/Tasks";
import Login from "./pages/Login/Login";
import Registration from "./pages/Registration/Registration";
import OTPVerification from "./pages/OtpVerification/OtpVerification";
import RegisterComplete from "./pages/RegisterComplete/RegisterComplete";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminAnalytics from "./pages/Admin/AdminAnalytics";
import AdminTasks from "./pages/Admin/AdminTasks";
import TaskVerification from "./pages/Admin/TaskVerification";
import Wallet from "./pages/Wallet";
import Team from "./pages/Team";
import Plans from "./pages/Plans";
import Deposit from "./pages/Deposit";
import AdminDeposits from "./pages/Admin/AdminDeposits";
import AdminWithdrawals from "./pages/Admin/AdminWithdrawals";
import UserManagement from "./pages/Admin/UserManagement";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/User/Dashboard";
import Invest from "./pages/User/Invest";
import History from "./pages/User/History";
import Profile from "./pages/User/Profilepage";
import Contact from "./pages/Contact";

function App() {
  return (
    <Suspense>
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
          {/* common unprotected Routes */}
          <Route exact path="/" component={Home} />
          <Route exact path="/tasks" component={Tasks} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Registration} />
          <Route exact path="/otpVerification" component={OTPVerification} />
          <Route exact path="/register/complete" component={RegisterComplete} />

          <Route path="/team" component={Team} />
          <Route path="/plans" component={Plans} />
          <Route path="/contact" component={Contact} />

          {/* Dashboard route with Layout */}
          <Route path="/dashboard">
            <Layout>
              <Dashboard />
            </Layout>
          </Route>

          {/* Wallet route with Layout */}
          <Route exact path="/wallet">
            <Layout>
              <Wallet />
            </Layout>
          </Route>

          {/* Invest route with Layout */}
          <Route exact path="/invest">
            <Layout>
              <Invest />
            </Layout>
          </Route>

          {/* History route with Layout */}
          <Route exact path="/history">
            <Layout>
              <History />
            </Layout>
          </Route>

          {/* Profile route with Layout */}
          <Route exact path="/profile">
            <Layout>
              <Profile />
            </Layout>
          </Route>

          {/* Admin routes */}
          <Route path="/admin" exact component={AdminDashboard} />
          <Route path="/admin/tasks" component={AdminTasks} />
          <Route path="/admin/taskverification" component={TaskVerification} />
          <Route path="/deposit" component={Deposit} />
          <Route path="/admin/deposits" component={AdminDeposits} />
          <Route exact path="/admin/withdrawals" component={AdminWithdrawals} />
          <Route path="/admin/users" component={UserManagement} />
          <Route path="/admin/analytics" component={AdminAnalytics} />

          {/* <Route exact path="*" component={NotFound} /> */}
          <Route path="*" component={NotFound} />
        </Switch>
        <Headerbottom />
        <Footer />
      </Router>
    </Suspense>
  );
}

export default App;
