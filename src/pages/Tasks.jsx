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
  const [levelFilter, setLevelFilter] = useState("all");
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
  const [userLevel, setUserLevel] = useState(0); // Default user level to 1
  const [walletBalance, setWalletBalance] = useState(0);
  const [noNetModal, setNoNetModal] = useState(false);

  // Refs for intersection observer animations
  const headerRef = useRef(null);
  const statsRef = useRef(null);

  // Level colors and configurations
  const levelConfig = {
    1: { color: "#e3f2fd", borderColor: "#2196f3", rewardPercentage: 0.5 },
    2: { color: "#e8f5e8", borderColor: "#b5e1b7", rewardPercentage: 2.0 },
    3: { color: "#fff3e0", borderColor: "#ffdaa3", rewardPercentage: 3.0 },
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
      // console.log("res.data.level", res.data.level);

      // Set user level from the response
      if (res.data.level) {
        setUserLevel(res.data.level);
      } else {
        // Default to level 0 if no level is found
        setUserLevel(0);
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
      loadWalletBalance();
      loadUserInvestments(); // Add this line
    }
    return () => {
      if (videoIntervalRef.current) {
        clearInterval(videoIntervalRef.current);
      }
    };
  }, [user]);

  // Add this function to check if user has purchased a specific level plan
  const hasUserPurchasedLevel = (level) => {
    if (!userInvestments || userInvestments.length === 0) return false;
    // No level is free anymore - all levels require investment plans
    return userInvestments.some((investment) => {
      const planLevel = investment.plan?.minLevel || investment.plan?.level;
      return planLevel === level; // Exact level match, not >= level
    });
  };

  // Task difficulty colors
  const difficultyColors = {
    easy: "var(--color-success)",
    medium: "var(--color-warning)",
    hard: "var(--color-primary)",
  };

  // Get user's investment for a specific level
  const getUserInvestmentForLevel = (level) => {
    if (!userInvestments || userInvestments.length === 0) return null;
    return userInvestments.find((investment) => {
      const planLevel = investment.plan?.minLevel || investment.plan?.level;
      return planLevel === level;
    });
  };

  // Add this function to calculate total available rewards across all investment plans
  const calculateTotalAvailableRewards = () => {
    if (!userInvestments || userInvestments.length === 0) return 0;

    let totalRewards = 0;

    userInvestments.forEach((investment) => {
      const planLevel = investment.plan?.minLevel || investment.plan?.level;
      const levelPercentage = levelConfig[planLevel]?.rewardPercentage || 0;
      const levelTotalReward = (investment.amount * levelPercentage) / 100;
      totalRewards += levelTotalReward;
    });

    return totalRewards;
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
      // toast.success("Task started successfully!");

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
      toast.success("Task submitted successfully!");

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

  // const handleRetry = () => {
  //   if (navigator.onLine) {
  //     setNoNetModal(false);
  //     // Reload the page to refetch data
  //     window.location.reload();
  //   } else {
  //     toast.error("Still no internet connection. Please check your network.");
  //   }
  // };

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
                  <span>{calculateTotalAvailableRewards().toFixed(3)} USD</span>
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
              <h3 className="level-info-title">
                Tasks Based on Unlocked Levels
              </h3>
              <div className="level-info-grid">
                {[1, 2, 3, 4].map((level) => {
                  // Check if user has purchased this specific level plan
                  const hasPurchasedThisLevel = userInvestments?.some(
                    (investment) => {
                      const planLevel =
                        investment.plan?.minLevel || investment.plan?.level;
                      return planLevel === level;
                    }
                  );

                  const isCurrentLevel = userLevel === level;

                  // ALL levels require purchase now - no special treatment for Level 1
                  const isPurchased = hasPurchasedThisLevel;
                  return (
                    <div
                      key={level}
                      className={`level-info-item ${
                        isPurchased ? "purchased" : "not-purchased"
                      } ${isCurrentLevel ? "current-level" : ""}`}
                    >
                      <div className="level-info-header">
                        <div className="level-number">
                          <StarIcon size={16} />
                          <span>Level {level}</span>
                        </div>
                        <div className="level-status">
                          {isPurchased ? (
                            <span className="purchased-badge">
                              <CheckIcon size={14} />
                              Purchased
                            </span>
                          ) : (
                            <span className="locked-badge">
                              <LockIcon size={14} />
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="level-info-content">
                        {isPurchased ? (
                          <p>Access to Level {level} tasks and rewards</p>
                        ) : (
                          <p>
                            Purchase Level {level} investment plan to unlock
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Replace upgrade prompt with no-plan banner when user has no investments */}
              {userLevel === 0 &&
              (!userInvestments || userInvestments.length === 0) ? (
                <div className="no-plan-banner">
                  <div className="no-plan-content">
                    <div className="no-plan-icon-tasks">
                      <LockIcon size={48} />
                    </div>
                    <h4>No Investment Plan Purchased</h4>
                    <p>
                      You need to purchase an investment plan to unlock tasks
                      and start earning rewards.
                    </p>
                    <Link to="/plans" className="invest-redirect-button">
                      View Investment Plans
                    </Link>
                  </div>
                </div>
              ) : (
                /* Show upgrade prompt for unpurchased levels */
                (() => {
                  // Find the lowest unpurchased level
                  const unpurchasedLevels = [1, 2, 3, 4].filter((level) => {
                    const hasThisLevelPlan = userInvestments?.some(
                      (investment) => {
                        const planLevel =
                          investment.plan?.minLevel || investment.plan?.level;
                        return planLevel === level;
                      }
                    );
                    return !hasThisLevelPlan;
                  });
                  return unpurchasedLevels.length > 0 ? (
                    <div className="level-upgrade-prompt">
                      <div className="upgrade-content">
                        <h4>
                          Unlock{" "}
                          {unpurchasedLevels.length > 1
                            ? "Premium"
                            : `Level ${unpurchasedLevels[0]}`}{" "}
                          Tasks
                        </h4>
                        <p>
                          {unpurchasedLevels.length > 1
                            ? `Purchase Level ${unpurchasedLevels.join(
                                ", "
                              )} investment plans to unlock all tasks and exclusive rewards.`
                            : `Purchase Level ${unpurchasedLevels[0]} investment plan to access tasks and exclusive rewards.`}
                        </p>
                        <Link to="/invest" className="upgrade-button">
                          View Investment Plans
                        </Link>
                      </div>
                    </div>
                  ) : null;
                })()
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

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
                      borderTop: `2px solid ${levelColors.borderColor}`,
                      borderLeft: `2px solid ${levelColors.borderColor}`,
                      borderRight: `2px solid ${levelColors.borderColor}`,
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
                            }% of your invested amount on the Plan)`}
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
                      <EthereumIcon size={16} />
                      <span>
                        {calculateTaskReward(activeTask.minLevel).toFixed(3)}
                      </span>
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
                          {/* <strong>{activeTask.reward.toFixed(3)} USD</strong>! */}
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
