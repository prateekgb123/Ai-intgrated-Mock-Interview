import React from 'react';

function Profile({ username }) {
 
  return (
    <div className="interview-card">
      <h2>Profile</h2>
      <p><strong>Username:</strong> {username}</p>
      
    </div>
  );
}

export default Profile;