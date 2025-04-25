// client/src/pages/Tasks.jsx
import React, { useState, useRef, useEffect } from "react";
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
  XIcon, // For rejected tasks
} from "../utils/icons";
import {
  getUserTasks,
  getAllTasks,
  verifyTaskCompletion,
  getTasksEarnings,
  startTask,
} from "../functions/tasks";
import "./Tasks.css";
import { Camera, Upload, AlertTriangle } from "lucide-react";

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
  const [videoWatchTime, setVideoWatchTime] = useState(0);
  const [videoWatchComplete, setVideoWatchComplete] = useState(false);
  const youtubePlayerRef = useRef(null);
  const videoIntervalRef = useRef(null);

  // Task difficulty colors
  const difficultyColors = {
    easy: "var(--color-success)",
    medium: "var(--color-warning)",
    hard: "var(--color-primary)",
  };

  // Utility function to extract YouTube video ID
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Start tracking when video plays
  const startVideoTracking = () => {
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

    videoIntervalRef.current = setInterval(() => {
      setVideoWatchTime((prev) => {
        const newTime = prev + 1;
        // Check if watched enough time
        if (
          activeTask.autoVerify &&
          activeTask.videoDuration &&
          newTime >= parseInt(activeTask.videoDuration)
        ) {
          setVideoWatchComplete(true);
          clearInterval(videoIntervalRef.current);

          // Auto verify the task
          verifyTask(activeTask._id);
        }
        return newTime;
      });
    }, 1000);
  };

  // Stop tracking when video pauses
  const stopVideoTracking = () => {
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
    if (user) {
      loadEarnings();
    }

    // Clean up video interval if component unmounts
    return () => {
      if (videoIntervalRef.current) {
        clearInterval(videoIntervalRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    // Only run this effect if activeTask is a YouTube watch task
    if (!activeTask || activeTask.type !== "youtube_watch") return;

    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Initialize player once API is ready
    let player;
    const onYouTubeIframeAPIReady = () => {
      if (youtubePlayerRef.current) {
        player = new window.YT.Player(youtubePlayerRef.current, {
          events: {
            onStateChange: (event) => {
              // Start tracking when video plays
              if (event.data === window.YT.PlayerState.PLAYING) {
                if (videoIntervalRef.current)
                  clearInterval(videoIntervalRef.current);

                videoIntervalRef.current = setInterval(() => {
                  setVideoWatchTime((prev) => {
                    const newTime = prev + 1;
                    // Auto complete when reached duration
                    if (newTime >= parseInt(activeTask.videoDuration || 30)) {
                      clearInterval(videoIntervalRef.current);
                      setVideoWatchComplete(true);
                    }
                    return newTime;
                  });
                }, 1000);
              }
              // Pause tracking when video pauses or ends
              else if (
                event.data === window.YT.PlayerState.PAUSED ||
                event.data === window.YT.PlayerState.ENDED
              ) {
                if (videoIntervalRef.current) {
                  clearInterval(videoIntervalRef.current);
                }
                // If video ended, consider it complete
                if (event.data === window.YT.PlayerState.ENDED) {
                  setVideoWatchComplete(true);
                }
              }
            },
          },
        });
      }
    };

    // When YouTube API is ready
    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    // Clean up
    return () => {
      if (videoIntervalRef.current) {
        clearInterval(videoIntervalRef.current);
      }
    };
  }, [activeTask]);

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
                status: userTask.status,
                rejectionReason: userTask.rejectionReason,
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

  // Load user earnings
  const loadEarnings = async () => {
    if (!user || !user.token) return;
    try {
      const res = await getTasksEarnings(user.token);
      console.log("Received earnings data:", res.data);
      setEarnings(res.data.totalEarnings || 0);
    } catch (err) {
      console.error("Error loading earnings:", err);
      setEarnings(0);
    }
  };

  // Filter tasks based on selected option
  const filteredTasks = tasks.filter((task) => {
    if (filterOption === "all") return true;
    if (filterOption === "completed") return task.completed;
    if (filterOption === "pending")
      return (
        !task.completed &&
        task.status !== "pending_verification" &&
        task.status !== "rejected"
      );
    if (filterOption === "rejected") return task.status === "rejected";
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

      // Update the activeTask directly with startedAt property
      setActiveTask((prevTask) => ({
        ...prevTask,
        startedAt: new Date(),
      }));

      // Also update the task in the tasks array
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, startedAt: new Date() } : task
        )
      );
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
    setVideoWatchTime(0);
    setVideoWatchComplete(false);

    // Clear any existing interval
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
  };

  // Close task details
  const closeTaskDetails = () => {
    if (verificationStatus === "verifying") return; // Prevent closing during verification

    // Clean up video tracking
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }

    setActiveTask(null);
    setVerificationInput("");
    setVerificationStatus("idle");
    setError("");
    setScreenshot(null);
    setScreenshotPreview(null);
    setVideoWatchTime(0);
    setVideoWatchComplete(false);
  };

  // Reset filter to show all tasks
  const resetFilter = () => setFilterOption("all");

  // Handle screenshot file selection
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

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle task verification
  const verifyTask = async (taskId) => {
    if (!user || !user.token) {
      toast.error("Please login to verify task completion.");
      return;
    }

    // For YouTube watch tasks, verification is fully automatic
    if (activeTask.type === "youtube_watch") {
      // Only verify if enough watch time has accumulated
      if (
        videoWatchTime < parseInt(activeTask.videoDuration || 1) &&
        !videoWatchComplete
      ) {
        toast.error("Please finish watching the video first.");
        return;
      }

      setVerificationStatus("verifying");
      setError("");

      try {
        // Send verification data for YouTube watch
        const verificationData = {
          videoUrl: activeTask.externalUrl,
          watchedDuration: videoWatchTime,
          autoVerified: true,
        };

        const res = await verifyTaskCompletion(
          taskId,
          verificationData,
          user.token
        );

        if (res.data.success) {
          // Update the task to completed
          const updatedTasks = tasks.map((task) =>
            task._id === taskId
              ? { ...task, completed: true, verified: true }
              : task
          );
          setTasks(updatedTasks);

          const rewardAmount = activeTask.reward.toFixed(3);
          toast.success(`Task completed! +${rewardAmount} ETH earned`);

          // Update earnings immediately
          loadEarnings();

          // Reset after showing completion
          setTimeout(() => {
            setActiveTask(null);
            setVerificationStatus("idle");
            setVideoWatchTime(0);
            setVideoWatchComplete(false);

            // Refresh the full task list
            loadTasks();
          }, 3000);
        } else {
          setVerificationStatus("error");
          setError(
            res.data.message || "Verification failed. Please try again."
          );
          toast.error(
            res.data.message || "Verification failed. Please try again."
          );
        }
      } catch (err) {
        setVerificationStatus("error");
        console.error("Error verifying task:", err);
        setError("An error occurred during verification. Please try again.");
        toast.error("An error occurred during verification. Please try again.");
      }
      return;
    }

    // Start verification process for other task types
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

      // Send verification request to API
      console.log("Sending verification data:", verificationData);
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
            setVideoWatchTime(0);
            setVideoWatchComplete(false);

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
            setVideoWatchTime(0);
            setVideoWatchComplete(false);

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
      setVerificationStatus("error");
      console.error("Error verifying task:", err);
      setError("An error occurred during verification. Please try again.");
      toast.error("An error occurred during verification. Please try again.");
    }
  };

  return (
    <div className="tasks-page">
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
            <button
              className={`filter-option ${
                filterOption === "rejected" ? "active" : ""
              }`}
              onClick={() => setFilterOption("rejected")}
            >
              Rejected
            </button>
          </div>
        </div>

        {error && !activeTask && <div className="error-message">{error}</div>}

        <div className="tasks-list">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              message={
                filterOption === "completed"
                  ? "You haven't completed any tasks yet."
                  : filterOption === "pending"
                  ? "No pending tasks found."
                  : filterOption === "rejected"
                  ? "You don't have any rejected tasks."
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
                } ${task.status === "rejected" ? "rejected" : ""}`}
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
                  ) : task.status === "rejected" ? (
                    <div className="rejected-badge">
                      <AlertTriangle size={16} />
                      <span>Rejected</span>
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

                {task.status === "rejected" && task.rejectionReason && (
                  <div className="task-rejection-info">
                    <div className="rejection-label">Reason for rejection:</div>
                    <div className="rejection-reason">
                      {task.rejectionReason}
                    </div>
                  </div>
                )}

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
                    : task.status === "rejected"
                    ? "View Details"
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

                {/* Show rejection reason if task was rejected */}
                {activeTask.status === "rejected" &&
                  activeTask.rejectionReason && (
                    <div className="task-rejection-details">
                      <h3>Task Rejected</h3>
                      <p className="rejection-reason">
                        <strong>Reason:</strong> {activeTask.rejectionReason}
                      </p>
                      <p className="rejection-note">
                        You can start a new task to earn rewards. If you believe
                        this was rejected in error, please contact support.
                      </p>
                    </div>
                  )}

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

                {/* Show screenshot instructions for screenshot tasks */}
                {activeTask.type === "screenshot" && (
                  <div className="screenshot-instructions">
                    {/* Display custom screenshot instructions if they exist, otherwise use default */}
                    <p className="instructions-text">
                      {activeTask.screenshotInstructions
                        ? activeTask.screenshotInstructions
                        : "Take a screenshot showing you've completed the task. Make sure important details are clearly visible."}
                    </p>
                    {/* Show required indicator if screenshot is required */}
                    {activeTask.screenshotRequired && (
                      <div className="screenshot-required-notice">
                        <AlertTriangle size={14} className="required-icon" />
                        <span>
                          A screenshot is required to verify this task
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Show external URL link if not YouTube watch task */}
                {activeTask.externalUrl &&
                  activeTask.type !== "youtube_watch" && (
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

                {/* Only show the start button for non-rejected tasks */}
                {!activeTask.completed &&
                  activeTask.status !== "pending_verification" &&
                  activeTask.status !== "rejected" &&
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
                          Starting this task will allow you to submit
                          verification when complete.
                        </span>
                      </div>
                    </div>
                  )}

                {/* If task is completed, show completion info */}
                {activeTask.completed && (
                  <div className="task-completed-info">
                    <div className="completed-status">
                      <CheckIcon size={24} />
                      <span>Task Completed</span>
                    </div>
                    <p>
                      You've successfully completed this task and earned{" "}
                      <strong>{activeTask.reward.toFixed(3)} ETH</strong>!
                    </p>
                  </div>
                )}

                {/* Only show verification UI if task is started but not completed */}
                {!activeTask.completed &&
                  activeTask.status !== "pending_verification" &&
                  activeTask.status !== "rejected" &&
                  activeTask.startedAt && (
                    <div className="verification-section">
                      {/* YouTube watch task */}

                      {/* YouTube watch tasks: show complete button when watch time reaches required duration */}
                      {/* YouTube watch task */}
                      {activeTask.type === "youtube_watch" && (
                        <div className="youtube-container">
                          <h3>Watch the Video</h3>
                          <div className="youtube-video-wrapper">
                            <iframe
                              ref={youtubePlayerRef}
                              width="100%"
                              height="315"
                              src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                                activeTask.externalUrl
                              )}?enablejsapi=1`}
                              title="YouTube Video"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                            <div className="video-progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (videoWatchTime /
                                      parseInt(
                                        activeTask.videoDuration || 30
                                      )) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="video-tracking-info">
                            <div className="tracking-icon">
                              <ClockIcon size={16} />
                            </div>
                            <div className="tracking-details">
                              <p className="tracking-message">
                                Watch the video for{" "}
                                {activeTask.videoDuration || 30} seconds to
                                complete this task.
                              </p>
                              <div className="tracking-progress">
                                <span>Progress:</span>
                                <span className="progress-number">
                                  {Math.floor(videoWatchTime)} /{" "}
                                  {activeTask.videoDuration || 30} seconds
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Always show a verification button for YouTube tasks */}
                          <div className="verification-action youtube-verify-action">
                            {verificationStatus === "error" && (
                              <div className="verification-error">
                                <AlertTriangle size={16} />
                                <span>{error}</span>
                              </div>
                            )}

                            <button
                              className="submit-verification-button"
                              onClick={() => verifyTask(activeTask._id)}
                              disabled={verificationStatus === "verifying"}
                            >
                              {videoWatchTime >=
                              parseInt(activeTask.videoDuration || 30)
                                ? verificationStatus === "idle"
                                  ? "Complete Task & Earn Reward"
                                  : verificationStatus === "verifying"
                                  ? "Verifying..."
                                  : verificationStatus === "complete"
                                  ? "Task Completed!"
                                  : "Try Again"
                                : `Watch ${
                                    parseInt(activeTask.videoDuration || 30) -
                                    Math.floor(videoWatchTime)
                                  } more seconds to complete`}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Screenshot upload for screenshot tasks */}
                      {activeTask.type === "screenshot" && (
                        <div className="screenshot-upload-section">
                          <h3>Upload Verification</h3>
                          <div className="upload-container">
                            <label
                              htmlFor="screenshot-upload"
                              className="upload-label"
                            >
                              {screenshotPreview ? (
                                <div className="preview-container">
                                  <img
                                    src={screenshotPreview}
                                    alt="Screenshot preview"
                                    className="screenshot-preview"
                                  />
                                  <div className="preview-overlay">
                                    <span>Change Image</span>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="upload-icon">
                                    <Camera size={24} />
                                  </div>
                                  <div className="upload-text">
                                    <span className="primary-text">
                                      Upload Screenshot
                                    </span>
                                    <span className="secondary-text">
                                      Click or drag image here
                                    </span>
                                  </div>
                                </>
                              )}
                            </label>
                            <input
                              type="file"
                              id="screenshot-upload"
                              accept="image/*"
                              onChange={handleScreenshotChange}
                              className="hidden-file-input"
                            />
                          </div>
                        </div>
                      )}

                      {/* Verification input for other task types (not YouTube watch) */}
                      {activeTask.type !== "screenshot" &&
                        activeTask.type !== "youtube_watch" && (
                          <div className="verification-input-section">
                            <h3>Verify Completion</h3>
                            <div className="input-container">
                              <label className="input-label">
                                {activeTask.type === "twitter_follow" ||
                                activeTask.type === "twitter_share"
                                  ? "Enter the URL of your Twitter post/profile:"
                                  : activeTask.type === "youtube_subscribe"
                                  ? "Enter the URL of the YouTube channel:"
                                  : activeTask.type === "telegram_join"
                                  ? "Enter your Telegram username:"
                                  : "Enter verification information:"}
                              </label>
                              <input
                                type="text"
                                value={verificationInput}
                                onChange={(e) =>
                                  setVerificationInput(e.target.value)
                                }
                                placeholder={
                                  activeTask.type === "twitter_follow" ||
                                  activeTask.type === "twitter_share"
                                    ? "https://twitter.com/..."
                                    : activeTask.type === "youtube_subscribe"
                                    ? "https://youtube.com/..."
                                    : activeTask.type === "telegram_join"
                                    ? "@username"
                                    : "Verification information..."
                                }
                                className="verification-input"
                              />
                            </div>
                          </div>
                        )}

                      {/* Verification submit button (only show for non-YouTube watch tasks) */}
                      {activeTask.type !== "youtube_watch" && (
                        <div className="verification-action">
                          {verificationStatus === "error" && (
                            <div className="verification-error">
                              <AlertTriangle size={16} />
                              <span>{error}</span>
                            </div>
                          )}
                          <button
                            className="submit-verification-button"
                            onClick={() => verifyTask(activeTask._id)}
                            disabled={verificationStatus === "verifying"}
                          >
                            {verificationStatus === "idle"
                              ? "Submit for Verification"
                              : verificationStatus === "verifying"
                              ? "Verifying..."
                              : verificationStatus === "complete"
                              ? "Verification Submitted!"
                              : "Try Again"}
                          </button>
                        </div>
                      )}
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
