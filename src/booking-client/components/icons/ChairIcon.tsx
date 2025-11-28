
import React from 'react';

interface ChairIconProps extends React.SVGProps<SVGSVGElement> {}

const ChairIcon: React.FC<ChairIconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 10V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v5" />
    <path d="M4 10a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2" />
    <path d="M4 14h16" />
    <path d="M8 3v7" />
    <path d="M16 3v7" />
    <path d="M6 19v3" />
    <path d="M18 19v3" />
  </svg>
);

export default ChairIcon;
