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
  StarIcon, // For level indicators
  LockIcon, // For locked tasks
} from "../utils/icons";
import {
  getUserTasks,
  getAllTasks,
  verifyTaskCompletion,
  getTasksEarnings,
  startTask,
} from "../functions/tasks";
import { getUserWallet } from "../functions/wallet";
import "./Tasks.css";
import { Camera, Upload, AlertTriangle } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import LoadingSpinner from "../hooks/LoadingSpinner";
import TasksIntroPage from "./TasksIntroPage";
import NoNetModal from "../components/NoNetModal/NoNetModal";

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
  const { refreshWalletBalance } = useWallet();

  // Component state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [verificationInput, setVerificationInput] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
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
  const [userLevel, setUserLevel] = useState(1); // Default user level to 1
  const [walletBalance, setWalletBalance] = useState(0);
  const [noNetModal, setNoNetModal] = useState(false);

  // Refs for intersection observer animations
  const headerRef = useRef(null);
  const statsRef = useRef(null);

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

  const loadWalletBalance = async () => {
    if (!user || !user.token) return;

    // Check network status before making API call
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    try {
      const res = await getUserWallet(user.token);
      setWalletBalance(res.data.balance || 0);
      console.log("res.data.level", res.data.level);

      // Set user level from the response
      if (res.data.level) {
        setUserLevel(res.data.level);
      } else {
        // Default to level 1 if no level is found
        setUserLevel(1);
      }
    } catch (err) {
      console.error("Error loading wallet balance:", err);

      // Check if it's a network error
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        setWalletBalance(0);
      }
    }
  };

  // Set up animation observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          // Remove observer once animation is triggered
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    // Observe elements
    if (headerRef.current) observer.observe(headerRef.current);
    if (statsRef.current) observer.observe(statsRef.current);
    return () => {
      // Clean up observers
      if (headerRef.current) observer.unobserve(headerRef.current);
      if (statsRef.current) observer.unobserve(statsRef.current);
    };
  }, []);

  // Add this to your useEffect that runs on component mount:
  useEffect(() => {
    loadTasks();
    if (user) {
      loadEarnings();
      loadWalletBalance(); // Add this line
    }

    // Clean up video interval if component unmounts
    return () => {
      if (videoIntervalRef.current) {
        clearInterval(videoIntervalRef.current);
      }
    };

    // Other cleanup code...
  }, [user]);

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
    if (user && user.token) {
      // Check network status before making API call
      if (!navigator.onLine) {
        setNoNetModal(true);
        setLoading(false);
        return;
      }

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

            // Check if it's a network error
            if (
              (err.message && err.message.includes("network")) ||
              err.code === "NETWORK_ERROR" ||
              !navigator.onLine
            ) {
              setNoNetModal(true);
            }
            // Continue with the tasks we have
          }
        }

        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error("Error loading tasks:", err);

        // Check if it's a network error
        if (
          (err.message && err.message.includes("network")) ||
          err.code === "NETWORK_ERROR" ||
          !navigator.onLine
        ) {
          setNoNetModal(true);
        } else {
          setError("Error loading tasks. Please try again.");
          toast.error("Failed to load tasks. Please refresh the page.");
        }
      }
    }
  };

  // Load user earnings
  const loadEarnings = async () => {
    if (!user || !user.token) return;

    // Check network status before making API call
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    try {
      const res = await getTasksEarnings(user.token);
      console.log("Received earnings data:", res.data);
      setEarnings(res.data.totalEarnings || 0);
    } catch (err) {
      console.error("Error loading earnings:", err);

      // Check if it's a network error
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        setEarnings(0);
      }
    }
  };

  // Filter tasks based on selected option and level
  const filteredTasks = tasks.filter((task) => {
    // First check level filter
    if (!task.minLevel) task.minLevel = 1; // Ensure all tasks have a minLevel

    // Tasks only available for user's level or below
    if (task.minLevel > userLevel) return false;

    // Then apply regular status filter
    if (filterOption === "all") return true;
    if (filterOption === "completed") return task.completed;
    if (filterOption === "pending")
      return (
        !task.completed &&
        task.status !== "pending_verification" &&
        task.status !== "rejected"
      );
    if (filterOption === "rejected") return task.status === "rejected";

    // Then apply optional level filter (if not "all")
    if (levelFilter !== "all") {
      const requiredLevel = parseInt(levelFilter);
      return task.minLevel === requiredLevel;
    }

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

    // Check network status before starting task
    if (!navigator.onLine) {
      setNoNetModal(true);
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

      // Check if it's a network error
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        toast.error("Failed to start task. Please try again.");
      }
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
  const resetFilter = () => {
    setFilterOption("all");
    setLevelFilter("all");
  };

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

  // YouTube video task verification
  const handleYoutubeVideoVerification = async (taskId) => {
    if (!user || !user.token) {
      toast.error("Please login to verify task completion.");
      return;
    }

    // Only verify if enough watch time has accumulated
    if (
      videoWatchTime < parseInt(activeTask.videoDuration || 30) &&
      !videoWatchComplete
    ) {
      toast.error(
        `Please watch at least ${activeTask.videoDuration} seconds of the video.`
      );
      return;
    }

    verifyTask(taskId);
  };

  // Verify task completion
  const verifyTask = async (taskId) => {
    if (!user || !user.token) {
      toast.error("Please login to verify task completion.");
      return;
    }

    setVerificationStatus("verifying");
    setError("");

    try {
      let verificationData = {};

      // If it's a screenshot task and screenshot is required
      if (
        activeTask.type === "screenshot" &&
        activeTask.screenshotRequired &&
        screenshot
      ) {
        const base64Screenshot = await fileToBase64(screenshot);
        verificationData.screenshot = base64Screenshot;
      }

      // Add verification input if provided
      if (verificationInput.trim()) {
        verificationData.verificationText = verificationInput.trim();
      }

      // For YouTube tasks, add watch time
      if (activeTask.type === "youtube_watch") {
        verificationData.watchTime = videoWatchTime;
      }

      const response = await verifyTaskCompletion(
        taskId,
        verificationData,
        user.token
      );

      setVerificationStatus("success");
      toast.success("Task verification submitted successfully!");

      if (response.data.autoVerified) {
        toast.success("Task automatically verified and reward credited!");
        refreshWalletBalance();
      } else {
        toast.success("Task submitted for verification by admin.");
      }

      // Update task status in the tasks array
      const updatedTasks = tasks.map((task) => {
        if (task._id === taskId) {
          return {
            ...task,
            status: response.data.autoVerified
              ? "verified"
              : "pending_verification",
            completed: response.data.autoVerified,
          };
        }
        return task;
      });

      setTasks(updatedTasks);

      // Close modal after a short delay
      setTimeout(() => {
        closeTaskDetails();
        refreshWalletBalance();
      }, 2000);
    } catch (err) {
      console.error("Error verifying task:", err);
      setVerificationStatus("idle");
      setError(
        err.response?.data?.message ||
          "Failed to verify task. Please try again."
      );
      toast.error(
        err.response?.data?.message ||
          "Failed to verify task. Please try again."
      );
    }
  };

  const handleRetry = () => {
    if (navigator.onLine) {
      setNoNetModal(false);
      // Reload the page to refetch data
      window.location.reload();
    } else {
      toast.error("Still no internet connection. Please check your network.");
    }
  };

  // Count tasks for each level
  const tasksPerLevel = [1, 2, 3, 4].map((level) => {
    return {
      level,
      count: tasks.filter((task) => (task.minLevel || 1) === level).length,
    };
  });

  return (
    <>
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

        {!user ? (
          <TasksIntroPage />
        ) : (
          <div className="container">
            <div className="tasks-hero">
              <div className="container">
                <div className="tasks-header" ref={headerRef}>
                  <div className="header-content-tasks">
                    <h1 className="page-title">Daily Tasks</h1>
                    <p className="page-description">
                      Complete tasks to earn rewards and increase your level.
                      New tasks are available every day.
                    </p>
                    <div className="header-actions">
                      <div className="user-level-indicator">
                        <div className="level-badge">Level {userLevel}</div>
                        <div className="level-progress">
                          <div
                            className="level-progress-bar"
                            style={{
                              width: `${Math.min(userLevel * 10, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="header-graphic">
                    <div className="tasks-graphic-container animate-float">
                      <div className="tasks-graphic-inner">
                        <div className="tasks-graphic-circle circle-1"></div>
                        <div className="tasks-graphic-circle circle-2"></div>
                        <div className="tasks-graphic-circle circle-3"></div>
                        <div className="tasks-graphic-checklist"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tasks-statistics" ref={statsRef}>
              <div className="stat-card-tasks">
                <div className="stat-title-tasks">Total Available Rewards</div>
                <div className="stat-value">
                  <EthereumIcon size={18} />
                  <span>{totalRewards.toFixed(3)} USD</span>
                </div>
              </div>

              <div className="stat-card-tasks">
                <div className="stat-title-tasks">Your Wallet Balance</div>
                <div className="stat-value">
                  <EthereumIcon size={18} />
                  <span>{walletBalance.toFixed(3)} USD</span>
                </div>
                <Link to="/wallet" className="wallet-link wallet-link-tasks">
                  View Wallet
                </Link>
              </div>

              <div className="stat-card-tasks">
                <div className="stat-title-tasks">Completion Rate</div>
                <div className="stat-value">
                  <span>
                    {tasks.length > 0
                      ? Math.round(
                          (tasks.filter((t) => t.completed).length /
                            tasks.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="progress-bar-tasks">
                  <div
                    className="progress-fill-tasks"
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
              <div className="stat-card-tasks">
                <div className="stat-title-tasks">Today's Tasks</div>
                <div className="stat-value">
                  <div className="stat-value">
                    {new Date().toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="stat-icon today-icon"></div>
              </div>
            </div>

            {/* Level-based tasks info */}
            <div className="level-tasks-info">
              <h3>Rewards Per Level</h3>
              <div className="level-tasks-grid">
                {[1, 2, 3, 4].map((level) => {
                  const levelTasks = tasks.filter(
                    (task) => (task.minLevel || 1) === level
                  );
                  const totalReward = levelTasks
                    .reduce((sum, task) => sum + task.reward, 0)
                    .toFixed(3);

                  return (
                    <div
                      className={`level-task-count ${
                        level > userLevel ? "locked-level" : ""
                      }`}
                      key={level}
                    >
                      <div className={`level-number level-${level}`}>
                        Level {level}
                        {level > userLevel && (
                          <LockIcon size={14} className="lock-icon" />
                        )}
                      </div>
                      <div className="reward-amount">
                        <EthereumIcon size={14} />
                        <span>{totalReward} USD</span>
                      </div>
                      <div className="task-count small">
                        ({levelTasks.length} Tasks)
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="user-level-indicator">
                Your Level: <span className="current-level">{userLevel}</span>
                {userLevel < 4 && (
                  <div className="level-up-hint">
                    <InfoIcon size={16} />
                    <span>Level up to unlock more rewards!</span>
                  </div>
                )}
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

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <div className="loading-indicator">
                <LoadingSpinner />
              </div>
            ) : filteredTasks.length === 0 ? (
              // Show network error UI when filter is "all" and no tasks, otherwise show normal empty state
              filterOption === "all" && tasks.length === 0 ? (
                <div className="network-error-container-tasks">
                  <div className="network-error-content">
                    <div className="network-error-icon">
                      <div className="wifi-icon">
                        <div className="wifi-circle wifi-circle-1"></div>
                        <div className="wifi-circle wifi-circle-2"></div>
                        <div className="wifi-circle wifi-circle-3"></div>
                        <div className="wifi-base"></div>
                        <div className="wifi-slash"></div>
                      </div>
                    </div>
                    <div className="network-error-text">
                      <h3>Failed to Load Tasks</h3>
                      <p>
                        It looks like you're not connected to the internet.
                        Please check your connection and try again.
                      </p>
                    </div>
                    <div className="network-error-actions">
                      <button
                        className="retry-btn"
                        onClick={() => window.location.reload()}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                          <path d="M21 3v5h-5" />
                          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                          <path d="M3 21v-5h5" />
                        </svg>
                        Try Again
                      </button>
                      <button
                        className="offline-mode-btn"
                        onClick={() =>
                          toast.info(
                            "Offline mode - Some features may be limited"
                          )
                        }
                      >
                        Continue Offline
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  message={
                    filterOption === "all"
                      ? "No tasks available at the moment."
                      : `No ${filterOption} tasks found.`
                  }
                  filterOption={filterOption}
                  onReset={() => setFilterOption("all")}
                />
              )
            ) : (
              <div className="tasks-list">
                {loading ? (
                  <div className="loading-container loading-container-grid">
                    <LoadingSpinner />
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
                      className={`task-card ${
                        task.completed ? "completed" : ""
                      } ${
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
                            <span>{task.reward.toFixed(3)} USD</span>
                          </div>
                        )}
                      </div>

                      <h3 className="task-title">{task.title}</h3>
                      <p className="task-description">{task.description}</p>

                      {task.status === "rejected" && task.rejectionReason && (
                        <div className="task-rejection-info">
                          <div className="rejection-label">
                            Reason for rejection:
                          </div>
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
            )}

            {/* Task details modal */}
            {activeTask && (
              <div className="task-modal-overlay" onClick={closeTaskDetails}>
                <div
                  className="task-modal"
                  onClick={(e) => e.stopPropagation()}
                >
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
                      <span>{activeTask.reward.toFixed(3)} USD</span>
                    </div>
                  </div>

                  <div className="task-modal-content">
                    <p className="task-full-description">
                      {activeTask.description}
                    </p>

                    {/* Show task steps for all tasks */}
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
                            <AlertTriangle
                              size={14}
                              className="required-icon"
                            />
                            <span>
                              A screenshot is required to verify this task
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tasks under verification: Show verification status instead of external link */}
                    {activeTask.status === "pending_verification" ? (
                      <div className="verification-status-message">
                        <div className="verification-status-icon">
                          <ClockIcon size={18} />
                        </div>
                        <div className="verification-status-text">
                          <span className="status-title">
                            Under Verification
                          </span>
                          <span className="status-description">
                            Our team is reviewing your submission. You'll be
                            notified once verified.
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Show external URL link for regular tasks that aren't YouTube watch */
                      activeTask.externalUrl &&
                      activeTask.type !== "youtube_watch" &&
                      !activeTask.completed &&
                      activeTask.status !== "rejected" && (
                        <a
                          href={activeTask.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="task-link-button"
                        >
                          <span>Go to Task</span>
                          <ExternalLinkIcon size={16} />
                        </a>
                      )
                    )}

                    {/* Show rejection reason if task was rejected */}
                    {activeTask.status === "rejected" &&
                      activeTask.rejectionReason && (
                        <div className="task-rejection-details">
                          <h3>Task Rejected</h3>
                          <p className="rejection-reason">
                            <strong>Reason:</strong>{" "}
                            {activeTask.rejectionReason}
                          </p>
                          <p className="rejection-note">
                            You can try a different task to earn rewards. If you
                            believe this was rejected in error, please contact
                            support.
                          </p>
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
                          <strong>{activeTask.reward.toFixed(3)} USD</strong>!
                        </p>
                      </div>
                    )}

                    {/* Only show the start button for non-rejected tasks that haven't been started */}
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

                    {/* Only show verification UI if task is started but not completed */}
                    {!activeTask.completed &&
                      activeTask.status !== "pending_verification" &&
                      activeTask.status !== "rejected" &&
                      activeTask.startedAt && (
                        <div className="verification-section">
                          {/* YouTube watch task */}
                          {activeTask.type === "youtube_watch" && (
                            <div className="youtube-container">
                              <h3>Watch the Video</h3>
                              <div className="youtube-video-wrapper">
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
                                  className={`submit-verification-button ${
                                    videoWatchTime <
                                    parseInt(activeTask.videoDuration || 30)
                                      ? "incomplete-button"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleYoutubeVideoVerification(
                                      activeTask._id
                                    )
                                  }
                                  disabled={
                                    videoWatchTime <
                                      parseInt(
                                        activeTask.videoDuration || 30
                                      ) || verificationStatus === "verifying"
                                  }
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
                                        parseInt(
                                          activeTask.videoDuration || 30
                                        ) - Math.floor(videoWatchTime)
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
                                  disabled={
                                    (activeTask.screenshotRequired &&
                                      !screenshot) ||
                                    verificationStatus === "verifying"
                                  }
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
                            </div>
                          )}

                          {/* Custom task verification */}
                          {activeTask.type === "custom" && (
                            <div className="custom-task-verification">
                              <h3>Task Verification</h3>
                              <p className="verification-note">
                                Complete all the steps above to verify this
                                task.
                              </p>

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
                                    ? "Verify Completion"
                                    : verificationStatus === "verifying"
                                    ? "Verifying..."
                                    : verificationStatus === "complete"
                                    ? "Task Completed!"
                                    : "Try Again"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
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

export default Tasks;
