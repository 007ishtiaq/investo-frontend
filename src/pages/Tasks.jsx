import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  EthereumIcon,
  CheckIcon,
  ExternalLinkIcon,
  ClockIcon,
} from "../utils/icons";

/**
 * Tasks page component for displaying available tasks to earn rewards
 */
const Tasks = () => {
  // Sample tasks data
  const [tasks] = useState([
    {
      id: 1,
      title: "Subscribe to Official YouTube Channel",
      description:
        "Subscribe to our official YouTube channel to earn a one-time reward.",
      reward: 0.005,
      difficulty: "easy",
      estimatedTime: "2 min",
      link: "https://youtube.com/@Ovniflow-oficial",
      completed: false,
      type: "youtube_subscribe",
      verified: false,
      steps: [
        "Click on the link to visit our YouTube channel",
        "Subscribe to the channel",
        'Return to this page and click "Verify Completion"',
      ],
    },
    {
      id: 2,
      title: "Watch Introduction Video",
      description:
        "Watch our complete introduction video to the platform (minimum 3 minutes).",
      reward: 0.008,
      difficulty: "easy",
      estimatedTime: "5 min",
      link: "https://youtube.com/watch?v=example",
      completed: false,
      type: "youtube_watch",
      verified: false,
      steps: [
        "Click on the link to watch the video",
        "Watch at least 3 minutes of the video",
        'Return to this page and click "Verify Completion"',
      ],
    },
    {
      id: 3,
      title: "Follow Our Twitter Account",
      description:
        "Follow our official Twitter account and like our pinned post.",
      reward: 0.01,
      difficulty: "easy",
      estimatedTime: "3 min",
      link: "https://twitter.com/example",
      completed: false,
      type: "twitter_follow",
      verified: false,
      steps: [
        "Click on the link to visit our Twitter profile",
        "Follow our account",
        "Like our pinned post",
        'Return to this page and click "Verify Completion"',
      ],
    },
    {
      id: 4,
      title: "Join Our Telegram Group",
      description: "Join our Telegram community and introduce yourself.",
      reward: 0.015,
      difficulty: "medium",
      estimatedTime: "5 min",
      link: "https://t.me/example",
      completed: false,
      type: "telegram_join",
      verified: false,
      steps: [
        "Click on the link to join our Telegram group",
        "Join the group",
        "Post an introduction message",
        'Return to this page and click "Verify Completion"',
      ],
    },
    {
      id: 5,
      title: "Share Investment Platform on Twitter",
      description:
        "Create a tweet about our platform using the provided template and hashtags.",
      reward: 0.025,
      difficulty: "medium",
      estimatedTime: "7 min",
      link: "https://twitter.com/intent/tweet?text=I%20just%20discovered%20this%20amazing%20investment%20platform!%20Check%20it%20out%20at%20example.com%20%23InvestmentPlatform%20%23Crypto",
      completed: false,
      type: "twitter_share",
      verified: false,
      steps: [
        "Click on the link to draft a pre-populated tweet",
        "Publish the tweet",
        "Copy the URL of your tweet",
        'Return to this page, paste the URL, and click "Verify Completion"',
      ],
    },
    {
      id: 6,
      title: "Complete Platform Tutorial",
      description:
        "Complete the interactive tutorial of our investment platform to earn a reward.",
      reward: 0.03,
      difficulty: "hard",
      estimatedTime: "15 min",
      link: "/tutorial",
      completed: false,
      type: "tutorial_complete",
      verified: false,
      steps: [
        "Click on the link to start the tutorial",
        "Complete all steps of the tutorial",
        "Verification will be automatic upon completion",
      ],
    },
  ]);

  const [activeTask, setActiveTask] = useState(null);
  const [verificationInput, setVerificationInput] = useState("");
  const [filterOption, setFilterOption] = useState("all");

  // Task difficulty colors
  const difficultyColors = {
    easy: "var(--color-success)",
    medium: "var(--color-warning)",
    hard: "var(--color-primary)",
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

  // Calculate earned rewards
  const earnedRewards = tasks
    .filter((task) => task.completed)
    .reduce((sum, task) => sum + task.reward, 0);

  // Handle task verification
  const verifyTask = (taskId) => {
    // In a real implementation, this would connect to the backend API
    // to verify the task completion with the provided evidence (verificationInput)
    console.log(`Verifying task ${taskId} with input: ${verificationInput}`);

    // Mock verification (in real app, this would be done by backend)
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: true, verified: true } : task
    );

    // In real app, this would update the state after API response
    // setTasks(updatedTasks);

    // Reset verification input and close task details
    setVerificationInput("");
    setActiveTask(null);
  };

  // Open task details
  const openTaskDetails = (task) => {
    setActiveTask(task);
  };

  // Close task details
  const closeTaskDetails = () => {
    setActiveTask(null);
    setVerificationInput("");
  };

  // if (!connected) {
  //   return (
  //     <div className="tasks-page">
  //       <div className="container">
  //         <div className="connect-wallet-message">
  //           <h2>Connect Wallet to View Tasks</h2>
  //           <p>Please connect your wallet to access task rewards.</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

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
              <span>{earnedRewards.toFixed(3)} ETH</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Completion Rate</div>
            <div className="stat-value">
              <span>
                {Math.round(
                  (tasks.filter((t) => t.completed).length / tasks.length) * 100
                )}
                %
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    (tasks.filter((t) => t.completed).length / tasks.length) *
                    100
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

        <div className="tasks-list">
          {filteredTasks.length === 0 ? (
            <div className="no-tasks-message">
              <p>No tasks found matching the selected filter.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
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
              <button className="close-modal-button" onClick={closeTaskDetails}>
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

                {!activeTask.completed && (
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
                      onClick={() => verifyTask(activeTask.id)}
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

// Add styling for the Tasks page
document.head.appendChild(document.createElement("style")).textContent = `
.tasks-page {
  padding: 3rem 0;
}

.tasks-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.page-description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  max-width: 800px;
  margin: 0 auto;
}

.tasks-statistics {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 2.5rem;
}

@media (min-width: 640px) {
  .tasks-statistics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .tasks-statistics {
    grid-template-columns: repeat(3, 1fr);
  }
}

.stat-card {
  background-color: var(--color-card-bg);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
}

.stat-title {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.75rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  display: flex;
  align-items: center;
}

.stat-value svg {
  margin-right: 0.5rem;
}

.progress-bar {
  height: 0.5rem;
  background-color: var(--color-background-hover);
  border-radius: 9999px;
  margin-top: 0.75rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-button);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.tasks-filter-section {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-label {
  font-weight: 500;
  color: var(--color-text-primary);
}

.filter-options {
  display: flex;
  gap: 0.5rem;
}

.filter-option {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: var(--color-background);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-option.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.tasks-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

@media (min-width: 640px) {
  .tasks-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .tasks-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

.task-card {
  background-color: var(--color-card-bg);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  position: relative;
  display: flex;
  flex-direction: column;
}

.task-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.task-card.completed {
  background-color: rgba(var(--color-success-rgb), 0.05);
}

.task-status {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
}

.completed-badge {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.completed-badge svg {
  margin-right: 0.25rem;
}

.reward-badge {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: var(--gradient-button);
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.reward-badge svg {
  margin-right: 0.25rem;
}

.task-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
  color: var(--color-text-primary);
  padding-right: 5rem;
}

.task-description {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  flex-grow: 1;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.difficulty-tag {
  font-size: 0.75rem;
  font-weight: 500;
}

.time-estimate {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.view-task-button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.view-task-button:hover {
  background-color: var(--color-background-hover);
  color: var(--color-primary);
}

.task-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.task-modal {
  background-color: var(--color-card-bg);
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-modal-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.task-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.task-modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.task-reward {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: var(--gradient-button);
  color: white;
  border-radius: 0.5rem;
  font-weight: 600;
}

.task-full-description {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.task-steps {
  margin-bottom: 1.5rem;
}

.task-steps h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-text-primary);
}

.task-steps ol {
  padding-left: 1.5rem;
}

.task-steps li {
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.task-link-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  background: var(--gradient-button);
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: opacity var(--transition-fast);
}

.task-link-button:hover {
  opacity: 0.9;
}

.verification-section {
  padding: 1.5rem;
  background-color: var(--color-background-hover);
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}

.verification-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.verification-input-group {
  margin-bottom: 1rem;
}

.verification-input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.verification-input-group input {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  color: var(--color-text-primary);
}

.verify-button {
  width: 100%;
  padding: 0.875rem;
  background: var(--gradient-button);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.verify-button:hover:not(:disabled) {
  opacity: 0.9;
}

.verify-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.verification-note {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.completion-message {
  padding: 2rem 1.5rem;
  background-color: var(--color-success-bg);
  border-radius: 0.75rem;
  text-align: center;
}

.completion-icon {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-success);
  border-radius: 50%;
  margin: 0 auto 1rem auto;
  color: white;
}

.completion-message h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-success);
}

.completion-message p {
  color: var(--color-text-secondary);
}

.no-tasks-message {
  grid-column: 1 / -1;
  padding: 3rem;
  text-align: center;
  background-color: var(--color-card-bg);
  border-radius: 1rem;
  border: 1px solid var(--color-border);
}

.connect-wallet-message {
  text-align: center;
  padding: 3rem 1rem;
  background-color: var(--color-card-bg);
  border-radius: 1rem;
  border: 1px solid var(--color-border);
}

.connect-wallet-message h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.connect-wallet-message p {
  color: var(--color-text-secondary);
}

/* Add ExternalLink Icon Component */
.external-link-icon {
  margin-left: 0.5rem;
}
`;
