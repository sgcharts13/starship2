import { createContext, useContext, useState } from "react";

const CourseContext = createContext();

export const useCourseContext = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
  const [selectedCourses, setSelectedCourses] = useState([]);

  const addCourse = (course) => {
    setSelectedCourses((prev) => [...prev, course]);
  };

  const removeCourse = (courseId) => {
    setSelectedCourses((prev) =>
      prev.filter((course) => course.code !== courseId)
    );
  };

  return (
    <CourseContext.Provider
      value={{ selectedCourses, addCourse, removeCourse }}
    >
      {children}
    </CourseContext.Provider>
  );
};
