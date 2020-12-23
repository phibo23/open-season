import { createContext, useMemo } from "react"
import { useAsync } from "react-use"
import { calculatePoints, getFinalResult, getResultType, isMatchHome } from "./openLigaDB"

export const DataContext = createContext({})

const DataContextProvider = ({
  children,
  season,
  slidingWindowSize,
}) => {
  const teams = useAsync(async () => {
    const response = await fetch(`https://www.openligadb.de/api/getavailableteams/bl1/${season}`)
    return response.json()
  }, [season])

  const matches = useAsync(async () => {
    const response = await fetch(`https://www.openligadb.de/api/getmatchdata/bl1/${season}`)
    return response.json()
  }, [season])

  const derivedMatchData = useMemo(() => {
    return matches.value
      // filter out unfinished matches
      ?.filter(m => m.MatchIsFinished === true)
      // flatMap enables returning multiple values for each entry in original array
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap
      ?.flatMap((m, index, array) => {
        // create one value for each team in match
        return [m.Team1, m.Team2].map((t) => {
          const isHome = isMatchHome(m, t.TeamId)
          const result = getFinalResult(m)
          const resultType = getResultType(result)
          const points = calculatePoints(resultType, isHome)

          return {
            dateTime: new Date(m?.MatchDateTimeUTC),
            goalsAgainst: isHome ? result?.PointsTeam2 : result?.PointsTeam1,
            goalsFor: isHome ? result?.PointsTeam1 : result?.PointsTeam2,
            isHome,
            matchDay: m?.Group.GroupOrderID,
            opponentId: isHome ? m?.Team2.TeamId : m?.Team1.TeamId,
            points,
            teamId: isHome ? m?.Team1.TeamId : m?.Team2.TeamId,
          }
        })
    }) ?? []
  }, [matches.value])

  const derivedMatchDataAggregates = useMemo(() => {
    return derivedMatchData?.map((dmd, index, array) => {
      const pointsTotal = array
        // find all entries that belong to current team
        .filter(i => i.teamId === dmd.teamId)
        // slice to sliding window size
        .slice(Math.max(0, dmd.matchDay-slidingWindowSize), dmd.matchDay)
        // sum up points
        .reduce((a, c, index, array) => a + c.points, 0)
      return {
        ...dmd,
        pointsTotal
      }
    })
  }, [derivedMatchData, slidingWindowSize])

  const data = useMemo(() => {
    return {
      season,
      derivedMatchData,
      derivedMatchDataAggregates,
      teams,
    }
  }, [derivedMatchData, derivedMatchDataAggregates, season, teams])

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  )
}

export default DataContextProvider