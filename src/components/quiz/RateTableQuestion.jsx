export function RateTableQuestion({ question, answers, onChange, feedback }) {
  const rows = question.question_data.tableData
  return (
    <div className="rate-question">
      <p className="question-prompt">จงหาอันดับปฏิกิริยา <strong>(m, n)</strong></p>
      <div className="rate-table-wrap">
        <table>
          <thead><tr><th>การทดลอง</th><th>[A] (M)</th><th>[B] (M)</th><th>อัตรา<br />(M/s)</th></tr></thead>
          <tbody>{rows.map((row) => (
            <tr key={row.expId}><th>ครั้งที่ {row.expId}</th><td>{row.A}</td><td>{row.B}</td><td>{row.rate}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <div className="answer-grid">
        <label className={feedback?.fields?.m === false ? 'is-wrong' : feedback?.fields?.m ? 'is-correct' : ''}>
          <span>ป้อนค่าอันดับ m:</span>
          <span className="answer-input"><input autoFocus inputMode="numeric" pattern="-?[0-9]*" value={answers.m} onChange={(event) => onChange('m', event.target.value)} /><i /></span>
        </label>
        <label className={feedback?.fields?.n === false ? 'is-wrong' : feedback?.fields?.n ? 'is-correct' : ''}>
          <span>ป้อนค่าอันดับ n:</span>
          <span className="answer-input"><input inputMode="numeric" pattern="-?[0-9]*" value={answers.n} onChange={(event) => onChange('n', event.target.value)} /><i /></span>
        </label>
      </div>
    </div>
  )
}
