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
  XIcon,
  StarIcon,
  LockIcon,
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
import { getUserInvestments } from "../functions/user";
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
  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [earnings, setEarnings] = useState(0);
  const [error, setError] = useState("");
  const [isStartingTask, setIsStartingTask] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [pendingVerificationTasks, setPendingVerificationTasks] = useState([]);
  const [videoWatchTime, setVideoWatchTime] = useState(0);
  const [userInvestments, setUserInvestments] = useState([]);
  const [videoWatchComplete, setVideoWatchComplete] = useState(false);
  const youtubePlayerRef = useRef(null);
  const videoIntervalRef = useRef(null);
  const [userLevel, setUserLevel] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [noNetModal, setNoNetModal] = useState(false);
  // Refs for intersection observer animations
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  // Level colors and configurations
  const levelConfig = {
    1: { color: "#e3f2fd", borderColor: "#2196f3", rewardPercentage: 0.5 },
    2: { color: "#e8f5e8", borderColor: "#4caf50", rewardPercentage: 2.0 },
    3: { color: "#fff3e0", borderColor: "#ff9800", rewardPercentage: 3.0 },
    4: { color: "#fce4ec", borderColor: "#e91e63", rewardPercentage: 4.0 },
  };
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
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }
    try {
      const res = await getUserWallet(user.token);
      setWalletBalance(res.data.balance || 0);
      if (res.data.level) {
        setUserLevel(res.data.level);
      } else {
        setUserLevel(0);
      }
    } catch (err) {
      console.error("Error loading wallet balance:", err);
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
  const loadUserInvestments = async () => {
    if (!user || !user.token) return;
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }
    try {
      const investments = await getUserInvestments(user.token);
      setUserInvestments(investments || []);
    } catch (err) {
      console.error("Error loading user investments:", err);
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        setUserInvestments([]);
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
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    if (headerRef.current) observer.observe(headerRef.current);
    if (statsRef.current) observer.observe(statsRef.current);

    return () => {
      if (headerRef.current) observer.unobserve(headerRef.current);
      if (statsRef.current) observer.unobserve(statsRef.current);
    };
  }, []);
  useEffect(() => {
    loadTasks();
    if (user) {
      loadEarnings();
      loadWalletBalance();
      loadUserInvestments();
    }
    return () => {
      if (videoIntervalRef.current) {
        clearInterval(videoIntervalRef.current);
      }
    };
  }, [user]);
  // Check if user has purchased a specific level plan
  const hasUserPurchasedLevel = (level) => {
    if (!userInvestments || userInvestments.length === 0) return false;
    return userInvestments.some((investment) => {
      const planLevel = investment.plan?.minLevel || investment.plan?.level;
      return planLevel === level;
    });
  };
  // Get user's investment for a specific level
  const getUserInvestmentForLevel = (level) => {
    if (!userInvestments || userInvestments.length === 0) return null;
    return userInvestments.find((investment) => {
      const planLevel = investment.plan?.minLevel || investment.plan?.level;
      return planLevel === level;
    });
  };
  // Calculate total reward for completing all tasks in a level
  const calculateLevelTotalReward = (level) => {
    const investment = getUserInvestmentForLevel(level);
    if (!investment) return 0;

    const levelPercentage = levelConfig[level]?.rewardPercentage || 0;
    return (investment.amount * levelPercentage) / 100;
  };
  // Calculate individual task reward (total reward / 5 tasks)
  const calculateTaskReward = (level) => {
    const totalReward = calculateLevelTotalReward(level);
    return totalReward / 5; // 5 tasks per level
  };
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
        if (user && user.token) {
          try {
            const userTasksRes = await getUserTasks(user.token);
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
            const pendingTasks = updatedTasks.filter(
              (task) => task.status === "pending_verification"
            );
            setPendingVerificationTasks(pendingTasks);
          } catch (err) {
            console.error("Error loading user tasks:", err);
            if (
              (err.message && err.message.includes("network")) ||
              err.code === "NETWORK_ERROR" ||
              !navigator.onLine
            ) {
              setNoNetModal(true);
            }
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading tasks:", err);
        setError("Failed to load tasks. Please try again.");
        setLoading(false);
        if (
          (err.message && err.message.includes("network")) ||
          err.code === "NETWORK_ERROR" ||
          !navigator.onLine
        ) {
          setNoNetModal(true);
        }
      }
    } else {
      setTasks([]);
      setLoading(false);
    }
  };
  // Load earnings
  const loadEarnings = async () => {
    if (!user || !user.token) return;
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }
    try {
      const res = await getTasksEarnings(user.token);
      setEarnings(res.data.totalEarnings || 0);
    } catch (err) {
      console.error("Error loading earnings:", err);
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      }
    }
  };
  // Handle retry for network issues
  const handleRetry = () => {
    if (navigator.onLine) {
      setNoNetModal(false);
      if (user && user.token) {
        loadTasks();
        loadEarnings();
        loadWalletBalance();
        loadUserInvestments();
      }
    } else {
      toast.error("Still no internet connection. Please check your network.");
    }
  };
  // Filter tasks based on current filters
  const getFilteredTasks = () => {
    let filtered = tasks;
    // Apply status filter
    if (filterOption === "completed") {
      filtered = filtered.filter((task) => task.completed);
    } else if (filterOption === "available") {
      filtered = filtered.filter((task) => !task.completed);
    } else if (filterOption === "pending") {
      filtered = filtered.filter(
        (task) => task.status === "pending_verification"
      );
    }
    return filtered;
  };
  // Group tasks by level and only return levels that have tasks
  const getTasksByLevel = () => {
    const filtered = getFilteredTasks();
    const grouped = {};

    for (let level = 1; level <= 4; level++) {
      const levelTasks = filtered.filter((task) => task.minLevel === level);
      if (levelTasks.length > 0) {
        grouped[level] = levelTasks;
      }
    }

    return grouped;
  };
  const tasksByLevel = getTasksByLevel();
  // Handle task click
  const handleTaskClick = (task) => {
    setActiveTask(task);
    setVerificationInput("");
    setVideoWatchTime(0);
    setVideoWatchComplete(false);
    setScreenshot(null);
    setScreenshotPreview(null);
  };
  // Close modal
  const closeModal = () => {
    setActiveTask(null);
    setVerificationStatus("idle");
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
    }
  };
  // Start task
  const handleStartTask = async (taskId) => {
    if (!user || !user.token) {
      toast.error("Please login to start tasks");
      return;
    }
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }
    try {
      setIsStartingTask(true);
      await startTask(taskId, user.token);
      toast.success("Task started successfully!");
      await loadTasks();
    } catch (err) {
      console.error("Error starting task:", err);
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        toast.error(err.response?.data?.message || "Failed to start task");
      }
    } finally {
      setIsStartingTask(false);
    }
  };
  // Handle screenshot upload
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  // Verify task
  const verifyTask = async (taskId, additionalData = {}) => {
    if (!user || !user.token) {
      toast.error("Please login to verify tasks");
      return;
    }
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }
    try {
      setVerificationStatus("verifying");
      const verificationData = {
        ...additionalData,
      };
      if (activeTask.type === "youtube_watch") {
        verificationData.watchTime = videoWatchTime;
      } else if (activeTask.type === "screenshot") {
        if (!screenshot) {
          toast.error("Please upload a screenshot");
          setVerificationStatus("idle");
          return;
        }
        verificationData.screenshot = screenshot;
      } else {
        verificationData.code = verificationInput.trim();
        if (!verificationData.code) {
          toast.error("Please enter the verification code");
          setVerificationStatus("idle");
          return;
        }
      }
      const res = await verifyTaskCompletion(
        taskId,
        verificationData,
        user.token
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setVerificationStatus("success");
        refreshWalletBalance();
        await loadTasks();
        await loadEarnings();
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        toast.error(res.data.message || "Verification failed");
        setVerificationStatus("error");
      }
    } catch (err) {
      console.error("Error verifying task:", err);
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        const errorMessage =
          err.response?.data?.message || "Verification failed";
        toast.error(errorMessage);
        setVerificationStatus("error");
      }
    }
  };
  // Render task card
  const renderTaskCard = (task, level) => {
    const isLocked = !hasUserPurchasedLevel(level);
    const taskReward = calculateTaskReward(level);
    const levelColors = levelConfig[level];
    return (
      <div
        key={task._id}
        className={`task-card ${task.completed ? "completed" : ""} ${
          isLocked ? "locked" : ""
        }`}
        onClick={() => !isLocked && handleTaskClick(task)}
        style={{
          backgroundColor: levelColors.color,
          borderLeft: `4px solid ${levelColors.borderColor}`,
          opacity: isLocked ? 0.6 : 1,
          cursor: isLocked ? "not-allowed" : "pointer",
        }}
      >
        {isLocked && (
          <div className="task-lock-overlay">
            <LockIcon size={24} />
            <span>Level {level} Required</span>
          </div>
        )}
        <div className="task-status">
          {task.completed ? (
            <div className="completed-badge">
              <CheckIcon size={16} />
              Completed
            </div>
          ) : task.status === "pending_verification" ? (
            <div className="pending-badge">
              <ClockIcon size={16} />
              Pending Review
            </div>
          ) : task.status === "rejected" ? (
            <div className="rejected-badge">
              <XIcon size={16} />
              Rejected
            </div>
          ) : (
            <div className="reward-badge">
              <EthereumIcon size={16} />${taskReward.toFixed(3)}
            </div>
          )}
        </div>
        <h3 className="task-title">{task.title}</h3>
        <p className="task-description">{task.description}</p>
        <div className="task-meta">
          <span
            className="difficulty-tag"
            style={{ color: difficultyColors[task.difficulty] }}
          >
            {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
          </span>
          <div className="time-estimate">
            <ClockIcon size={14} />
            {task.estimatedTime}
          </div>
        </div>
        {!isLocked && (
          <button
            className="view-task-button"
            onClick={(e) => {
              e.stopPropagation();
              handleTaskClick(task);
            }}
          >
            {task.completed ? "View Details" : "Start Task"}
          </button>
        )}
      </div>
    );
  };
  // Show intro page if user is not logged in
  if (!user || !user.token) {
    return <TasksIntroPage />;
  }
  // Show loading state
  if (loading) {
    return (
      <>
        <div className="tasks-page">
          <div className="container">
            <LoadingSpinner />
          </div>
        </div>
        <NoNetModal
          classDisplay={noNetModal ? "show" : ""}
          setNoNetModal={setNoNetModal}
          handleRetry={handleRetry}
        />
      </>
    );
  }
  return (
    <>
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
          {/* Header */}
          <div className="tasks-header" ref={headerRef}>
            <h1 className="page-title">Complete Tasks & Earn Rewards</h1>
            <p className="page-description">
              {userInvestments.length === 0
                ? "Purchase an investment plan to unlock tasks and start earning rewards!"
                : "Complete daily tasks to earn rewards based on your investment plans."}
            </p>
          </div>
          {/* Statistics */}
          <div className="tasks-statistics" ref={statsRef}>
            <div className="stat-card-tasks">
              <div className="stat-title-tasks">Total Earnings</div>
              <div className="stat-value">
                <EthereumIcon size={24} />${earnings.toFixed(3)}
              </div>
            </div>
            <div className="stat-card-tasks">
              <div className="stat-title-tasks">Wallet Balance</div>
              <div className="stat-value">
                <EthereumIcon size={24} />${walletBalance.toFixed(3)}
              </div>
            </div>
            <div className="stat-card-tasks">
              <div className="stat-title-tasks">Pending Reviews</div>
              <div className="stat-value">
                <ClockIcon size={24} />
                {pendingVerificationTasks.length}
              </div>
            </div>
            <div className="stat-card-tasks">
              <div className="stat-title-tasks">Completed Tasks</div>
              <div className="stat-value">
                <CheckIcon size={24} />
                {tasks.filter((task) => task.completed).length}
              </div>
            </div>
          </div>
          {/* No Investment Warning */}
          {userInvestments.length === 0 && (
            <div className="no-plan-banner">
              <div className="no-plan-content">
                <InfoIcon size={24} />
                <div>
                  <h3>No Investment Plan Purchased</h3>
                  <p>
                    All task levels are locked. Purchase an investment plan to
                    unlock tasks and start earning.
                  </p>
                </div>
                <Link to="/plans" className="purchase-plan-button">
                  View Plans
                </Link>
              </div>
            </div>
          )}
          {/* Filter Section */}
          <div className="tasks-filter-section">
            <div className="filter-label">Filter:</div>
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
                  filterOption === "available" ? "active" : ""
                }`}
                onClick={() => setFilterOption("available")}
              >
                Available
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
                  filterOption === "pending" ? "active" : ""
                }`}
                onClick={() => setFilterOption("pending")}
              >
                Pending Review
              </button>
            </div>
          </div>
          {/* Tasks by Level - Only show levels that have tasks */}
          {Object.keys(tasksByLevel).map((level) => {
            const levelNum = parseInt(level);
            const levelTasks = tasksByLevel[level];
            const isLevelLocked = !hasUserPurchasedLevel(levelNum);
            const totalReward = calculateLevelTotalReward(levelNum);
            const levelColors = levelConfig[levelNum];
            return (
              <div key={level} className="level-section">
                <div
                  className="level-header"
                  style={{
                    backgroundColor: levelColors.color,
                    borderLeft: `4px solid ${levelColors.borderColor}`,
                  }}
                >
                  <div className="level-info">
                    <h2 className="level-title">
                      <StarIcon size={20} />
                      Level {level} Tasks
                      {isLevelLocked && <LockIcon size={20} />}
                    </h2>
                    <p className="level-description">
                      {isLevelLocked
                        ? `Purchase Level ${level} plan to unlock these tasks`
                        : `Complete all 5 tasks to earn $${totalReward.toFixed(
                            3
                          )} total (${
                            levelConfig[levelNum].rewardPercentage
                          }% of your investment)`}
                    </p>
                  </div>
                  {!isLevelLocked && (
                    <div className="level-reward">
                      <div className="total-reward">
                        <EthereumIcon size={16} />${totalReward.toFixed(3)}{" "}
                        Total
                      </div>
                      <div className="per-task-reward">
                        ${(totalReward / 5).toFixed(3)} per task
                      </div>
                    </div>
                  )}
                </div>
                <div className="level-tasks-grid">
                  {levelTasks.map((task) => renderTaskCard(task, levelNum))}
                </div>
              </div>
            );
          })}
          {/* Empty State */}
          {Object.keys(tasksByLevel).length === 0 && (
            <EmptyState
              message="No tasks found matching your criteria"
              filterOption={filterOption}
              onReset={() => {
                setFilterOption("all");
              }}
            />
          )}
        </div>
        {/* Task Modal */}
        {activeTask && (
          <div className="task-modal-overlay" onClick={closeModal}>
            <div className="task-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal-button" onClick={closeModal}>
                ×
              </button>
              <div className="task-modal-header">
                <h2>{activeTask.title}</h2>
                <div className="task-reward">
                  <EthereumIcon size={16} />$
                  {calculateTaskReward(activeTask.minLevel).toFixed(3)}
                </div>
              </div>
              <div className="task-modal-content">
                <div className="task-full-description">
                  {activeTask.description}
                </div>
                {activeTask.steps && activeTask.steps.length > 0 && (
                  <div className="task-steps">
                    <h3>Steps to Complete:</h3>
                    <ol>
                      {activeTask.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {activeTask.externalUrl && (
                  <a
                    href={activeTask.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="task-link-button"
                  >
                    Open Link
                    <ExternalLinkIcon size={16} />
                  </a>
                )}
                {/* YouTube Video Embed */}
                {activeTask.type === "youtube_watch" &&
                  activeTask.externalUrl && (
                    <div className="youtube-container">
                      <iframe
                        ref={youtubePlayerRef}
                        width="100%"
                        height="315"
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                          activeTask.externalUrl
                        )}?enablejsapi=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                      {activeTask.autoVerify && (
                        <div className="video-progress">
                          <p>
                            Watch Time: {videoWatchTime}s /{" "}
                            {activeTask.videoDuration}s
                          </p>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${Math.min(
                                  (videoWatchTime /
                                    parseInt(activeTask.videoDuration || 30)) *
                                    100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          {videoWatchComplete && (
                            <p className="watch-complete">
                              ✅ Video watching completed!
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                {/* Screenshot Upload */}
                {activeTask.type === "screenshot" && (
                  <div className="screenshot-section">
                    <h3>Upload Screenshot</h3>
                    {activeTask.screenshotInstructions && (
                      <div className="screenshot-instructions">
                        <InfoIcon size={16} />
                        <p>{activeTask.screenshotInstructions}</p>
                      </div>
                    )}

                    <div className="screenshot-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="screenshot-input"
                        id="screenshot-upload"
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className="screenshot-upload-button"
                      >
                        <Camera size={20} />
                        Choose Image
                      </label>
                    </div>
                    {screenshotPreview && (
                      <div className="screenshot-preview">
                        <img src={screenshotPreview} alt="Screenshot preview" />
                      </div>
                    )}
                  </div>
                )}
                {/* Verification Section */}
                {activeTask.type === "custom" && !activeTask.completed && (
                  <div className="verification-section">
                    <h3>Verification</h3>
                    <div className="verification-input-group">
                      <label>Enter verification code:</label>
                      <input
                        type="text"
                        value={verificationInput}
                        onChange={(e) => setVerificationInput(e.target.value)}
                        placeholder="Enter code here..."
                      />
                    </div>
                  </div>
                )}
                {/* Action Buttons */}
                {!activeTask.completed && (
                  <div className="task-actions">
                    {activeTask.type === "youtube_watch" ? (
                      activeTask.autoVerify ? (
                        videoWatchComplete ? (
                          <button
                            className="verify-button"
                            onClick={() => verifyTask(activeTask._id)}
                            disabled={verificationStatus === "verifying"}
                          >
                            {verificationStatus === "verifying"
                              ? "Verifying..."
                              : "Complete Task"}
                          </button>
                        ) : (
                          <p className="watch-instruction">
                            Watch the video to complete this task
                          </p>
                        )
                      ) : (
                        <button
                          className="verify-button"
                          onClick={() => verifyTask(activeTask._id)}
                          disabled={verificationStatus === "verifying"}
                        >
                          {verificationStatus === "verifying"
                            ? "Verifying..."
                            : "Mark as Completed"}
                        </button>
                      )
                    ) : activeTask.type === "screenshot" ? (
                      <button
                        className="verify-button"
                        onClick={() => verifyTask(activeTask._id)}
                        disabled={
                          verificationStatus === "verifying" || !screenshot
                        }
                      >
                        {verificationStatus === "verifying"
                          ? "Uploading..."
                          : "Submit Screenshot"}
                      </button>
                    ) : (
                      <button
                        className="verify-button"
                        onClick={() => verifyTask(activeTask._id)}
                        disabled={
                          verificationStatus === "verifying" ||
                          !verificationInput.trim()
                        }
                      >
                        {verificationStatus === "verifying"
                          ? "Verifying..."
                          : "Verify Task"}
                      </button>
                    )}
                  </div>
                )}
                {/* Completion Status */}
                {activeTask.completed && (
                  <div className="task-completed-status">
                    <CheckIcon size={24} />
                    <p>Task completed successfully!</p>
                  </div>
                )}
                {/* Rejection Reason */}
                {activeTask.status === "rejected" &&
                  activeTask.rejectionReason && (
                    <div className="rejection-reason">
                      <AlertTriangle size={16} />
                      <div>
                        <strong>Task Rejected:</strong>
                        <p>{activeTask.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                {/* Note */}
                {activeTask.note && (
                  <div className="task-note">
                    <InfoIcon size={16} />
                    <p>{activeTask.note}</p>
                  </div>
                )}
              </div>
            </div>
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
