import React, { useState, useEffect, useRef } from "react";
import Timetable from "../components/Timetable";
import { useCourseContext } from "../context/CourseContext";
import "../styles/homePage.css";
import { Link, useLocation } from "react-router-dom";
import { getIndexDetails } from "../services/databaseService";
import { toPng } from "html-to-image";

const HomePage = () => {
  const { selectedCourses, removeCourse } = useCourseContext();
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [indexDetails, setIndexDetails] = useState({});
  const location = useLocation();
  const timetableRef = useRef(null);

  function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  // If navigating from generatedSchedules, add the selected timetable indexes
  useEffect(() => {
    if (location.state?.addedIndexes) {
      setSelectedIndexes(location.state.addedIndexes);
    }
  }, [location.state]);
  console.log(selectedCourses, selectedIndexes);

  const handleExportAsPng = () => {
    if (timetableRef.current) {
      const originalBackgroundColor =
        timetableRef.current.style.backgroundColor;
      timetableRef.current.style.backgroundColor = "white";

      toPng(timetableRef.current)
        .then((dataUrl) => {
          timetableRef.current.style.backgroundColor = originalBackgroundColor;
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "timetable.png";
          link.click();
        })
        .catch((err) => {
          console.error("Failed to export timetable as PNG", err);
        });
    }
  };

  const handleIndexChange = async (course, selectedIndexId) => {
    console.log(course, selectedIndexId);
    setSelectedIndexes((prev) => [
      ...prev.filter((item) => item.courseName !== course.name),
      {
        courseName: course.name,
        courseCode: course.code,
        selectedIndexId,
      },
    ]);

    const selectedIndex = course.indexes.find(
      (index) => index === selectedIndexId
    );
    console.log(selectedIndex);
    if (selectedIndex) {
      // Assuming you have a function to get the timeslot details for the selected index
      const indexDetails = await getIndexDetails(selectedIndex);
      console.log(indexDetails);
      if (indexDetails) {
        setIndexDetails((prev) => ({
          ...prev,
          [course.code]: Array.isArray(indexDetails) ? indexDetails : [],
        }));
      }
    }
  };

  return (
    <div className="home-page">
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
      <h1 class="header">Course Scheduler</h1>
      <div className="home-body" ref={timetableRef}>
        <Timetable selectedIndexes={selectedIndexes} />
        <div className="selected-courses-container">
          <h2>Selected Courses</h2>
          {selectedCourses?.length > 0 ? (
            selectedCourses.map((course) => (
              <div key={course.code} className="selected-course-item">
                <h3>
                  {course.code} {course.name}
                </h3>
                <select
                  value={
                    selectedIndexes.find(
                      (item) => item.courseName === course.name
                    )?.selectedIndexId || ""
                  }
                  onChange={(e) => handleIndexChange(course, e.target.value)}
                >
                  <option value="">Select Index</option>
                  {course.indexes.map((index) => (
                    <option key={index} value={index}>
                      {zeroPad(index, 5)}
                    </option>
                  ))}
                </select>
                &nbsp; &nbsp;
                <button onClick={() => removeCourse(course.code)}>-</button>
                <br></br>
                <br></br>
                {console.log(indexDetails[course.code])}
                {Array.isArray(indexDetails[course.code])
                  ? indexDetails[course.code].map((timeslot, idx) => (
                      <span key={idx}>
                        {timeslot.day}: {timeslot.startTime} -{" "}
                        {timeslot.endTime}
                        <br />
                      </span>
                    ))
                  : "Index Details"}
              </div>
            ))
          ) : (
            <p>No courses selected</p>
          )}
          <br></br>
          <button onClick={handleExportAsPng}>Export Timetable as PNG</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
