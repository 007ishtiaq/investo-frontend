import React, { Suspense } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./pages/Home";
import NotFound from "./pages/not-found";
import "./App.css";
import Footer from "./components/Footer/Footer";
import Headerbottom from "./components/Header/Headerbottom";
import Tasks from "./pages/Tasks";

function App() {
  return (
    <Suspense>
      <Router>
        <Header />
        <Switch>
          {/* common unprotected Routes */}
          <Route exact path="/" component={Home} />
          <Route path="/tasks" component={Tasks} />

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
