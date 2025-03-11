// ScheduleGenerator.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseContext } from "../context/CourseContext";
import "../styles/scheduleGenerator.css";
import SelectedCoursesList from "../components/SelectedCoursesList";
import CourseSearch from "../components/CourseSearch";

const ScheduleGenerator = () => {
  const { selectedCourses, addCourse, removeCourse } = useCourseContext();
  const [days, setDays] = useState(3);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [breakTime, setBreakTime] = useState(1);
  const navigate = useNavigate();

  const handleSubmit = () => {
    const preferences = { days, startTime, endTime, breakTime };
    navigate("/generated-schedules", {
      state: { selectedCourses, preferences },
    });
  };

  return (
    <div className="schedule-generator">
      <h1>Schedule Generator</h1>
      <div className="add-courses-body">
        <SelectedCoursesList
          courses={selectedCourses}
          onRemoveCourse={removeCourse}
        />
        <CourseSearch onAddCourse={addCourse} />
      </div>
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
        <label>
          Start Time:
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>
        <label>
          End Time:
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
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
        <button onClick={handleSubmit}>Generate Schedule</button>
      </div>
    </div>
  );
};
export default ScheduleGenerator;
