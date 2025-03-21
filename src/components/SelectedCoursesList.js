// src/components/SelectedCoursesList.js
import React from "react";
import "../styles/selectedCoursesList.css";

const SelectedCoursesList = ({ courses, onRemoveCourse }) => {
  return (
    <div className="selected-courses-container">
      <h2>Selected Courses</h2>
      {courses.length === 0 ? (
        <p>No courses selected</p>
      ) : (
        <div className="selected-courses-grid">
          {courses.map((course) => (
            <div key={course.code} className="selected-course-item">
              <div className="course-details">
                <p>
                  {course.code} {course.name}
                </p>
                <button
                  className="minus-button"
                  onClick={() => onRemoveCourse(course.code)}
                >
                  -
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectedCoursesList;
