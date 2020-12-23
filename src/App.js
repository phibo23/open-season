import { useEffect, useMemo, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import * as d3 from 'd3'

const App = ({
  season,
  svgHeight,
  svgMarginBottom,
  svgMarginLeft,
  svgMarginRight,
  svgMarginTop,
  svgWidth,
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
        matchDay: tm?.Group.GroupOrderID,
        opponentId: isHome ? tm?.Team2.TeamId : tm?.Team1.TeamId,
        points
      }
    }) ?? []
  }, [selectedTeam, teamMatches])

  const svgRef = useRef(null)

  useEffect(() => {
    // based on https://observablehq.com/@mbostock/cancer-survival-rates
    d3.select(svgRef.current)
      .attr("viewBox", [0, 0, svgWidth, svgHeight])
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)

    const x = d3.scalePoint()
      .domain(teamDerivedData?.map((tdd) => tdd.matchDay))
      .range([svgMarginLeft, svgWidth - svgMarginRight])

    const y = d3.scaleLinear()
      .domain(d3.extent(teamDerivedData, d => d.points))
      .range([svgHeight - svgMarginBottom, svgMarginTop])

    const xAxis = (g) => g
      .attr("transform", `translate(0,${svgMarginRight})`)
      .call(d3.axisTop(x))
      .call(g => g.select(".domain").remove())

    d3.select(svgRef.current).append('g')
      .call(xAxis)

    const line = d3.line()
      .x(d => x(d.matchDay))
      .y(d => y(d.points))
    
    d3.select(svgRef.current).append('g')
        .attr("fill", "none")
        .attr("stroke", "#000")
      .selectAll("path")
      .data(d3.group(teamDerivedData, d => selectedTeam))
      .join("path")
        .attr("d", ([, group]) => line(group))
        .call(path => path.clone(true))
        .attr("stroke", "#fff")
        .attr("stroke-width", 5)

    d3.select(svgRef.current).append("g")
        .attr("fill", "#fff")
      .selectAll("circle")
      .data(teamDerivedData)
      .join("circle")
        .attr("cx", d => x(d.matchDay))
        .attr("cy", d => y(d.points))
        .attr("r", 10)

    const formatValue = d3.format(",")
    
    d3.select(svgRef.current).append("g")
        .attr("text-anchor", "middle")
      .selectAll("text")
      .data(teamDerivedData)
      .join("text")
        .attr("x", d => x(d.matchDay))
        .attr("y", d => y(d.points))
        .attr("dy", "0.35em")
        .text(d => formatValue(d.points))

    d3.select(svgRef.current).append("g")
        .attr("text-anchor", "end")
      .selectAll("text")
      .data(d3.groups(teamDerivedData, d => teams.value?.find(t => t.TeamId === selectedTeam)?.ShortName))
      .join("text")
        .attr("x", svgMarginLeft - 12)
        .attr("y", ([key, [d]]) => y(d.points) + (key === "Colon") * 10)
        .attr("dy", "0.35em")
        .text(([key]) => key)
  }, [selectedTeam, svgHeight, svgMarginBottom, svgMarginLeft, svgMarginRight, svgMarginTop, svgWidth, teams, teamDerivedData])

  return (
    <div>
      <select onChange={(e) => { setSelectedTeam(parseInt(e.target.value, 10)) }}>
        { teams.value?.map((t) => <option key={t?.TeamId} value={t?.TeamId}>{t?.TeamName}</option>)}
      </select>
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
                <td>{tdd.isHome ? 'H' : 'A'} {opponent.TeamName}</td>
                <td>{tdd.goalsFor}</td>
                <td>{tdd.goalsAgainst}</td>
                <td>{tdd.points}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <svg ref={svgRef}/>
    </div>
  )
}

App.defaultProps = {
  season: '2020',
  svgHeight: 200,
  svgMarginBottom: 20,
  svgMarginLeft: 60,
  svgMarginRight: 20,
  svgMarginTop: 30,
  svgWidth: 500,
}

export default App