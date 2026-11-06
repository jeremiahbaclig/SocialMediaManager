import type { SVGProps } from "react";
import type { PlatformKey } from "../posts/postTypes";

type PlatformIconProps = SVGProps<SVGSVGElement> & { platform: PlatformKey };

export function PlatformIcon({ platform, ...props }: PlatformIconProps) {
  const sharedProps = {
    "aria-hidden": true as const,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    ...props,
  };

  switch (platform) {
    case "youtube":
      return (
        <svg {...sharedProps} className={`text-red-600 ${props.className ?? ""}`}>
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12s0-3.9-.5-5.8ZM9.6 15.7V8.3l6.3 3.7-6.3 3.7Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...sharedProps} className={`text-slate-950 ${props.className ?? ""}`}>
          <path d="M16.6 2h-3.4v13.6a3.1 3.1 0 1 1-3.1-3.1c.4 0 .8.1 1.2.2V9.2a7 7 0 1 0 5.3 6.8V9.1a8.2 8.2 0 0 0 4.8 1.5V7.2c-2.7-.1-4.8-2.3-4.8-5.2Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg
          {...sharedProps}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-fuchsia-600 ${props.className ?? ""}`}
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "twitter":
      return (
        <svg {...sharedProps} className={`text-slate-950 ${props.className ?? ""}`}>
          <path d="M18.9 1.2h3.7l-8 9.2L24 22.8h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9Zm-1.3 19.5h2L6.5 3.2H4.3l13.3 17.5Z" />
        </svg>
      );
  }
}
