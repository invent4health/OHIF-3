import React from 'react';
import type { IconProps } from '../types';

export const Report = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 28 28"
    fill="Black"
    {...props}
  >
    {/* Document Shape */}
    <path d="M7 2h10l5 5v17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
    {/* Report Lines */}
    <line
      x1="9"
      y1="9"
      x2="19"
      y2="9"
      stroke="white"
      strokeWidth="2"
    />
    <line
      x1="9"
      y1="13"
      x2="19"
      y2="13"
      stroke="white"
      strokeWidth="2"
    />
    <line
      x1="9"
      y1="17"
      x2="15"
      y2="17"
      stroke="white"
      strokeWidth="2"
    />
  </svg>
);

export default Report;
