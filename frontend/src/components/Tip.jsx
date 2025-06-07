import React from 'react';

function Tip() {
  const tips = [
    "Stay calm and think before answering.",
    "Structure your responses clearly.",
    "Practice makes perfect!",
    // ...more tips
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  return (
    <div className="interview-card" style={{ background: "#e2eafc" }}>
      <h4>Tip of the Day</h4>
      <p>{randomTip}</p>
    </div>
  );
}

export default Tip;