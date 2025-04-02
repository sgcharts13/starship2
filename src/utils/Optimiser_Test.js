import { getIndexDetails } from "../services/databaseService";
import * as XLSX from "xlsx";

const generations_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const populationSize_list = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200];

const generateInitialPopulation = async (
  size,
  selectedCourses,
  preferences,
  selectedPreferences
) => {
  const population = [];
  for (let i = 0; i < size; i++) {
    const schedule = await createRandomSchedule(selectedCourses);
    const fitness = evaluateFitness(schedule, preferences, selectedPreferences);
    if (schedule.length > 0 && fitness > 0) {
      population.push({ schedule, fitness });
    }
  }
  return population;
};

const createRandomSchedule = async (selectedCourses) => {
  return Promise.all(
    selectedCourses.map(async (course) => {
      if (!course.indexes || course.indexes.length === 0) return [];

      const randomIndex = Math.floor(Math.random() * course.indexes.length);
      const chosenIndex = course.indexes[randomIndex];
      const indexDetails = await getIndexDetails(chosenIndex);
      //console.log(chosenIndex, indexDetails);

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

const evaluateFitness = (schedule, preferences, selectedPreferences) => {
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
        parseTime(timeslots[i].startTime) < parseTime(timeslots[i - 1].endTime)
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
    if (selectedPreferences.days) {
      score += daysExceed * 20;
    } else {
      score += daysExceed * 10;
    }
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
  if (selectedPreferences.startTime) {
    score += startTimeExceedDays * 10;
  } else {
    score += startTimeExceedDays * 5;
  }

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
  if (selectedPreferences.endTime) {
    score += endTimeExceedDays * 10;
  } else {
    score += endTimeExceedDays * 5;
  }

  // Calculate break durations and score based on break time preference
  let breakTimeExceedInstances = 0;
  for (const day in timeslotsByDay) {
    const timeslots = timeslotsByDay[day];
    for (let i = 1; i < timeslots.length; i++) {
      const breakDuration =
        parseTime(timeslots[i].startTime) - parseTime(timeslots[i - 1].endTime);
      if (breakDuration < preferences.breakTime) {
        breakTimeExceedInstances++;
      }
    }
  }
  if (selectedPreferences.breakTime) {
    score += breakTimeExceedInstances * 10;
  } else {
    score += breakTimeExceedInstances * 5;
  }

  // //console.log(
  //   daysWithClasses,
  //   daysExceed,
  //   startTimes,
  //   startTimeExceedDays,
  //   endTimes,
  //   endTimeExceedDays,
  //   breakTimeExceedInstances,
  //   score
  // );

  return score;
};

const parseTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
};

const evolvePopulation = async (
  population,
  selectedCourses,
  preferences,
  selectedPreferences
) => {
  return Promise.all(
    population.map(async (individual) => {
      if (Math.random() < 0.1) {
        individual.schedule = await mutate(
          individual.schedule,
          selectedCourses
        );
      }
      return {
        ...individual,
        fitness: evaluateFitness(
          individual.schedule,
          preferences,
          selectedPreferences
        ),
      };
    })
  );
};

const mutate = async (schedule, selectedCourses) => {
  if (!schedule || schedule.length === 0) return schedule;

  const mutatedSchedule = [...schedule];
  const randomCourseIndex = Math.floor(Math.random() * mutatedSchedule.length);

  const newEntries = await createRandomSchedule(selectedCourses);
  if (newEntries.length > 0) {
    mutatedSchedule[randomCourseIndex] =
      newEntries[randomCourseIndex] || mutatedSchedule[randomCourseIndex];
  }

  return mutatedSchedule;
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

const OptimiserTest = async (
  selectedCourses,
  preferences,
  selectedPreferences
) => {
  const results = [];
  for (const populationSize of populationSize_list) {
    for (const generations of generations_list) {
      console.log(populationSize, generations);
      let population = await generateInitialPopulation(
        populationSize,
        selectedCourses,
        preferences,
        selectedPreferences
      );

      for (let i = 0; i < generations; i++) {
        population = await evolvePopulation(
          population,
          selectedCourses,
          preferences,
          selectedPreferences
        );
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
          avgBreakTime: formatTime(
            calculateAverageBreakTime(schedule.schedule)
          ),
          days: new Set(schedule.schedule.map((entry) => entry.day)).size,
          score: schedule.fitness, // Include the score
          timetableNumber: index + 1, // Add timetable number
        }));

      const scores = [
        sortedSchedules[0].score,
        sortedSchedules[1].score,
        sortedSchedules[2].score,
      ];
      console.log(scores);
      results.push({
        populationSize,
        generations,
        score1: scores[0],
        score2: scores[1],
        score3: scores[2],
      });
    }
  }
  // Export results to Excel
  const worksheet = XLSX.utils.json_to_sheet(results);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
  XLSX.writeFile(workbook, "Optimiser_Test_Results_2.xlsx");

  return sortedSchedules;
};

export default OptimiserTest;
