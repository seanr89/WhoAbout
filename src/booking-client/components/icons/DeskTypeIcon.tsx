import React from 'react';
import { DeskType } from '../../types';

interface DeskTypeIconProps extends React.SVGProps<SVGSVGElement> {
  type: DeskType;
}

const DeskTypeIcon: React.FC<DeskTypeIconProps> = ({ type, ...props }) => {
  switch (type) {
    case DeskType.STANDING:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M6 21h12" />
          <path d="M6 17h2" />
          <path d="M16 17h2" />
          <path d="M12 17V7" />
          <path d="M4 7h16" />
          <circle cx="12" cy="4" r="2" />
          <path d="M12 11l-2 -2" />
          <path d="M12 11l2 -2" />
        </svg>
      );
    case DeskType.HIGH_SEAT:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M7 19h10" />
          <path d="M12 19V9" />
          <path d="M4 9h16" />
          <path d="M9 9v3a3 3 0 0 0 6 0V9" />
        </svg>
      );
    case DeskType.MEETING_ROOM:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M6 9h12v6H6z" />
          <path d="M6 9v-3a3 3 0 0 1 3 -3h6a3 3 0 0 1 3 3v3" />
          <path d="M6 15v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3 -3v-3" />
        </svg>
      );
    case DeskType.STANDARD:
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M2 8h20v2H2z"/>
          <path d="M6 10v10h2V10zm10 0v10h2V10z"/>
        </svg>
      );
  }
};

export default DeskTypeIcon;
