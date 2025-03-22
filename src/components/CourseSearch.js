// src/components/CourseSearch.js
import React, { useState } from "react";
import { searchCourses } from "../services/databaseService";
import "../styles/courseSearch.css";

const CourseSearch = ({ onAddCourse }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    if (query.trim() === "") return;
    const courses = await searchCourses(query);
    setSearchResults(
      courses.filter(
        (course) =>
          course.name.toLowerCase().includes(query.toLowerCase()) ||
          course.code.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleAddCourse = (course) => {
    onAddCourse(course);
  };

  return (
    <div className="course-search">
      <h2>Course Search</h2>
      <input
        type="text"
        placeholder="Search for course code or name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <div className="search-results">
        {searchResults.map((course) => (
          <div key={course.id} className="course-item">
            <h3>
              {course.name} ({course.code})
            </h3>
            <p>
              {course.au_count} AU |{" "}
              {course.letter_grade ? "Pass/Fail" : "Letter-Graded"} |{" "}
              {course.indexes.length} available timeslot(s)
              <br />
              Prerequisite: {course.prereq ? course.prereq : "-"}
              <br />
              <br />
              <i>{course.description}</i>
            </p>
            <button onClick={() => handleAddCourse(course)}>Add Course</button>
            <br />
            <br />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseSearch;
