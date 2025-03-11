import React, { createContext, useContext, useState } from "react";

// Create the context
const CourseContext = createContext();

// Create a custom hook to access the context
export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourseContext must be used within a CourseProvider");
  }
  return context;
};

// Create a provider component
export const CourseProvider = ({ children }) => {
  const [selectedCourses, setSelectedCourses] = useState([]);

  const addCourse = (course) => {
    setSelectedCourses((prev) => [...prev, course]);
  };

  const removeCourse = (courseId) => {
    setSelectedCourses((prev) =>
      prev.filter((course) => course.id !== courseId)
    );
  };

  const resetCourses = () => {
    setSelectedCourses([]);
  };

  return (
    <CourseContext.Provider
      value={{ selectedCourses, addCourse, removeCourse, resetCourses }}
    >
      {children}
    </CourseContext.Provider>
  );
};
