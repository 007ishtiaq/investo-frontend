// client/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import "./UserManagement.css";

const UserManagement = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setUsers(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Load users error:", error);
      toast.error("Error loading users");
      setLoading(false);
    }
  };

  const openUserModal = (user) => {
    setActiveUser(user);
    setSelectedLevel(user.level || 1);
  };

  const closeUserModal = () => {
    setActiveUser(null);
  };

  const handleLevelUpdate = async () => {
    try {
      setLoading(true);
      await axios.put(
        `/api/admin/user/${activeUser._id}/level`,
        {
          level: selectedLevel,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      // Update local user data
      const updatedUsers = users.map((u) =>
        u._id === activeUser._id ? { ...u, level: selectedLevel } : u
      );
      setUsers(updatedUsers);

      toast.success(`User level updated to ${selectedLevel}`);
      closeUserModal();
      setLoading(false);
    } catch (error) {
      console.error("Update user level error:", error);
      toast.error("Failed to update user level");
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.username && user.username.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 4:
        return "level-4";
      case 3:
        return "level-3";
      case 2:
        return "level-2";
      default:
        return "level-1";
    }
  };

  return (
    <div className="user-management-page">
      <div className="container">
        <div className="page-header">
          <h1>User Management</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by email or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div className="loading-spinner">Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="no-users">
            <p>No users found.</p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Level</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.username || "-"}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`level-badge ${getLevelBadgeClass(
                          u.level || 1
                        )}`}
                      >
                        Level {u.level || 1}
                      </span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td className="actions-cell">
                      <button
                        className="edit-button"
                        onClick={() => openUserModal(u)}
                      >
                        Edit Level
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeUser && (
          <div className="modal-overlay">
            <div className="user-edit-modal">
              <div className="modal-header">
                <h2>Edit User Level</h2>
                <button className="close-button" onClick={closeUserModal}>
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="user-details">
                  <div className="detail-row">
                    <span className="detail-label">Username:</span>
                    <span className="detail-value">
                      {activeUser.username || "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{activeUser.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Current Level:</span>
                    <span
                      className={`level-badge ${getLevelBadgeClass(
                        activeUser.level || 1
                      )}`}
                    >
                      Level {activeUser.level || 1}
                    </span>
                  </div>
                </div>

                <div className="level-selection">
                  <h3>Select New Level</h3>
                  <div className="level-buttons">
                    {[1, 2, 3, 4].map((level) => (
                      <button
                        key={level}
                        className={`level-button ${
                          selectedLevel === level ? "selected" : ""
                        } level-${level}`}
                        onClick={() => setSelectedLevel(level)}
                      >
                        Level {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="level-benefits">
                  <h3>Level {selectedLevel} Benefits</h3>
                  <ul className="benefits-list">
                    {selectedLevel >= 1 && (
                      <li>Access to basic investment plans</li>
                    )}
                    {selectedLevel >= 2 && (
                      <li>Access to standard investment plans</li>
                    )}
                    {selectedLevel >= 3 && (
                      <li>Access to premium investment plans</li>
                    )}
                    {selectedLevel >= 4 && (
                      <li>Access to elite investment plans</li>
                    )}
                    {selectedLevel >= 2 && <li>Higher daily profits</li>}
                    {selectedLevel >= 3 && (
                      <li>Priority customer support access</li>
                    )}
                    {selectedLevel >= 4 && (
                      <li>VIP investment opportunities</li>
                    )}
                  </ul>
                </div>

                <div className="modal-actions">
                  <button
                    className="cancel-button"
                    onClick={closeUserModal}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="save-button"
                    onClick={handleLevelUpdate}
                    disabled={loading || selectedLevel === activeUser.level}
                  >
                    {loading ? "Updating..." : "Update Level"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
