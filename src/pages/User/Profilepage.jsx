import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { User, Mail, Key, Shield, Bell, LogOut } from "lucide-react";
import TwoFactorAuth from "../../components/TwoFactorAuth/TwoFactorAuth";
import { useSelector } from "react-redux";
import { getCurrentUser, updateUserProfile } from "../../functions/user";
import toast from "react-hot-toast";
import "./Profile.css";

// Custom FormLabel component instead of using the UI Label
const FormLabel = ({ htmlFor, children }) => {
  return (
    <label htmlFor={htmlFor} className="form-label">
      {children}
    </label>
  );
};

const Profile = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.token) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUser(user.token);
      setProfileData(res.data);
      setName(res.data.name);
      setPhone(res.data.contact || "");
      setLoading(false);
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error("Failed to load user profile");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateUserProfile(user.token, {
        name,
        contact: phone,
      });
      setProfileData(res.data);
      toast.success("Profile updated successfully");
      setSaving(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to update profile");
      setSaving(false);
    }
  };

  if (loading || !profileData) {
    return (
      <div className="skeleton-container">
        <Card className="skeleton-header-card">
          <CardContent className="skeleton-header-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="skeleton-card-title"></div>
          </CardHeader>
          <CardContent>
            <div className="skeleton-card-content"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Card className="profile-header-card">
        <CardContent className="profile-header-content">
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="profile-avatar-fallback">
                {profileData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </div>
            <div className="profile-header-info">
              <h1 className="profile-title">{profileData.name}</h1>
              <p className="profile-description">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="profile-tabs">
        <div className="tabs-list">
          <button
            className={`tab-trigger ${
              activeTab === "profile" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`tab-trigger ${
              activeTab === "security" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
          <button
            className={`tab-trigger ${
              activeTab === "notifications" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
        </div>

        {activeTab === "profile" && (
          <Card className="tab-content">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="profile-form">
                <div className="profile-form-grid">
                  <div className="form-group">
                    <FormLabel htmlFor="name">Full Name</FormLabel>
                    <div className="input-with-icon">
                      <div className="input-icon-wrapper">
                        <User className="input-icon" />
                      </div>
                      <Input
                        id="name"
                        className="input-with-prefix"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <FormLabel htmlFor="affiliateCode">
                      Affiliate Code
                    </FormLabel>
                    <div className="input-with-icon">
                      <div className="input-icon-wrapper">
                        <User className="input-icon" />
                      </div>
                      <Input
                        id="affiliateCode"
                        className="input-with-prefix"
                        value={profileData.affiliateCode}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <FormLabel htmlFor="email">Email Address</FormLabel>
                    <div className="input-with-icon">
                      <div className="input-icon-wrapper">
                        <Mail className="input-icon" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        className="input-with-prefix"
                        value={profileData.email}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <FormLabel htmlFor="phone">Phone Number</FormLabel>
                    <div className="input-with-icon">
                      <div className="input-icon-wrapper">
                        <span className="input-emoji">📱</span>
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        className="input-with-prefix"
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="card-footer">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {activeTab === "security" && (
          <Card className="tab-content">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Update your password and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="profile-form">
              <div className="form-group">
                <FormLabel htmlFor="current-password">
                  Current Password
                </FormLabel>
                <div className="input-with-icon">
                  <div className="input-icon-wrapper">
                    <Key className="input-icon" />
                  </div>
                  <Input
                    id="current-password"
                    type="password"
                    className="input-with-prefix"
                  />
                </div>
              </div>

              <div className="profile-form-grid">
                <div className="form-group">
                  <FormLabel htmlFor="new-password">New Password</FormLabel>
                  <div className="input-with-icon">
                    <div className="input-icon-wrapper">
                      <Key className="input-icon" />
                    </div>
                    <Input
                      id="new-password"
                      type="password"
                      className="input-with-prefix"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <FormLabel htmlFor="confirm-password">
                    Confirm New Password
                  </FormLabel>
                  <div className="input-with-icon">
                    <div className="input-icon-wrapper">
                      <Key className="input-icon" />
                    </div>
                    <Input
                      id="confirm-password"
                      type="password"
                      className="input-with-prefix"
                    />
                  </div>
                </div>
              </div>

              <div className="security-section">
                <h3 className="section-title">Two-Factor Authentication</h3>

                {showTwoFactorAuth ? (
                  <TwoFactorAuth />
                ) : (
                  <div className="feature-section">
                    <Shield className="feature-icon" />
                    <div>
                      <p className="feature-description">
                        Two-factor authentication adds an extra layer of
                        security to your account by requiring more than just a
                        password to sign in.
                      </p>
                      <Button
                        variant="outline"
                        className="feature-button"
                        onClick={() => setShowTwoFactorAuth(true)}
                      >
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="card-footer">
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        )}

        {activeTab === "notifications" && (
          <Card className="tab-content">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when we notify you.
              </CardDescription>
            </CardHeader>
            <CardContent className="notification-settings">
              <div className="feature-section">
                <Bell className="feature-icon" />
                <div className="notification-options">
                  <h3 className="section-title">Email Notifications</h3>
                  <div className="option-grid">
                    <div className="checkbox-option">
                      <input
                        type="checkbox"
                        id="email-deposits"
                        className="checkbox-input"
                        defaultChecked
                      />
                      <FormLabel htmlFor="email-deposits">
                        Deposits and withdrawals
                      </FormLabel>
                    </div>
                    <div className="checkbox-option">
                      <input
                        type="checkbox"
                        id="email-earnings"
                        className="checkbox-input"
                        defaultChecked
                      />
                      <FormLabel htmlFor="email-earnings">
                        Daily earnings updates
                      </FormLabel>
                    </div>
                    <div className="checkbox-option">
                      <input
                        type="checkbox"
                        id="email-promotions"
                        className="checkbox-input"
                      />
                      <FormLabel htmlFor="email-promotions">
                        Promotions and news
                      </FormLabel>
                    </div>
                    <div className="checkbox-option">
                      <input
                        type="checkbox"
                        id="email-security"
                        className="checkbox-input"
                        defaultChecked
                      />
                      <FormLabel htmlFor="email-security">
                        Security alerts
                      </FormLabel>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="card-footer">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
};

export default Profile;
