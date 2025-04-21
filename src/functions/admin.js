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
export const getPendingTasks = async (token) => {
  return await axios.get(`${API_URL}/admin/tasks/pending`, {
    headers: {
      authtoken: token,
    },
  });
};

export const approveTask = async (userTaskId, token) => {
  return await axios.post(
    `${API_URL}/admin/tasks/approve/${userTaskId}`,
    {},
    {
      headers: {
        authtoken: token,
      },
    }
  );
};

export const rejectTask = async (userTaskId, data, token) => {
  return await axios.post(`${API_URL}/admin/tasks/reject/${userTaskId}`, data, {
    headers: {
      authtoken: token,
    },
  });
};
