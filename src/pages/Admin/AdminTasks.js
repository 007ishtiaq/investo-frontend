// client/src/pages/admin/AdminTasks.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
} from "../../functions/admin";
import "./AdminTasks.css";

const AdminTasks = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  // In the initial state and reset form:
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    steps: [""],
    rewardPercentage: 0.5,
    type: "custom",
    externalUrl: "",
    difficulty: "easy",
    estimatedTime: "5 min",
    active: true,
    screenshotInstructions: "",
    screenshotRequired: false,
    autoVerify: true, // Add this for YouTube watch auto-verification
    videoDuration: "", // Add this to specify video duration in seconds
    minLevel: 1,
    displayDate: "",
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await getAllTasks(user.token);
      setTasks(res.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "displayDate") {
      // Handle the date field specifically
      const dateValue = value ? new Date(value) : null;
      setFormValues({
        ...formValues,
        [name]: dateValue,
      });
    } else {
      // Handle other fields normally
      setFormValues({
        ...formValues,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleStepChange = (index, value) => {
    const updatedSteps = [...formValues.steps];
    updatedSteps[index] = value;
    setFormValues({ ...formValues, steps: updatedSteps });
  };

  const addStep = () => {
    setFormValues({ ...formValues, steps: [...formValues.steps, ""] });
  };

  const removeStep = (index) => {
    if (formValues.steps.length > 1) {
      const updatedSteps = formValues.steps.filter((_, i) => i !== index);
      setFormValues({ ...formValues, steps: updatedSteps });
    }
  };

  // Update resetForm with the same fields
  const resetForm = () => {
    setFormValues({
      title: "",
      description: "",
      steps: [""],
      rewardPercentage: 0.5,
      type: "custom",
      externalUrl: "",
      difficulty: "easy",
      estimatedTime: "5 min",
      active: true,
      screenshotInstructions: "",
      screenshotRequired: false,
      autoVerify: true,
      videoDuration: "",
      minLevel: 1,
      displayDate: "",
    });
    setEditingTask(null);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      resetForm();
    }
  };

  // Update handleEditTask to include these fields
  const handleEditTask = (task) => {
    setEditingTask(task);
    const displayDate = task.displayDate ? new Date(task.displayDate) : "";
    setFormValues({
      title: task.title,
      description: task.description,
      steps: Array.isArray(task.steps) && task.steps.length ? task.steps : [""],
      rewardPercentage: task.rewardPercentage || 0.5, // Changed from reward
      type: task.type,
      externalUrl: task.externalUrl || "",
      difficulty: task.difficulty,
      estimatedTime: task.estimatedTime,
      active: task.active !== undefined ? task.active : true,
      screenshotInstructions: task.screenshotInstructions || "",
      screenshotRequired: task.screenshotRequired || false,
      autoVerify: task.autoVerify || false,
      videoDuration: task.videoDuration || "",
      minLevel: task.minLevel || 1,
      displayDate: displayDate,
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId, user.token);
        toast.success("Task deleted successfully");
        loadTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formValues.title.trim()) {
      return toast.error("Title is required");
    }
    if (!formValues.description.trim()) {
      return toast.error("Description is required");
    }
    if (formValues.steps.some((step) => !step.trim())) {
      return toast.error("All steps must have content");
    }
    if (formValues.reward <= 0) {
      return toast.error("Reward must be greater than 0");
    }

    try {
      setLoading(true);

      if (editingTask) {
        // Update existing task
        await updateTask(editingTask._id, formValues, user.token);
        toast.success("Task updated successfully");
      } else {
        // Create new task
        await createTask(formValues, user.token);
        toast.success("Task created successfully");
      }

      resetForm();
      setShowForm(false);
      loadTasks();
    } catch (error) {
      setLoading(false);
      console.error("Error saving task:", error);
      toast.error(error.response?.data?.message || "Failed to save task");
    }
  };

  // Helper function to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Every day";
    const date = new Date(dateString);

    // Get day, month and year with leading zeros if needed
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is zero-based
    const year = date.getFullYear();

    // Format as DD.MM.YYYY
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="admin-tasks-page">
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
        <div className="admin-tasks-header">
          <h1>Task Management</h1>
          <button className="toggle-form-button" onClick={toggleForm}>
            {showForm ? "Hide Form" : "Add New Task"}
          </button>
        </div>

        {showForm && (
          <div className="task-form-container">
            <h2>{editingTask ? "Edit Task" : "Create New Task"}</h2>
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label htmlFor="minLevel">Minimum User Level Required</label>
                <select
                  id="minLevel"
                  name="minLevel"
                  value={formValues.minLevel}
                  onChange={handleChange}
                >
                  <option value="1">Level 1 (Everyone)</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                </select>
                <small className="form-text">
                  Only users at or above this level will see this task
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="displayDate">Display Date</label>
                <input
                  type="date"
                  id="displayDate"
                  name="displayDate"
                  value={
                    formValues.displayDate
                      ? new Date(formValues.displayDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleChange}
                />
                <small className="form-text">
                  Leave blank to show this task every day, or select a specific
                  date to only show on that day
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="title">Task Title*</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formValues.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description*</label>
                <textarea
                  id="description"
                  name="description"
                  value={formValues.description}
                  onChange={handleChange}
                  placeholder="Enter task description"
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>Steps to Complete*</label>
                {formValues.steps.map((step, index) => (
                  <div key={index} className="step-input-group">
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      required
                    />
                    <button
                      type="button"
                      className="remove-step-button"
                      onClick={() => removeStep(index)}
                      disabled={formValues.steps.length <= 1}
                    >
                      −
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-step-button"
                  onClick={addStep}
                >
                  + Add Step
                </button>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="rewardPercentage">
                    Reward Percentage (%)*
                  </label>
                  <input
                    type="number"
                    id="rewardPercentage"
                    name="rewardPercentage"
                    value={formValues.rewardPercentage}
                    onChange={handleChange}
                    step="0.1"
                    min="0.1"
                    max="100"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Task Type*</label>
                  <select
                    id="type"
                    name="type"
                    value={formValues.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="youtube_watch">YouTube Watch</option>
                    <option value="screenshot">Screenshot</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              {formValues.type === "screenshot" && (
                <>
                  <div className="form-group">
                    <label htmlFor="screenshotInstructions">
                      Screenshot Instructions
                    </label>
                    <textarea
                      id="screenshotInstructions"
                      name="screenshotInstructions"
                      value={formValues.screenshotInstructions || ""}
                      onChange={handleChange}
                      placeholder="Enter specific instructions for taking the screenshot (what to include, etc.)"
                      rows="3"
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="screenshotRequired"
                        checked={formValues.screenshotRequired}
                        onChange={handleChange}
                      />
                      Screenshot Required for Verification
                    </label>
                  </div>
                </>
              )}

              {formValues.type === "youtube_watch" && (
                <>
                  <div className="form-group">
                    <label htmlFor="externalUrl">YouTube Video URL*</label>
                    <input
                      type="url"
                      id="externalUrl"
                      name="externalUrl"
                      value={formValues.externalUrl}
                      onChange={handleChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                      required={formValues.type === "youtube_watch"}
                    />
                    <small className="form-text">
                      The YouTube video URL users will watch
                    </small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="videoDuration">
                      Video Duration (seconds)*
                    </label>
                    <input
                      type="number"
                      id="videoDuration"
                      name="videoDuration"
                      value={formValues.videoDuration}
                      onChange={handleChange}
                      placeholder="Enter video duration in seconds"
                      min="1"
                    />
                    <small className="form-text">
                      The time in seconds users need to watch to complete this
                      task
                    </small>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="autoVerify"
                        checked={formValues.autoVerify}
                        onChange={handleChange}
                      />
                      Enable Auto-Verification (watches are verified
                      automatically)
                    </label>
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="externalUrl">External URL (optional)</label>
                <input
                  type="url"
                  id="externalUrl"
                  name="externalUrl"
                  value={formValues.externalUrl}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty*</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formValues.difficulty}
                    onChange={handleChange}
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedTime">Estimated Time*</label>
                  <input
                    type="text"
                    id="estimatedTime"
                    name="estimatedTime"
                    value={formValues.estimatedTime}
                    onChange={handleChange}
                    placeholder="5 min"
                    required
                  />
                </div>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formValues.active}
                    onChange={handleChange}
                  />
                  Active (visible to users)
                </label>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingTask
                    ? "Update Task"
                    : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="tasks-list-section">
          <h2>All Tasks</h2>

          {loading && !showForm ? (
            <div className="loading-indicator">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="no-tasks-message">
              <p>
                No tasks found. Create your first task using the "Add New Task"
                button.
              </p>
            </div>
          ) : (
            <div className="admin-tasks-list">
              {/* Tasks Summary By Level */}
              <div className="tasks-summary">
                <h3>Tasks Distribution By Level</h3>
                <div className="level-stats">
                  {[1, 2, 3, 4].map((level) => {
                    const tasksCount = tasks.filter(
                      (task) => (task.minLevel || 1) === level
                    ).length;
                    return (
                      <div className="level-stat-box" key={level}>
                        <span className="level-label">Level {level}</span>
                        <span className="level-count">{tasksCount}</span>
                        <span className="level-percentage">
                          {tasks.length
                            ? Math.round((tasksCount / tasks.length) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Level Groupings */}
              {[1, 2, 3, 4].map((level) => {
                const levelTasks = tasks.filter(
                  (task) => (task.minLevel || 1) === level
                );

                if (levelTasks.length === 0) return null;

                return (
                  <div key={level} className="level-task-group">
                    <div className="level-header">
                      <h3>Level {level} Tasks</h3>
                      <span className="level-task-count">
                        {levelTasks.length} tasks
                      </span>
                    </div>

                    <div className="tasks-table">
                      <div className="tasks-table-header">
                        <div className="task-cell">Title</div>
                        <div className="task-cell">Type</div>
                        <div className="task-cell">Reward</div>
                        <div className="task-cell">Difficulty</div>
                        <div className="task-cell">Status</div>
                        <div className="task-cell">Live Date</div>
                        <div className="task-cell">Actions</div>
                      </div>

                      {levelTasks.map((task) => (
                        <div
                          key={task._id}
                          className={`tasks-table-row ${
                            !task.active ? "inactive-task" : ""
                          }`}
                        >
                          <div className="task-cell task-title-cell">
                            {task.title}
                          </div>
                          <div className="task-cell">
                            {task.type.replace("_", " ")}
                          </div>
                          <div className="task-cell">
                            {task.rewardPercentage}%
                          </div>
                          <div className="task-cell">{task.difficulty}</div>
                          <div className="task-cell">
                            <span
                              className={`status-badge ${
                                task.active ? "active" : "inactive"
                              }`}
                            >
                              {task.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <td className="task-cell">
                            {formatDate(task.displayDate)}
                          </td>
                          <div className="task-cell actions-cell">
                            <button
                              className="edit-button"
                              onClick={() => handleEditTask(task)}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-button"
                              onClick={() => handleDeleteTask(task._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTasks;
