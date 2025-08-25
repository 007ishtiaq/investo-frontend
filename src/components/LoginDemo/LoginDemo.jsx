import React from "react";
import "./LoginDemo.css";
import { User, Shield } from "lucide-react"; // for icons

const LoginDemo = () => {
  return (
    <div className="login-demo-container">
      <div className="login-card">
        <h2 className="login-title">🔑 Demo Login Credentials</h2>
        <p className="login-subtitle">
          Use the following credentials to explore the app as Admin or User.
        </p>

        <div className="login-credentials">
          <div className="cred-box">
            <div className="cred-head">
              <Shield className="cred-icon" />
              <h3 className="cred-title">Admin Login</h3>
            </div>

            <p>
              <strong>Email:</strong> qwertyuiop3009975@gmail.com
            </p>
            <p>
              <strong>Password:</strong> admin123
            </p>
          </div>

          <div className="cred-box">
            <div className="cred-head">
              <User className="cred-icon" />
              <h3 className="cred-title">User Login</h3>
            </div>
            <p>
              <strong>Email:</strong> qwertyuiopplm2221@gmail.com
            </p>
            <p>
              <strong>Password:</strong> user123
            </p>
          </div>
        </div>

        <p className="purchase-note">
          🚀 This is a demo application. To purchase the full version, contact
          us at:
          <br />
          📞 <strong>0307-6570551</strong> | 💬 WhatsApp available
        </p>
      </div>
    </div>
  );
};

export default LoginDemo;
