import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";


// Lazy loaded components
const PageNotFound = lazy(() => import("./ErrorPages/PageNotFound.jsx"));
const MainPageLayout = lazy(() => import("./components/mainPage"));
const Settings = lazy(() => import("./components/settings.jsx"));
const Reg = lazy(() => import("./components/BodyDetails"));
const Profil = lazy(() => import("./components/profilePage"));
const AdminPage = lazy(() => import("./Admin/admin.jsx"));
const MainPageContent = lazy(() => import("./components/mainPageContent"));
const Workout = lazy(() => import("./components/workoutPage"));
const Diet = lazy(() => import("./components/dietPage"));
const Leaderboard = lazy(() => import("./components/leaderboard"));

// Static import
import WelcomePage from "./components/WelcomePage";
import Login from "./components/loginRegister.jsx";
const queryClient = new QueryClient();

const MainLayoutWrapper = () => {
  return (
    <MainPageLayout>
      <Outlet />
    </MainPageLayout>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<div className="loading-spinner">Betöltés...</div>}>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<Login />} />
            
            {/* MainPage nested routes */}
            <Route path="/mainPage" element={<MainLayoutWrapper />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<MainPageContent />} />
              <Route path="workout" element={<Workout />} />
              <Route path="diet" element={<Diet />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profil" element={<Profil />} />
            </Route>
            
            <Route path="/registration" element={<Reg />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
};

export default App;