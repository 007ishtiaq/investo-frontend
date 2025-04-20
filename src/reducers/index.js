import { combineReducers } from "redux";
import { MobileSideNav } from "./MobileSideNav";
import { userReducer } from "./userReducer";

const rootReducer = combineReducers({
  mobileSideNav: MobileSideNav,
  user: userReducer,
});

export default rootReducer;
