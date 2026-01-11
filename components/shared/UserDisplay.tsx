import React from 'react';

interface Props {
  name: string;
  role?: string;
  className?: string;
}

const UserDisplay = ({ name, role = 'member', className = '' }: Props) => {
  const getRoleClass = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return 'role-sparkle-owner';
      case 'admin':
        return 'role-sparkle-admin';
      case 'moderator':
        return 'role-sparkle-moderator';
      default:
        return 'role-sparkle-member';
    }
  };

  return (
    <span className={`${getRoleClass(role)} ${className}`}>
      {name}
    </span>
  );
};

export default UserDisplay;
