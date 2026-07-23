import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./languageSwitcher";

const NavBar = ({ user }) => {
  const { t } = useTranslation("navbar");

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
              <button
                type="button"
                className="nav-link dropdown-toggle border-0 bg-transparent"
                id="navbarDropdownMain"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {t("menu.main")}
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="navbarDropdownMain"
              >
                <li>
                  <NavLink to="/dashboard" className="dropdown-item">
                    {t("main.dashboard")}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/statics" className="dropdown-item">
                    {t("main.statics")}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/statics-chart" className="dropdown-item">
                    {t("main.planQuality")}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/ftq" className="dropdown-item">
                    {t("main.ftq")}
                  </NavLink>
                </li>
              </ul>
            </li>

            {user && (
              <li className="nav-item dropdown">
                <button
                  type="button"
                  className="nav-link dropdown-toggle border-0 bg-transparent"
                  id="navbarDropdownManagement"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {t("menu.management")}
                </button>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="navbarDropdownManagement"
                >
                  <li>
                    <NavLink to="/department" className="dropdown-item">
                      {t("management.department")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/employee-dashboard" className="dropdown-item">
                      {t("management.employeeDashboard")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/employee-add" className="dropdown-item">
                      {t("management.employeeAdd")}
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}

            <li className="nav-item dropdown">
              <button
                type="button"
                className="nav-link dropdown-toggle border-0 bg-transparent"
                id="navbarDropdownPlans"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {t("menu.plans")}
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="navbarDropdownPlans"
              >
                <li>
                  <NavLink to="/plan" className="dropdown-item">
                    {t("plans.plan")}
                  </NavLink>
                  <NavLink to="/plan-activity" className="dropdown-item">
                    {t("plans.planActivity")}
                  </NavLink>
                  <NavLink to="/plan-activity-report" className="dropdown-item">
                    {t("plans.report")}
                  </NavLink>
                  <NavLink to="/plan-hourly" className="dropdown-item">
                    {t("plans.planHourly")}
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <button
                type="button"
                className="nav-link dropdown-toggle border-0 bg-transparent"
                id="navbarDropdownReports"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {t("menu.reports")}
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="navbarDropdownReports"
              >
                <li>
                  <NavLink to="/report" className="dropdown-item">
                    {t("reports.report")}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/pcb-report" className="dropdown-item">
                    {t("reports.pcbReport")}
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <button
                type="button"
                className="nav-link dropdown-toggle border-0 bg-transparent"
                id="navbarDropdownRepairs"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {t("menu.repairs")}
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="navbarDropdownRepairs"
              >
                {user && (
                  <li>
                    <NavLink to="/pcb-repairer" className="dropdown-item">
                      {t("repairs.repairer")}
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink to="/pcb-repair" className="dropdown-item">
                    {t("repairs.repair")}
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <button
                type="button"
                className="nav-link dropdown-toggle border-0 bg-transparent"
                id="navbarDropdownMachines"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {t("menu.machines")}
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="navbarDropdownMachines"
              >
                <li>
                  <NavLink to="/machine-dashboard" className="dropdown-item">
                    {t("machines.dashboard")}
                  </NavLink>
                </li>

                {user && (
                  <>
                    <li>
                      <NavLink to="/machine" className="dropdown-item">
                        {t("machines.machine")}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/machine-repairer" className="dropdown-item">
                        {t("machines.repairer")}
                      </NavLink>
                    </li>
                  </>
                )}

                <li>
                  <NavLink to="/machine-repair" className="dropdown-item">
                    {t("machines.repair")}
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <button
                type="button"
                className="nav-link dropdown-toggle border-0 bg-transparent"
                id="navbarDropdownBoardFlow"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {t("menu.boardFlow")}
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="navbarDropdownBoardFlow"
              >
                <li>
                  <NavLink to="/board-report" className="dropdown-item">
                    {t("boardFlow.report")}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/board-flow" className="dropdown-item">
                    {t("boardFlow.flow")}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/qr-reader-add" className="dropdown-item">
                    {t("boardFlow.qrReader")}
                  </NavLink>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <NavLink to="/board-flow-v2" className="dropdown-item">
                    {t("boardFlow.flowV2")}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/board-report-v2" className="dropdown-item">
                    {t("boardFlow.reportV2")}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/qr-reader-v2-add" className="dropdown-item">
                    {t("boardFlow.qrReaderV2")}
                  </NavLink>
                </li>
              </ul>
            </li>

            {user && (
              <li className="nav-item dropdown">
                <button
                  type="button"
                  className="nav-link dropdown-toggle border-0 bg-transparent"
                  id="navbarDropdownSettings"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {t("menu.settings")}
                </button>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="navbarDropdownSettings"
                >
                  <li>
                    <NavLink to="/product" className="dropdown-item">
                      {t("settings.product")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/brand" className="dropdown-item">
                      {t("settings.brand")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/productBrand" className="dropdown-item">
                      {t("settings.productBrand")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/model" className="dropdown-item">
                      {t("settings.model")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/defect" className="dropdown-item">
                      {t("settings.defect")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/line" className="dropdown-item">
                      {t("settings.line")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/lineDefect" className="dropdown-item">
                      {t("settings.lineDefect")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/component" className="dropdown-item">
                      {t("settings.component")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/component-connect" className="dropdown-item">
                      {t("settings.componentConnect")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/component-import" className="dropdown-item">
                      {t("settings.componentBulk")}
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}
            <li className="nav-item dropdown">
              <button
                type="button"
                className="nav-link dropdown-toggle border-0 bg-transparent"
                id="navbarDropdownReadyProduct"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {t("readyProduct.title")}
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="navbarDropdownReadyProduct"
              >
                <li>
                  <NavLink to="/ready-product-import" className="dropdown-item">
                    {t("readyProduct.import")}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/ready-product-export" className="dropdown-item">
                    {t("readyProduct.export")}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/ready-product-report" className="dropdown-item">
                    {t("readyProduct.report")}
                  </NavLink>
                </li>
                {user && (
                  <li>
                    <NavLink
                      to="/ready-product-transactions"
                      className="dropdown-item"
                    >
                      {t("readyProduct.transactions")}
                    </NavLink>
                  </li>
                )}
              </ul>
            </li>
            <li className="nav-item dropdown">
              <button
                type="button"
                className="nav-link dropdown-toggle border-0 bg-transparent"
                id="navbarDropdownReturnProduct"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {t("returnProduct.title")}
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="navbarDropdownReturnProduct"
              >
                <li>
                  <NavLink
                    to="/returned-product-import"
                    className="dropdown-item"
                  >
                    {t("returnProduct.import")}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/returned-product-export"
                    className="dropdown-item"
                  >
                    {t("returnProduct.export")}
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/returned-product-report"
                    className="dropdown-item"
                  >
                    {t("returnProduct.report")}
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/returned-product-transactions"
                    className="dropdown-item"
                  >
                    {t("returnProduct.transactions")}
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <button
                type="button"
                className="nav-link dropdown-toggle border-0 bg-transparent"
                id="navbarDropdownPrinter"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {t("menu.printer")}
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="navbarDropdownPrinter"
              >
                <li>
                  <NavLink to="/component-print" className="dropdown-item">
                    {t("printer.qr")}
                  </NavLink>
                </li>
              </ul>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto">
            <LanguageSwitcher />
            {!user && (
              <React.Fragment>
                {/*<NavLink to="/register" className="nav-item nav-link">
                  Register
            </NavLink>*/}
                <NavLink to="/login" className="nav-item nav-link">
                  {t("auth.login")}
                </NavLink>
              </React.Fragment>
            )}
            {user && (
              <React.Fragment>
                <NavLink to="/logout" className="nav-item nav-link">
                  {t("auth.logout")}
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
