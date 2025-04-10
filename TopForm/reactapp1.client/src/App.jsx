import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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

import WelcomePage from "./components/WelcomePage";
import Login from "./components/loginRegister.jsx";
import LoadingPage from "./ErrorPages/loadingPage"; 
import AcessDenied from "./ErrorPages/AccessDeniedPage.jsx";

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
      <Suspense fallback={<LoadingPage />}>
      <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute showBodyguard={true} />}>
              <Route path="/registration" element={<Reg />} />
              <Route path="/mainPage" element={<MainLayoutWrapper />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<MainPageContent />} />
                <Route path="workout" element={<Workout />} />
                <Route path="diet" element={<Diet />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profil" element={<Profil />} />
                
              </Route>
            </Route>

            <Route element={<ProtectedRoute showBodyguard={false} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/loading" element={<LoadingPage />} />
              <Route path="*" element={<PageNotFound />} />
              <Route path="/access-denied" element={<AcessDenied />} />
            </Route>
            
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
};

export default App;