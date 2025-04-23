// client/src/pages/Tasks.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import {
  EthereumIcon,
  CheckIcon,
  ClockIcon,
  ExternalLinkIcon,
  EmptyBoxIcon,
  InfoIcon,
} from "../utils/icons";
import {
  getUserTasks,
  getAllTasks,
  verifyTaskCompletion,
  getTasksEarnings,
  startTask,
} from "../functions/tasks";
import "./Tasks.css";
import { Camera, Upload } from "lucide-react"; // Make sure you have lucide-react

/**
 * EmptyState component for displaying when no tasks match criteria
 */
const EmptyState = ({ message, filterOption, onReset }) => (
  <div className="empty-state">
    <EmptyBoxIcon size={64} />
    <h3>{message}</h3>
    {filterOption !== "all" && (
      <button className="reset-filter-button" onClick={onReset}>
        View All Tasks
      </button>
    )}
  </div>
);

/**
 * TaskVerificationProgress component for task verification steps
 */
const TaskVerificationProgress = ({ status, error }) => {
  return (
    <div className="verification-progress">
      <div className="progress-indicators">
        <div className={`progress-step ${status !== "idle" ? "active" : ""}`}>
          <div className="step-dot"></div>
          <div className="step-label">Submitting</div>
        </div>
        <div
          className={`progress-line ${status !== "idle" ? "active" : ""}`}
        ></div>
        <div
          className={`progress-step ${
            status === "verifying" || status === "complete" ? "active" : ""
          }`}
        >
          <div className="step-dot"></div>
          <div className="step-label">Verifying</div>
        </div>
        <div
          className={`progress-line ${
            status === "verifying" || status === "complete" ? "active" : ""
          }`}
        ></div>
        <div
          className={`progress-step ${status === "complete" ? "active" : ""}`}
        >
          <div className="step-dot"></div>
          <div className="step-label">Complete</div>
        </div>
      </div>
      <div className="verification-message">
        {status === "idle" && "Ready to verify completion"}
        {status === "verifying" && "Verifying your task completion..."}
        {status === "complete" && "Task successfully verified!"}
        {status === "error" && error}
      </div>
    </div>
  );
};

/**
 * Main Tasks component
 */
