import React from "react";
//import "../styles/preferenceForm.css"; // Import the CSS file for styling

const PreferenceForm = ({
  days,
  setDays,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  breakTime,
  setBreakTime,
  filterStartTimeOptions,
  filterEndTimeOptions,
  handleSubmit,
  buttonText,
  buttonHandler,
}) => {
  return (
    <div className="preferences-box">
      <h2>Set Preferences</h2>
      <div className="preferences">
        <label>
          Days in Week: {days}
          <input
            type="range"
            min="1"
            max="5"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </label>
        <label>
          Start Time:
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          >
            {filterStartTimeOptions(endTime).map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
        <label>
          End Time:
          <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
            {filterEndTimeOptions(startTime).map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
        <label>
          Average Break Time: {breakTime}h
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={breakTime}
            onChange={(e) => setBreakTime(e.target.value)}
          />
        </label>
      </div>
      <div className="buttons">
        <button onClick={handleSubmit}>Generate Schedule</button>
        <button className="reset-courses-button" onClick={buttonHandler}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default PreferenceForm;
