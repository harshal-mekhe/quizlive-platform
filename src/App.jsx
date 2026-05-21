import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import QuizzesPage from '@/pages/QuizzesPage'
import QuizFormPage from '@/pages/QuizFormPage'
import JoinPage from '@/pages/JoinPage'
import WaitingRoomPage from '@/pages/WaitingRoomPage'
import AdminWaitingRoomPage from '@/pages/AdminWaitingRoomPage'
import AdminLiveQuizPage from '@/pages/AdminLiveQuizPage'
import ParticipantPlayPage from '@/pages/ParticipantPlayPage'
import QuizResultsPage from '@/pages/QuizResultsPage'
import { ROUTES } from '@/utils/constants'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.JOIN} element={<JoinPage />} />
              <Route path={ROUTES.WAITING} element={<WaitingRoomPage />} />
              <Route path={ROUTES.PLAY} element={<ParticipantPlayPage />} />
              <Route path={ROUTES.RESULTS} element={<QuizResultsPage />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
            </Route>

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={ROUTES.QUIZZES} element={<QuizzesPage />} />
              {/* "new" must be registered before ":id/edit" */}
              <Route path={ROUTES.QUIZ_NEW} element={<QuizFormPage />} />
              <Route path={ROUTES.QUIZ_EDIT} element={<QuizFormPage />} />
              <Route path={ROUTES.ADMIN_WAITING} element={<AdminWaitingRoomPage />} />
              <Route path={ROUTES.ADMIN_LIVE} element={<AdminLiveQuizPage />} />
            </Route>

            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
