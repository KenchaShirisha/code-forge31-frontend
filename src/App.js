import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CoursePage from './pages/CoursePage';
import ProblemPage from './pages/ProblemPage';
import QuizPage from './pages/QuizPage';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import AssignmentPage from './pages/AssignmentPage';
import RoadmapPage from './pages/RoadmapPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<AuthenticatedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function AuthenticatedLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/course/:id" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
        <Route path="/problem/:courseId/:level/:problemId" element={<ProtectedRoute><ProblemPage /></ProtectedRoute>} />
        <Route path="/quiz/:courseId/:level" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/assignment/:courseId/:level/:assignmentId" element={<ProtectedRoute><AssignmentPage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
        <Route path="/roadmap/:lang" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
