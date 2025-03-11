import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCourseContext } from "../context/CourseContext";
import "../styles/optimisedSchedules.css";

const OptimisedSchedules = () => {
  const { state } = useLocation(); // Retrieve state from navigation
  const { selectedCourses, preferences } = state || {}; // Destructure selected courses and preferences
  const [optimalSchedules, setOptimalSchedules] = useState([]);
  const navigate = useNavigate();

  const POPULATION_SIZE = 50;
  const GENERATIONS = 100;
  const MUTATION_RATE = 0.1;

  // Calculate score for a schedule based on preferences
  const calculateScore = (schedule) => {
    if (!preferences) return 0;

    let score = 0;
    const daysWithClasses = new Set(schedule.map((entry) => entry.day)).size;
    score += (6 - daysWithClasses) * 10;

    let totalStartTime = 0;
    let totalEndTime = 0;
    let totalBreakTime = 0;

    schedule.sort((a, b) => a.startTime - b.startTime);
    for (let i = 0; i < schedule.length; i++) {
      totalStartTime += schedule[i].startTime;
      totalEndTime += schedule[i].endTime;

      if (i > 0) {
        totalBreakTime += schedule[i].startTime - schedule[i - 1].endTime;
      }
    }

    const avgStartTime = totalStartTime / schedule.length || 0;
    const avgEndTime = totalEndTime / schedule.length || 0;
    const avgBreakTime = totalBreakTime / (schedule.length - 1 || 1);

    if (avgStartTime >= preferences.startTime) score += 10;
    if (avgEndTime <= preferences.endTime) score += 10;
    if (Math.abs(avgBreakTime - preferences.breakTime) <= 0.5) score += 15;

    return score;
  };

  const geneticAlgorithm = () => {
    const generateInitialPopulation = () => {
      const population = [];
      for (let i = 0; i < POPULATION_SIZE; i++) {
        const individual = selectedCourses.map((course) => {
          const randomIndex =
            course.indexes[Math.floor(Math.random() * course.indexes.length)];
          return randomIndex;
        });
        population.push(individual);
      }
      return population;
    };

    const crossover = (parent1, parent2) => {
      const crossoverPoint = Math.floor(Math.random() * parent1.length);
      return [
        [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)],
        [...parent2.slice(0, crossoverPoint), ...parent1.slice(crossoverPoint)],
      ];
    };

    const mutate = (individual) => {
      if (Math.random() < MUTATION_RATE) {
        const randomCourseIdx = Math.floor(
          Math.random() * selectedCourses.length
        );
        const randomIndex =
          selectedCourses[randomCourseIdx].indexes[
            Math.floor(
              Math.random() * selectedCourses[randomCourseIdx].indexes.length
            )
          ];
        individual[randomCourseIdx] = randomIndex;
      }
      return individual;
    };

    let population = generateInitialPopulation();

    for (let gen = 0; gen < GENERATIONS; gen++) {
      const fitness = population.map((individual) =>
        calculateScore(individual)
      );

      const totalFitness = fitness.reduce((acc, score) => acc + score, 0);
      const selectParent = () => {
        const threshold = Math.random() * totalFitness;
        let runningSum = 0;
        for (let i = 0; i < population.length; i++) {
          runningSum += fitness[i];
          if (runningSum >= threshold) return population[i];
        }
      };

      const newPopulation = [];
      while (newPopulation.length < POPULATION_SIZE) {
        const parent1 = selectParent();
        const parent2 = selectParent();
        const [child1, child2] = crossover(parent1, parent2);
        newPopulation.push(mutate(child1));
        if (newPopulation.length < POPULATION_SIZE) {
          newPopulation.push(mutate(child2));
        }
      }

      population = newPopulation;
    }

    const scoredPopulation = population.map((individual) => ({
      schedule: individual,
      score: calculateScore(individual),
    }));
    scoredPopulation.sort((a, b) => b.score - a.score);

    return scoredPopulation.slice(0, 3).map(({ schedule }) => schedule);
  };

  useEffect(() => {
    if (preferences && selectedCourses?.length > 0) {
      const schedules = geneticAlgorithm();
      setOptimalSchedules(
        schedules.map((schedule) => {
          const daysWithClasses = new Set(schedule.map((entry) => entry.day))
            .size;
          const avgStartTime =
            schedule.reduce((sum, entry) => sum + entry.startTime, 0) /
              schedule.length || 0;
          const avgEndTime =
            schedule.reduce((sum, entry) => sum + entry.endTime, 0) /
              schedule.length || 0;
          const avgBreakTime =
            schedule.length > 1
              ? schedule
                  .sort((a, b) => a.startTime - b.startTime)
                  .reduce(
                    (sum, entry, i, arr) =>
                      i > 0
                        ? sum + (entry.startTime - arr[i - 1].endTime)
                        : sum,
                    0
                  ) /
                (schedule.length - 1)
              : 0;

          return {
            schedule,
            description: `Days: ${daysWithClasses}, Avg Start Time: ${avgStartTime.toFixed(
              2
            )}, Avg End Time: ${avgEndTime.toFixed(
              2
            )}, Avg Break Time: ${avgBreakTime.toFixed(2)} hrs`,
          };
        })
      );
    }
  }, [preferences, selectedCourses]);

  const handleAddToTimetable = () => {
    navigate("/");
  };

  return (
    <div className="optimised-schedules-page">
      <h1>Optimized Schedules</h1>
      {optimalSchedules.map((scheduleObj, idx) => (
        <div key={idx} className="schedule-option">
          <h2>Schedule {idx + 1}</h2>
          <p>{scheduleObj.description}</p>
          <ul>
            {scheduleObj.schedule.map((entry, i) => (
              <li key={i}>
                {entry.courseName} - Day {entry.day}, {entry.startTime}:00 -{" "}
                {entry.endTime}:00
              </li>
            ))}
          </ul>
          <button onClick={handleAddToTimetable}>Add to Timetable</button>
        </div>
      ))}
    </div>
  );
};

export default OptimisedSchedules;
