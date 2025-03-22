import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SelectedCoursesList from "../components/SelectedCoursesList";
import CourseSearch from "../components/CourseSearch";
import Navbar from "../components/Navbar"; // Import the Navbar component
import { useCourseContext } from "../context/CourseContext";
import "../styles/navbar.css"; // Import the new navbar CSS file
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
    setCourseColors,
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

  const handleAddCourse = (course) => {
    addCourse(course);
    if (!selectedCourses.some((c) => c.code === course.code)) {
      const hue = Math.floor(Math.random() * 360);
      const saturation = 30;
      const lightness = 74;
      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      setCourseColors((prevColors) => ({
        ...prevColors,
        [course.code]: color,
      }));
    }
  };

  const handleAddToSchedule = () => {
    navigate("/"); // Redirect to the home page
  };

  return (
    <div className="add-courses-page">
      <Navbar /> {/* Use the Navbar component */}
      <div className="add-courses-body">
        <h1>Add Courses</h1>
        <CourseSearch onAddCourse={handleAddCourse} />
      </div>
      <div className="add-courses-body">
        {warning && <div className="warning">{warning}</div>}
        <div className="add-courses-button-container">
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
      <SelectedCoursesList
        courses={selectedCourses}
        onRemoveCourse={removeCourse}
      />
    </div>
  );
};

export default AddCoursesPage;
