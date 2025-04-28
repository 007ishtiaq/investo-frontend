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
import AdminTasks from "./pages/Admin/AdminTasks";
import TaskVerification from "./pages/Admin/TaskVerification";
import Wallet from "./pages/Wallet";
import Team from "./pages/Team";
import Plans from "./pages/Plans";

function App() {
  return (
    <Suspense>
      <Router>
        <Header />
        <Switch>
          {/* common unprotected Routes */}
          <Route exact path="/" component={Home} />
          <Route exact path="/tasks" component={Tasks} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Registration} />
          <Route exact path="/otpVerification" component={OTPVerification} />
          <Route exact path="/register/complete" component={RegisterComplete} />
          <Route exact path="/wallet" component={Wallet} />
          <Route path="/team" component={Team} />
          <Route path="/plans" component={Plans} />

          {/* Admin routes */}
          <Route path="/admin" exact component={AdminDashboard} />
          <Route path="/admin/tasks" component={AdminTasks} />
          <Route path="/admin/taskverification" component={TaskVerification} />

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
