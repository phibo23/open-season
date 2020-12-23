import { useEffect, useRef } from "react"
import * as d3 from 'd3'

/**
 * based on https://observablehq.com/@mbostock/cancer-survival-rates
 */
const Chart = ({
  selectedTeam,
  svgFontSize,
  svgHeight,
  svgMarginBottom,
  svgMarginLeft,
  svgMarginRight,
  svgMarginTop,
  svgWidth,
  teamDerivedData,
  teamDerivedDataAggregates,
  teams,
}) => {
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
      .domain(teamDerivedDataAggregates?.map((tdd) => tdd.matchDay))
      .range([svgMarginLeft, svgWidth - svgMarginRight])

    // scale y
    const y = d3.scaleLinear()
      .domain(d3.extent(teamDerivedDataAggregates, d => d.pointsTotal))
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
    
    // draw lines
    d3.select(svgRef.current).append('g')
        .attr("fill", "none")
        .attr("stroke", "#000")
      .selectAll("path")
      .data(d3.group(teamDerivedDataAggregates, d => selectedTeam))
      .join("path")
        .attr("d", ([, group]) => line(group))
        .call(path => path.clone(true))
        .attr("stroke", "#fff")
        .attr("stroke-width", 5)

    // draw background for values
    d3.select(svgRef.current).append("g")
        .attr("fill", "#fff")
      .selectAll("circle")
      .data(teamDerivedDataAggregates)
      .join("circle")
        .attr("cx", d => x(d.matchDay))
        .attr("cy", d => y(d.pointsTotal))
        .attr("r", svgFontSize)

    // define format for values
    const formatValue = d3.format(",")
    
    // draw values
    d3.select(svgRef.current).append("g")
        .attr("text-anchor", "middle")
      .selectAll("text")
      .data(teamDerivedDataAggregates)
      .join("text")
        .attr("x", d => x(d.matchDay))
        .attr("y", d => y(d.pointsTotal))
        .attr("dy", "0.35em")
        .text(d => formatValue(d.pointsTotal))

    // draw labels left
    d3.select(svgRef.current).append("g")
        .attr("text-anchor", "end")
      .selectAll("text")
      .data(d3.groups(teamDerivedDataAggregates, d => teams.value?.find(t => t.TeamId === selectedTeam)?.ShortName))
      .join("text")
        .attr("x", svgMarginLeft - 12)
        .attr("y", ([key, [d]]) => y(d.pointsTotal) + (key === "Colon") * 10)
        .attr("dy", "0.35em")
        .text(([key]) => key)

    // draw labels right
    d3.select(svgRef.current).append("g")
        .attr("text-anchor", "end")
      .selectAll("text")
      .data(d3.groups([...teamDerivedDataAggregates].reverse(), d => teams.value?.find(t => t.TeamId === selectedTeam)?.ShortName))
      .join("text")
        .attr("x", svgWidth - 12)
        .attr("y", ([key, [d]]) => y(d.pointsTotal) + (key === "Colon") * 10)
        .attr("dy", "0.35em")
        .text(([key]) => key)
  }, [selectedTeam, svgFontSize, svgHeight, svgMarginBottom, svgMarginLeft, svgMarginRight, svgMarginTop, svgWidth, teams, teamDerivedData, teamDerivedDataAggregates])

  return (
    <svg ref={svgRef}/>
  )
}

Chart.defaultProps = {
  svgFontSize: 5,
  svgHeight: 200,
  svgMarginBottom: 20,
  svgMarginLeft: 60,
  svgMarginRight: 60,
  svgMarginTop: 40,
  svgWidth: 500,
}

export default Chart