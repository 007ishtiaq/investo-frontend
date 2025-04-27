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
  // Track processing state for approving/rejecting
  const [processingTaskId, setProcessingTaskId] = useState(null);

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
    console.log("userTaskId", userTaskId);

    // Prevent duplicate clicks
    if (processingTaskId) return;

    setProcessingTaskId(userTaskId);

    try {
      // Show processing state to user
      toast.loading("Processing approval and crediting reward...", {
        id: "approval",
      });

      const res = await approveTask(userTaskId, user.token);

      // Dismiss the loading toast and show success
      toast.dismiss("approval");
      toast.success("Task approved and reward credited to user's wallet");

      // Update the local state to immediately reflect the change
      if (selectedUser) {
        // 1. Update the task status in the selected user's tasks
        const updatedUserTasks = selectedUser.tasks.filter(
          (task) => task._id !== userTaskId
        );

        // 2. Update the stats
        const updatedStats = {
          ...selectedUser.stats,
          underVerification: Math.max(
            0,
            selectedUser.stats.underVerification - 1
          ),
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
      toast.dismiss("approval");
      toast.error("Failed to approve task and credit wallet");
    } finally {
      setProcessingTaskId(null);
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

    // Prevent duplicate submissions
    if (processingTaskId) return;

    setProcessingTaskId(selectedTaskId);

    try {
      toast.loading("Processing rejection...", { id: "rejection" });

      await rejectTask(selectedTaskId, { rejectionReason }, user.token);

      toast.dismiss("rejection");
      toast.success("Task rejected - no reward credited");
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
          underVerification: Math.max(
            0,
            selectedUser.stats.underVerification - 1
          ),
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
      toast.dismiss("rejection");
      toast.error("Failed to reject task");
    } finally {
      setProcessingTaskId(null);
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

    if (task.verificationData && task.verificationData.screenshot) {
      return task.verificationData.screenshot;
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
                    <div className="task-count">
                      {userGroup.stats.underVerification} pending verification{" "}
                      {userGroup.stats.underVerification === 1
                        ? "task"
                        : "tasks"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="user-verification-view">
              <button className="back-button" onClick={backToUsers}>
                ← Back to Users
              </button>

              <div className="user-profile-header">
                <h2>
                  {selectedUser.user.name
                    ? `${selectedUser.user.name}'s Tasks`
                    : `User ${
                        selectedUser.user._id || selectedUser.user.id
                      }'s Tasks`}
                </h2>
                <div className="user-email">
                  {selectedUser.user.email || "No Email"}
                </div>
              </div>

              <div className="user-verification-stats">
                <div className="stat-card verification">
                  <div className="stat-count">
                    {selectedUser.stats.underVerification}
                  </div>
                  <div className="stat-label">Pending Verification</div>
                </div>
                <div className="stat-card completed">
                  <div className="stat-count">
                    {selectedUser.stats.completed}
                  </div>
                  <div className="stat-label">Completed Tasks</div>
                </div>
                <div className="stat-card rejected">
                  <div className="stat-count">
                    {selectedUser.stats.rejected}
                  </div>
                  <div className="stat-label">Rejected Tasks</div>
                </div>
              </div>

              {selectedUser.tasks.length === 0 ? (
                <div className="no-tasks-message">
                  <p>This user has no pending task verifications.</p>
                </div>
              ) : (
                <div className="verification-tasks-list">
                  {selectedUser.tasks
                    .filter((task) => task.status === "pending_verification")
                    .map((task) => {
                      const taskDetails = getTaskDetails(task);
                      const screenshotUrl = getScreenshotUrl(task);

                      return (
                        <div key={task._id} className="verification-task-card">
                          <div className="task-header">
                            <h3 className="task-title">{taskDetails.title}</h3>
                            <div className="task-reward-badge">
                              ${taskDetails.reward.toFixed(3)} USD
                            </div>
                          </div>

                          <div className="task-type-badge">
                            {taskDetails.type}
                          </div>

                          <div className="task-verification-details">
                            <div className="submitted-info">
                              <div className="info-label">Submitted:</div>
                              <div className="info-value">
                                {new Date(task.updatedAt).toLocaleString()}
                              </div>
                            </div>

                            {/* Display screenshot if available */}
                            {screenshotUrl && (
                              <div className="screenshot-preview-container">
                                <div className="info-label">Screenshot:</div>
                                <div
                                  className="screenshot-preview"
                                  onClick={() => openImageModal(screenshotUrl)}
                                >
                                  <img
                                    src={screenshotUrl}
                                    alt="Verification screenshot"
                                  />
                                  <div className="preview-overlay">
                                    <span>Click to enlarge</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Task specific data */}
                            {task.verificationData && (
                              <div className="verification-data">
                                {Object.entries(task.verificationData).map(
                                  ([key, value]) => {
                                    // Skip screenshot as it's handled separately
                                    if (
                                      key === "screenshot" ||
                                      key === "screenshotUrl"
                                    )
                                      return null;

                                    return (
                                      <div key={key} className="data-item">
                                        <div className="info-label">
                                          {key.charAt(0).toUpperCase() +
                                            key
                                              .slice(1)
                                              .replace(/([A-Z])/g, " $1")}
                                          :
                                        </div>
                                        <div className="info-value">
                                          {typeof value === "boolean"
                                            ? value
                                              ? "Yes"
                                              : "No"
                                            : value}
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </div>

                          <div className="verification-actions">
                            <div className="reward-credit-info">
                              <div className="credit-icon">💰</div>
                              <span className="credit-text">
                                Approving will credit $
                                {taskDetails.reward.toFixed(3)} USD to user's
                                wallet
                              </span>
                            </div>
                            <div className="action-buttons">
                              <button
                                className="reject-button"
                                onClick={() => openRejectModal(task._id)}
                                disabled={processingTaskId === task._id}
                              >
                                Reject
                              </button>
                              <button
                                className="approve-button"
                                onClick={() => handleApprove(task._id)}
                                disabled={processingTaskId === task._id}
                              >
                                {processingTaskId === task._id
                                  ? "Processing..."
                                  : "Approve & Credit Reward"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div className="modal-overlay" onClick={() => setImageModalOpen(false)}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-modal"
              onClick={() => setImageModalOpen(false)}
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Verification screenshot"
              className="fullsize-image"
            />
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="reject-modal">
            <h3>Reject Task</h3>
            <p>Please provide a reason for rejecting this task:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Example: 'Screenshot doesn't show the required proof of completion'"
              rows="4"
            ></textarea>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowRejectModal(false)}
                disabled={processingTaskId === selectedTaskId}
              >
                Cancel
              </button>
              <button
                className="confirm-reject-button"
                onClick={handleReject}
                disabled={
                  !rejectionReason.trim() || processingTaskId === selectedTaskId
                }
              >
                {processingTaskId === selectedTaskId
                  ? "Processing..."
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskVerification;
