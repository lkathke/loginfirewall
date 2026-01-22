"use client";

import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

type IconName = keyof typeof LucideIcons;

interface DynamicIconProps extends Omit<LucideProps, "ref"> {
  name: string;
  fallback?: IconName;
  imageClassName?: string;
}

function isUrl(str: string): boolean {
  return str.startsWith("http://") || str.startsWith("https://");
}

export function DynamicIcon({ name, fallback = "Link", className, imageClassName, ...props }: DynamicIconProps) {
  // Check if it's an image URL
  if (isUrl(name)) {
    return (
      <img
        src={name}
        alt="icon"
        className={imageClassName || className}
      />
    );
  }

  // Normalize icon name (capitalize first letter of each word)
  const normalizedName = name
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("") as IconName;

  const IconComponent = LucideIcons[normalizedName] as React.ComponentType<LucideProps>;

  if (IconComponent && typeof IconComponent === "function") {
    return <IconComponent className={className} {...props} />;
  }

  // Try exact match
  const ExactIcon = LucideIcons[name as IconName] as React.ComponentType<LucideProps>;
  if (ExactIcon && typeof ExactIcon === "function") {
    return <ExactIcon className={className} {...props} />;
  }

  // Fallback icon
  const FallbackIcon = LucideIcons[fallback] as React.ComponentType<LucideProps>;
  return <FallbackIcon className={className} {...props} />;
}
