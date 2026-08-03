import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/RequireAuth'
import HomePage from './pages/HomePage'
import ConfigPage from './pages/ConfigPage'
import EventScreen from './pages/EventScreen'
import TransactionsPage from './pages/TransactionsPage'
import LoginPage from './pages/LoginPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import StaffPage from './pages/StaffPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/alterar-password"
          element={
            <RequireAuth>
              <ChangePasswordPage />
            </RequireAuth>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/config"
          element={
            <RequireAuth>
              <ConfigPage />
            </RequireAuth>
          }
        />
        <Route
          path="/venda"
          element={
            <RequireAuth>
              <EventScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/transacoes"
          element={
            <RequireAuth>
              <TransactionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/funcionarios"
          element={
            <RequireAuth>
              <StaffPage />
            </RequireAuth>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
