import { useMemo, useState } from 'react'
import { useAsync } from 'react-use'

const App = ({
  season,
}) => {
  const teams = useAsync(async () => {
    const response = await fetch(`https://www.openligadb.de/api/getavailableteams/bl1/${season}`)
    return response.json()
  }, [season])

  const matches = useAsync(async () => {
    const response = await fetch(`https://www.openligadb.de/api/getmatchdata/bl1/${season}`)
    return response.json()
  }, [season])

  const [selectedTeam, setSelectedTeam] = useState(null)

  const teamMatches = useMemo(() => {
    return matches.value?.filter((m) => {
      return m.Team1.TeamId === selectedTeam || m.Team2.TeamId === selectedTeam
    })
  }, [matches, selectedTeam])

  const teamDerivedData = useMemo(() => {
    return teamMatches?.map((tm) => {
      const isHome = tm?.Team1.TeamId === selectedTeam
      const result = tm?.MatchResults?.find((mr) => mr?.ResultTypeID === 2)
      // https://stackoverflow.com/a/34852894
      const resultType = result && Math.sign(result.PointsTeam1 - result.PointsTeam2)
      let points = 0
      if ((resultType === 1 && isHome) || (resultType === -1 && !isHome)) {
        points = 3
      } else if (resultType === 0) {
        points = 1
      }
      return {
        dateTime: new Date(tm?.MatchDateTimeUTC),
        goalsAgainst: isHome ? result?.PointsTeam2 : result?.PointsTeam1,
        goalsFor: isHome ? result?.PointsTeam1 : result?.PointsTeam2,
        isHome,
        opponentId: isHome ? tm?.Team2.TeamId : tm?.Team1.TeamId,
        points
      }
    })
  }, [selectedTeam, teamMatches])

  return (
    <div>
      <select onChange={(e) => { setSelectedTeam(parseInt(e.target.value, 10)) }}>
        { teams.value?.map((t) => <option key={t?.TeamId} value={t?.TeamId}>{t?.TeamName}</option>)}
      </select>
      <table>
        <thead>
          <tr>
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
                <td>{tdd.dateTime.toLocaleString()}</td>
                <td>{tdd.isHome ? 'H' : 'A'} {opponent.TeamName}</td>
                <td>{tdd.goalsFor}</td>
                <td>{tdd.goalsAgainst}</td>
                <td>{tdd.points}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

App.defaultProps = {
  season: '2020',
}

export default App