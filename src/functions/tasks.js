import axios from "axios";

// Get all tasks for current user
export const getUserTasks = async (authtoken) =>
  await axios.get(`${process.env.REACT_APP_API}/tasks/user`, {
    headers: {
      authtoken,
    },
  });

// Get a specific task details
export const getTask = async (taskId, authtoken) =>
  await axios.get(`${process.env.REACT_APP_API}/tasks/${taskId}`, {
    headers: {
      authtoken,
    },
  });

// Get all available tasks
export const getAllTasks = async (authtoken) =>
  await axios.get(`${process.env.REACT_APP_API}/tasks`, {
    headers: {
      authtoken,
    },
  });

// Mark a task as started by user
export const startTask = async (taskId, authtoken) =>
  await axios.post(
    `${process.env.REACT_APP_API}/tasks/start`,
    { taskId },
    {
      headers: {
        authtoken,
      },
    }
  );

// Submit verification for task completion
export const verifyTaskCompletion = async (
  taskId,
  verificationData,
  authtoken
) =>
  await axios.post(
    `${process.env.REACT_APP_API}/tasks/verify`,
    { taskId, verificationData },
    {
      headers: {
        authtoken,
      },
    }
  );

// Check status of task verification
export const checkVerificationStatus = async (taskId, authtoken) =>
  await axios.get(
    `${process.env.REACT_APP_API}/tasks/verify-status/${taskId}`,
    {
      headers: {
        authtoken,
      },
    }
  );

// Get user's completed tasks
export const getCompletedTasks = async (authtoken) =>
  await axios.get(`${process.env.REACT_APP_API}/tasks/completed`, {
    headers: {
      authtoken,
    },
  });

// Get user's total earned rewards
export const getTasksEarnings = async (authtoken) =>
  await axios.get(`${process.env.REACT_APP_API}/tasks/earnings`, {
    headers: {
      authtoken,
    },
  });

// For admin only: Create a new task
export const createTask = async (taskData, authtoken) =>
  await axios.post(
    `${process.env.REACT_APP_API}/tasks/admin/create`,
    taskData,
    {
      headers: {
        authtoken,
      },
    }
  );

// For admin only: Update task
export const updateTask = async (taskId, taskData, authtoken) =>
  await axios.put(
    `${process.env.REACT_APP_API}/tasks/admin/update/${taskId}`,
    taskData,
    {
      headers: {
        authtoken,
      },
    }
  );

// For admin only: Delete task
export const deleteTask = async (taskId, authtoken) =>
  await axios.delete(
    `${process.env.REACT_APP_API}/tasks/admin/delete/${taskId}`,
    {
      headers: {
        authtoken,
      },
    }
  );
