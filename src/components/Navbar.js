import React, { useState } from "react";
import { Link } from "react-router-dom";
import starshipLogo from "../assets/STARSHIP.png";
import "../styles/navbar.css"; // Import the navbar CSS file
import extLinks from "../assets/ext_links.png";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo-placeholder">
        <img src={starshipLogo} alt="logo" width="100" height="100%" />
      </div>
      <div className="nav-links">
        <h3>STARSHIP Pages</h3>
        <Link to="/">
          <button>Timetable Planner</button>
        </Link>
        <Link to="/add-courses">
          <button>Add Courses</button>
        </Link>
        <Link to="/schedule-generator">
          <button>Schedule Generator</button>
        </Link>
        <br></br>
        <h3 onClick={toggleDropdown} className="dropdown-header">
          Useful Links
          <span className="dropdown-arrow">{isDropdownOpen ? "▲" : "▼"}</span>
        </h3>
        {isDropdownOpen && (
          <div className="dropdown-content">
            <a
              href="https://wish.ntu.edu.sg/pls/webexe/LDAP_login.login?w_URL=https://wish.wis.ntu.edu.sg/pls/webexe/aus_stars_planner.main"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button>
                STARS Planner&nbsp;&nbsp;
                <img src={extLinks} alt="ext-link" width="10" height="10"></img>
              </button>
            </a>
            <a
              href="https://wish.wis.ntu.edu.sg/pls/webexe/ldap_login.login?w_url=https://wish.wis.ntu.edu.sg/pls/webexe/dars_result_ro.main_display"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button>
                Degree Audit&nbsp;&nbsp;
                <img src={extLinks} alt="ext-link" width="10" height="10"></img>
              </button>
            </a>
            <a
              href="https://wish.wis.ntu.edu.sg/webexe/owa/aus_schedule.main"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button>
                Class Schedule&nbsp;&nbsp;
                <img src={extLinks} alt="ext-link" width="10" height="10"></img>
              </button>
            </a>
            <a
              href="https://wis.ntu.edu.sg/webexe/owa/aus_subj_cont.main"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button>
                Course Content&nbsp;&nbsp;
                <img src={extLinks} alt="ext-link" width="10" height="10"></img>
              </button>
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
