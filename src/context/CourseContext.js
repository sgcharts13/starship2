import React, { createContext, useContext, useState } from "react";

const CourseContext = createContext();

export const useCourseContext = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courseColors, setCourseColors] = useState({});
  const [warning, setWarning] = useState("");

  const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 30;
    const lightness = 74;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const addCourse = (course) => {
    if (selectedCourses.some((c) => c.code === course.code)) {
      setWarning(`Course ${course.code} is already added.`);
      return;
    }
    setSelectedCourses((prevCourses) => [...prevCourses, course]);
    setCourseColors((prevColors) => ({
      ...prevColors,
      [course.code]: generateRandomColor(),
    }));
    setWarning(""); // Clear the warning if the course is added successfully
  };

  const removeCourse = (courseCode) => {
    setSelectedCourses((prevCourses) =>
      prevCourses.filter((course) => course.code !== courseCode)
    );
    setCourseColors((prevColors) => {
      const newColors = { ...prevColors };
      delete newColors[courseCode];
      return newColors;
    });
  };

  const resetCourses = () => {
    setSelectedCourses([]);
    setCourseColors({});
  };

  return (
    <CourseContext.Provider
      value={{
        selectedCourses,
        addCourse,
        removeCourse,
        resetCourses,
        warning,
        setWarning,
        courseColors,
        setCourseColors,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
