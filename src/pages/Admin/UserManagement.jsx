// client/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getUsers } from "../../functions/user";
import { formatBalance } from "../../functions/wallet";
import "./UserManagement.css";

const UserManagement = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const itemsPerPage = 20;

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
      case 1:
        return "level-1";
      case 0:
      default:
        return "level-0"; // Added level-0 class for level 0 users
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
                  <th>Total Investment</th>
                  <th>Team</th>
                  <th>Joined</th>
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
                          u.level !== undefined ? u.level : 0 // Default to 0 if level is undefined
                        )}`}
                      >
                        {u.purchasedLevels ||
                          `Level ${u.level !== undefined ? u.level : 0}`}
                      </span>
                    </td>
                    <td
                      className={`user-balance-manage ${getBalanceClass(
                        u.wallet?.balance || 0
                      )}`}
                    >
                      {formatBalance(u.wallet?.balance || 0, "USD")}
                    </td>
                    <td className="investment-cell">
                      {formatBalance(u.totalInvestment || 0, "USD")}
                    </td>
                    <td className="team-cell">
                      <span className="team-count">{u.team?.count || 0}</span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
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
      </div>
    </div>
  );
};

export default UserManagement;
