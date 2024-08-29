function predictSignalTiming(greenDuration, redDuration, currentTime) {
  // Total duration of one cycle
  const cycleDuration = greenDuration + redDuration;
  // Elapsed time within the current cycle
  const elapsedTime = currentTime % cycleDuration;
  // Determine the current signal state and time remaining for change
  let currentSignal, greenWindow;
  if (elapsedTime < greenDuration) {
    // If elapsed time is within the green signal duration
    currentSignal = "Green";
    greenWindow = greenDuration - elapsedTime -5; // Time remaining for green to turn red
  } else {
    // If elapsed time exceeds green signal duration, it's in the red signal phase
    currentSignal = "Red";
    greenWindow = cycleDuration - elapsedTime + greenDuration -5; // Time remaining for red to turn green
  }
  return {
    currentSignal: currentSignal,
    greenWindow: greenWindow,
  };
}

// Example usage
const greenDuration = 5; // Green signal duration in seconds
const redDuration = 5; // Red signal duration in seconds
const initialTime = 14400; // Initial time of signal in seconds since midnight

setInterval(() => {
  const currentTimeHours = new Date().getHours();
  const currentTimeMinutes = new Date().getMinutes();
  const currentTimeSeconds = new Date().getSeconds();
  const currentTime =
    currentTimeHours * 3600 + currentTimeMinutes * 60 + currentTimeSeconds; // Current time in seconds
  const actualCurrentTime = (currentTime - initialTime + 86400) % 86400; // Ensure the time is non-negative and wraps around a 24-hour clock
  const signalInfo = predictSignalTiming(
    greenDuration,
    redDuration,
    actualCurrentTime
  );

  console.log(`Current Signal: ${signalInfo.currentSignal}`);
  console.log(
    `You have ${signalInfo.greenWindow} seconds to reach the signal so you don't have to wait 😁`
  );
}, 1000);
