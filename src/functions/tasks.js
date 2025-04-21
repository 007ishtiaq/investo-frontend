import axios from "axios";

// Get base URL from environment variable
const API_URL = process.env.REACT_APP_API || "";

// Get all available tasks
export const getAllTasks = async (token) => {
  return await axios.get(`${API_URL}/tasks`, {
    headers: {
      authtoken: token ? token : "",
    },
  });
};

// Get a specific task details
export const getTask = async (taskId, token) => {
  return await axios.get(`${API_URL}/tasks/${taskId}`, {
    headers: {
      authtoken: token,
    },
  });
};

// Get user's tasks with completion status
export const getUserTasks = async (token) => {
  return await axios.get(`${API_URL}/user/tasks`, {
    headers: {
      authtoken: token,
    },
  });
};

// Start a task
export const startTask = async (taskId, token) => {
  return await axios.post(
    `${API_URL}/tasks/${taskId}/start`,
    {},
    {
      headers: {
        authtoken: token,
      },
    }
  );
};

// Verify task completion
export const verifyTaskCompletion = async (taskId, verificationData, token) => {
  return await axios.post(
    `${API_URL}/tasks/${taskId}/verify`,
    verificationData,
    {
      headers: {
        authtoken: token,
      },
    }
  );
};

// Get user's total earned rewards from tasks
export const getTasksEarnings = async (token) => {
  return await axios.get(`${API_URL}/user/tasks/earnings`, {
    headers: {
      authtoken: token,
    },
  });
};

// ADMIN FUNCTIONS

// Get all tasks (admin only)
export const getAllTasksAdmin = async (token) => {
  return await axios.get(`${API_URL}/api/admin/tasks`, {
    headers: {
      authtoken: token,
    },
  });
};

// Create a new task (admin only)
export const createTask = async (taskData, token) => {
  return await axios.post(`${API_URL}/admin/tasks`, taskData, {
    headers: {
      authtoken: token,
    },
  });
};

// Update a task (admin only)
export const updateTask = async (taskId, taskData, token) => {
  return await axios.put(`${API_URL}/admin/tasks/${taskId}`, taskData, {
    headers: {
      authtoken: token,
    },
  });
};

// Delete a task (admin only)
export const deleteTask = async (taskId, token) => {
  return await axios.delete(`${API_URL}/admin/tasks/${taskId}`, {
    headers: {
      authtoken: token,
    },
  });
};

// Get task completions (admin only)
export const getTaskCompletions = async (token) => {
  return await axios.get(`${API_URL}/admin/tasks/completions`, {
    headers: {
      authtoken: token,
    },
  });
};
