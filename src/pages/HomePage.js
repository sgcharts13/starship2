import React, { useState, useEffect, useRef } from "react";
import Timetable from "../components/Timetable";
import { useCourseContext } from "../context/CourseContext";
import "../styles/homePage.css";
import "../styles/selectedCoursesList.css"; // Import the new selected courses list CSS file
import { Link, useLocation } from "react-router-dom";
import { getIndexDetails } from "../services/databaseService";
import { toPng } from "html-to-image";
import Navbar from "../components/Navbar";

const HomePage = () => {
  const { selectedCourses, removeCourse } = useCourseContext();
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [indexDetails, setIndexDetails] = useState({});
  const [courseColors, setCourseColors] = useState({});
  const location = useLocation();
  const timetableRef = useRef(null);

  function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 30;
    const lightness = 74;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  useEffect(() => {
    if (location.state?.addedIndexes) {
      setSelectedIndexes(location.state.addedIndexes);
    }
  }, [location.state]);

  useEffect(() => {
    const newColors = {};
    selectedCourses.forEach((course) => {
      if (!courseColors[course.code]) {
        newColors[course.code] = getRandomColor();
      }
    });
    setCourseColors((prevColors) => ({ ...prevColors, ...newColors }));
  }, [selectedCourses]);

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

    if (selectedIndexId === "") {
      // Remove index details if "Select Index" is chosen
      setSelectedIndexes((prev) =>
        prev.filter((item) => item.courseName !== course.name)
      );
      setIndexDetails((prev) => {
        const newDetails = { ...prev };
        delete newDetails[course.code];
        return newDetails;
      });
      return;
    }

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
      const indexChangeDetails = await getIndexDetails(selectedIndex);
      console.log(indexChangeDetails);
      if (indexChangeDetails) {
        setIndexDetails((prev) => ({
          ...prev,
          [course.code]: Array.isArray(indexChangeDetails.timeslots)
            ? indexChangeDetails.timeslots
            : [],
        }));
      }
    }
  };

  const handleRemoveCourse = (courseCode) => {
    removeCourse(courseCode);
    setSelectedIndexes((prev) =>
      prev.filter((item) => item.courseCode !== courseCode)
    );
    setIndexDetails((prev) => {
      const newDetails = { ...prev };
      delete newDetails[courseCode];
      return newDetails;
    });
    setCourseColors((prevColors) => {
      const newColors = { ...prevColors };
      delete newColors[courseCode];
      return newColors;
    });
  };

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-body" ref={timetableRef}>
        <Timetable
          selectedIndexes={selectedIndexes}
          courseColors={courseColors}
        />
      </div>
      <div className="selected-courses-container">
        <h2>Selected Courses</h2>
        <div className="button-container">
          <Link to="/add-courses">
            <button>Add Courses</button>
          </Link>
          <br></br>
          <button onClick={handleExportAsPng}>Print Timetable</button>
        </div>
        {selectedCourses?.length > 0 ? (
          selectedCourses.map((course) => (
            <div
              key={course.code}
              className="selected-course-item"
              style={{ backgroundColor: courseColors[course.code] }}
            >
              <p>
                <b>
                  {course.code} {course.name}
                </b>
              </p>
              <select
                style={{ margin: 0 }}
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
              <button
                className="minus-button"
                onClick={() => handleRemoveCourse(course.code)}
              >
                -
              </button>
              {console.log(indexDetails[course.code])}
              {Array.isArray(indexDetails[course.code])
                ? indexDetails[course.code].map((timeslot, idx) => (
                    <p key={idx}>
                      {timeslot.day}: {timeslot.start.slice(0, -3)} -{" "}
                      {timeslot.end.slice(0, -3)}
                    </p>
                  ))
                : ""}
            </div>
          ))
        ) : (
          <p>No courses selected</p>
        )}
        <br></br>
      </div>
    </div>
  );
};

export default HomePage;
