import "./style.css";
import { initAnimations, replayAnimations } from "./animations.js";

const year = document.querySelector("#year");
const replayButton = document.querySelector("#replay-animations");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

function syncReplayLabel() {
  if (replayButton) {
    replayButton.textContent = motionPreference.matches ? "kembali ke atas" : "putar ulang animasi";
  }
}

if (year) {
  year.textContent = String(new Date().getFullYear());
}

initAnimations();
motionPreference.addEventListener("change", syncReplayLabel);
syncReplayLabel();

if (replayButton) {
  replayButton.hidden = false;
  replayButton.addEventListener("click", replayAnimations);
}
