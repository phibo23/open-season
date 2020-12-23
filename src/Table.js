import { useContext } from "react"
import { DataContext } from "./DataContext"

const Table = () => {
  const {
    season,
    teamDerivedData,
    teams,
  } = useContext(DataContext)
  return (
    <table>
      <thead>
        <tr>
          <th>Match</th>
          <th>Date</th>
          <th>Opponent</th>
          <th>GF</th>
          <th>GA</th>
          <th>P</th>
        </tr>
      </thead>
      <tbody>
        { teamDerivedData?.map((tdd) => {
          const opponent = teams.value?.find(t => t.TeamId === tdd.opponentId)
          return (
            <tr key={`${season}_${tdd.opponentId}_${tdd.isHome}`}>
              <td>{tdd.matchDay}</td>
              <td>{tdd.dateTime.toLocaleString()}</td>
              <td>{tdd.isHome ? 'H' : 'A'} {opponent?.TeamName}</td>
              <td>{tdd.goalsFor}</td>
              <td>{tdd.goalsAgainst}</td>
              <td>{tdd.points}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default Table