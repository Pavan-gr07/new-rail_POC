import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { MainLayout } from './layout'
import Dashboard from './pages/Dashboard'
import Trains from './pages/Trains'
import Displays from './pages/Displays'
import HSR from './pages/HSR'
import Events from './pages/Events'
import Announcements from './pages/Announcements'
import Config from './pages/Config'
import NetworkTopology from './pages/NetworkTopology'
import GIS from "./pages/GIS";
import NotFound from './pages/NotFound'
import CNMSGISView from './pages/CentralNMS'
import ReportingAnalyticsDashboard from './pages/ReportingAnalyticsDashboard'
import VideoDisplaySoftware from './pages/VideoDisplaySoftware'
import ArrivalDepartureInfo from './pages/ArrivalDepartureInfo'
import AnnouncementSystem from './pages/AnnouncementSystem'
import CoachGuidanceSystem from './pages/CoachGuidanceSystem'

function App() {

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trains" element={<Trains />} />
          <Route path="/displays" element={<Displays />} />
          <Route path="/hsr" element={<HSR />} />
          <Route path="/events" element={<Events />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/config" element={<Config />} />
          <Route path="/network" element={<NetworkTopology />} />
          <Route path="/gis" element={<GIS />} />
          <Route path="/central" element={<CNMSGISView />} />
          <Route path="/reports" element={<ReportingAnalyticsDashboard />} />
          <Route path="/videos" element={<VideoDisplaySoftware />} />
          <Route path="/train-info" element={<ArrivalDepartureInfo />} />
          <Route path="/announcement" element={<AnnouncementSystem />} />
          <Route path="/coach-guidence" element={<CoachGuidanceSystem />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
