import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AddCoursesPage from "./pages/AddCoursesPage";
import ScheduleGenerator from "./pages/ScheduleGenerator";
import GeneratedSchedules from "./pages/GeneratedSchedules";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-courses" element={<AddCoursesPage />} />
        <Route path="/schedule-generator" element={<ScheduleGenerator />} />
        <Route path="/generated-schedules" element={<GeneratedSchedules />} />
      </Routes>
    </Router>
  );
}

export default App;
