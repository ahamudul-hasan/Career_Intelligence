import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { 
  HealthDashboardPage,
  CareerSelectionPage,
  JobSearchPage,
  MarketAnalysisPage,
  SkillGapPage,
  RoadmapPage,
  ProfilePage,
  NotFoundPage
} from './pages';
import { useHealth } from './hooks/useHealth';

export const App: React.FC = () => {
  const { health, loading, error, latency, lastChecked, refetch } = useHealth(true);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar health={health} loading={loading} onRefresh={refetch} />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Routes>
            <Route 
              path="/" 
              element={
                <HealthDashboardPage
                  health={health}
                  loading={loading}
                  error={error}
                  latency={latency}
                  lastChecked={lastChecked}
                  onRefresh={refetch}
                />
              } 
            />
            <Route path="/careers" element={<CareerSelectionPage />} />
            <Route path="/jobs" element={<JobSearchPage />} />
            <Route path="/analysis" element={<MarketAnalysisPage />} />
            <Route path="/gaps" element={<SkillGapPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
