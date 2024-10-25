import React from "react";

interface ButtonProps {
  label: string;
  onClick: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400`}
    >
      {label}
    </button>
  );
};

export default Button;
