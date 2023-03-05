import { Box, Button, FormLabel, Stack } from '@mui/material'
import { Container } from '@mui/system'
import { useState, FormEvent } from 'react'
import { LabeledTextField } from '../../components'
import { article } from '../../hooks/firebase/useArticle'

/* eslint-disable @typescript-eslint/no-unused-vars */

const pictureUrls = [
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/150',
]

export enum ArticleFormPurpose {
  CREATE,
  UPDATE,
}

interface ArticleFormProps {
  purpose: ArticleFormPurpose
  onSubmit: (
    title: string,
    body: string,
    imagelink: string,
    published: boolean,
    articleId?: string,
  ) => void
  article?: article
  articleId?: string
}

export const ArticleForm = ({
  purpose,
  onSubmit,
  ...rest
}: ArticleFormProps) => {
  const [pictureIndexStart, setPictureIndexStart] = useState(0)
  const [selectedPictureIndex, setSelectedPictureIndex] = useState(0)

  const [isTitleError, setIsTitleError] = useState(false)
  const [title, setTitle] = useState('')
  const [titleHelperText, setTitleHelperText] = useState('')

  const [isBodyError, setIsBodyError] = useState(false)
  const [body, setBody] = useState('')
  const [bodyHelperText, setBodyHelperText] = useState('')

  const [customLink, setCustomLink] = useState('')

  const handleSubmit = (e: FormEvent<HTMLElement>, published: boolean) => {
    let isInvalid = false
    if (title.length === 0 || countWords(title) > 60) {
      isInvalid = true
      setIsTitleError(true)
      if (title.length === 0) {
        setTitleHelperText("Title can't be empty.")
      } else {
        setBodyHelperText('Title must be 60 words or less.')
      }
    } else {
      setIsTitleError(false)
      setTitleHelperText('')
    }
    if (body.length === 0 || countWords(body) > 250) {
      isInvalid = true
      setIsBodyError(true)
      if (body.length === 0) {
        setBodyHelperText("Body can't be empty.")
      } else {
        setBodyHelperText('Body must be 250 words or less.')
      }
    } else {
      console.log(countWords(body))
      setIsBodyError(false)
      setBodyHelperText('')
    }
    if (!isInvalid) {
      if (rest.articleId !== undefined) {
        onSubmit(
          title,
          body,
          customLink.length > 0
            ? customLink
            : pictureUrls[selectedPictureIndex],
          published,
          rest.articleId,
        )
      } else {
        onSubmit(
          title,
          body,
          customLink.length > 0
            ? customLink
            : pictureUrls[selectedPictureIndex],
          published,
        )
      }
    }

    e.preventDefault()
  }

  return (
    <Container>
      <form
        style={{
          alignSelf: 'stretch',
          justifyItems: 'space-between',
          flex: 1,
        }}
        onSubmit={(event) => {
          handleSubmit(event, true)
        }}
      >
        <Stack
          direction='column'
          justifyContent='flex-start'
          alignItems='flex-start'
          spacing={40}
        >
          {purpose === ArticleFormPurpose.CREATE && (
            <Button
              variant='contained'
              style={{ backgroundColor: 'black', alignSelf: 'flex-end' }}
              onClick={(event) => {
                handleSubmit(event, false)
              }}
            >
              SAVE DRAFT
            </Button>
          )}
          <FormLabel style={{ color: 'black' }}>Pick an image</FormLabel>
          <Stack
            justifyContent={'space-between'}
            alignSelf={'stretch'}
            direction='row'
          >
            <Button
              style={{ color: 'black' }}
              onClick={() => {
                if (pictureIndexStart - 4 < 0) {
                  setPictureIndexStart(
                    Math.ceil(pictureUrls.length / 4) * 4 - 4,
                  )
                } else {
                  setPictureIndexStart(
                    (pictureIndexStart - 4) % pictureUrls.length,
                  )
                }
              }}
            >
              {'<'}
            </Button>
            <Stack direction='row' spacing={5}>
              {Array(4)
                .fill(null)
                .map((value, index) => {
                  return (
                    <Button
                      style={{
                        backgroundColor:
                          selectedPictureIndex === pictureIndexStart + index
                            ? 'black'
                            : 'transparent',
                      }}
                      disabled={!pictureUrls[pictureIndexStart + index]}
                      key={index}
                      onClick={() => {
                        setSelectedPictureIndex(pictureIndexStart + index)
                      }}
                    >
                      <Box
                        sx={{
                          width: 150,
                          height: 150,
                          backgroundImage: `url(${
                            pictureUrls[pictureIndexStart + index]
                          })`,
                        }}
                      />
                    </Button>
                  )
                })}
            </Stack>
            <Button
              style={{ color: 'black' }}
              onClick={() => {
                if (pictureIndexStart + 4 >= pictureUrls.length) {
                  setPictureIndexStart(0)
                } else {
                  setPictureIndexStart(
                    (pictureIndexStart + 4) % pictureUrls.length,
                  )
                }
              }}
            >
              {'>'}
            </Button>
          </Stack>
          <LabeledTextField
            variant='outlined'
            onTextChange={setCustomLink}
            placeholder='Paste link to image'
            label='or'
            multiline={false}
          />
          <LabeledTextField
            variant='outlined'
            onTextChange={setTitle}
            placeholder='60 words or less'
            label='Title'
            multiline={false}
            error={isTitleError}
            helperText={titleHelperText}
            value={
              purpose === ArticleFormPurpose.UPDATE ? rest.article?.title : null
            }
          />
          <LabeledTextField
            variant='outlined'
            onTextChange={setBody}
            placeholder='250 words or less'
            label='Body'
            multiline={true}
            rows={7}
            error={isBodyError}
            helperText={bodyHelperText}
          />
        </Stack>
        <Button
          type='submit'
          variant='contained'
          style={{ marginTop: 34, backgroundColor: 'black' }}
        >
          {purpose === ArticleFormPurpose.CREATE ? 'CREATE' : 'UPDATE'}
        </Button>
      </form>
    </Container>
  )
}

function countWords(text: string): number {
  return text.trim().split(' ').length
}
