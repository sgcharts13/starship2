import React, { useEffect, useState } from "react";
import { getIndexDetails } from "../services/databaseService";
import "../styles/timetable.css";

const Timetable = ({ selectedIndexes, courseColors }) => {
  const [timeslots, setTimeslots] = useState([]);

  useEffect(() => {
    const fetchTimeslots = async () => {
      const newTimeslots = [];
      const processedIndexes = new Set();
      var selectedIndexBool = true;
      console.log(selectedIndexes);
      if (selectedIndexes.length === 0) {
        selectedIndexBool = false;
      } else if (selectedIndexes[0].courseIndex !== undefined) {
        selectedIndexBool = false;
      }
      console.log(selectedIndexes, selectedIndexBool);
      if (selectedIndexBool === true) {
        for (const {
          courseName,
          courseCode,
          selectedIndexId,
        } of selectedIndexes) {
          console.log(
            courseName,
            courseCode,
            "selectedIndexId",
            selectedIndexId
          );
          const indexDetails = await getIndexDetails(selectedIndexId);
          if (indexDetails) {
            const courseSlots = indexDetails.timeslots.map((slot) => ({
              ...slot,
              courseName,
              courseCode,
            }));
            newTimeslots.push(...courseSlots);
          }
        }
      } else {
        for (const { courseName, courseCode, courseIndex } of selectedIndexes) {
          if (processedIndexes.has(courseIndex)) {
            continue; // Skip duplicate courseIndex values
          }
          processedIndexes.add(courseIndex); // Add courseIndex to the set
          console.log(courseName, courseCode, courseIndex);
          const indexDetails = await getIndexDetails(courseIndex);
          if (indexDetails) {
            const courseSlots = indexDetails.timeslots.map((slot) => ({
              ...slot,
              courseName,
              courseCode,
            }));
            newTimeslots.push(...courseSlots);
          }
        }
      }
      console.log(newTimeslots);
      setTimeslots(newTimeslots);
    };

    fetchTimeslots();
  }, [selectedIndexes]);

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}:00`;
  };

  const calculateRowSpan = (start, end) => {
    const timeToDecimal = (time) => {
      return parseFloat(
        time
          .replace(":30:00", ".5")
          .replace(":50:00", ".9")
          .replace(":20:00", ".4")
      );
    };
    const startTime = timeToDecimal(formatTime(start));
    const endTime = timeToDecimal(formatTime(end));
    const timeDiff = Math.round((endTime - startTime) * 2);
    return timeDiff;
  };

  const getTextColor = (backgroundColor) => {
    return "black";
  };

  const renderTimetable = () => {
    const times = Array.from({ length: 28 }, (_, i) => 8 + i / 2);
    const days = ["MON", "TUE", "WED", "THU", "FRI"];
    const timetableMatrix = {};

    timeslots.forEach((slot) => {
      const formattedStart = formatTime(slot.start);
      const formattedEnd = formatTime(slot.end);
      if (!timetableMatrix[slot.day]) timetableMatrix[slot.day] = [];

      timetableMatrix[slot.day].push({
        start: formattedStart,
        end: formattedEnd,
        details: slot,
      });
    });

    // Detect and merge clashes
    const mergedTimetable = {};
    days.forEach((day) => {
      if (!timetableMatrix[day]) return;

      const sortedSlots = timetableMatrix[day].sort((a, b) =>
        a.start.localeCompare(b.start)
      );
      mergedTimetable[day] = [];

      let mergedSlot = null;
      sortedSlots.forEach((slot) => {
        if (!mergedSlot) {
          mergedSlot = { ...slot, courses: [slot.details] };
        } else {
          const mergedEnd = mergedSlot.end;

          if (slot.start < mergedEnd) {
            // Overlapping slot detected, merge them
            mergedSlot.end = slot.end > mergedEnd ? slot.end : mergedEnd;
            mergedSlot.courses.push(slot.details);
          } else {
            // No overlap, push merged slot and start a new one
            mergedTimetable[day].push(mergedSlot);
            mergedSlot = { ...slot, courses: [slot.details] };
          }
        }
      });

      if (mergedSlot) {
        mergedTimetable[day].push(mergedSlot);
      }
    });

    return (
      <table className="timetable">
        <thead>
          <tr>
            <th></th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time, rowIndex) => {
            const hours = Math.floor(time).toString().padStart(2, "0");
            const minutes = time % 1 === 0 ? "00" : "30";
            const formattedTime = `${hours}:${minutes}:00`;
            return (
              <tr key={rowIndex}>
                <td>{formattedTime.slice(0, -3)}</td>
                {days.map((day) => {
                  const slot = mergedTimetable[day]?.find(
                    (s) => s.start === formattedTime
                  );

                  if (slot) {
                    const rowSpan = calculateRowSpan(slot.start, slot.end);
                    const isClash = slot.courses.length > 1;
                    const backgroundColor = isClash
                      ? "#f73959"
                      : courseColors[slot.courses[0].courseCode] || "#ADD8E6";
                    const textColor = getTextColor(backgroundColor);

                    return (
                      <td
                        key={`${day}-${time}`}
                        rowSpan={rowSpan}
                        className="timeslot"
                        style={{
                          backgroundColor,
                          color: textColor,
                        }}
                      >
                        <div>
                          {isClash ? (
                            <div className="clash-text">
                              <strong>CLASH:</strong>
                              <br />
                              {slot.courses.map((course, index) => (
                                <span key={index}>
                                  <strong>
                                    {course.courseCode} {course.courseName} -{" "}
                                    {course.class_group}
                                  </strong>{" "}
                                  <br />
                                  {course.start.slice(0, -3)} -{" "}
                                  {course.end.slice(0, -3)} <br />
                                  {course.venue}
                                  <br />
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <strong>
                                {slot.courses[0].courseCode}{" "}
                                {slot.courses[0].courseName} -{" "}
                                {slot.courses[0].class_group}
                              </strong>
                              <br />
                              {slot.courses.map((course, index) => (
                                <span key={index}>
                                  {course.start.slice(0, -3)} -{" "}
                                  {course.end.slice(0, -3)}
                                  <br /> {course.venue}
                                  <br />
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  } else if (
                    mergedTimetable[day]?.some(
                      (s) => formattedTime > s.start && formattedTime < s.end
                    )
                  ) {
                    return null; // Prevent duplicate slots rendering
                  } else {
                    return <td key={`${day}-${time}`} />;
                  }
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="timetable-container">
      <h2>Timetable Planner</h2>
      {renderTimetable()}
    </div>
  );
};

export default Timetable;
