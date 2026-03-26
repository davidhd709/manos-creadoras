export default function Table({ columns, data, emptyMessage = 'Sin datos' }) {
  if (!data || data.length === 0) {
    return <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="pro-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row._id || i}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
