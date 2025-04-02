import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/loginRegister";
import MainPage from "./components/mainPage";
import Settings from "./components/settings";
import Reg from "./components/BodyDetails";
import Profil from "./components/profilePage";
import WelcomePage from "./components/WelcomePage";
import AdminPage from "./Admin/admin.jsx"

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mainPage/*" element={<MainPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/registration" element={<Reg />} />
          <Route path="/admin" element={<AdminPage />} />

        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
