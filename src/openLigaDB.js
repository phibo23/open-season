export const isMatchHome = (match, teamId) => {
  return match?.Team1.TeamId === teamId
}

export const getFinalResult = (match) => {
  // match results also contain half time result
  return match?.MatchResults?.find((mr) => mr?.ResultTypeID === 2)
}

export const getResultType = (result) => {
  // determine if home or away team won or draw
  // https://stackoverflow.com/a/34852894
  return Math.sign(result.PointsTeam1 - result.PointsTeam2)
}

export const calculatePoints = (resultType, isHome) => {
  // award points depending on result type and team
  let points = 0
  if ((resultType === 1 && isHome) || (resultType === -1 && !isHome)) {
    points = 3
  } else if (resultType === 0) {
    points = 1
  }
  return points  
}