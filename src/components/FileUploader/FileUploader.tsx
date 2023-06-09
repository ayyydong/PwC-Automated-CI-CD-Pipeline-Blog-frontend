import { Typography, Stack, Button as MUIButton } from '@mui/material'
import { NotificationContext } from 'context/NotificationContext'
import React, { FC, useContext } from 'react'
import { Button } from '../Button'

interface FileUploadProps {
  setFile: Function
  file: File | null
  previewFile?: string
}

export const FileUploader: FC<FileUploadProps> = ({
  setFile,
  file,
  previewFile,
}) => {
  const { dispatch } = useContext(NotificationContext)

  const fileSizeHandler = (files: FileList | null) => {
    if (files == null) {
      return file
    }
    const newFile = files[0]
    if (newFile.size <= 3000000) {
      return newFile
    } else {
      dispatch({
        notificationActionType: 'error',
        message: `File size exceeds limit of 3MB`,
      })
      return file
    }
  }

  return (
    <Stack
      direction={'row'}
      spacing={2}
      width={'450px'}
      sx={{ justifyContent: 'flex-start', alignItems: 'center' }}
    >
      <Button
        dark
        disabled={!file && previewFile === undefined}
        text='DESELECT FILE'
        data-testid='reset'
        onClick={() => setFile(null)}
      />
      <MUIButton
        size={'small'}
        component='label'
        data-testid='upload-btn'
        variant='contained'
        sx={{ backgroundColor: 'white.main', border: '2px solid black' }}
      >
        <Typography variant='button' sx={{ color: 'black.main' }}>
          SELECT FILE
        </Typography>
        <input
          data-testid='upload-input'
          type='file'
          hidden
          accept='image/*'
          multiple
          onClick={(event) => {
            const e = event.target as HTMLInputElement
            e.value = ''
          }}
          onChange={(event) => setFile(fileSizeHandler(event.target.files))}
        />
      </MUIButton>
      {file !== null || previewFile !== undefined ? (
        <img
          data-testid='upload-preview'
          src={file !== null ? URL.createObjectURL(file) : previewFile}
          width='140px'
          height='140px'
          style={{ marginLeft: 30, objectFit: 'contain' }}
        />
      ) : (
        <Typography paddingLeft={'20px'} variant={'caption'}>
          File Unselected
        </Typography>
      )}
    </Stack>
  )
}
