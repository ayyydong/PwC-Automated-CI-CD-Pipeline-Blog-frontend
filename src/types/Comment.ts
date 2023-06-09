import { Timestamp } from 'firebase/firestore'

export interface UserComment {
  commenter_uid: string
  commenter_image: string
  commenter_username: string
  content: string
  post_time: Timestamp
  commentID: string
}
