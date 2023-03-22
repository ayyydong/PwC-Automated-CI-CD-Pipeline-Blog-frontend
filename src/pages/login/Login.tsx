import React, { FC, useEffect } from 'react'
import { GetStartedTitle } from './GetStartedTitle'
import { LoginAndSignUpForm } from './LoginAndSignUpForm'
import { AppWrapper } from '../../components/AppWrapper'
import { useAuth } from '../../hooks/firebase/useAuth'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../hooks/firebase/useUser'

export const Login: FC = () => {
  const navigate = useNavigate()
  const { queriedUser, loading } = useUser()

  useEffect(() => {
    if (!loading && queriedUser.uid) {
      navigate('/')
    }
  }, [queriedUser, loading])

  if (loading || queriedUser.uid) {
    return null
  }

  return (
    <AppWrapper>
      <GetStartedTitle />
      <LoginAndSignUpForm />
    </AppWrapper>
  )
}
