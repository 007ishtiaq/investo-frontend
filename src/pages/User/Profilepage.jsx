import React, { useState, useEffect, useRef } from "react";
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
import { User, Mail, Key, Shield, Bell, Camera } from "lucide-react";
import TwoFactorAuth from "../../components/TwoFactorAuth/TwoFactorAuth";
import { useSelector, useDispatch } from "react-redux";
import {
  getCurrentUser,
  updateUserProfile,
  updateNotificationPreferences,
} from "../../functions/user";
import firebase, { auth } from "../../firebase";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import NoNetModal from "../../components/NoNetModal/NoNetModal";
import "./Profile.css";
import { Link } from "react-router-dom";
import { Edit2 } from "lucide-react";

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
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [noNetModal, setNoNetModal] = useState(false);
  const fileInputRef = useRef(null);
  // Email notification preferences
  const [notifDeposits, setNotifDeposits] = useState(true);
  const [notifEarnings, setNotifEarnings] = useState(true);
  const [notifPromotions, setNotifPromotions] = useState(false);
  const [notifSecurity, setNotifSecurity] = useState(true);

  const dispatch = useDispatch(); // Add this line

  // Add network status monitoring
  useEffect(() => {
    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        setNoNetModal(false);
      }
    };

    const handleOfflineStatus = () => {
      setNoNetModal(true);
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOfflineStatus);

    // Check initial status
    if (!navigator.onLine) {
      setNoNetModal(true);
    }

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOfflineStatus);
    };
  }, []);

  useEffect(() => {
    if (user && user.token) {
      loadUserProfile();
    }
  }, [user?.token, hasLoadedProfile]);

  const loadUserProfile = async () => {
    // Check network status before making API call
    if (!navigator.onLine) {
      setNoNetModal(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getCurrentUser(user.token);
      setProfileData(res.data);

      setName(res.data.name);
      setPhone(res.data.contact || "");
      // Set notification preferences if available
      if (res.data.notifications) {
        setNotifDeposits(res.data.notifications.deposits !== false);
        setNotifEarnings(res.data.notifications.earnings !== false);
        setNotifPromotions(res.data.notifications.promotions === true);
        setNotifSecurity(res.data.notifications.security !== false);
      }

      // UPDATE REDUX STORE AND LOCAL STORAGE with fresh data from server
      const updatedUser = {
        ...user,
        name: res.data.name,
        email: res.data.email,
        profileImage: res.data.profileImage || null,
        contact: res.data.contact,
        // Add any other fields that might be in the response
        role: res.data.role || user.role,
        _id: res.data._id || user._id,
        balance: res.data.balance || user.balance,
        // Keep the token from current user state
        token: user.token,
      };
      // Dispatch to Redux store
      dispatch({
        type: "LOGGED_IN_USER",
        payload: updatedUser,
      });
      // Update localStorage
      if (window !== undefined) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      setHasLoadedProfile(true);

      setLoading(false);
    } catch (err) {
      console.error("Failed to load profile:", err);

      // Check if it's a network error
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        toast.error("Failed to load user profile");
      }
      setLoading(false);
    }
  };
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate file type
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
    ];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or GIF)");
      return;
    }
    // Validate file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }
    // Set the file for upload
    setProfileImage(file);
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      document.querySelector(
        ".profile-avatar-fallback"
      ).style.backgroundImage = `url(${reader.result})`;
      document.querySelector(".profile-avatar-fallback").innerHTML = "";
    };
    reader.readAsDataURL(file);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check network status before submitting
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    try {
      setSaving(true);
      const userData = {
        name,
        contact: phone,
      };
      // Add profile image to update data if available
      if (profileImage) {
        userData.profileImage = profileImage;
      }
      const res = await updateUserProfile(user.token, userData);
      setProfileData(res.data);
      console.log(res.data);

      // UPDATE REDUX STORE AND LOCAL STORAGE
      const updatedUser = {
        ...user,
        name: res.data.name,
        profileImage: res.data.profileImage || null,
        // Add any other fields that might have been updated
        contact: res.data.contact,
      };
      // Dispatch to Redux store
      dispatch({
        type: "LOGGED_IN_USER",
        payload: updatedUser,
      });
      // Update localStorage
      if (window !== undefined) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      toast.success("Profile updated successfully");

      // Reset the file input and state after successful update
      if (profileImage) {
        setProfileImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }

      setSaving(false);
    } catch (err) {
      console.error("Failed to update profile:", err);

      // Check if it's a network error
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        toast.error("Failed to update profile");
      }
      setSaving(false);
    }
  };
  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };
  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    // Check network status before submitting
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    try {
      setSavingPreferences(true);
      const notificationPreferences = {
        deposits: notifDeposits,
        earnings: notifEarnings,
        promotions: notifPromotions,
        security: notifSecurity,
      };
      const res = await updateNotificationPreferences(
        user.token,
        notificationPreferences
      );
      if (res.data) {
        setProfileData({
          ...profileData,
          notifications: notificationPreferences,
        });
        toast.success("Notification preferences updated successfully");
      }
      setSavingPreferences(false);
    } catch (err) {
      console.error("Failed to update notification preferences:", err);

      // Check if it's a network error
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        toast.error("Failed to update notification preferences");
      }
      setSavingPreferences(false);
    }
  };

  const handleRetry = () => {
    if (navigator.onLine) {
      setNoNetModal(false);
      if (user && user.token && !profileData) {
        loadUserProfile();
      }
    } else {
      toast.error("Still no internet connection. Please check your network.");
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
      // Check network status before submitting
      if (!navigator.onLine) {
        setNoNetModal(true);
        return;
      }

      try {
        setUpdatingPassword(true);
        // Get current user
        const currentUser = auth.currentUser;
        if (currentUser) {
          // For Firebase v8
          const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            values.currentPassword
          );
          try {
            // First reauthenticate with current password
            await currentUser.reauthenticateWithCredential(credential);
            // If reauthentication successful, update password
            await currentUser.updatePassword(values.password);
            toast.success("Password updated successfully");
            action.resetForm();
          } catch (error) {
            console.error("Reauthentication failed:", error);
            if (error.code === "auth/wrong-password") {
              toast.error("Current password is incorrect");
            } else {
              toast.error("Authentication failed. Please try again.");
            }
          }
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
      } finally {
        setUpdatingPassword(false);
      }
    },
  });
  if (loading || !profileData) {
    return (
      <>
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

        <NoNetModal
          classDisplay={noNetModal ? "show" : ""}
          setNoNetModal={setNoNetModal}
          handleRetry={handleRetry}
        />
      </>
    );
  }
  return (
    <>
      <Card className="profile-header-card">
        <CardContent className="profile-header-content">
          <div className="profile-header">
            <div className="profile-avatar-container">
              <div
                className="profile-avatar-fallback"
                style={{
                  backgroundImage: profileData.profileImage
                    ? `url(${profileData.profileImage})`
                    : "",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!profileData.profileImage && getUserInitials(profileData.name)}
              </div>
              <div className="profile-edit-button" onClick={handleImageClick}>
                <Edit2 size={14} />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: "none" }}
            />
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
              <CardTitle>Password Update</CardTitle>
              <CardDescription>
                Choose a strong password that is at least 6 characters long and
                contains a mix of letters, numbers, and symbols.
              </CardDescription>
            </CardHeader>
            <form onSubmit={passwordFormik.handleSubmit}>
              <CardContent className="profile-form">
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

                {/* <div className="security-section">
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
                </div> */}
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
              <CardTitle>
                <div className="tab-head-title">
                  <Bell className="feature-icon" />{" "}
                  <div> Notification Preferences </div>
                </div>
              </CardTitle>
              <CardDescription>
                Manage how and when we notify you.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleNotificationSubmit}>
              <CardContent className="notification-settings">
                <div className="feature-section">
                  <div className="notification-options">
                    <div className="option-grid">
                      <div className="checkbox-option">
                        <input
                          type="checkbox"
                          id="email-deposits"
                          className="checkbox-input"
                          checked={notifDeposits}
                          onChange={(e) => setNotifDeposits(e.target.checked)}
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
                          checked={notifEarnings}
                          onChange={(e) => setNotifEarnings(e.target.checked)}
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
                          checked={notifPromotions}
                          onChange={(e) => setNotifPromotions(e.target.checked)}
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
                          checked={notifSecurity}
                          onChange={(e) => setNotifSecurity(e.target.checked)}
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
                <Button type="submit" disabled={savingPreferences}>
                  {savingPreferences ? "Saving..." : "Save Preferences"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>

      <NoNetModal
        classDisplay={noNetModal ? "show" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleRetry}
      />
    </>
  );
};

export default Profile;
