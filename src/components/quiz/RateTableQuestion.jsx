export function RateTableQuestion({ question, answers, onChange, feedback }) {
  const rows = question.question_data.tableData
  const askedField = question.askedField
  const label = askedField === 'm' ? 'อันดับต่อสาร A (m)' : 'อันดับต่อสาร B (n)'
  return (
    <div className="rate-question">
      <p className="question-prompt">จงหา <strong>{label}</strong></p>
      <div className="rate-table-wrap">
        <table>
          <thead><tr><th>การทดลอง</th><th>[A] (M)</th><th>[B] (M)</th><th>อัตรา<br />(M/s)</th></tr></thead>
          <tbody>{rows.map((row) => (
            <tr key={row.expId}><th>ครั้งที่ {row.expId}</th><td>{row.A}</td><td>{row.B}</td><td>{row.rate}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <div className="answer-grid">
        <label className={feedback?.fields?.[askedField] === false ? 'is-wrong' : feedback?.fields?.[askedField] ? 'is-correct' : ''}>
          <span>ป้อนค่า {askedField}:</span>
          <span className="answer-input"><input autoFocus inputMode="numeric" pattern="-?[0-9]*" value={answers[askedField]} onChange={(event) => onChange(askedField, event.target.value)} /><i /></span>
        </label>
      </div>
    </div>
  )
}
