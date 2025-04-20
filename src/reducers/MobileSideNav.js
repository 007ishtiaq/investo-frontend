export const MobileSideNav = (state = false, action) => {
  switch (action.type) {
    case "SET_SIDENAV_VISIBLE":
      return action.payload;
    default:
      return state;
  }
};
