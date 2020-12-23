import { useState } from 'react'

import Chart from './Chart'
import DataContextProvider from './DataContext'

const App = () => {
  const [season, setSeason] = useState('2020')
  const [slidingWindowSize, setSlidingWindowSize] = useState(5)

  return (
    <div>
      <input type='text' onBlur={(e) => { setSeason(e.target.value) }} placeholder={season} />
      <input type='number' min={5} max={34} onChange={(e) => { setSlidingWindowSize(parseInt(e.target.value)) }} placeholder={slidingWindowSize} />
      <DataContextProvider
        season={season}
        slidingWindowSize={slidingWindowSize}
      >
        <Chart />
      </DataContextProvider>
    </div>
  )
}

export default App