"use client";

import React, { useState } from "react";
import Link from "next/link";

type BaseProps = {
  children: React.ReactNode;
  background?: string;
  border?: string;
  className?: string;
  shadowSize?: number;
  shadowColor?: string;
  disabled?: boolean;
  // how
};

type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    as?: "button";
    href?: never;
  };

type LinkProps = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    as: "link";
    href: string;
  };

type AnimatedButtonProps = ButtonProps | LinkProps;

/**
 * AnimatedButton — Neobrutalist button with smooth lift + shadow + press animation
 *
 * Usage:
 *   <AnimatedButton background="#22C55E" href="/belajar" as="link">
 *     Mulai Sekarang
 *   </AnimatedButton>
 *
 *   <AnimatedButton background="#22C55E" type="submit" disabled={loading}>
 *     Masuk Sekarang →
 *   </AnimatedButton>
 */
export default function AnimatedButton(props: AnimatedButtonProps) {
  const {
    children,
    background = "#fff",
    border = "4px solid #000",
    className = "",
    shadowSize = 8,
    shadowColor = "#000",
    disabled,
    as,
    ...rest
  } = props;

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const shadowBase = `3px 3px 0 ${shadowColor}`;
  const shadowHover = `4px 4px 0 ${shadowColor}`;
  const shadowActive = `1px 1px 0 ${shadowColor}`;

  const baseClass = [
    "inline-flex items-center justify-center",
    "rounded-2xl px-6 py-3.5",
    "text-base font-black text-black",
    "transition-all duration-200 ease-out",
    disabled
      ? "opacity-70 cursor-not-allowed"
      : "cursor-pointer",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const getTransform = () => {
    if (disabled) return "translate(0, 0)";
    if (isPressed) return "translate(3px, 3px)";
    if (isHovered) return "translate(0, -2px)";
    return "translate(0, 0)";
  };

  const getShadow = () => {
    if (disabled) return shadowBase;
    if (isPressed) return shadowActive;
    if (isHovered) return shadowHover;
    return shadowBase;
  };

  const style: React.CSSProperties = {
    background: background,
    border: border,
  };

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setIsHovered(false);
      setIsPressed(false);
    }
  };

  const handleMouseDown = () => {
    if (!disabled) setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (!disabled) setIsPressed(false);
  };

  const dynamicStyle: React.CSSProperties = {
    ...style,
    transform: getTransform(),
    boxShadow: getShadow(),
  };

  if (as === "link") {
    const { href, ...linkRest } = rest as LinkProps;
    return (
      <Link
        href={href}
        className={baseClass}
        style={dynamicStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...(linkRest as Record<string, unknown>)}
      >
        {children}
      </Link>
    );
  }

  const { ...buttonRest } = rest as ButtonProps;
  return (
    <button
      className={baseClass}
      style={dynamicStyle}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...(buttonRest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
