"use client";

import React from 'react';

interface Props {
  name: string;
  color: string;
  className?: string;
}

const UserTagBadge = ({ name, color, className = "" }: Props) => {
  return (
    <div 
      className={`px-2 py-0.5 subtle-medium uppercase tracking-wider transition-all duration-300 inline-flex items-center ${className}`}
      style={{ 
        backgroundColor: `${color}1A`, // 10% opacity
        border: `1px solid ${color}4D`, // 30% opacity
        color,
        // @ts-ignore
        '--spark-color': color 
      } as React.CSSProperties}
    >
      <span className="user-tag-spark">
        {name}
      </span>
    </div>
  );
};

export default UserTagBadge;
