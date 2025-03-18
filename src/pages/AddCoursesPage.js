import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import SelectedCoursesList from "../components/SelectedCoursesList";
import CourseSearch from "../components/CourseSearch";
import { useCourseContext } from "../context/CourseContext";
import "../styles/addCourses.css";

const AddCoursesPage = () => {
  const {
    selectedCourses,
    addCourse,
    removeCourse,
    resetCourses,
    warning,
    setWarning,
  } = useCourseContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the warning when the component mounts
    setWarning("");
  }, [setWarning]);

  const handleAddToSchedule = () => {
    navigate("/"); // Redirect to the home page
  };

  return (
    <div className="add-courses-page">
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
      <h1>Add Courses</h1>
      <div className="add-courses-body">
        <SelectedCoursesList
          courses={selectedCourses}
          onRemoveCourse={removeCourse}
        />
        <CourseSearch onAddCourse={addCourse} />
      </div>
      {warning && <div className="warning">{warning}</div>}
      <div className="add-courses-body">
        <button
          className="add-to-schedule-button"
          onClick={handleAddToSchedule}
        >
          Add Courses to Schedule
        </button>
        <button className="reset-courses-button" onClick={resetCourses}>
          Reset Selections
        </button>
      </div>
    </div>
  );
};

export default AddCoursesPage;
