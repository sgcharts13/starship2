import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Optimiser from "../utils/Optimiser.js";
import "../styles/timetable.css";
import "../styles/generatedSchedules.css"; // Add this import for the new CSS file
import Navbar from "../components/Navbar.js";
import PreferenceForm from "../components/PreferenceForm"; // Import the PreferenceForm component
import SelectedCoursesList from "../components/SelectedCoursesList";
import "../styles/selectedCoursesList.css";
import loadingGif from "../assets/loading.gif";
import Timetable from "../components/Timetable";
import { useCourseContext } from "../context/CourseContext";

const GeneratedSchedules = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseColors } = useCourseContext();
  console.log(courseColors);

  const selectedCourses = location.state?.selectedCourses || [];
  const preferences = location.state?.preferences || {};
  console.log(selectedCourses, preferences);
  const [selectedPreferences, setSelectedPreferences] = useState(
    location.state?.selectedPreferences || {}
  );
  console.log(selectedCourses, preferences, selectedPreferences);

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
  const [generatedSchedules, setGeneratedSchedules] = useState([]);
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
  const [isTimetableVisible, setIsTimetableVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("courseview"); // State to manage view mode

  useEffect(() => {
    if (selectedCourses.length > 0) {
      generateSchedules();
    }
  }, [selectedCourses]);

  const handleSubmit = () => {
    generateSchedules();
  };

  const DisallowRemoveCourse = () => {
    alert("Cannot remove course from this page");
  };

  const handleNextSchedule = () => {
    if (currentScheduleIndex < generatedSchedules.length - 1) {
      setCurrentScheduleIndex(currentScheduleIndex + 1);
      setIsTimetableVisible(false); // Hide timetable when switching schedules
    }
  };

  const handlePreviousSchedule = () => {
    if (currentScheduleIndex > 0) {
      setCurrentScheduleIndex(currentScheduleIndex - 1);
      setIsTimetableVisible(false); // Hide timetable when switching schedules
    }
  };

  const generateSchedules = async () => {
    setIsLoading(true);
    const sortedSchedules = await Optimiser(
      selectedCourses,
      preferences,
      selectedPreferences
    );
    setGeneratedSchedules(sortedSchedules);
    setIsLoading(false);
  };

  const handleAddToTimetable = (schedule) => {
    const uniqueIndexes = new Set();
    const addedIndexes = [];

    schedule.forEach((slot) => {
      const indexKey = `${slot.courseName}-${slot.courseIndex}`;
      if (!uniqueIndexes.has(indexKey)) {
        uniqueIndexes.add(indexKey);
        addedIndexes.push({
          courseName: slot.courseName,
          courseCode: slot.courseCode,
          selectedIndexId: slot.courseIndex,
        });
      }
    });

    navigate("/", { state: { addedIndexes } });
  };

  const getBreakTimes = (timeslots) => {
    const breakTimes = [];
    // Sort the timeslots by start time
    const sortedTimeslots = timeslots.sort(
      (a, b) => parseTime(a.startTime) - parseTime(b.startTime)
    );
    for (let i = 1; i < sortedTimeslots.length; i++) {
      const breakDuration =
        parseTime(sortedTimeslots[i].startTime) -
        parseTime(sortedTimeslots[i - 1].endTime);
      breakTimes.push(formatTime(breakDuration));
    }
    return breakTimes.join(", ");
  };

  const dayOrder = ["MON", "TUE", "WED", "THU", "FRI"];

  const formatTime = (decimalTime) => {
    if (decimalTime === "N/A") return "N/A";
    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const parseTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours + minutes / 60;
  };

  const isConstraintViolated = (value, constraint, type) => {
    if (type === "startTime") {
      return value < parseTime(constraint);
    } else if (type === "endTime") {
      return value > parseTime(constraint);
    } else if (type === "breakTime") {
      const breakTimes = value.split(", ").map(parseTime);
      return breakTimes.some((breakTime) => breakTime > constraint);
    }
    return false;
  };

  const formatBreakTimes = (breakTimes, constraint) => {
    return breakTimes
      .split(", ")
      .map((breakTime, idx) => {
        const parsedBreakTime = parseTime(breakTime);
        const isViolated = parsedBreakTime < constraint;
        return (
          <span
            key={idx}
            style={{
              color: isViolated ? "red" : "inherit",
              fontWeight: isViolated ? "bold" : "normal",
            }}
          >
            {breakTime}
          </span>
        );
      })
      .reduce((prev, curr) => [prev, ", ", curr]);
  };

  const currentSchedule = generatedSchedules[currentScheduleIndex];

  const renderDayView = () => (
    <table className="generated-schedule-day-table">
      <thead>
        <tr>
          <th>Day</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Break Time(s)</th>
        </tr>
      </thead>
      <tbody>
        {dayOrder
          .filter((day) =>
            currentSchedule.schedule.some((slot) => slot.day === day)
          )
          .map((day) => {
            const timeslots = currentSchedule.schedule.filter(
              (slot) => slot.day === day
            );
            const startTime = Math.min(
              ...timeslots.map((slot) => parseTime(slot.startTime))
            );
            const endTime = Math.max(
              ...timeslots.map((slot) => parseTime(slot.endTime))
            );
            const breakTimes = getBreakTimes(timeslots);

            return (
              <tr key={day}>
                <td>{day}</td>
                <td
                  style={{
                    color: isConstraintViolated(
                      startTime,
                      preferences.startTime,
                      "startTime"
                    )
                      ? "red"
                      : "inherit",
                    fontWeight: isConstraintViolated(
                      startTime,
                      preferences.startTime,
                      "startTime"
                    )
                      ? "bold"
                      : "normal",
                  }}
                >
                  {formatTime(startTime)}
                </td>
                <td
                  style={{
                    color: isConstraintViolated(
                      endTime,
                      preferences.endTime,
                      "endTime"
                    )
                      ? "red"
                      : "inherit",
                    fontWeight: isConstraintViolated(
                      endTime,
                      preferences.endTime,
                      "endTime"
                    )
                      ? "bold"
                      : "normal",
                  }}
                >
                  {formatTime(endTime)}
                </td>
                <td>{formatBreakTimes(breakTimes, preferences.breakTime)}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );

  const renderCourseView = () => (
    <table className="generated-schedule-course-table">
      <thead>
        <tr>
          <th>Course</th>
          <th>Timeslot(s)</th>
        </tr>
      </thead>
      <tbody>
        {selectedCourses.map((course) => {
          const timeslots = currentSchedule.schedule
            .filter((slot) => slot.courseCode === course.code)
            .map(
              (slot) =>
                `${slot.day} ${slot.startTime.slice(
                  0,
                  -3
                )} - ${slot.endTime.slice(0, -3)}`
            )
            .join(", ");
          return (
            <tr key={course.code}>
              <td>{course.code}</td>
              <td>{timeslots}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="generated-schedules-page">
      <Navbar />
      <div className="generated-schedules-body">
        <PreferenceForm
          days={days}
          setDays={setDays}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          breakTime={breakTime}
          setBreakTime={setBreakTime}
          filterStartTimeOptions={(endTime) => {
            const times = [];
            for (let hour = 8; hour <= 22; hour++) {
              times.push(`${hour.toString().padStart(2, "0")}:00`);
              times.push(`${hour.toString().padStart(2, "0")}:30`);
            }
            return times.filter((time) => time < endTime);
          }}
          filterEndTimeOptions={(startTime) => {
            const times = [];
            for (let hour = 8; hour <= 22; hour++) {
              times.push(`${hour.toString().padStart(2, "0")}:00`);
              times.push(`${hour.toString().padStart(2, "0")}:30`);
            }
            return times.filter((time) => time > startTime);
          }}
          handleSubmit={handleSubmit}
          buttonText="Change Course Selections"
          buttonHandler={() =>
            navigate("/schedule-generator", {
              state: { selectedCourses, preferences },
            })
          }
          selectedPreferences={selectedPreferences}
          setSelectedPreferences={setSelectedPreferences}
        />
        <h1>Generated Schedules</h1>
        {isLoading ? (
          <div className="loading-container">
            <img src={loadingGif} alt="Loading..." className="loading-gif" />
            <p>Loading schedules, please wait...</p>
          </div>
        ) : (
          currentSchedule && (
            <div className="carousel-container">
              {currentScheduleIndex > 0 && (
                <button
                  className="carousel-arrow left-arrow"
                  onClick={handlePreviousSchedule}
                >
                  &lt;
                </button>
              )}
              <div className="schedule-option">
                <h2>Timetable {currentSchedule.timetableNumber}</h2>
                <p>
                  <center>Score: {currentSchedule.score}</center>
                </p>
                <div className="view-buttons">
                  <button
                    className={`view-button ${
                      viewMode === "dayview" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("dayview")}
                  >
                    View Days
                  </button>
                  <button
                    className={`view-button ${
                      viewMode === "courseview" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("courseview")}
                  >
                    View Courses
                  </button>
                </div>
                {viewMode === "dayview" ? renderDayView() : renderCourseView()}
                <button
                  className="timetable-hide"
                  onClick={() => handleAddToTimetable(currentSchedule.schedule)}
                >
                  Add to Timetable
                </button>
                <button
                  className="timetable-hide"
                  onClick={() => setIsTimetableVisible(!isTimetableVisible)}
                >
                  {isTimetableVisible ? "Hide Timetable" : "View Timetable"}
                </button>
                {console.log(currentSchedule.schedule, courseColors)}
                {isTimetableVisible && (
                  <Timetable
                    selectedIndexes={currentSchedule.schedule}
                    courseColors={courseColors}
                  />
                )}
              </div>
              {currentScheduleIndex < generatedSchedules.length - 1 && (
                <button
                  className="carousel-arrow right-arrow"
                  onClick={handleNextSchedule}
                >
                  &gt;
                </button>
              )}
            </div>
          )
        )}
      </div>
      <SelectedCoursesList
        courses={selectedCourses}
        onRemoveCourse={DisallowRemoveCourse}
        hideRemoveButton={true} // Add this prop to hide the minus buttons
      />
    </div>
  );
};

export default GeneratedSchedules;
