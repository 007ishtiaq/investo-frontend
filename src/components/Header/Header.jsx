import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { WalletIcon, MenuIcon } from "../../utils/icons";
import { useIsMobile } from "../../hooks/use-mobile";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../actions/auth";
import { getUserWallet, formatBalance } from "../../functions/wallet";
import "./Header.css";

const Header = () => {
  const isMobile = useIsMobile();
  const dispatch = useDispatch();
  const history = useHistory();
  const { user } = useSelector((state) => ({ ...state }));
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletCurrency, setWalletCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);

  // Fetch wallet balance when user is logged in
  useEffect(() => {
    if (user && user.token) {
      fetchWalletBalance();
    }
  }, [user]);

  const fetchWalletBalance = async () => {
    setLoading(true);
    try {
      // Pass the auth token to the function
      const res = await getUserWallet(user.token);

      // Check if we have data and access the data property from the axios response
      if (res && res.data && res.data.balance !== undefined) {
        setWalletBalance(res.data.balance);
        if (res.data.currency) {
          setWalletCurrency(res.data.currency);
        }
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    if (window !== undefined) {
      localStorage.removeItem("user");
    }
    history.push("/login");
  };

  // Determine dashboard path based on user role
  const dashboardPath = user && user.role === "admin" ? "/admin" : "/user";

  return (
    <header className="header">
      <div className="header-content container">
        {/* Logo */}
        <div className="logo">
          <Link to="/" className="logo-link">
            <div className="logo-icon gradient-bg">
              <span>T</span>
            </div>
            <span className="logo-text">TreasureNFT</span>
          </Link>
        </div>

        {/* Navigation */}
        {!isMobile && (
          <nav className="main-nav">
            <Link to={dashboardPath} className="nav-link">
              Dashboard
            </Link>
            <Link to="/tasks" className="nav-link">
              Tasks
            </Link>
            <Link to="/team" className="nav-link">
              My Team
            </Link>
            <Link to="/vip" className="nav-link">
              VIP
            </Link>
            <Link to="/profile" className="nav-link">
              Me
            </Link>
          </nav>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          {!user ? (
            <>
              {!isMobile && (
                <Link to="/register" className="create-button">
                  Sign Up
                </Link>
              )}
              <Link
                to="/login"
                className="connect-wallet-button gradient-bg wallet-button"
              >
                <WalletIcon size={16} />
                <span>Login</span>
              </Link>
            </>
          ) : (
            <div className="user-auth-section">
              <Link to="/wallet" className="user-balance">
                <WalletIcon size={16} />
                <span>
                  {loading
                    ? "Loading..."
                    : formatBalance(walletBalance, walletCurrency)}
                </span>
              </Link>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          )}

          {isMobile && (
            <button className="menu-button">
              <MenuIcon size={24} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
