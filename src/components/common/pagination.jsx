import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const Pagination = ({ itemsCount, pageSize, onPageChange, currentPage }) => {
  const { t } = useTranslation("common");
  const pageCount = Math.ceil(itemsCount / pageSize);
  if (pageCount === 1) return null;
  let pageArray = [];
  for (let i = 1; i <= pageCount; i++) {
    pageArray.push(i);
  }
  return (
    <nav aria-label={t("pagination.ariaLabel")}>
      <ul className="pagination mt-2">
        {pageArray.map((page) => (
          <li
            className={currentPage === page ? "page-item active" : "page-item"}
            key={page}
            aria-current={currentPage === page ? "page" : undefined}
          >
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  itemsCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};

export default Pagination;
