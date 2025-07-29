import React from "react";

const BoardFlow = ({ lines, onCircleClick }) => {
  const styles = {
    scrollable: {
      overflowX: "auto",
      whiteSpace: "nowrap",
    },
    circleButton: {
      width: "80px",
      height: "80px",
    },
  };

  const latestPassed = lines.length > 0 ? lines[lines.length - 1].passed : 0;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div style={styles.scrollable} className="d-flex">
            {lines.map((line, index) => {
              const hasPassed = line.passed > 0;
              const hasFailed = line.missing > 0;
              const hasBoth = hasPassed && hasFailed;

              return (
                <React.Fragment key={index}>
                  {/* Passed / Failed section */}
                  {(hasPassed || hasFailed) && (
                    <div
                      className={`d-flex flex-column align-items-center justify-content-center m-4`}
                      style={{
                        minHeight: hasBoth ? "auto" : "120px",
                      }}
                    >
                      {hasPassed && (
                        <button
                          type="button"
                          onClick={() =>
                            onCircleClick({ id: line.readerId, passed: true })
                          }
                          className="btn btn-success rounded-circle fw-bold fs-3 mb-2"
                          style={styles.circleButton}
                        >
                          {line.passed}
                        </button>
                      )}
                      {hasFailed && (
                        <button
                          type="button"
                          onClick={() =>
                            onCircleClick({ id: line.readerId, passed: false })
                          }
                          className="btn btn-danger rounded-circle fw-bold fs-3 mt-2"
                          style={styles.circleButton}
                        >
                          {line.missing}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Reader Name */}
                  <button
                    onClick={null}
                    type="button"
                    className="btn btn-secondary btn-lg p-4 m-4"
                  >
                    {line.readerName}
                  </button>
                </React.Fragment>
              );
            })}

            {/* Extra Latest Passed Circle at the end */}
            {latestPassed > 0 && (
              <div className="d-flex align-items-center justify-content-center m-4">
                <button
                  type="button"
                  onClick={() =>
                    onCircleClick({
                      id: lines[lines.length - 1].readerId,
                      passed: true,
                    })
                  }
                  className="btn btn-success rounded-circle fw-bold fs-3"
                  style={styles.circleButton}
                >
                  {latestPassed}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardFlow;
