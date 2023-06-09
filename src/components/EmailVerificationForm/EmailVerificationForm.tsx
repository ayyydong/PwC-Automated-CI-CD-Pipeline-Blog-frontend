import { TextField, Box, FormHelperText } from '@mui/material'
import { Stack } from '@mui/system'
import { Button } from '../Button'
import { useForgotPasswordEmail } from '../../hooks/firebase/useAuth'
import { useNavigate } from 'react-router-dom'
import React, { FC, FormEvent, useEffect, useState } from 'react'

enum ForgotPasswordErrors {
  invalidEmail = 'auth/invalid-email',
  userNotFound = 'auth/user-not-found',
}

export const EmailVerificationForm: FC = () => {
  const [emailError, setEmailError] = useState('')
  const [email, setEmail] = useState('')

  const navigate = useNavigate()
  const forgotPasswordHandler = useForgotPasswordEmail()

  const sendEmailLink = (event: FormEvent<HTMLElement>) => {
    event.preventDefault()
    forgotPasswordHandler.sendEmail(email.trim())
  }

  useEffect(() => {
    if (!forgotPasswordHandler.loading) {
        navigate('/get-started')
    } else if (forgotPasswordHandler.error) {
        const error = forgotPasswordHandler.error.code
        switch (error) {
        case ForgotPasswordErrors.invalidEmail:
            setEmailError('Invalid email')
            break
        case ForgotPasswordErrors.userNotFound:
            setEmailError('User was not found')
            break
        default:
            setEmailError('Unable to send email link')
            break
        }
    }
  }, [forgotPasswordHandler.loading, forgotPasswordHandler.error])

  return (
    <form onSubmit={sendEmailLink}>
      <Stack
        width='270px'
        direction='column'
        justifyContent='flex-start'
        alignItems='stretch'
        borderRadius='12px'
        sx={{ backgroundColor: 'white.light' }}
        p='32px'
        spacing={24}
      >
        <Box component='div'>
          <TextField
            id='email'
            label='Email'
            variant='outlined'
            error={emailError.length > 0}
            onChange={(event) => {
              setEmail(event.target.value)
            }}
            sx={{ width: '100%' }}
          />
          {emailError.length > 0 && (
            <FormHelperText data-testid="error-msg" error={true} sx={{ pl: '13px' }}>
              {emailError}
            </FormHelperText>
          )}
        </Box>
        <Button
          dark={true}
          text='SEND RESET PASSWORD LINK'
          type={'submit'}
          style={{ color: 'white.main' }}
        />
      </Stack>
    </form>
  )
}
