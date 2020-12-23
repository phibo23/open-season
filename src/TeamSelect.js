import { Chip, FormControl, InputLabel, makeStyles, MenuItem, Select } from "@material-ui/core"
import { useContext } from "react"
import { DataContext } from "./DataContext"

/**
 * based on https://material-ui.com/components/selects/#multiple-select
 */
const TeamSelect = ({
  onChange,
  value,
}) => {
  const {
    teams,
  } = useContext(DataContext)

  const classes = useStyles()

  return (
    <FormControl>
      <InputLabel id="demo-mutiple-chip-label">Teams</InputLabel>
      <Select
        labelId="demo-mutiple-chip-label"
        multiple
        onChange={onChange}
        renderValue={(selected) => (
          <div className={classes.chips}>
            {selected.map((value) => {
              const team = teams.value?.find(t => t.TeamId === value)
              return(
                <Chip key={value} label={team?.ShortName || team?.TeamName} className={classes.chip} />
              )
            })}
          </div>
        )}
        value={value}
      >
        {teams.value?.map((t) => (
          <MenuItem key={t.TeamId} value={t.TeamId}>
            {t.ShortName || t.TeamName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

const useStyles = makeStyles((theme) => ({
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
}))

export default TeamSelect