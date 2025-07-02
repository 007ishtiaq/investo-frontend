// client/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getUsers, updateUserLevel } from "../../functions/user";
import { formatBalance } from "../../functions/wallet";
import "./UserManagement.css";

const UserManagement = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers(currentPage, searchTerm);
  }, [currentPage]);

  useEffect(() => {
    // Debounce search to avoid too many API calls
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on new search
      loadUsers(1, searchTerm);
    }, 500);

    setDebounceTimeout(timeoutId);

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [searchTerm]);

  const loadUsers = async (page, email = "") => {
    try {
      setLoading(true);
      const data = await getUsers(user.token, page, itemsPerPage, email);
      setUsers(data.users);
      setCurrentPage(data.pagination.currentPage);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
      setLoading(false);
    } catch (error) {
      toast.error(error.message || "Error loading users");
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
      await updateUserLevel(activeUser._id, selectedLevel, user.token);
      // Update local user data
      const updatedUsers = users.map((u) =>
        u._id === activeUser._id ? { ...u, level: selectedLevel } : u
      );
      setUsers(updatedUsers);
      toast.success(`User level updated to ${selectedLevel}`);
      closeUserModal();
      setLoading(false);
    } catch (error) {
      toast.error(error.message || "Failed to update user level");
      setLoading(false);
    }
  };

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

  const getBalanceClass = (balance) => {
    if (balance === 0) return "balance-zero";
    if (balance >= 1000) return "balance-high";
    return "balance-positive";
  };

  return (
    <div className="user-management-page">
      <div className="container">
        <div className="page-header">
          <h1>User Management</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div className="loading-spinner">Loading...</div>
        ) : users.length === 0 ? (
          <div className="no-users">
            <p>No users found.</p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Level</th>
                  <th>Balance</th>
                  <th>Team</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name || "-"}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`level-badge-user ${getLevelBadgeClass(
                          u.level || 1
                        )}`}
                      >
                        Level {u.level || 1}
                      </span>
                    </td>
                    <td
                      className={`user-balance-manage ${getBalanceClass(
                        u.wallet?.balance || 0
                      )}`}
                    >
                      {formatBalance(u.wallet?.balance || 0, "USD")}
                    </td>
                    <td className="team-cell">
                      <span className="team-count">{u.team?.count || 0}</span>
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

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="pagination">
                <button
                  className="page-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages} ({totalItems} users)
                </span>
                <button
                  className="page-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </button>
              </div>
            )}
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
                      {activeUser.name || "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{activeUser.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Current Level:</span>
                    <span
                      className={`level-badge-user ${getLevelBadgeClass(
                        activeUser.level || 1
                      )}`}
                    >
                      Level {activeUser.level || 1}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Wallet Balance:</span>
                    <span
                      className={`detail-value ${getBalanceClass(
                        activeUser.wallet?.balance || 0
                      )}`}
                    >
                      {formatBalance(activeUser.wallet?.balance || 0, "USD")}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Team Members:</span>
                    <span className="detail-value">
                      {activeUser.team?.count || 0}
                    </span>
                  </div>
                  {activeUser.team?.members &&
                    activeUser.team.members.length > 0 && (
                      <div className="team-members-list">
                        <h4>Team Members</h4>
                        <ul>
                          {activeUser.team.members.map((member) => (
                            <li key={member._id} className="team-member">
                              <span className="member-name">{member.name}</span>
                              <span className="member-email">
                                {member.email}
                              </span>
                              <span
                                className={`member-level ${getLevelBadgeClass(
                                  member.level
                                )}`}
                              >
                                Level {member.level}
                              </span>
                            </li>
                          ))}
                          {activeUser.team.count >
                            activeUser.team.members.length && (
                            <li className="more-members">
                              +
                              {activeUser.team.count -
                                activeUser.team.members.length}{" "}
                              more members
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
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
