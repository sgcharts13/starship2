// src/components/SelectedCoursesList.js
import React from "react";
import "../styles/selectedCoursesList.css";

const SelectedCoursesList = ({ courses, onRemoveCourse }) => {
  return (
    <div className="selected-courses-list">
      <h2>Selected Courses</h2>
      {courses.length === 0 ? (
        <p>No courses selected</p>
      ) : (
        <ul>
          {courses.map((course) => (
            <li key={course.code}>
              {course.name} ({course.code})
              <button onClick={() => onRemoveCourse(course.code)}>-</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelectedCoursesList;
