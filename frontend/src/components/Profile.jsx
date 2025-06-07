import React from 'react';

function Profile({ username }) {
  // You can fetch and display more user data here
  return (
    <div className="interview-card">
      <h2>Profile</h2>
      <p><strong>Username:</strong> {username}</p>
      {/* Add avatar, email, reset password, etc */}
    </div>
  );
}

export default Profile;