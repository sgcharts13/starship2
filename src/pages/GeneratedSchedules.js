import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getIndexDetails } from "../services/databaseService";
import "../styles/timetable.css";

const GeneratedSchedules = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedCourses = location.state?.selectedCourses || [];
  const preferences = location.state?.preferences || {};
  console.log(selectedCourses, preferences);

  const [generatedSchedules, setGeneratedSchedules] = useState([]);

  useEffect(() => {
    if (selectedCourses.length > 0) {
      generateSchedules();
    }
  }, [selectedCourses]);

  const generateSchedules = async () => {
    const populationSize = 100;
    const generations = 10;
    let population = await generateInitialPopulation(populationSize);

    for (let i = 0; i < generations; i++) {
      population = await evolvePopulation(population);
    }

    const uniqueSchedules = getUniqueSchedules(population);

    const sortedSchedules = uniqueSchedules
      .sort((a, b) => a.fitness - b.fitness) // Sort in ascending order
      .slice(0, 3) // Select the first three schedules
      .map((schedule, index) => ({
        schedule: schedule.schedule,
        avgStartTime: formatTime(
          calculateEarliestTime(schedule.schedule, "startTime")
        ),
        avgEndTime: formatTime(
          calculateLatestTime(schedule.schedule, "endTime")
        ),
        avgBreakTime: formatTime(calculateAverageBreakTime(schedule.schedule)),
        days: new Set(schedule.schedule.map((entry) => entry.day)).size,
        score: schedule.fitness, // Include the score
        timetableNumber: index + 1, // Add timetable number
      }));

    console.log(sortedSchedules);

    setGeneratedSchedules(sortedSchedules);
  };

  const generateInitialPopulation = async (size) => {
    const population = [];
    for (let i = 0; i < size; i++) {
      const schedule = await createRandomSchedule();
      const fitness = evaluateFitness(schedule);
      if (schedule.length > 0 && fitness > 0) {
        population.push({ schedule, fitness });
      }
    }
    return population;
  };

  const createRandomSchedule = async () => {
    return Promise.all(
      selectedCourses.map(async (course) => {
        if (!course.indexes || course.indexes.length === 0) return [];

        const randomIndex = Math.floor(Math.random() * course.indexes.length);
        const chosenIndex = course.indexes[randomIndex];
        const indexDetails = await getIndexDetails(chosenIndex);
        console.log(chosenIndex, indexDetails);

        if (
          !indexDetails ||
          !indexDetails.timeslots ||
          indexDetails.timeslots.length === 0
        ) {
          return [];
        }

        return indexDetails.timeslots
          .map((timeslot) => ({
            courseName: course.name || "Unknown Course",
            courseCode: course.code || "Unknown Course",
            courseIndex: chosenIndex || "Unknown Index",
            class_group: timeslot.class_group || "Unknown Group",
            venue: timeslot.venue || "Unknown Venue",
            day: timeslot.day || "N/A",
            startTime: timeslot.start || "00:00",
            endTime: timeslot.end || "00:00",
          }))
          .filter((entry) => entry.day !== "N/A"); // Remove invalid entries
      })
    ).then((results) => results.flat());
  };

  const evaluateFitness = (schedule) => {
    if (!schedule || schedule.length === 0) return 1000;

    let score = 0;
    const daysWithClasses = new Set();
    let startTimes = [];
    let endTimes = [];

    // Check for overlapping timeslots
    const timeslotsByDay = {};
    for (const slot of schedule) {
      if (!slot || !slot.day) continue; // Prevent undefined error
      if (slot.day !== "N/A") {
        daysWithClasses.add(slot.day);
        if (!timeslotsByDay[slot.day]) {
          timeslotsByDay[slot.day] = [];
        }
        timeslotsByDay[slot.day].push(slot);
      }
    }

    for (const day in timeslotsByDay) {
      const timeslots = timeslotsByDay[day];
      timeslots.sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
      for (let i = 1; i < timeslots.length; i++) {
        if (
          parseTime(timeslots[i].startTime) <
          parseTime(timeslots[i - 1].endTime)
        ) {
          // Overlapping timeslots detected
          return 1000;
        }
      }
    }

    for (const slot of schedule) {
      if (slot.startTime !== "00:00") {
        startTimes.push(parseTime(slot.startTime));
      }
      if (slot.endTime !== "00:00") {
        endTimes.push(parseTime(slot.endTime));
      }
    }

    // Calculate score based on days preference
    const daysExceed = daysWithClasses.size - preferences.days;
    if (daysExceed > 0) {
      score += daysExceed * 10;
    }

    // Calculate score based on start time preference
    let startTimeExceedDays = 0;
    for (const day in timeslotsByDay) {
      const timeslots = timeslotsByDay[day];
      if (timeslots.length > 0) {
        const dayStartTime = parseTime(timeslots[0].startTime);
        if (dayStartTime < parseTime(preferences.startTime)) {
          startTimeExceedDays++;
        }
      }
    }
    score += startTimeExceedDays * 5;

    // Calculate score based on end time preference
    let endTimeExceedDays = 0;
    for (const day in timeslotsByDay) {
      const timeslots = timeslotsByDay[day];
      if (timeslots.length > 0) {
        const dayEndTime = parseTime(timeslots[timeslots.length - 1].endTime);
        if (dayEndTime > parseTime(preferences.endTime)) {
          endTimeExceedDays++;
        }
      }
    }
    score += endTimeExceedDays * 5;

    // Calculate break durations and score based on break time preference
    let breakTimeExceedInstances = 0;
    for (const day in timeslotsByDay) {
      const timeslots = timeslotsByDay[day];
      for (let i = 1; i < timeslots.length; i++) {
        const breakDuration =
          parseTime(timeslots[i].startTime) -
          parseTime(timeslots[i - 1].endTime);
        if (breakDuration < preferences.breakTime) {
          breakTimeExceedInstances++;
        }
      }
    }
    score += breakTimeExceedInstances * 5;

    console.log(
      daysWithClasses,
      daysExceed,
      startTimes,
      startTimeExceedDays,
      endTimes,
      endTimeExceedDays,
      breakTimeExceedInstances,
      score
    );

    return score;
  };

  const parseTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours + minutes / 60;
  };

  const evolvePopulation = async (population) => {
    return Promise.all(
      population.map(async (individual) => {
        if (Math.random() < 0.1) {
          individual.schedule = await mutate(individual.schedule);
        }
        return { ...individual, fitness: evaluateFitness(individual.schedule) };
      })
    );
  };

  const mutate = async (schedule) => {
    if (!schedule || schedule.length === 0) return schedule;

    const mutatedSchedule = [...schedule];
    const randomCourseIndex = Math.floor(
      Math.random() * mutatedSchedule.length
    );

    const newEntries = await createRandomSchedule();
    if (newEntries.length > 0) {
      mutatedSchedule[randomCourseIndex] =
        newEntries[randomCourseIndex] || mutatedSchedule[randomCourseIndex];
    }

    return mutatedSchedule;
  };

  const calculateEarliestTime = (schedule, timeField) => {
    const times = schedule
      .map((entry) => parseTime(entry[timeField]))
      .filter((time) => time > 0);

    return times.length ? Math.min(...times).toFixed(2) : "N/A";
  };

  const calculateLatestTime = (schedule, timeField) => {
    const times = schedule
      .map((entry) => parseTime(entry[timeField]))
      .filter((time) => time > 0);

    return times.length ? Math.max(...times).toFixed(2) : "N/A";
  };

  const calculateAverageBreakTime = (schedule) => {
    // Group timeslots by day
    const timeslotsByDay = {};
    schedule.forEach((timeslot) => {
      if (!timeslotsByDay[timeslot.day]) {
        timeslotsByDay[timeslot.day] = [];
      }
      timeslotsByDay[timeslot.day].push(timeslot);
    });

    let breaks = [];
    for (const day in timeslotsByDay) {
      const timeslots = timeslotsByDay[day];
      if (timeslots.length > 1) {
        // Sort the timeslots by start time
        const sortedTimeslots = timeslots.sort(
          (a, b) => parseTime(a.startTime) - parseTime(b.startTime)
        );

        // Calculate break durations for the day
        for (let i = 1; i < sortedTimeslots.length; i++) {
          const previousEndTime = parseTime(sortedTimeslots[i - 1].endTime);
          const currentStartTime = parseTime(sortedTimeslots[i].startTime);
          breaks.push(currentStartTime - previousEndTime);
        }
      }
    }

    return breaks.length
      ? (breaks.reduce((a, b) => a + b, 0) / breaks.length).toFixed(2)
      : "N/A";
  };

  const formatTime = (decimalTime) => {
    if (decimalTime === "N/A") return "N/A";
    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const handleAddToTimetable = (schedule) => {
    const uniqueIndexes = new Set();
    const addedIndexes = [];

    schedule.forEach((slot) => {
      const indexKey = `${slot.courseName}-${slot.courseIndex}`;
      if (!uniqueIndexes.has(indexKey)) {
        uniqueIndexes.add(indexKey);
        addedIndexes.push({
          courseName: slot.courseName,
          courseCode: slot.courseCode,
          selectedIndexId: slot.courseIndex,
        });
      }
    });

    navigate("/", { state: { addedIndexes } });
  };

  const getBreakTimes = (timeslots) => {
    const breakTimes = [];
    // Sort the timeslots by start time
    const sortedTimeslots = timeslots.sort(
      (a, b) => parseTime(a.startTime) - parseTime(b.startTime)
    );
    for (let i = 1; i < sortedTimeslots.length; i++) {
      const breakDuration =
        parseTime(sortedTimeslots[i].startTime) -
        parseTime(sortedTimeslots[i - 1].endTime);
      breakTimes.push(formatTime(breakDuration));
    }
    return breakTimes.join(", ");
  };

  const calculateRowSpan = (start, end) => {
    const startTime = parseTime(start);
    const endTime = parseTime(end);
    return Math.round((endTime - startTime) * 2); // Each row represents 30 minutes
  };

  const renderTimetable = (schedule) => {
    const times = Array.from({ length: 28 }, (_, i) => 8 + i / 2);
    const days = ["MON", "TUE", "WED", "THU", "FRI"];
    const timetableMatrix = {};

    schedule.forEach((slot) => {
      const formattedStart = formatTime(parseTime(slot.startTime)).slice(0, -3);
      const formattedEnd = formatTime(parseTime(slot.endTime)).slice(0, -3);
      if (!timetableMatrix[slot.day]) timetableMatrix[slot.day] = [];

      timetableMatrix[slot.day].push({
        start: formattedStart,
        end: formattedEnd,
        details: slot,
      });
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
                  const slot = timetableMatrix[day]?.find(
                    (s) => s.details.startTime === formattedTime
                  );

                  if (slot) {
                    const rowSpan = calculateRowSpan(
                      slot.details.startTime,
                      slot.details.endTime
                    );
                    const isClash = slot.details.length > 1;
                    const backgroundColor = isClash ? "red" : "#ADD8E6";

                    return (
                      <td
                        key={`${day}-${time}`}
                        rowSpan={rowSpan}
                        className="timeslot"
                        style={{
                          backgroundColor,
                          color: isClash ? "white" : "black",
                        }}
                      >
                        <div>
                          <div>
                            <strong>
                              {slot.details.courseCode}{" "}
                              {slot.details.courseName} -{" "}
                              {slot.details.class_group}
                            </strong>
                            <br />
                            {slot.details.startTime.slice(0, -3)} -{" "}
                            {slot.details.endTime.slice(0, -3)}
                            <br /> {slot.details.venue}
                            <br />
                          </div>
                        </div>
                      </td>
                    );
                  } else if (
                    timetableMatrix[day]?.some(
                      (s) =>
                        formattedTime > s.details.startTime &&
                        formattedTime < s.details.endTime
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

  const getUniqueSchedules = (population) => {
    const uniqueSchedules = [];
    const seenSchedules = new Set();

    population.forEach((individual) => {
      const scheduleString = JSON.stringify(
        individual.schedule.map((slot) => ({
          courseCode: slot.courseCode,
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
      );

      if (!seenSchedules.has(scheduleString)) {
        seenSchedules.add(scheduleString);
        uniqueSchedules.push(individual);
      }
    });

    return uniqueSchedules;
  };

  const dayOrder = ["MON", "TUE", "WED", "THU", "FRI"];

  return (
    <div className="generated-schedules-page">
      <h1>Generated Schedules</h1>
      <button
        onClick={() =>
          navigate("/schedule-generator", {
            state: { selectedCourses, preferences },
          })
        }
      >
        Back
      </button>
      <p>
        Preferences: Days: {preferences.days}, Start: {preferences.startTime},
        End: {preferences.endTime}, Break: {preferences.breakTime || "N/A"}
      </p>
      {generatedSchedules.map((scheduleObj, idx) => {
        // Group timeslots by day for each schedule
        const timeslotsByDay = {};
        scheduleObj.schedule.forEach((timeslot) => {
          if (!timeslotsByDay[timeslot.day]) {
            timeslotsByDay[timeslot.day] = [];
          }
          timeslotsByDay[timeslot.day].push(timeslot);
        });

        return (
          <div key={idx} className="schedule-option">
            <h2>Timetable {scheduleObj.timetableNumber}</h2>
            <p>
              Days: {scheduleObj.days}, Start Time: {scheduleObj.avgStartTime},
              End Time: {scheduleObj.avgEndTime}, Avg Break Time:{" "}
              {scheduleObj.avgBreakTime}, Score: {scheduleObj.score}
            </p>
            <p>
              {scheduleObj.schedule.map((entry, idx) => (
                <span key={idx}>
                  {entry.courseCode} - {entry.day}, {entry.startTime} -{" "}
                  {entry.endTime}
                  <br></br>
                </span>
              ))}
            </p>
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Break Time(s)</th>
                </tr>
              </thead>
              <tbody>
                {dayOrder
                  .filter((day) => timeslotsByDay[day])
                  .map((day) => {
                    const timeslots = timeslotsByDay[day];
                    const startTime = formatTime(
                      Math.min(
                        ...timeslots.map((slot) => parseTime(slot.startTime))
                      )
                    );
                    const endTime = formatTime(
                      Math.max(
                        ...timeslots.map((slot) => parseTime(slot.endTime))
                      )
                    );
                    const breakTimes = getBreakTimes(timeslots);
                    return (
                      <tr key={day}>
                        <td>{day}</td>
                        <td>{startTime}</td>
                        <td>{endTime}</td>
                        <td>{breakTimes}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {renderTimetable(scheduleObj.schedule)}
            <button onClick={() => handleAddToTimetable(scheduleObj.schedule)}>
              Add to Timetable
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default GeneratedSchedules;
