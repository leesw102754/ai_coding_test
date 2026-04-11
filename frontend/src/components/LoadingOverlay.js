import Lottie from "lottie-react";
import SearchingLottie from "../assets/SearchingLottie.json";
import "./LoadingOverlay.css";

export default function LoadingOverlay({ text }) {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <Lottie
          animationData={SearchingLottie}
          loop={true}
          autoplay={true}
          className="loading-lottie"
        />
        {text && <p className="loading-text">{text}</p>}
      </div>
    </div>
  );
}