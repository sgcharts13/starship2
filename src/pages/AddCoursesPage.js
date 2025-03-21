import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SelectedCoursesList from "../components/SelectedCoursesList";
import CourseSearch from "../components/CourseSearch";
import Navbar from "../components/Navbar"; // Import the Navbar component
import { useCourseContext } from "../context/CourseContext";
import "../styles/selectedCoursesList.css"; // Import the new selected courses list CSS file
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

    // Clear the warning when the component unmounts
    return () => {
      setWarning("");
    };
  }, [setWarning]);

  const handleAddToSchedule = () => {
    navigate("/"); // Redirect to the home page
  };

  return (
    <div className="add-courses-page">
      <Navbar /> {/* Use the Navbar component */}
      <div className="add-courses-body">
        <h1>Add Courses</h1>
        <CourseSearch onAddCourse={addCourse} />
      </div>
      <div className="add-courses-body">
        {warning && <div className="warning">{warning}</div>}
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
      <SelectedCoursesList
        courses={selectedCourses}
        onRemoveCourse={removeCourse}
      />
    </div>
  );
};

export default AddCoursesPage;
