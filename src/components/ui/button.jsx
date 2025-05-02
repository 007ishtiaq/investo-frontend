import React from "react";
import "./button.css";

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    // If asChild is true, we render the child component instead of a button
    if (asChild) {
      // This is a simplified version of the Slot component
      const child = React.Children.only(props.children);
      return React.cloneElement(child, {
        ref,
        className: `button button-${variant} button-${size} ${className || ""}`,
        ...props,
      });
    }

    // Regular button
    return (
      <button
        className={`button button-${variant} button-${size}-size ${
          className || ""
        }`}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

// Export a function that returns the class names string for use in other components
const buttonVariants = ({
  variant = "default",
  size = "default",
  className = "",
}) => {
  return `button button-${variant} button-${size}-size ${className}`;
};

export { Button, buttonVariants };
