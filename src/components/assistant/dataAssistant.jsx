import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import ReactLoading from "react-loading";
import { ask } from "../../services/assistantService";

const EXAMPLE_KEYS = ["example1", "example2", "example3", "example4"];

// "Ask your data": a chat over production/quality statistics. Each answer comes
// from the backend agent, which only reads the statics queries (no writes).
class DataAssistant extends Component {
  state = { question: "", turns: [], loading: false, pending: null };

  bottomRef = React.createRef();

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.loading !== this.state.loading &&
      this.bottomRef.current &&
      this.bottomRef.current.scrollIntoView
    )
      this.bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }

  submit = async (text) => {
    const question = (text !== undefined ? text : this.state.question).trim();
    if (!question || this.state.loading) return;

    const { t, i18n } = this.props;
    // Only answered turns are history; failed ones would confuse follow-ups.
    const history = this.state.turns
      .filter((turn) => !turn.error)
      .flatMap((turn) => [
        { role: "user", text: turn.question },
        { role: "assistant", text: turn.answer },
      ]);

    this.setState({ question: "", loading: true, pending: question });
    let turn;
    try {
      const { data } = await ask(question, i18n.language, history);
      turn = { question, ...data };
    } catch (ex) {
      const status = ex.response && ex.response.status;
      const message =
        status === 401
          ? t("errors.login")
          : (ex.response && ex.response.data && ex.response.data.message) ||
            t("errors.generic");
      turn = { question, answer: message, error: true };
    }
    this.setState((s) => ({
      turns: [...s.turns, turn],
      loading: false,
      pending: null,
    }));
  };

  handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      this.submit();
    }
  };

  renderQuestion(text) {
    return (
      <div className="d-flex justify-content-end">
        <div
          className="bg-primary text-white rounded px-3 py-2"
          style={{ maxWidth: "80%", whiteSpace: "pre-wrap" }}
        >
          {text}
        </div>
      </div>
    );
  }

  renderTable(turn) {
    if (!turn.columns || !turn.columns.length || !turn.rows || !turn.rows.length)
      return null;
    return (
      <div className="table-responsive mt-2">
        <table className="table table-sm table-bordered table-striped mb-0">
          <thead>
            <tr>
              {turn.columns.map((c, i) => (
                <th key={i}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {turn.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    const { t, user } = this.props;
    const { question, turns, loading, pending } = this.state;

    if (!user) return <div className="alert alert-info">{t("errors.login")}</div>;

    return (
      <div>
        <h3>{t("title")}</h3>
        <p className="text-muted">{t("intro")}</p>

        {turns.length === 0 && !loading && (
          <div className="mb-3">
            {EXAMPLE_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className="btn btn-outline-secondary btn-sm me-2 mb-2"
                onClick={() => this.submit(t(key))}
              >
                {t(key)}
              </button>
            ))}
          </div>
        )}

        {turns.map((turn, i) => (
          <div key={i} className="mb-4">
            {this.renderQuestion(turn.question)}
            <div
              className={
                "border rounded px-3 py-2 mt-2" +
                (turn.error ? " border-danger text-danger" : "")
              }
            >
              <div style={{ whiteSpace: "pre-wrap" }}>{turn.answer}</div>
              {this.renderTable(turn)}
              {turn.sources && turn.sources.length > 0 && (
                <details className="mt-2 small text-muted">
                  <summary>{t("sources")}</summary>
                  <ul className="mb-0">
                    {turn.sources.map((s, j) => (
                      <li key={j}>
                        <code>{s}</code>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="mb-4">
            {this.renderQuestion(pending)}
            <div className="d-flex align-items-center mt-2 text-muted">
              <ReactLoading type="bubbles" color="#6c757d" height={32} width={32} />
              <span className="ms-2">{t("thinking")}</span>
            </div>
          </div>
        )}

        <div ref={this.bottomRef} />

        <div className="input-group mb-2">
          <textarea
            className="form-control"
            rows={2}
            value={question}
            placeholder={t("placeholder")}
            onChange={(e) => this.setState({ question: e.target.value })}
            onKeyDown={this.handleKeyDown}
            disabled={loading}
            maxLength={2000}
          />
          <button
            className="btn btn-primary"
            onClick={() => this.submit()}
            disabled={loading || !question.trim()}
          >
            {t("ask")}
          </button>
        </div>
        <div className="d-flex justify-content-between small text-muted mb-4">
          <span>{t("disclaimer")}</span>
          {turns.length > 0 && (
            <button
              type="button"
              className="btn btn-link btn-sm p-0"
              onClick={() => this.setState({ turns: [] })}
              disabled={loading}
            >
              {t("newChat")}
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default withTranslation("assistant")(DataAssistant);
