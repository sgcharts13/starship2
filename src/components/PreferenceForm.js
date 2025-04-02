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
  selectedPreferences,
  setSelectedPreferences,
}) => {
  const handleCheckboxChange = (preference) => {
    setSelectedPreferences((prev) => ({
      ...prev,
      [preference]: !prev[preference],
    }));
  };

  return (
    <div className="preferences-box">
      <h2>Set Preferences</h2>
      <p>
        <i>Tick the checkboxes to assign higher priority.</i>
      </p>
      <div className="preferences">
        <label>
          Days in Week:<br></br>
          {days} day(s)
          <input
            type="range"
            min="1"
            max="5"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
          <input
            type="checkbox"
            checked={selectedPreferences?.days || false}
            onChange={() => handleCheckboxChange("days")}
          />
        </label>
        <label>
          Earliest Start Time:
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
          <input
            type="checkbox"
            checked={selectedPreferences?.startTime || false}
            onChange={() => handleCheckboxChange("startTime")}
          />
        </label>
        <label>
          Latest End Time:
          <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
            {filterEndTimeOptions(startTime).map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          <input
            type="checkbox"
            checked={selectedPreferences?.endTime || false}
            onChange={() => handleCheckboxChange("endTime")}
          />
        </label>
        <label>
          Minimum Break Time: {breakTime}h
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={breakTime}
            onChange={(e) => setBreakTime(e.target.value)}
          />
          <input
            type="checkbox"
            checked={selectedPreferences?.breakTime || false}
            onChange={() => handleCheckboxChange("breakTime")}
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
