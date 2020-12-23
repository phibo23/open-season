import { useContext } from "react"
import { DataContext } from "./DataContext"

const Table = () => {
  const {
    season,
    derivedMatchData,
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
        { derivedMatchData?.map((dmd) => {
          const opponent = teams.value?.find(t => t.TeamId === dmd.opponentId)
          return (
            <tr key={`${season}_${dmd.opponentId}_${dmd.isHome}`}>
              <td>{dmd.matchDay}</td>
              <td>{dmd.dateTime.toLocaleString()}</td>
              <td>{dmd.isHome ? 'H' : 'A'} {opponent?.TeamName}</td>
              <td>{dmd.goalsFor}</td>
              <td>{dmd.goalsAgainst}</td>
              <td>{dmd.points}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default Table