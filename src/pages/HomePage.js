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
  const { selectedCourses, removeCourse, courseColors } = useCourseContext();
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [indexDetails, setIndexDetails] = useState({});
  const location = useLocation();
  const timetableRef = useRef(null);

  function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  useEffect(() => {
    if (location.state?.addedIndexes) {
      setSelectedIndexes(location.state.addedIndexes);
    }
  }, [location.state]);

  const handleExportAsPng = () => {
    if (timetableRef.current) {
      const originalBackgroundColor =
        timetableRef.current.style.backgroundColor;
      timetableRef.current.style.backgroundColor = "white";

      // Create a wrapper to combine timetable and selected courses list
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "flex-start";
      wrapper.style.backgroundColor = "white";
      wrapper.style.margin = "0"; // Remove margins
      wrapper.style.padding = "0"; // Remove padding

      // Clone the timetable
      const timetableClone = timetableRef.current.cloneNode(true);
      timetableClone.style.width = `${timetableRef.current.scrollWidth}px`;
      timetableClone.style.height = `${timetableRef.current.scrollHeight}px`;

      // Clone the selected courses list
      const selectedCoursesList = document.querySelector(
        ".selected-courses-container"
      );
      const selectedCoursesClone = selectedCoursesList.cloneNode(true);

      // Remove buttons from the cloned selected courses list
      const buttons = selectedCoursesClone.querySelector(".button-container");
      if (buttons) {
        buttons.remove();
      }

      // Ensure the selected index is displayed in the dropdowns
      const originalSelectors = selectedCoursesList.querySelectorAll("select");
      const clonedSelectors = selectedCoursesClone.querySelectorAll("select");
      clonedSelectors.forEach((clonedSelector, index) => {
        clonedSelector.value = originalSelectors[index].value;
      });

      selectedCoursesClone.style.width = `${selectedCoursesList.scrollWidth}px`;
      selectedCoursesClone.style.height = `${selectedCoursesList.scrollHeight}px`;

      // Append clones to the wrapper
      wrapper.appendChild(timetableClone);
      wrapper.appendChild(selectedCoursesClone);

      // Remove the navbar to eliminate the left gap
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        navbar.style.display = "none";
      }

      // Adjust wrapper layout to flush left
      wrapper.style.marginLeft = "0";
      wrapper.style.marginRight = "0";

      // Fix overlap issue by adding spacing between timetable and selected courses list
      wrapper.style.gap = "20px"; // Add spacing between the two elements

      // Apply scaling to shrink the content if it's too large
      const scaleFactor = 0.5; // Shrink to 50% of the original size
      wrapper.style.transform = `scale(${scaleFactor})`;
      wrapper.style.transformOrigin = "top left";
      wrapper.style.width = `${
        timetableRef.current.scrollWidth + selectedCoursesList.scrollWidth + 20
      }px`; // Include gap in width
      wrapper.style.height = `${Math.max(
        timetableRef.current.scrollHeight,
        selectedCoursesList.scrollHeight
      )}px`;

      document.body.appendChild(wrapper);

      toPng(wrapper, {
        cacheBust: true,
        width: wrapper.scrollWidth * scaleFactor,
        height: wrapper.scrollHeight * scaleFactor,
      })
        .then((dataUrl) => {
          timetableRef.current.style.backgroundColor = originalBackgroundColor;

          // Restore the navbar after capturing
          if (navbar) {
            navbar.style.display = "";
          }

          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "timetable_and_courses.png";
          link.click();
          document.body.removeChild(wrapper); // Remove the wrapper after capturing
        })
        .catch((err) => {
          console.error("Failed to export timetable and courses as PNG", err);

          // Restore the navbar in case of error
          if (navbar) {
            navbar.style.display = "";
          }

          document.body.removeChild(wrapper); // Ensure the wrapper is removed in case of error
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
  };

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-body" ref={timetableRef}>
        <Timetable
          selectedIndexes={selectedIndexes}
          courseColors={courseColors}
        />
        <div className="selected-courses-container">
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
            <p className="none">No courses selected</p>
          )}
          <br></br>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
