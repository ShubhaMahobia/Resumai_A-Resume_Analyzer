import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './LoadingAnimation.css';

const LoadingAnimation = () => {
  return (
    <div className="loading-animation-container">
      <div className="loading-content">
        <DotLottieReact
          src="https://lottie.host/79fe9785-fc20-4dce-a24f-57799bc0ffdd/md6S9A734D.lottie"
          loop
          autoplay
          className="lottie-animation"
        />
        <div className="loading-text">
          <h3>Analyzing Your Resume</h3>
          <p>Our AI is matching your skills and experience with job requirements...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation; 