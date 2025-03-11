import React, { useState, useEffect } from "react";
import Timetable from "../components/Timetable";
import { useCourseContext } from "../context/CourseContext";
import "../styles/homePage.css";
import { Link, useLocation } from "react-router-dom";

const HomePage = () => {
  const { selectedCourses, removeCourse } = useCourseContext();
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const location = useLocation();

  // If navigating from generatedSchedules, add the selected timetable indexes
  useEffect(() => {
    if (location.state?.addedIndexes) {
      setSelectedIndexes((prev) => [...prev, ...location.state.addedIndexes]);
    }
  }, [location.state]);

  return (
    <div className="home-page">
      <h1>Course Scheduler</h1>
      <Link to="/add-courses">
        <button>Add Courses</button>
      </Link>
      <Link to="/schedule-generator">
        <button>Generate Schedule</button>
      </Link>
      <div className="home-body">
        <Timetable selectedIndexes={selectedIndexes} />
        <div className="selected-courses-container">
          <h2>Selected Courses</h2>
          {selectedCourses?.length > 0 ? (
            selectedCourses.map((course) => (
              <div key={course.code} className="selected-course-item">
                <h3>{course.name}</h3>
                <select
                  value={
                    selectedIndexes.find(
                      (item) => item.courseName === course.name
                    )?.selectedIndexId || ""
                  }
                  onChange={(e) =>
                    setSelectedIndexes((prev) => [
                      ...prev.filter((item) => item.courseName !== course.name),
                      {
                        courseName: course.name,
                        selectedIndexId: e.target.value,
                      },
                    ])
                  }
                >
                  <option value="">Select Index</option>
                  {course.indexes.map((index) => (
                    <option key={index} value={index}>
                      {index}
                    </option>
                  ))}
                </select>
                &nbsp; &nbsp;
                <button onClick={() => removeCourse(course.code)}>-</button>
              </div>
            ))
          ) : (
            <p>No courses selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
