import { useState } from 'react'

export function useAlert() {
  const [alert, setAlert] = useState({
    isVisible: false,
    type: 'success',
    message: ''
  })

  const showAlert = (type, message) => {
    setAlert({
      isVisible: true,
      type,
      message
    })
  }

  const hideAlert = () => {
    setAlert(prev => ({
      ...prev,
      isVisible: false
    }))
  }

  const showSuccess = (message) => showAlert('success', message)
  const showError = (message) => showAlert('error', message)
  const showWarning = (message) => showAlert('warning', message)
  const showInfo = (message) => showAlert('info', message)

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}