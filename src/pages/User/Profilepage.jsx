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
import { User, Mail, Key, Shield, Bell } from "lucide-react";
import TwoFactorAuth from "../../components/TwoFactorAuth/TwoFactorAuth";
import { useSelector } from "react-redux";
import { getCurrentUser, updateUserProfile } from "../../functions/user";
import { auth } from "../../firebase";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./Profile.css";

// Custom FormLabel component instead of using the UI Label
const FormLabel = ({ htmlFor, children }) => {
  return (
    <label htmlFor={htmlFor} className="form-label">
      {children}
    </label>
  );
};

// Password change validation schema
const passwordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  password: Yup.string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
  confirm_password: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
});

const Profile = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

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

  // Password formik setup
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, action) => {
      try {
        setUpdatingPassword(true);

        // Get current user
        const currentUser = auth.currentUser;
        const credential = auth.EmailAuthProvider.credential(
          currentUser.email,
          values.currentPassword
        );

        if (currentUser) {
          // First reauthenticate with current password
          await currentUser
            .reauthenticateWithCredential(credential)
            .then(async () => {
              // If reauthentication successful, update password
              await currentUser.updatePassword(values.password);
              toast.success("Password updated successfully");
              action.resetForm();
              setUpdatingPassword(false);
            })
            .catch((error) => {
              console.error("Reauthentication failed:", error);
              if (error.code === "auth/wrong-password") {
                toast.error("Current password is incorrect");
              } else {
                toast.error("Authentication failed. Please try again.");
              }
              setUpdatingPassword(false);
            });
        } else {
          throw new Error("User not authenticated");
        }
      } catch (err) {
        console.error("Failed to update password:", err);

        // Handle specific errors
        if (err.code === "auth/requires-recent-login") {
          toast.error(
            "For security reasons, please log in again before changing your password"
          );
        } else {
          toast.error(err.message || "Failed to update password");
        }

        setUpdatingPassword(false);
      }
    },
  });

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
            <form onSubmit={passwordFormik.handleSubmit}>
              <CardContent className="profile-form">
                <div className="form-group password-form-section">
                  <h3 className="section-title">Password Update</h3>
                  <p className="section-description">
                    Choose a strong password that is at least 6 characters long
                    and contains a mix of letters, numbers, and symbols.
                  </p>
                </div>

                <div className="form-group">
                  <FormLabel htmlFor="currentPassword">
                    Current Password
                  </FormLabel>
                  <div className="input-with-icon">
                    <div className="input-icon-wrapper">
                      <Key className="input-icon" />
                    </div>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      className="input-with-prefix"
                      placeholder="Enter your current password"
                      value={passwordFormik.values.currentPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                    />
                  </div>
                  {passwordFormik.touched.currentPassword &&
                  passwordFormik.errors.currentPassword ? (
                    <div className="form-error-message">
                      {passwordFormik.errors.currentPassword}
                    </div>
                  ) : null}
                </div>

                <div className="profile-form-grid">
                  <div className="form-group">
                    <FormLabel htmlFor="password">New Password</FormLabel>
                    <div className="input-with-icon">
                      <div className="input-icon-wrapper">
                        <Key className="input-icon" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        className="input-with-prefix"
                        placeholder="Enter new password"
                        value={passwordFormik.values.password}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                      />
                    </div>
                    {passwordFormik.touched.password &&
                    passwordFormik.errors.password ? (
                      <div className="form-error-message">
                        {passwordFormik.errors.password}
                      </div>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <FormLabel htmlFor="confirm_password">
                      Confirm New Password
                    </FormLabel>
                    <div className="input-with-icon">
                      <div className="input-icon-wrapper">
                        <Key className="input-icon" />
                      </div>
                      <Input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        className="input-with-prefix"
                        placeholder="Confirm your new password"
                        value={passwordFormik.values.confirm_password}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                      />
                    </div>
                    {passwordFormik.touched.confirm_password &&
                    passwordFormik.errors.confirm_password ? (
                      <div className="form-error-message">
                        {passwordFormik.errors.confirm_password}
                      </div>
                    ) : null}
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
                <Button
                  type="submit"
                  disabled={
                    updatingPassword ||
                    !passwordFormik.values.currentPassword ||
                    !passwordFormik.values.password ||
                    !passwordFormik.values.confirm_password ||
                    passwordFormik.isSubmitting
                  }
                >
                  {updatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </form>
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

              <div className="notification-divider"></div>

              <div className="feature-section">
                <span className="feature-emoji">📱</span>
                <div className="notification-options">
                  <h3 className="section-title">Push Notifications</h3>
                  <div className="option-grid">
                    <div className="checkbox-option">
                      <input
                        type="checkbox"
                        id="push-deposits"
                        className="checkbox-input"
                        defaultChecked
                      />
                      <FormLabel htmlFor="push-deposits">
                        Deposits and withdrawals
                      </FormLabel>
                    </div>
                    <div className="checkbox-option">
                      <input
                        type="checkbox"
                        id="push-earnings"
                        className="checkbox-input"
                        defaultChecked
                      />
                      <FormLabel htmlFor="push-earnings">
                        Daily earnings updates
                      </FormLabel>
                    </div>
                    <div className="checkbox-option">
                      <input
                        type="checkbox"
                        id="push-promotions"
                        className="checkbox-input"
                      />
                      <FormLabel htmlFor="push-promotions">
                        Promotions and news
                      </FormLabel>
                    </div>
                    <div className="checkbox-option">
                      <input
                        type="checkbox"
                        id="push-security"
                        className="checkbox-input"
                        defaultChecked
                      />
                      <FormLabel htmlFor="push-security">
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
