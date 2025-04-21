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
// import OTPVerification from "./pages/OtpVerification/OtpVerification";

function App() {
  return (
    <Suspense>
      <Router>
        <Header />
        <Switch>
          {/* common unprotected Routes */}
          <Route exact path="/" component={Home} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Registration} />
          {/* <Route path="/otpVerification" component={OTPVerification} /> */}

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
