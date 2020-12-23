import { useState } from 'react'

import Chart from './Chart'
import DataContextProvider from './DataContext'

const App = () => {
  const [season, setSeason] = useState(2020)
  const [slidingWindowSize, setSlidingWindowSize] = useState(34)

  return (
    <div>
      <input type='number' min={2010} max={2020} onChange={(e) => { setSeason(parseInt(e.target.value, 10)) }} placeholder={season} />
      <input type='number' min={5} max={34} onChange={(e) => { setSlidingWindowSize(parseInt(e.target.value, 10)) }} placeholder={slidingWindowSize} />
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