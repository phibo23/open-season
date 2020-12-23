import { useMemo, useState } from 'react'
import { useAsync } from 'react-use'

import Table from './Table'
import Chart from './Chart'

const App = () => {
  const [season, setSeason] = useState('2020')

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
      return (m.Team1.TeamId === selectedTeam || m.Team2.TeamId === selectedTeam) && m.MatchIsFinished
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
        matchDay: tm?.Group.GroupOrderID,
        opponentId: isHome ? tm?.Team2.TeamId : tm?.Team1.TeamId,
        points,
      }
    }) ?? []
  }, [selectedTeam, teamMatches])

  const [slidingWindowSize, setSlidingWindowSize] = useState(5)

  const teamDerivedDataAggregates = useMemo(() => {
    return teamDerivedData?.map((tdd, index, array) => {
      return {
        ...tdd,
        pointsTotal: array.slice(Math.max(0, index-slidingWindowSize), index).reduce((a,c) => a + c.points, 0)
      }
    })
  }, [slidingWindowSize, teamDerivedData])

  return (
    <div>
      <input type='text' onBlur={(e) => { setSeason(e.target.value) }} placeholder={season} />
      <input type='number' min={5} max={34} onChange={(e) => { setSlidingWindowSize(parseInt(e.target.value)) }} placeholder={slidingWindowSize} />
      <select onChange={(e) => { setSelectedTeam(parseInt(e.target.value, 10)) }}>
        { teams.value?.map((t) => <option key={t?.TeamId} value={t?.TeamId}>{t?.TeamName}</option>)}
      </select>
      <Chart
        selectedTeam={selectedTeam}
        teamDerivedData={teamDerivedData}
        teamDerivedDataAggregates={teamDerivedDataAggregates}
        teams={teams}
      />
      <Table
        season={season}
        teamDerivedData={teamDerivedData}
        teams={teams}
      />
    </div>
  )
}

export default App