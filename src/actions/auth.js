// src/actions/auth.js
export const loggedInUser = (user) => {
  return {
    type: "LOGGED_IN_USER",
    payload: user,
  };
};

export const logout = () => {
  return {
    type: "LOGOUT",
    payload: null,
  };
};
