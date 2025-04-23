// client/src/functions/admin.js
import axios from "axios";

// Get base URL from environment variable
const API_URL = process.env.REACT_APP_API || "";

// Get all tasks (including inactive ones) - ADMIN ONLY
export const getAllTasks = async (token) => {
  return await axios.get(`${API_URL}/admin/tasks`, {
    headers: {
      authtoken: token,
    },
  });
};

// Create a new task - ADMIN ONLY
export const createTask = async (taskData, token) => {
  return await axios.post(`${API_URL}/admin/tasks`, taskData, {
    headers: {
      authtoken: token,
    },
  });
};

// Update an existing task - ADMIN ONLY
export const updateTask = async (taskId, taskData, token) => {
  return await axios.put(`${API_URL}/admin/tasks/${taskId}`, taskData, {
    headers: {
      authtoken: token,
    },
  });
};

// Delete a task - ADMIN ONLY
export const deleteTask = async (taskId, token) => {
  return await axios.delete(`${API_URL}/admin/tasks/${taskId}`, {
    headers: {
      authtoken: token,
    },
  });
};

// Get task completions (for analytics) - ADMIN ONLY
export const getTaskCompletions = async (token) => {
  return await axios.get(`${API_URL}/admin/tasks/completions`, {
    headers: {
      authtoken: token,
    },
  });
};

// Add to your existing admin.js functions
// Get pending verification tasks
export const getPendingTasks = async (authToken) => {
  return await axios.get(`${process.env.REACT_APP_API}/admin/tasks/pending`, {
    headers: {
      authToken,
    },
  });
};

// Approve a task
export const approveTask = async (userTaskId, authToken) => {
  return await axios.post(
    `${process.env.REACT_APP_API}/admin/tasks/${userTaskId}/approve`,
    {},
    {
      headers: {
        authToken,
      },
    }
  );
};

// Reject a task
export const rejectTask = async (userTaskId, data, authToken) => {
  return await axios.post(
    `${process.env.REACT_APP_API}/admin/tasks/${userTaskId}/reject`,
    data,
    {
      headers: {
        authToken,
      },
    }
  );
};
