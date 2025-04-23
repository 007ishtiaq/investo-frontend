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
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    steps: [""],
    reward: 0.001,
    type: "custom",
    link: "",
    difficulty: "easy",
    estimatedTime: "5 min",
    active: true,
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
    setFormValues({
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    });
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

  const resetForm = () => {
    setFormValues({
      title: "",
      description: "",
      steps: [""],
      reward: 0.001,
      type: "custom",
      link: "",
      difficulty: "easy",
      estimatedTime: "5 min",
      active: true,
    });
    setEditingTask(null);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      resetForm();
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormValues({
      title: task.title,
      description: task.description,
      steps: Array.isArray(task.steps) && task.steps.length ? task.steps : [""], // Fix here
      reward: task.reward,
      type: task.type,
      link: task.link || "",
      difficulty: task.difficulty,
      estimatedTime: task.estimatedTime,
      active: task.active !== undefined ? task.active : true,
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
                  <label htmlFor="reward">Reward (ETH)*</label>
                  <input
                    type="number"
                    id="reward"
                    name="reward"
                    value={formValues.reward}
                    onChange={handleChange}
                    step="0.001"
                    min="0.001"
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
                    <option value="twitter_follow">Twitter Follow</option>
                    <option value="twitter_share">Twitter Share</option>
                    <option value="youtube_subscribe">YouTube Subscribe</option>
                    <option value="youtube_watch">YouTube Watch</option>
                    <option value="telegram_join">Telegram Join</option>
                    <option value="login">Login</option>
                    <option value="profile">Profile Update</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="link">External Link (optional)</label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={formValues.link}
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
              <div className="tasks-table-header">
                <div className="task-cell">Title</div>
                <div className="task-cell">Type</div>
                <div className="task-cell">Reward</div>
                <div className="task-cell">Difficulty</div>
                <div className="task-cell">Status</div>
                <div className="task-cell">Actions</div>
              </div>

              {tasks.map((task) => (
                <div
                  key={task._id}
                  className={`tasks-table-row ${
                    !task.active ? "inactive-task" : ""
                  }`}
                >
                  <div className="task-cell task-title-cell">{task.title}</div>
                  <div className="task-cell">{task.type.replace("_", " ")}</div>
                  <div className="task-cell">{task.reward.toFixed(3)} ETH</div>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTasks;
