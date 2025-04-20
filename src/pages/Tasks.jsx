import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux"; // Assuming you use Redux for auth
import {
  EthereumIcon,
  CheckIcon,
  ClockIcon,
  ExternalLinkIcon,
} from "../utils/icons";
import {
  getUserTasks,
  getAllTasks,
  verifyTaskCompletion,
  getTasksEarnings,
} from "../functions/tasks";
import "./Tasks.css"; // Make sure to import your CSS

/**
 * Tasks page component for displaying available tasks to earn rewards
 */
const Tasks = () => {
  // Get user from Redux store
  const { user } = useSelector((state) => ({ ...state }));

  // Component state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [verificationInput, setVerificationInput] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [verificationStatus, setVerificationStatus] = useState("idle"); // idle, verifying, complete, error
  const [earnings, setEarnings] = useState(0);
  const [error, setError] = useState("");

  // Task difficulty colors
  const difficultyColors = {
    easy: "var(--color-success)",
    medium: "var(--color-warning)",
    hard: "var(--color-primary)",
  };

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
    loadEarnings();
  }, []);

  // Load all tasks from API
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAllTasks(user ? user.token : "");
      setTasks(res.data);

      // If user is logged in, update task completion status
      if (user) {
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
            };
          }

          return task;
        });

        setTasks(updatedTasks);
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Error loading tasks. Please try again.");
      console.error("Error loading tasks:", err);
    }
  };

  // Load user's earned rewards
  const loadEarnings = async () => {
    if (!user) return;

    try {
      const res = await getTasksEarnings(user.token);
      setEarnings(res.data.totalEarnings);
    } catch (err) {
      console.error("Error loading earnings:", err);
    }
  };

  // Filter tasks based on selected option
  const filteredTasks = tasks.filter((task) => {
    if (filterOption === "all") return true;
    if (filterOption === "completed") return task.completed;
    if (filterOption === "pending") return !task.completed;
    return true;
  });

  // Calculate total rewards for all tasks
  const totalRewards = tasks.reduce((sum, task) => sum + task.reward, 0);

  // Handle task verification
  const verifyTask = async (taskId) => {
    if (!user) {
      alert("Please login to verify task completion.");
      return;
    }

    // Start verification process
    setVerificationStatus("verifying");

    try {
      // Prepare verification data based on task type
      const verificationData =
        activeTask.type === "twitter_share"
          ? { tweetUrl: verificationInput }
          : {};

      // Send verification request to API
      const res = await verifyTaskCompletion(
        taskId,
        verificationData,
        user.token
      );

      if (res.data.success) {
        // Update local task state
        const updatedTasks = tasks.map((task) =>
          task._id === taskId
            ? { ...task, completed: true, verified: true }
            : task
        );

        setTasks(updatedTasks);
        setVerificationStatus("complete");

        // Update earnings
        loadEarnings();

        // Reset after showing completion
        setTimeout(() => {
          setVerificationInput("");
          setActiveTask(null);
          setVerificationStatus("idle");
        }, 2000);
      } else {
        setVerificationStatus("error");
        setError(res.data.message || "Verification failed. Please try again.");
      }
    } catch (err) {
      setVerificationStatus("error");
      setError(
        err.response?.data?.message || "Error verifying task. Please try again."
      );
      console.error("Error verifying task:", err);
    }
  };

  // Open task details
  const openTaskDetails = (task) => {
    setActiveTask(task);
    setVerificationStatus("idle");
    setError("");
  };

  // Close task details
  const closeTaskDetails = () => {
    if (verificationStatus === "verifying") return; // Prevent closing during verification
    setActiveTask(null);
    setVerificationInput("");
    setVerificationStatus("idle");
    setError("");
  };

  // Task verification progress component
  const TaskVerificationProgress = () => {
    return (
      <div className="verification-progress">
        <div className="progress-indicators">
          <div
            className={`progress-step ${
              verificationStatus !== "idle" ? "active" : ""
            }`}
          >
            <div className="step-dot"></div>
            <div className="step-label">Submitting</div>
          </div>
          <div
            className={`progress-line ${
              verificationStatus !== "idle" ? "active" : ""
            }`}
          ></div>
          <div
            className={`progress-step ${
              verificationStatus === "verifying" ||
              verificationStatus === "complete"
                ? "active"
                : ""
            }`}
          >
            <div className="step-dot"></div>
            <div className="step-label">Verifying</div>
          </div>
          <div
            className={`progress-line ${
              verificationStatus === "verifying" ||
              verificationStatus === "complete"
                ? "active"
                : ""
            }`}
          ></div>
          <div
            className={`progress-step ${
              verificationStatus === "complete" ? "active" : ""
            }`}
          >
            <div className="step-dot"></div>
            <div className="step-label">Complete</div>
          </div>
        </div>
        <div className="verification-message">
          {verificationStatus === "idle" && "Ready to verify completion"}
          {verificationStatus === "verifying" &&
            "Verifying your task completion..."}
          {verificationStatus === "complete" && "Task successfully verified!"}
          {verificationStatus === "error" && error}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="tasks-page">
        <div className="container">
          <div className="connect-wallet-message">
            <h2>Please Login to View Tasks</h2>
            <p>You need to login to access task rewards.</p>
            <Link to="/login" className="login-button">
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="no-tasks-message">
              <p>No tasks found matching the selected filter.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`task-card ${task.completed ? "completed" : ""}`}
                onClick={() => openTaskDetails(task)}
              >
                <div className="task-status">
                  {task.completed ? (
                    <div className="completed-badge">
                      <CheckIcon size={16} />
                      <span>Completed</span>
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

                <button className="view-task-button">
                  {task.completed ? "View Details" : "Complete Task"}
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
                    {activeTask.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                <a
                  href={activeTask.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="task-link-button"
                >
                  <span>Go to Task</span>
                  <ExternalLinkIcon size={16} />
                </a>

                {!activeTask.completed && verificationStatus === "idle" && (
                  <div className="verification-section">
                    <h3>Verify Completion</h3>
                    {activeTask.type === "twitter_share" && (
                      <div className="verification-input-group">
                        <label>Tweet URL:</label>
                        <input
                          type="text"
                          placeholder="https://twitter.com/username/status/123456789"
                          value={verificationInput}
                          onChange={(e) => setVerificationInput(e.target.value)}
                        />
                      </div>
                    )}
                    <button
                      className="verify-button"
                      onClick={() => verifyTask(activeTask._id)}
                      disabled={
                        activeTask.type === "twitter_share" &&
                        !verificationInput
                      }
                    >
                      Verify Completion
                    </button>
                    <p className="verification-note">
                      Note: Verification may take a few moments. Please remain
                      on this page.
                    </p>
                  </div>
                )}

                {!activeTask.completed && verificationStatus !== "idle" && (
                  <div className="verification-progress-container">
                    <TaskVerificationProgress />
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
