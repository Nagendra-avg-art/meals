import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  type = 'button', 
  href 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer no-underline hover:animate-blink hover:scale-105 active:scale-95";
  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg",
    secondary: "bg-white text-green-700 border-2 border-green-600 hover:bg-green-50",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };

  if (href) {
    return (
      <a 
        href={href} 
        className={`${baseStyle} ${variants[variant]} ${className}`}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noreferrer' : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <button 
      type={type}
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  type?: 'success' | 'warning' | 'neutral' | 'blue';
}

export const Badge: React.FC<BadgeProps> = ({ children, type = 'success' }) => {
  const styles = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    neutral: "bg-gray-100 text-gray-800",
    blue: "bg-blue-100 text-blue-800"
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[type]}`}>
      {children}
    </span>
  );
};