import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
const base = { viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;

export const LinkedInIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.5 4.77 5.76v5.69h-4v-5.04c0-1.2-.02-2.75-1.7-2.75-1.7 0-1.96 1.3-1.96 2.66v5.13h-4z" />
  </svg>
);
export const YouTubeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.75 15.02V8.98L15.5 12z" />
  </svg>
);
export const InstagramIcon = (p: IconProps) => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
  </svg>
);
export const XIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78zm-1.08 16.17h1.7L7.4 4.74H5.58z" />
  </svg>
);
export const FacebookIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M13.5 21v-7.5h2.53l.38-2.93H13.5V8.7c0-.85.24-1.43 1.46-1.43h1.56V4.65A21 21 0 0 0 14.25 4.5c-2.25 0-3.79 1.37-3.79 3.9v2.17H7.92v2.93h2.54V21z" />
  </svg>
);

export const socialIconMap = {
  linkedin: LinkedInIcon,
  youtube: YouTubeIcon,
  instagram: InstagramIcon,
  x: XIcon,
  facebook: FacebookIcon,
};
