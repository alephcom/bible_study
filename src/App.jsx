import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import SearchPage from './components/SearchForm/SearchPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<SearchPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

