import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const SIBLING_COUNT = 1;
const LEFT_ELLIPSIS = "left-ellipsis";
const RIGHT_ELLIPSIS = "right-ellipsis";

function range(start, end) {
  const result = [];
  for (let i = start; i <= end; i++) result.push(i);
  return result;
}

// Windowed page list: first page, last page, a window around the current
// page, and an ellipsis placeholder for whatever's collapsed in between -
// keeps the control's width bounded no matter how many pages there are.
function getPageItems(currentPage, pageCount) {
  const totalVisible = SIBLING_COUNT * 2 + 5; // first + last + current + 2 siblings + 2 ellipsis slots

  if (pageCount <= totalVisible) return range(1, pageCount);

  const leftSibling = Math.max(currentPage - SIBLING_COUNT, 1);
  const rightSibling = Math.min(currentPage + SIBLING_COUNT, pageCount);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < pageCount - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = range(1, 3 + SIBLING_COUNT * 2);
    return [...leftRange, RIGHT_ELLIPSIS, pageCount];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = range(pageCount - (3 + SIBLING_COUNT * 2) + 1, pageCount);
    return [1, LEFT_ELLIPSIS, ...rightRange];
  }

  return [1, LEFT_ELLIPSIS, ...range(leftSibling, rightSibling), RIGHT_ELLIPSIS, pageCount];
}

const Pagination = ({ itemsCount, pageSize, onPageChange, currentPage }) => {
  const { t } = useTranslation("common");
  const pageCount = Math.ceil(itemsCount / pageSize);
  if (pageCount === 1) return null;

  const pageItems = getPageItems(currentPage, pageCount);

  return (
    <nav aria-label={t("pagination.ariaLabel")}>
      <ul className="pagination mt-2">
        <li className={currentPage === 1 ? "page-item disabled" : "page-item"}>
          <button
            type="button"
            className="page-link"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label={t("pagination.previous")}
          >
            &laquo;
          </button>
        </li>
        {pageItems.map((item) =>
          item === LEFT_ELLIPSIS || item === RIGHT_ELLIPSIS ? (
            <li className="page-item disabled" key={item}>
              <span className="page-link">&hellip;</span>
            </li>
          ) : (
            <li
              className={currentPage === item ? "page-item active" : "page-item"}
              key={item}
              aria-current={currentPage === item ? "page" : undefined}
            >
              <button
                type="button"
                className="page-link"
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            </li>
          )
        )}
        <li
          className={currentPage === pageCount ? "page-item disabled" : "page-item"}
        >
          <button
            type="button"
            className="page-link"
            disabled={currentPage === pageCount}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label={t("pagination.next")}
          >
            &raquo;
          </button>
        </li>
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
