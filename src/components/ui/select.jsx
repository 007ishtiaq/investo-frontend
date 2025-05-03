import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import "./select.css";

// Custom Select components
const Select = ({ children, value, onValueChange, defaultValue, disabled }) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(
    defaultValue || value || ""
  );
  const selectRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Find the display value from children
  const displayValue =
    React.Children.toArray(children)
      .filter(
        (child) => React.isValidElement(child) && child.type === SelectContent
      )
      .flatMap((content) =>
        React.Children.toArray(content.props.children).filter(
          (child) => React.isValidElement(child) && child.type === SelectItem
        )
      )
      .find(
        (child) =>
          React.isValidElement(child) && child.props.value === selectedValue
      )?.props.children || "";

  const handleSelectItem = (itemValue) => {
    setSelectedValue(itemValue);
    if (onValueChange) {
      onValueChange(itemValue);
    }
    setOpen(false);
  };

  // We'll handle item selection inside the SelectContent component
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === SelectContent) {
      return React.cloneElement(child, {
        selectedValue,
        onSelectItem: handleSelectItem,
        isOpen: open,
      });
    }
    return child;
  });

  return (
    <div
      className={`select-root ${disabled ? "select-disabled" : ""}`}
      ref={selectRef}
    >
      <SelectTrigger
        onClick={() => !disabled && setOpen(!open)}
        open={open}
        disabled={disabled}
      >
        <SelectValue>{displayValue}</SelectValue>
        <ChevronDown className="select-icon" />
      </SelectTrigger>

      {enhancedChildren}
    </div>
  );
};

const SelectGroup = ({ children, className, ...props }) => {
  return (
    <div className={`select-group ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

const SelectValue = ({ children }) => {
  return <span className="select-value">{children}</span>;
};

const SelectTrigger = ({
  children,
  className,
  open,
  onClick,
  disabled,
  ...props
}) => {
  return (
    <button
      type="button"
      className={`select-trigger ${open ? "select-open" : ""} ${
        className || ""
      }`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const SelectContent = ({ children, isOpen, selectedValue, onSelectItem }) => {
  if (!isOpen) return null;

  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === SelectItem) {
      return React.cloneElement(child, {
        selected: child.props.value === selectedValue,
        onClick: () => onSelectItem(child.props.value),
      });
    }
    return child;
  });

  return (
    <div className="select-content">
      <div className="select-scroll-up">
        <ChevronUp className="select-scroll-icon" />
      </div>
      <div className="select-viewport">{enhancedChildren}</div>
      <div className="select-scroll-down">
        <ChevronDown className="select-scroll-icon" />
      </div>
    </div>
  );
};

const SelectLabel = ({ children, className, ...props }) => {
  return (
    <div className={`select-label ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

const SelectItem = ({
  children,
  value,
  className,
  selected,
  onClick,
  disabled,
  ...props
}) => {
  return (
    <div
      className={`select-item ${selected ? "select-item-selected" : ""} ${
        disabled ? "select-item-disabled" : ""
      } ${className || ""}`}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      <span className="select-item-indicator">
        {selected && <Check className="select-check-icon" />}
      </span>
      <span className="select-item-text">{children}</span>
    </div>
  );
};

const SelectSeparator = ({ className, ...props }) => {
  return <div className={`select-separator ${className || ""}`} {...props} />;
};

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
