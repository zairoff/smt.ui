import React from "react";
import { Link, NavLink } from "react-router-dom";

const NavBar = ({ user }) => {
  return (
    <nav className="navbar navbar-expand-md navbar-light bg-light">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          {user ? user.username : "Artel"}
        </Link>
        <button
          className="navbar-toggler ms-auto"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Main
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li>
                  <NavLink to="/dashboard" className="dropdown-item">
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/statics" className="dropdown-item">
                    Statics
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/ftq" className="dropdown-item">
                    FTQ
                  </NavLink>
                </li>
              </ul>
            </li>

            {user && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Management
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li>
                    <NavLink to="/department" className="dropdown-item">
                      Department
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/employee-dashboard" className="dropdown-item">
                      Employee-dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/employee-add" className="dropdown-item">
                      Employee-add
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Plans
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li>
                  <NavLink to="/plan" className="dropdown-item">
                    Plan
                  </NavLink>
                  <NavLink to="/plan-activity" className="dropdown-item">
                    Plan activity
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Reports
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li>
                  <NavLink to="/report" className="dropdown-item">
                    Report
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/pcb-report" className="dropdown-item">
                    PCB-Report
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Repairs
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                {user && (
                  <li>
                    <NavLink to="/pcb-repairer" className="dropdown-item">
                      Repairer
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink to="/pcb-repair" className="dropdown-item">
                    Repair
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Machines
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li>
                  <NavLink to="/machine-dashboard" className="dropdown-item">
                    Dashboard
                  </NavLink>
                </li>
                {user && (
                  <>
                    <li>
                      <NavLink to="/machine" className="dropdown-item">
                        Machine
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/machine-repairer" className="dropdown-item">
                        Repairer
                      </NavLink>
                    </li>
                  </>
                )}

                <li>
                  <NavLink to="/machine-repair" className="dropdown-item">
                    Repair
                  </NavLink>
                </li>
              </ul>
            </li>

            {user && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Settings
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li>
                    <NavLink to="/product" className="dropdown-item">
                      Product
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/brand" className="dropdown-item">
                      Brand
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/productBrand" className="dropdown-item">
                      Product-Brand
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/model" className="dropdown-item">
                      Model
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/defect" className="dropdown-item">
                      Defect
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/line" className="dropdown-item">
                      Line
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/lineDefect" className="dropdown-item">
                      Line-Defect
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            {!user && (
              <React.Fragment>
                {/*<NavLink to="/register" className="nav-item nav-link">
                  Register
            </NavLink>*/}
                <NavLink to="/login" className="nav-item nav-link">
                  Login
                </NavLink>
              </React.Fragment>
            )}
            {user && (
              <React.Fragment>
                <NavLink to="/logout" className="nav-item nav-link">
                  Logout
                </NavLink>
              </React.Fragment>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
