import React, { useState } from "react";
import Timetable from "../components/Timetable";
import { Link } from "react-router-dom";
import { useCourseContext } from "../context/CourseContext";
import "../styles/homePage.css";

const HomePage = () => {
  const { selectedCourses, removeCourse } = useCourseContext();
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const handleIndexSelect = (courseName, selectedIndexId) => {
    setSelectedIndexes([
      ...selectedIndexes.filter((item) => item.courseName !== courseName),
      { courseName, selectedIndexId },
    ]);
  };

  const handleRemoveCourse = (courseId) => {
    removeCourse(courseId);
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Course Scheduler</h1>
        <Link to="/add-courses">
          <button>Add Courses</button>
        </Link>
      </div>
      <div className="home-body">
        <div className="timetable-container">
          <Timetable selectedIndexes={selectedIndexes} />
        </div>
        <div className="selected-courses-container">
          <h2>Selected Courses</h2>
          {selectedCourses.map((course) => (
            <div key={course.code} className="selected-course-item">
              <h3>{course.name}</h3>
              <select
                onChange={(e) => handleIndexSelect(course.name, e.target.value)}
              >
                <option value="">Select Index</option>
                {course.indexes.map((index) => (
                  <option key={index} value={index}>
                    {index}
                  </option>
                ))}
              </select>
              &nbsp;&nbsp;
              <button onClick={() => handleRemoveCourse(course.id)}>-</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
