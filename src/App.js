import { CssBaseline, Drawer, makeStyles, TextField } from '@material-ui/core'
import { useState } from 'react'

import Chart from './Chart'
import DataContextProvider from './DataContext'
import TeamSelect from './TeamSelect'

const App = () => {
  const [season, setSeason] = useState(2020)
  const [slidingWindowSize, setSlidingWindowSize] = useState(34)
  const [selectedTeams, setSelectedTeams] = useState([])

  const classes = useStyles()

  return (
    <div>
      <DataContextProvider
        season={season}
        slidingWindowSize={slidingWindowSize}
      >
        <div className={classes.root}>
          <CssBaseline />
          <Drawer
            anchor="left"
            classes={{
              paper: classes.drawerPaper,
            }}
            className={classes.drawer}
            variant='permanent'
          >
            <TextField
              defaultValue={2020}
              label='Season'
              onChange={(e) => { setSeason(parseInt(e.target.value, 10)) }}
              select
              SelectProps={{
                native: true,
              }}
            >
              {[
                // XXX for some reason these dont work correctly
                // 2008, 2009, 2010,
                2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020
              ].map(s => (
                <option key={s} value={s}>{s}/{s+1}</option>
              ))}
            </TextField>
            <TextField
              defaultValue={34}
              inputProps={{
                max: 34,
                min: 5,
              }}
              label='Matches'
              onChange={(e) => { setSlidingWindowSize(parseInt(e.target.value, 10)) }}
              type='number'
            />
            <TeamSelect
              onChange={(e) => {
                setSelectedTeams(e.target.value)
              }}
              value={selectedTeams}
            />
          </Drawer>
          <main className={classes.content}>
            <Chart selectedTeams={selectedTeams} />
          </main>
        </div>
      </DataContextProvider>
    </div>
  )
}

const drawerWidth = 200;
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    padding: theme.spacing(),
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
}))

export default App