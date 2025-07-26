import React from "react";

const BoardFlow = ({ lines }) => {
  const styles = {
    scrollable: {
      overflowX: "auto",
      whiteSpace: "nowrap",
    },
  };

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div style={styles.scrollable} className="d-flex">
              {lines.map((line, index) => (
                <React.Fragment key={index}>
                  <button
                    onClick={null}
                    type="button"
                    className="btn btn-secondary btn-lg p-4 m-4"
                  >
                    {line.name}
                  </button>
                  {index < lines.length - 1 && (
                    <div className="row">
                      <div>
                        <button
                          type="button"
                          className="btn btn-block btn-success rounded-circle m-4 fw-bold fs-3"
                          style={{ width: "80px", height: "80px" }}
                        >
                          {line.passed}
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="btn btn-block btn-danger rounded-circle m-4 fw-bold fs-3"
                          style={{ width: "80px", height: "80px" }}
                        >
                          {line.failed}
                        </button>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BoardFlow;
