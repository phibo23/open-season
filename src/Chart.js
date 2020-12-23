import { useContext, useEffect, useMemo, useRef } from "react"
import * as d3 from 'd3'
import { DataContext } from "./DataContext"

/**
 * based on https://observablehq.com/@mbostock/cancer-survival-rates
 */
const Chart = ({
  svgFontSize,
  svgHeight,
  svgMarginBottom,
  svgMarginLeft,
  svgMarginRight,
  svgMarginTop,
  svgWidth,
}) => {
  const {
    derivedMatchData,
    derivedMatchDataAggregates,
    selectedTeams,
    teams,  
  } = useContext(DataContext)

  const derivedMatchDataAggregatesSelectedTeams = useMemo(() => {
    return derivedMatchDataAggregates.filter(dmd => selectedTeams.includes(dmd.teamId))
  }, [derivedMatchDataAggregates, selectedTeams])

  const svgRef = useRef(null)
  useEffect(() => {
    // setup svg
    d3.select(svgRef.current)
      .attr("viewBox", [0, 0, svgWidth, svgHeight])
      .attr("font-family", "sans-serif")
      .attr("font-size", svgFontSize)
      .selectAll('*').remove()

    // scale x
    const x = d3.scalePoint()
      .domain(derivedMatchDataAggregates?.map((dmd) => dmd.matchDay))
      .range([svgMarginLeft, svgWidth - svgMarginRight])

    // scale y
    const y = d3.scaleLinear()
      .domain(d3.extent(derivedMatchDataAggregates, d => d.pointsTotal))
      .range([svgHeight - svgMarginBottom, svgMarginTop])

    // define x axis
    const xAxis = (g) => g
      .style('font-size', svgFontSize)
      .attr("transform", `translate(0,${svgMarginTop})`)
      .call(d3.axisTop(x))
      .call(g => g.select(".domain").remove())

    // draw x axis
    d3.select(svgRef.current).append('g')
      .call(xAxis)

    // define line
    const line = d3.line()
      .x(d => x(d.matchDay))
      .y(d => y(d.pointsTotal))
    
    // draw lines for unselected teams
    d3.select(svgRef.current).append('g')
        .attr("fill", "none")
        .attr("stroke", "#000")
      .selectAll("path")
      .data(d3.group(derivedMatchDataAggregates.filter(dmd => !selectedTeams.includes(dmd.teamId)), d => d.teamId))
      .join("path")
        .attr("d", ([, group]) => line(group))
        .attr("stroke", '#aaa')
        .call(path => path.clone(true))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)

    // draw lines for selected teams afterwards so they are displayed on top
    d3.select(svgRef.current).append('g')
        .attr("fill", "none")
        .attr("stroke", "#000")
      .selectAll("path")
      .data(d3.group(derivedMatchDataAggregatesSelectedTeams, d => d.teamId))
      .join("path")
        .attr("d", ([, group]) => line(group))
        .attr("stroke", '#f00')
        .call(path => path.clone(true))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
  
    // draw background for values
    d3.select(svgRef.current).append("g")
        .attr("fill", "#fff")
      .selectAll("circle")
      .data(derivedMatchDataAggregatesSelectedTeams)
      .join("circle")
        .attr("cx", d => x(d.matchDay))
        .attr("cy", d => y(d.pointsTotal))
        .attr("r", svgFontSize-1)

    // define format for values
    const formatValue = d3.format(",")
    
    // draw values
    d3.select(svgRef.current).append("g")
        .attr("text-anchor", "middle")
      .selectAll("text")
      .data(derivedMatchDataAggregatesSelectedTeams)
      .join("text")
        .attr("x", d => x(d.matchDay))
        .attr("y", d => y(d.pointsTotal))
        .attr("dy", "0.35em")
        .text(d => formatValue(d.pointsTotal))

    // draw labels left
    d3.select(svgRef.current).append("g")
        .attr("text-anchor", "end")
      .selectAll("text")
      .data(d3.groups(derivedMatchDataAggregates, d => teams.value?.find(t => t.TeamId === d.teamId)?.ShortName))
      .join("text")
        .attr("x", svgMarginLeft - 5)
        .attr("y", ([key, [d]]) => y(d.pointsTotal) + (key === "Colon") * 10)
        .attr("dy", "0.35em")
        .text(([key]) => key)

    // draw labels right
    d3.select(svgRef.current).append("g")
        .attr("text-anchor", "start")
      .selectAll("text")
      // reverse because need y position for last entry
      .data(d3.groups([...derivedMatchDataAggregates].reverse(), d => teams.value?.find(t => t.TeamId === d.teamId)?.ShortName))
      .join("text")
        .attr("x", svgWidth - svgMarginRight + 5)
        .attr("y", ([key, [d]]) => y(d.pointsTotal) + (key === "Colon") * 10)
        .attr("dy", "0.35em")
        .text(([key]) => key)
  }, [derivedMatchData, derivedMatchDataAggregates, derivedMatchDataAggregatesSelectedTeams, selectedTeams, svgFontSize, svgHeight, svgMarginBottom, svgMarginLeft, svgMarginRight, svgMarginTop, svgWidth, teams])

  return (
    <svg ref={svgRef}/>
  )
}

Chart.defaultProps = {
  svgFontSize: 5,
  svgHeight: 200,
  svgMarginBottom: 20,
  svgMarginLeft: 40,
  svgMarginRight: 40,
  svgMarginTop: 40,
  svgWidth: 500,
}

export default Chart