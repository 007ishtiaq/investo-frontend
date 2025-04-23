// client/src/pages/admin/TaskVerification.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import {
  getPendingTasks,
  approveTask,
  rejectTask,
} from "../../functions/admin";
import "./TaskVerification.css";

const TaskVerification = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState("");
  const [userGroups, setUserGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Cleanup function to handle component unmounting
  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getPendingTasks(user.token);
        console.log("API response:", res.data);

        // Only update state if component is still mounted
        if (isMounted) {
          const allTasks = res.data || [];
          setPendingTasks(allTasks);

          // Group tasks by user
          const groupedByUser = groupTasksByUser(allTasks);
          setUserGroups(groupedByUser);

          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setLoading(false);
          console.error("Error loading pending tasks:", error);
          setError(
            "Failed to load pending tasks. Please try refreshing the page."
          );
          toast.error("Failed to load pending tasks");
        }
      }
    };

    if (user && user.token) {
      fetchTasks();
    }

    // Cleanup function will run when component unmounts
    return () => {
      isMounted = false;
    };
  }, [user]); // Depend on user to rerun when user changes

  // Extract user ID from task
  const getUserId = (task) => {
    // Handle if userId is an object with _id or a string directly
    if (task.userId) {
      if (typeof task.userId === "object" && task.userId._id) {
        return task.userId._id;
      }
      if (typeof task.userId === "string") {
        return task.userId;
      }
      // If it's an object with $oid (MongoDB format)
      if (typeof task.userId === "object" && task.userId.$oid) {
        return task.userId.$oid;
      }
    }
    return null;
  };

  // Group tasks by user with better error handling
  const groupTasksByUser = (tasks) => {
    const groupedTasks = {};

    tasks.forEach((task) => {
      const userId = getUserId(task);
      if (!userId) return;

      // Get user info
      let userInfo = task.userId;
      if (typeof userInfo !== "object" || !userInfo.name) {
        userInfo = { _id: userId, id: userId };
      }

      if (!groupedTasks[userId]) {
        groupedTasks[userId] = {
          user: userInfo,
          tasks: [],
          stats: {
            pending: 0,
            underVerification: 0,
            completed: 0,
            rejected: 0, // Add rejected stat
          },
        };
      }

      groupedTasks[userId].tasks.push(task);

      // Update stats based on task status
      if (task.status === "rejected") {
        groupedTasks[userId].stats.rejected++;
      } else if (task.status === "pending_verification") {
        groupedTasks[userId].stats.underVerification++;
      } else if (task.completed) {
        groupedTasks[userId].stats.completed++;
      } else {
        groupedTasks[userId].stats.pending++;
      }
    });

    // Convert to array for easier rendering
    return Object.values(groupedTasks);
  };

  const loadPendingTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getPendingTasks(user.token);
      console.log("Refreshed API response:", res.data);

      // Set all tasks that have come from API
      const allTasks = res.data || [];
      setPendingTasks(allTasks);

      // Group tasks by user
      const groupedByUser = groupTasksByUser(allTasks);
      setUserGroups(groupedByUser);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error loading pending tasks:", error);
      setError("Failed to load pending tasks. Please try refreshing the page.");
      toast.error("Failed to load pending tasks");
    }
  };

  const handleApprove = async (userTaskId) => {
    try {
      await approveTask(userTaskId, user.token);
      toast.success("Task approved and reward issued");

      // Update the local state to immediately reflect the change
      if (selectedUser) {
        // 1. Update the task status in the selected user's tasks
        const updatedUserTasks = selectedUser.tasks.filter(
          (task) => task._id !== userTaskId
        );

        // 2. Update the stats
        const updatedStats = {
          ...selectedUser.stats,
          underVerification: selectedUser.stats.underVerification - 1,
          completed: selectedUser.stats.completed + 1,
        };

        // 3. Update the selected user state
        setSelectedUser({
          ...selectedUser,
          tasks: updatedUserTasks,
          stats: updatedStats,
        });

        // 4. Update the user in the userGroups array
        const updatedUserGroups = userGroups.map((group) => {
          if (group.user._id === selectedUser.user._id) {
            return {
              ...group,
              tasks: updatedUserTasks,
              stats: updatedStats,
            };
          }
          return group;
        });

        setUserGroups(updatedUserGroups);
      }

      // Also refresh data from the server to ensure consistency
      loadPendingTasks();
    } catch (error) {
      console.error("Error approving task:", error);
      toast.error("Failed to approve task");
    }
  };

  const openRejectModal = (userTaskId) => {
    setSelectedTaskId(userTaskId);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return toast.error("Please provide a reason for rejection");
    }

    try {
      await rejectTask(selectedTaskId, { rejectionReason }, user.token);
      toast.success("Task rejected");
      setShowRejectModal(false);

      // Update the local state to immediately reflect the change
      if (selectedUser) {
        // 1. Update the task status in the selected user's tasks
        const updatedUserTasks = selectedUser.tasks.filter(
          (task) => task._id !== selectedTaskId
        );

        // 2. Update the stats
        const updatedStats = {
          ...selectedUser.stats,
          underVerification: selectedUser.stats.underVerification - 1,
          rejected: selectedUser.stats.rejected + 1,
        };

        // 3. Update the selected user state
        setSelectedUser({
          ...selectedUser,
          tasks: updatedUserTasks,
          stats: updatedStats,
        });

        // 4. Update the user in the userGroups array
        const updatedUserGroups = userGroups.map((group) => {
          if (group.user._id === selectedUser.user._id) {
            return {
              ...group,
              tasks: updatedUserTasks,
              stats: updatedStats,
            };
          }
          return group;
        });

        setUserGroups(updatedUserGroups);
      }

      // Also refresh data from the server to ensure consistency
      loadPendingTasks();
    } catch (error) {
      console.error("Error rejecting task:", error);
      toast.error("Failed to reject task");
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const selectUser = (userData) => {
    setSelectedUser(userData);
  };

  const backToUsers = () => {
    setSelectedUser(null);
  };

  // Extract screenshot URL from task
  const getScreenshotUrl = (task) => {
    if (task.screenshot) {
      return task.screenshot;
    }

    if (task.verificationData && task.verificationData.screenshotUrl) {
      return task.verificationData.screenshotUrl;
    }

    return null;
  };

  // Extract task details safely
  const getTaskDetails = (task) => {
    const taskId = task.taskId;
    let title = "Unknown Task";
    let type = "Unknown Type";
    let reward = task.reward || 0;

    if (taskId) {
      if (typeof taskId === "object") {
        title = taskId.title || "Unknown Task";
        type = taskId.type || "Unknown Type";
        reward = taskId.reward || reward;
      }
    }

    return { title, type, reward };
  };

  if (!user || !user.token) {
    return (
      <div className="task-verification-page">
        <div className="container">
          <div className="error-message">
            <p>You must be logged in as an admin to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-verification-page">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            style: {
              background: "green",
            },
          },
          error: {
            style: {
              background: "red",
            },
          },
        }}
      />

      <div className="container">
        <h1>Task Verification</h1>
        {!selectedUser ? (
          <>
            <p className="subtitle">
              Select a user to verify their task submissions
            </p>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <div className="loading-indicator">Loading submissions...</div>
            ) : userGroups.length === 0 ? (
              <div className="no-tasks-message">
                <p>No pending task submissions to verify.</p>
              </div>
            ) : (
              <div className="users-grid">
                {userGroups.map((userGroup) => (
                  <div
                    key={userGroup.user._id || userGroup.user.id}
                    className="user-card"
                    onClick={() => selectUser(userGroup)}
                  >
                    <div className="user-card-header">
                      {userGroup.user.name ? (
                        <>
                          <h3>{userGroup.user.name}</h3>
                          <span className="user-email">
                            {userGroup.user.email || "No Email"}
                          </span>
                        </>
                      ) : (
                        <h3>
                          User ID: {userGroup.user._id || userGroup.user.id}
                        </h3>
                      )}
                    </div>

                    <div className="task-stats">
                      <div className="stat-badge pending">
                        <span className="stat-count">
                          {userGroup.stats.pending}
                        </span>
                        <span className="stat-label">Pending</span>
                      </div>
                      <div className="stat-badge verification">
                        <span className="stat-count">
                          {userGroup.stats.underVerification}
                        </span>
                        <span className="stat-label">Verifying</span>
                      </div>
                      <div className="stat-badge completed">
                        <span className="stat-count">
                          {userGroup.stats.completed}
                        </span>
                        <span className="stat-label">Completed</span>
                      </div>
                      <div className="stat-badge rejected">
                        <span className="stat-count">
                          {userGroup.stats.rejected}
                        </span>
                        <span className="stat-label">Rejected</span>
                      </div>
                    </div>

                    <div className="user-task-count">
                      <span>{userGroup.tasks.length} tasks</span>
                    </div>

                    <div className="view-tasks-button">
                      <span>View Tasks</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="user-tasks-header">
              <button className="back-button" onClick={backToUsers}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Back to Users
              </button>
              <div className="user-info">
                {selectedUser.user.name ? (
                  <>
                    <h2>{selectedUser.user.name}</h2>
                    <span className="user-email">
                      {selectedUser.user.email || "No Email"}
                    </span>
                  </>
                ) : (
                  <h2>
                    User ID: {selectedUser.user._id || selectedUser.user.id}
                  </h2>
                )}
              </div>
            </div>

            <div className="task-stats-summary">
              <div className="stat-badge pending">
                <span className="stat-count">{selectedUser.stats.pending}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-badge verification">
                <span className="stat-count">
                  {selectedUser.stats.underVerification}
                </span>
                <span className="stat-label">Verifying</span>
              </div>
              <div className="stat-badge completed">
                <span className="stat-count">
                  {selectedUser.stats.completed}
                </span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-badge rejected">
                <span className="stat-count">
                  {selectedUser.stats.rejected}
                </span>
                <span className="stat-label">Rejected</span>
              </div>
            </div>

            <div className="pending-tasks-list">
              {selectedUser.tasks.map((submission) => {
                const { title, type, reward } = getTaskDetails(submission);
                const screenshotUrl = getScreenshotUrl(submission);

                return (
                  <div key={submission._id} className="task-submission-card">
                    <div className="submission-header">
                      <h3>{title}</h3>
                      <span className="task-type">
                        {type === "screenshot"
                          ? "Screenshot"
                          : type.replace("_", " ")}
                      </span>
                    </div>

                    <div className="submission-details">
                      <div className="detail-row">
                        <span className="label">Submitted on:</span>
                        <span className="value">
                          {submission.createdAt
                            ? new Date(submission.createdAt).toLocaleString()
                            : "Unknown date"}
                        </span>
                      </div>

                      <div className="detail-row">
                        <span className="label">Status:</span>
                        <span
                          className={`value status-badge ${submission.status}`}
                        >
                          {submission.status === "pending_verification"
                            ? "Under Verification"
                            : submission.status === "rejected"
                            ? "Rejected"
                            : submission.completed
                            ? "Completed"
                            : "Pending"}
                        </span>
                      </div>

                      {/* Display rejection reason if task was rejected */}
                      {submission.status === "rejected" &&
                        submission.rejectionReason && (
                          <div className="detail-row rejection-reason">
                            <span className="label">Rejection Reason:</span>
                            <span className="value">
                              {submission.rejectionReason}
                            </span>
                          </div>
                        )}

                      <div className="detail-row">
                        <span className="label">Reward:</span>
                        <span className="value reward">
                          {reward.toFixed(3)} ETH
                        </span>
                      </div>

                      {/* Display screenshot thumbnail if available */}
                      {screenshotUrl && (
                        <div className="screenshot-preview">
                          <h4>Screenshot Submission:</h4>
                          <div className="screenshot-thumbnail-container">
                            <img
                              src={screenshotUrl}
                              alt="Task Screenshot"
                              className="screenshot-thumbnail"
                              onClick={() => openImageModal(screenshotUrl)}
                            />
                            <div className="click-hint">Click to enlarge</div>
                          </div>
                        </div>
                      )}

                      {/* Display other verification data except screenshot (which we're showing above) */}
                      {submission.verificationData && (
                        <div className="verification-data">
                          <h4>Verification Data:</h4>
                          {Object.entries(submission.verificationData)
                            .filter(
                              ([key]) =>
                                !["screenshot", "screenshotUrl"].includes(key)
                            )
                            .map(([key, value]) => (
                              <div key={key} className="verification-item">
                                <span className="label">{key}:</span>
                                <span className="value">
                                  {typeof value === "string" &&
                                  value.length < 100
                                    ? value
                                    : "[Data too large to display]"}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {submission.status === "pending_verification" && (
                      <div className="submission-actions">
                        <button
                          className="approve-button"
                          onClick={() => handleApprove(submission._id)}
                        >
                          Approve & Issue Reward
                        </button>
                        <button
                          className="reject-button"
                          onClick={() => openRejectModal(submission._id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRejectModal(false)}
        >
          <div className="rejection-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Task Submission</h3>
            <p>Please provide a reason for rejection:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection"
              rows={4}
            ></textarea>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button className="confirm-button" onClick={handleReject}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {imageModalOpen && selectedImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setImageModalOpen(false)}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-image-modal"
              onClick={() => setImageModalOpen(false)}
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Full size screenshot"
              className="fullsize-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskVerification;
