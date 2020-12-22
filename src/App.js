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
    return matches.value?.filter(m => {
      return m.Team1.TeamId === selectedTeam || m.Team2.TeamId === selectedTeam
    })
  }, [matches, selectedTeam])

  return (
    <div>
      <select onChange={(e) => { setSelectedTeam(parseInt(e.target.value, 10)) }}>
        { teams.value?.map((t) => <option key={t?.TeamId} value={t?.TeamId}>{t?.TeamName}</option>)}
      </select>
      <ul>
        { teamMatches?.map((m) => {
          const result = m?.MatchResults?.find(mr => mr?.ResultTypeID === 2)
          return <li key={m?.MatchId}>{m?.Team1.TeamName} {result?.PointsTeam1 ?? '-'}:{result?.PointsTeam2 ?? '-'} {m?.Team2.TeamName}</li>
        })}
      </ul>
    </div>
  )
}

App.defaultProps = {
  season: '2020',
}

export default App