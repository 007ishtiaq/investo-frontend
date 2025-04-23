// client/src/pages/admin/TaskVerification.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
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

  useEffect(() => {
    loadPendingTasks();
  }, []);

  const loadPendingTasks = async () => {
    try {
      setLoading(true);
      const res = await getPendingTasks(user.token);
      setPendingTasks(res.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error loading pending tasks:", error);
      toast.error("Failed to load pending tasks");
    }
  };

  const handleApprove = async (userTaskId) => {
    try {
      await approveTask(userTaskId, user.token);
      toast.success("Task approved and reward issued");
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

  return (
    <div className="task-verification-page">
      <div className="container">
        <h1>Task Verification</h1>
        <p className="subtitle">Review and verify task submissions</p>

        {loading ? (
          <div className="loading-indicator">Loading submissions...</div>
        ) : pendingTasks.length === 0 ? (
          <div className="no-tasks-message">
            <p>No pending task submissions to verify.</p>
          </div>
        ) : (
          <div className="pending-tasks-list">
            {pendingTasks.map((submission) => (
              <div key={submission._id} className="task-submission-card">
                <div className="submission-header">
                  <h3>{submission.taskId.title}</h3>
                  <span className="task-type">
                    {submission.taskId.type === "screenshot"
                      ? "Screenshot"
                      : submission.taskId.type.replace("_", " ")}
                  </span>
                </div>

                <div className="submission-details">
                  <div className="detail-row">
                    <span className="label">Submitted by:</span>
                    <span className="value">
                      {submission.userId.name} ({submission.userId.email})
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Submitted on:</span>
                    <span className="value">
                      {new Date(submission.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Reward:</span>
                    <span className="value reward">
                      {submission.taskId.reward.toFixed(3)} ETH
                    </span>
                  </div>

                  {/* Display screenshot thumbnail if available */}
                  {submission.taskId.type === "screenshot" &&
                    submission.screenshot && (
                      <div className="screenshot-preview">
                        <h4>Screenshot Submission:</h4>
                        <div className="screenshot-thumbnail-container">
                          <img
                            src={submission.screenshot}
                            alt="Task Screenshot"
                            className="screenshot-thumbnail"
                            onClick={() =>
                              openImageModal(submission.screenshot)
                            }
                          />
                          <div className="click-hint">Click to enlarge</div>
                        </div>
                      </div>
                    )}

                  {/* Fallback to showing verification data if screenshot URL not available directly */}
                  {submission.taskId.type === "screenshot" &&
                    !submission.screenshot &&
                    submission.verificationData &&
                    submission.verificationData.screenshotUrl && (
                      <div className="screenshot-preview">
                        <h4>Screenshot Submission:</h4>
                        <div className="screenshot-thumbnail-container">
                          <img
                            src={submission.verificationData.screenshotUrl}
                            alt="Task Screenshot"
                            className="screenshot-thumbnail"
                            onClick={() =>
                              openImageModal(
                                submission.verificationData.screenshotUrl
                              )
                            }
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
                            <span className="value">{value}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

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
              </div>
            ))}
          </div>
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
