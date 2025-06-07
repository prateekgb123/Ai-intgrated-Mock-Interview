import React from 'react';

export default function Profile({ userId, username }) {
  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-info">
        <div><b>User ID:</b> {userId}</div>
        <div><b>Username:</b> {username}</div>
        <div>Email update/change coming soon!</div>
      </div>
    </div>
  );
}