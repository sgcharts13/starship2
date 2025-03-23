// ScheduleGenerator.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCourseContext } from "../context/CourseContext";
import "../styles/scheduleGenerator.css";
import "../styles/selectedCoursesList.css"; // Import the new selected courses
import SelectedCoursesList from "../components/SelectedCoursesList";
import CourseSearch from "../components/CourseSearch";
import Navbar from "../components/Navbar";
import PreferenceForm from "../components/PreferenceForm"; // Import the PreferenceForm component

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

    // Clear the warning when the component unmounts
    return () => {
      setWarning("");
    };
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
  const [selectedPreferences, setSelectedPreferences] = useState({
    days: false,
    startTime: false,
    endTime: false,
    breakTime: false,
  });

  const handleSubmit = () => {
    if (selectedCourses.length < 2) {
      setError("Please select at least 2 courses to generate the schedule.");
      return;
    }
    setError(""); // Clear the error if the condition is met
    const preferences = { days, startTime, endTime, breakTime };
    navigate("/generated-schedules", {
      state: { selectedCourses, preferences, selectedPreferences },
    });
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 22; hour++) {
      times.push(`${hour.toString().padStart(2, "0")}:00`);
      times.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return times;
  };

  const filterEndTimeOptions = (startTime) => {
    const times = generateTimeOptions();
    return times.filter((time) => time > startTime);
  };

  const filterStartTimeOptions = (endTime) => {
    const times = generateTimeOptions();
    return times.filter((time) => time < endTime);
  };

  return (
    <div className="schedule-generator-page">
      <Navbar />
      <div className="schedule-generator-body">
        <h1>Schedule Generator</h1>
        <CourseSearch onAddCourse={addCourse} />
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
        <PreferenceForm
          days={days}
          setDays={setDays}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          breakTime={breakTime}
          setBreakTime={setBreakTime}
          filterStartTimeOptions={filterStartTimeOptions}
          filterEndTimeOptions={filterEndTimeOptions}
          handleSubmit={handleSubmit}
          buttonText="Reset Course Selections"
          buttonHandler={resetCourses}
          selectedPreferences={selectedPreferences}
          setSelectedPreferences={setSelectedPreferences}
        />
        <SelectedCoursesList
          courses={selectedCourses}
          onRemoveCourse={removeCourse}
        />
      </div>
    </div>
  );
};

export default ScheduleGenerator;
