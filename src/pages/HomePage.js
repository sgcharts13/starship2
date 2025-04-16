import React, { useState, useEffect, useRef } from "react";
import Timetable from "../components/Timetable";
import { useCourseContext } from "../context/CourseContext";
import "../styles/homePage.css";
import "../styles/selectedCoursesList.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getIndexDetails } from "../services/databaseService";
import Navbar from "../components/Navbar";
import html2canvas from "html2canvas";

const HomePage = () => {
  const {
    selectedCourses,
    addCourse,
    removeCourse,
    courseColors,
    setCourseColors,
  } = useCourseContext();
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [indexDetails, setIndexDetails] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const timetableRef = useRef(null);
  const selectedCoursesRef = useRef(null);

  function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  useEffect(() => {
    // Parse query parameters to prepopulate selected courses and indexes
    const params = new URLSearchParams(location.search);
    const courses = params.get("courses");
    if (courses) {
      const parsedCourses = JSON.parse(decodeURIComponent(courses));
      setSelectedIndexes(parsedCourses);

      // Populate selectedCourses using addCourse and assign unique background colors
      parsedCourses.forEach((course) => {
        addCourse({
          code: course.courseCode,
          name: course.courseName,
          indexes: [course.selectedIndexId], // Assuming indexes are provided
        });
      });

      // Assign unique background colors for each course
      const newCourseColors = {};
      parsedCourses.forEach((course, index) => {
        const color = `hsl(${(index * 137.5) % 360}, 70%, 80%)`; // Generate unique colors
        newCourseColors[course.courseCode] = color;
      });
      setCourseColors(newCourseColors);
    }

    if (location.state?.addedIndexes) {
      setSelectedIndexes(location.state.addedIndexes);
    }
  }, [location.state, location.search, addCourse, setCourseColors]);

  // Function to export timetable and selected courses list as combined PNG
  const handleExportAsPng = async () => {
    const timetableCanvas = await html2canvas(timetableRef.current);
    const originalStyle = selectedCoursesRef.current.style.cssText;
    selectedCoursesRef.current.style.height = "auto";
    selectedCoursesRef.current.style.overflow = "visible";
    const coursesCanvas = await html2canvas(selectedCoursesRef.current);
    selectedCoursesRef.current.style.cssText = originalStyle;

    const timetableWidth = timetableCanvas.width;
    const timetableHeight = timetableCanvas.height;
    const coursesWidth = coursesCanvas.width;
    const coursesHeight = coursesCanvas.height;

    const totalWidth = timetableWidth + coursesWidth;
    const maxHeight = Math.max(timetableHeight, coursesHeight);

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = totalWidth;
    finalCanvas.height = maxHeight;

    const ctx = finalCanvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    ctx.drawImage(timetableCanvas, 0, 0);
    ctx.drawImage(coursesCanvas, timetableWidth, 0);

    const link = document.createElement("a");
    link.download = "full_timetable.png";
    link.href = finalCanvas.toDataURL("image/png");
    link.click();
  };

  // Function to generate a shareable link
  const handleGetShareableLink = () => {
    const encodedCourses = encodeURIComponent(JSON.stringify(selectedIndexes));
    const shareableLink = `${window.location.origin}${window.location.pathname}?courses=${encodedCourses}`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      alert("Shareable link copied to clipboard!");
    });
  };

  const handleIndexChange = async (course, selectedIndexId) => {
    if (selectedIndexId === "") {
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
    if (selectedIndex) {
      const indexChangeDetails = await getIndexDetails(selectedIndex);
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
  };

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-body" ref={timetableRef}>
        <Timetable
          selectedIndexes={selectedIndexes}
          courseColors={courseColors}
        />
        <div className="selected-courses-container" ref={selectedCoursesRef}>
          <h2>Selected Courses</h2>
          <div className="button-container">
            <Link to="/add-courses">
              <button>Add Courses</button>
            </Link>
            <br></br>
            <button onClick={handleExportAsPng}>
              Print Timetable&nbsp;
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12 15.575q-.2 0-.375-.062T11.3 15.3l-3.6-3.6q-.3-.3-.288-.7t.288-.7q.3-.3.713-.312t.712.287L11 12.15V5q0-.425.288-.712T12 4t.713.288T13 5v7.15l1.875-1.875q.3-.3.713-.288t.712.313q.275.3.288.7t-.288.7l-3.6 3.6q-.15.15-.325.213t-.375.062M6 20q-.825 0-1.412-.587T4 18v-2q0-.425.288-.712T5 15t.713.288T6 16v2h12v-2q0-.425.288-.712T19 15t.713.288T20 16v2q0 .825-.587 1.413T18 20z"
                />
              </svg>
            </button>
            <br></br>
            <button onClick={handleGetShareableLink}>Get Shareable Link</button>
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
            <p className="none">No courses selected</p>
          )}
          <br></br>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
