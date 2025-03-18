// ScheduleGenerator.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCourseContext } from "../context/CourseContext";
import "../styles/scheduleGenerator.css";
import SelectedCoursesList from "../components/SelectedCoursesList";
import CourseSearch from "../components/CourseSearch";

const ScheduleGenerator = () => {
  const {
    selectedCourses,
    addCourse,
    removeCourse,
    resetCourses,
    warning,
    setWarning,
  } = useCourseContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Clear the warning when the component mounts
    setWarning("");
  }, [setWarning]);

  // Get preferences from the state passed from the previous page or use default values
  const initialPreferences = location.state?.preferences || {
    days: 3,
    startTime: "08:00",
    endTime: "18:00",
    breakTime: 1,
  };

  const [days, setDays] = useState(initialPreferences.days);
  const [startTime, setStartTime] = useState(initialPreferences.startTime);
  const [endTime, setEndTime] = useState(initialPreferences.endTime);
  const [breakTime, setBreakTime] = useState(initialPreferences.breakTime);
  const [error, setError] = useState(""); // State for managing error message

  const handleSubmit = () => {
    if (selectedCourses.length < 2) {
      setError("Please select at least 2 courses to generate the schedule.");
      return;
    }
    setError(""); // Clear the error if the condition is met
    const preferences = { days, startTime, endTime, breakTime };
    navigate("/generated-schedules", {
      state: { selectedCourses, preferences },
    });
  };

  const handleBackToHome = () => {
    navigate("/", { state: { selectedCourses } });
  };

  return (
    <div className="schedule-generator-page">
      <nav className="navbar">
        <div className="logo-placeholder">Logo</div>
        <div className="nav-links">
          <Link to="/add-courses">
            <button>Add Courses</button>
          </Link>
          <Link to="/schedule-generator">
            <button>Generate Schedule</button>
          </Link>
          <Link to="/user-guide">
            <button>User Guide</button>
          </Link>
        </div>
      </nav>
      <h1>Schedule Generator</h1>
      <button onClick={handleBackToHome}>Back to Home</button>
      <div className="add-courses-body">
        <SelectedCoursesList
          courses={selectedCourses}
          onRemoveCourse={removeCourse}
        />
        <CourseSearch onAddCourse={addCourse} />
      </div>
      {warning && (
        <div className="warning">
          <br></br>
          {warning}
        </div>
      )}
      {error && (
        <div className="error">
          <br></br>
          {error}
        </div>
      )}
      <div className="preferences">
        <h2>Set Preferences</h2>
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
        <br />
        <br />
        <label>
          Start Time:
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>
        <br />
        <br />
        <label>
          End Time:
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>
        <br />
        <br />
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
        <br />
        <br />
        <button onClick={handleSubmit}>Generate Schedule</button>
        <button className="reset-courses-button" onClick={resetCourses}>
          Reset Selections
        </button>
      </div>
    </div>
  );
};

export default ScheduleGenerator;
