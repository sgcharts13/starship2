import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      <div className="add-courses-header">
        <h1>Add Courses</h1>
        <button onClick={() => navigate("/")}>Return to Home</button>
      </div>
      <br></br>
      <div className="add-courses-body">
        <SelectedCoursesList
          courses={selectedCourses}
          onRemoveCourse={removeCourse}
        />
        <CourseSearch onAddCourse={addCourse} />
      </div>
      <br></br>
      {warning && <div className="warning">{warning}</div>}
      <br></br>
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
