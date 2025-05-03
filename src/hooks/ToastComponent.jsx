import React from "react";
import { X } from "lucide-react";
import "./ToastComponent.css";

// Constants
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

// Action types object
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

// Counter for generating unique IDs
let count = 0;

// Function to generate unique IDs for toasts
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Map to track timeouts for removing toasts
const toastTimeouts = new Map();

// Array to track listeners for state changes
const listeners = [];

// In-memory state
let memoryState = { toasts: [] };

// Function to add a toast to the removal queue
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

// Reducer function to manage toast state
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // Side effects
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

// Dispatch function to update state and notify listeners
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// Toast function to create new toasts
function toast(props) {
  const id = genId();

  const update = (props) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

// Custom hook to access toast functionality
function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

// Toast component
const Toast = ({
  className,
  title,
  description,
  action,
  open,
  onOpenChange,
  ...props
}) => {
  return (
    <div
      className={`toast ${open ? "toast-open" : "toast-closed"} ${
        className || ""
      }`}
      data-open={open ? "true" : "false"}
      {...props}
    >
      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        {description && <div className="toast-description">{description}</div>}
      </div>
      {action && <div className="toast-action">{action}</div>}
      <button className="toast-close" onClick={() => onOpenChange(false)}>
        <X className="toast-close-icon" />
      </button>
    </div>
  );
};

// Toast action component
const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <div
    className={`toast-action-button ${className || ""}`}
    ref={ref}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

// Toaster component (container for all toasts)
const Toaster = () => {
  const { toasts } = useToast();

  return (
    <div className="toaster">
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast
          key={id}
          title={title}
          description={description}
          action={action}
          {...props}
        />
      ))}
    </div>
  );
};

export { useToast, toast, Toast, ToastAction, Toaster };