const Tasks = () => {
  // Get user from Redux store
  const { user } = useSelector((state) => ({ ...state }));

  // Component state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [verificationInput, setVerificationInput] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [earnings, setEarnings] = useState(0);
  const [error, setError] = useState("");
  const [isStartingTask, setIsStartingTask] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [pendingVerificationTasks, setPendingVerificationTasks] = useState([]);

  // Task difficulty colors
  const difficultyColors = {
    easy: "var(--color-success)",
    medium: "var(--color-warning)",
    hard: "var(--color-primary)",
  };

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
    if (user) {
      loadEarnings();
    }
  }, [user]);

  // Load all tasks from API
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAllTasks(user ? user.token : "");
      setTasks(res.data);

      // If user is logged in, update task completion status
      if (user && user.token) {
        try {
          const userTasksRes = await getUserTasks(user.token);

          // Map through tasks and update completion status
          const updatedTasks = res.data.map((task) => {
            const userTask = userTasksRes.data.find(
              (ut) => ut.taskId === task._id
            );

            if (userTask) {
              return {
                ...task,
                completed: userTask.completed,
                verified: userTask.verified,
                startedAt: userTask.startedAt,
                status: userTask.status, // Make sure this is returned from your API
              };
            }

            return task;
          });

          setTasks(updatedTasks);

          // Set pending verification tasks
          const pendingTasks = updatedTasks.filter(
            (task) => task.status === "pending_verification"
          );
          setPendingVerificationTasks(pendingTasks);
        } catch (err) {
          console.error("Error loading user tasks:", err);
          // Continue with the tasks we have
        }
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Error loading tasks. Please try again.");
      console.error("Error loading tasks:", err);
      toast.error("Failed to load tasks. Please refresh the page.");
    }
  };

  // In your frontend code
  const loadEarnings = async () => {
    if (!user || !user.token) return;
    try {
      const res = await getTasksEarnings(user.token);
      console.log("Received earnings data:", res.data);
      setEarnings(res.data.totalEarnings || 0);
    } catch (err) {
      console.error("Error loading earnings:", err);
      // Set earnings to 0 or current value on error
      setEarnings(0);
    }
  };

  // Filter tasks based on selected option
  const filteredTasks = tasks.filter((task) => {
    if (filterOption === "all") return true;
    if (filterOption === "completed") return task.completed;
    if (filterOption === "pending")
      return !task.completed && task.status !== "pending_verification";
    return true;
  });

  // Calculate total rewards for all tasks
  const totalRewards = tasks.reduce((sum, task) => sum + task.reward, 0);

  // Handle task start
  const handleStartTask = async (taskId) => {
    if (!user || !user.token) {
      toast.error("Please login to start this task.");
      return;
    }

    setIsStartingTask(true);
    try {
      await startTask(taskId, user.token);
      toast.success("Task started successfully!");
      loadTasks(); // Reload tasks to update status
    } catch (err) {
      console.error("Error starting task:", err);
      toast.error("Failed to start task. Please try again.");
    } finally {
      setIsStartingTask(false);
    }
  };

  // Open task details
  const openTaskDetails = (task) => {
    setActiveTask(task);
    setVerificationStatus("idle");
    setError("");
    setVerificationInput("");
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  // Close task details
  const closeTaskDetails = () => {
    if (verificationStatus === "verifying") return; // Prevent closing during verification
    setActiveTask(null);
    setVerificationInput("");
    setVerificationStatus("idle");
    setError("");
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  // Reset filter to show all tasks
  const resetFilter = () => setFilterOption("all");

  // Add this function to handle file selection
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Store the file
      setScreenshot(file);
    }
  };

  // Add this function to convert the file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Update the verifyTask function to include screenshot
  const verifyTask = async (taskId) => {
    if (!user || !user.token) {
      toast.error("Please login to verify task completion.");
      return;
    }
    // Start verification process
    setVerificationStatus("verifying");
    setError("");
    try {
      // Prepare verification data based on task type
      const verificationData = {};
      if (
        activeTask.type === "twitter_share" ||
        activeTask.type === "twitter_follow"
      ) {
        verificationData.tweetUrl = verificationInput;
      } else if (activeTask.type === "youtube_subscribe") {
        verificationData.channelUrl = verificationInput;
      } else if (activeTask.type === "youtube_watch") {
        verificationData.videoUrl = verificationInput;
      } else if (activeTask.type === "telegram_join") {
        verificationData.username = verificationInput;
      } else if (activeTask.type === "screenshot") {
        // For screenshot verification
        if (!screenshot) {
          setVerificationStatus("error");
          setError("Please upload a screenshot to verify this task.");
          toast.error("Please upload a screenshot to verify this task.");
          return;
        }

        // Convert screenshot to base64
        verificationData.screenshot = await fileToBase64(screenshot);
      }
      // For logging purposes
      console.log("Verifying task:", taskId);

      // Send verification request to API
      const res = await verifyTaskCompletion(
        taskId,
        verificationData,
        user.token
      );
      console.log("Verification response:", res.data);

      if (res.data.success) {
        if (res.data.status === "pending_verification") {
          // For screenshot tasks that require manual verification
          const updatedTasks = tasks.map((task) =>
            task._id === taskId
              ? { ...task, status: "pending_verification" }
              : task
          );
          setTasks(updatedTasks);
          setVerificationStatus("complete");

          toast.success(
            "Screenshot submitted for verification. Our team will review it shortly."
          );

          // Reset after showing completion
          setTimeout(() => {
            setVerificationInput("");
            setScreenshot(null);
            setScreenshotPreview(null);
            setActiveTask(null);
            setVerificationStatus("idle");

            // Refresh the full task list to ensure everything is up to date
            loadTasks();
          }, 3000);
        } else {
          // For regular tasks with immediate verification
          const updatedTasks = tasks.map((task) =>
            task._id === taskId
              ? { ...task, completed: true, verified: true }
              : task
          );
          setTasks(updatedTasks);
          setVerificationStatus("complete");

          const rewardAmount = activeTask.reward.toFixed(3);
          toast.success(`Task completed! +${rewardAmount} ETH earned`);

          // Update earnings immediately
          loadEarnings();

          // Reset after showing completion
          setTimeout(() => {
            setVerificationInput("");
            setScreenshot(null);
            setScreenshotPreview(null);
            setActiveTask(null);
            setVerificationStatus("idle");

            // Refresh the full task list to ensure everything is up to date
            loadTasks();
          }, 3000);
        }
      } else {
        setVerificationStatus("error");
        setError(res.data.message || "Verification failed. Please try again.");
        toast.error(
          res.data.message || "Verification failed. Please try again."
        );
      }
    } catch (err) {
      console.error("Error verifying task:", err);
      setVerificationStatus("error");

      const errorMessage =
        err.response?.data?.message ||
        "Error verifying task. Please try again.";

      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // If not logged in, show login prompt
  if (!user) {
    return (
      <div className="tasks-page">
        <div className="container">
          <div className="connect-wallet-message">
            <h2>Please Login to View Tasks</h2>
            <p>
              You need to login to access task rewards and track your progress.
            </p>
            <Link to="/login" className="login-button">
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="tasks-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "green",
              color: "white",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "red",
              color: "white",
            },
          },
        }}
      />

      <div className="container">
        <div className="tasks-header">
          <h1 className="page-title">Complete Tasks, Earn Rewards</h1>
          <p className="page-description">
            Complete simple tasks to earn cryptocurrency rewards. Tasks include
            social media interactions, learning about the platform, and
            promoting our community.
          </p>
        </div>

        <div className="tasks-statistics">
          <div className="stat-card">
            <div className="stat-title">Total Available Rewards</div>
            <div className="stat-value">
              <EthereumIcon size={18} />
              <span>{totalRewards.toFixed(3)} ETH</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Your Earned Rewards</div>
            <div className="stat-value">
              <EthereumIcon size={18} />
              <span>{earnings.toFixed(3)} ETH</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Completion Rate</div>
            <div className="stat-value">
              <span>
                {tasks.length > 0
                  ? Math.round(
                      (tasks.filter((t) => t.completed).length / tasks.length) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    tasks.length > 0
                      ? (tasks.filter((t) => t.completed).length /
                          tasks.length) *
                        100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="tasks-filter-section">
          <div className="filter-label">Filter Tasks:</div>
          <div className="filter-options">
            <button
              className={`filter-option ${
                filterOption === "all" ? "active" : ""
              }`}
              onClick={() => setFilterOption("all")}
            >
              All Tasks
            </button>
            <button
              className={`filter-option ${
                filterOption === "pending" ? "active" : ""
              }`}
              onClick={() => setFilterOption("pending")}
            >
              Pending
            </button>
            <button
              className={`filter-option ${
                filterOption === "completed" ? "active" : ""
              }`}
              onClick={() => setFilterOption("completed")}
            >
              Completed
            </button>
          </div>
        </div>

        {error && !activeTask && <div className="error-message">{error}</div>}

        <div className="tasks-list">
          {filteredTasks.length === 0 ? (
            <EmptyState
              message={
                filterOption === "completed"
                  ? "You haven't completed any tasks yet."
                  : filterOption === "pending"
                  ? "No pending tasks found."
                  : "No tasks available at the moment."
              }
              filterOption={filterOption}
              onReset={resetFilter}
            />
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`task-card ${task.completed ? "completed" : ""} ${
                  task.status === "pending_verification"
                    ? "pending-verification"
                    : ""
                }`}
              >
                <div className="task-status">
                  {task.completed ? (
                    <div className="completed-badge">
                      <CheckIcon size={16} />
                      <span>Completed</span>
                    </div>
                  ) : task.status === "pending_verification" ? (
                    <div className="pending-verification-badge">
                      <ClockIcon size={16} />
                      <span>Under Verification</span>
                    </div>
                  ) : (
                    <div className="reward-badge">
                      <EthereumIcon size={16} />
                      <span>{task.reward.toFixed(3)} ETH</span>
                    </div>
                  )}
                </div>

                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">{task.description}</p>

                <div className="task-meta">
                  <div
                    className="difficulty-tag"
                    style={{ color: difficultyColors[task.difficulty] }}
                  >
                    {task.difficulty.charAt(0).toUpperCase() +
                      task.difficulty.slice(1)}
                  </div>

                  <div className="time-estimate">
                    <ClockIcon size={14} />
                    <span>{task.estimatedTime}</span>
                  </div>
                </div>

                <button
                  className="view-task-button"
                  onClick={() => openTaskDetails(task)}
                >
                  {task.completed
                    ? "View Details"
                    : task.status === "pending_verification"
                    ? "View Progress"
                    : "Complete Task"}
                </button>
              </div>
            ))
          )}
        </div>

        {activeTask && (
          <div className="task-modal-overlay" onClick={closeTaskDetails}>
            <div className="task-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="close-modal-button"
                onClick={closeTaskDetails}
                disabled={verificationStatus === "verifying"}
              >
                ×
              </button>

              <div className="task-modal-header">
                <h2>{activeTask.title}</h2>
                <div className="task-reward">
                  <EthereumIcon size={18} />
                  <span>{activeTask.reward.toFixed(3)} ETH</span>
                </div>
              </div>

              <div className="task-modal-content">
                <p className="task-full-description">
                  {activeTask.description}
                </p>

                <div className="task-steps">
                  <h3>Steps to Complete:</h3>
                  <ol>
                    {Array.isArray(activeTask.steps) &&
                    activeTask.steps.length > 0 ? (
                      activeTask.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))
                    ) : (
                      <li>Complete this task to earn rewards.</li>
                    )}
                  </ol>
                </div>

                {activeTask.link && (
                  <a
                    href={activeTask.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="task-link-button"
                  >
                    <span>Go to Task</span>
                    <ExternalLinkIcon size={16} />
                  </a>
                )}

                {activeTask.externalUrl && (
                  <a
                    href={activeTask.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="task-link-button"
                  >
                    <span>Go to Task</span>
                    <ExternalLinkIcon size={16} />
                  </a>
                )}

                {/* FIX: Modified condition here to show the start button correctly */}
                {!activeTask.completed &&
                  activeTask.status !== "pending_verification" &&
                  !activeTask.startedAt && (
                    <div className="start-task-section">
                      <button
                        className="start-task-button"
                        onClick={() => handleStartTask(activeTask._id)}
                        disabled={isStartingTask}
                      >
                        {isStartingTask ? "Starting..." : "Start Task"}
                      </button>
                      <div className="task-info-note">
                        <InfoIcon size={16} />
                        <span>
                          You need to start the task before verification
                        </span>
                      </div>
                    </div>
                  )}

                {/* FIX: Modified condition here to show verification section correctly */}
                {!activeTask.completed &&
                  activeTask.status !== "pending_verification" &&
                  activeTask.startedAt &&
                  verificationStatus === "idle" && (
                    <div className="verification-section">
                      {/* Screenshot upload for screenshot type tasks */}
                      {activeTask.type === "screenshot" && (
                        <div className="screenshot-upload-container">
                          <h4>Upload Screenshot</h4>
                          <p>
                            {activeTask.screenshotInstructions ||
                              "Take a screenshot showing you've completed this task and upload it here."}
                          </p>

                          {screenshotPreview ? (
                            <div className="screenshot-preview">
                              <img
                                src={screenshotPreview}
                                alt="Screenshot preview"
                              />
                              <button
                                className="remove-screenshot-button"
                                onClick={() => {
                                  setScreenshot(null);
                                  setScreenshotPreview(null);
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="screenshot-upload-box">
                              <input
                                type="file"
                                id="screenshot-upload"
                                accept="image/*"
                                onChange={handleScreenshotChange}
                                style={{ display: "none" }}
                              />
                              <label
                                htmlFor="screenshot-upload"
                                className="upload-label"
                              >
                                <div className="upload-icon">
                                  <Camera size={24} />
                                </div>
                                <span>Click to upload screenshot</span>
                              </label>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Text input for other task types */}
                      {[
                        "youtube_subscribe",
                        "youtube_watch",
                        "twitter_follow",
                        "twitter_share",
                        "telegram_join",
                      ].includes(activeTask.type) && (
                        <div className="verification-input-container">
                          <label htmlFor="verification-input">
                            {activeTask.type === "youtube_subscribe"
                              ? "Enter Channel URL:"
                              : activeTask.type === "youtube_watch"
                              ? "Enter Video URL:"
                              : activeTask.type.includes("twitter")
                              ? "Enter Tweet URL:"
                              : "Enter Telegram Username:"}
                          </label>
                          <input
                            id="verification-input"
                            type="text"
                            value={verificationInput}
                            onChange={(e) =>
                              setVerificationInput(e.target.value)
                            }
                            placeholder={
                              activeTask.type === "youtube_subscribe"
                                ? "https://youtube.com/channel/..."
                                : activeTask.type === "youtube_watch"
                                ? "https://youtube.com/watch?v=..."
                                : activeTask.type.includes("twitter")
                                ? "https://twitter.com/..."
                                : "@username"
                            }
                            disabled={verificationStatus === "verifying"}
                          />
                        </div>
                      )}

                      <button
                        className="verify-task-button"
                        onClick={() => verifyTask(activeTask._id)}
                        disabled={
                          verificationStatus === "verifying" ||
                          verificationStatus === "complete" ||
                          ([
                            "youtube_subscribe",
                            "youtube_watch",
                            "twitter_follow",
                            "twitter_share",
                            "telegram_join",
                          ].includes(activeTask.type) &&
                            !verificationInput) ||
                          (activeTask.type === "screenshot" && !screenshot)
                        }
                      >
                        {verificationStatus === "verifying"
                          ? "Verifying..."
                          : verificationStatus === "complete"
                          ? "Verified!"
                          : "Verify Completion"}
                      </button>
                    </div>
                  )}

                {!activeTask.completed &&
                  activeTask.startedAt &&
                  verificationStatus !== "idle" && (
                    <div className="verification-progress-container">
                      <TaskVerificationProgress
                        status={verificationStatus}
                        error={error}
                      />
                    </div>
                  )}

                {activeTask.status === "pending_verification" && (
                  <div className="task-completed-info">
                    <div className="pending-icon">
                      <ClockIcon size={32} />
                    </div>
                    <h3>Under Verification</h3>
                    <p>
                      Your screenshot has been submitted and is pending review
                      by our team. You'll receive your reward once it's
                      approved.
                    </p>
                  </div>
                )}

                {activeTask.completed && (
                  <div className="completion-message">
                    <div className="completion-icon">
                      <CheckIcon size={32} />
                    </div>
                    <h3>Task Completed!</h3>
                    <p>
                      You've successfully completed this task and earned the
                      reward.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
