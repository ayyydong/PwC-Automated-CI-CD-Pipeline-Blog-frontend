import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  getDoc,
  getDocs,
  QuerySnapshot,
  DocumentData,
  FirestoreErrorCode,
  FirestoreError,
  QueryDocumentSnapshot,
  startAfter,
  Query,
} from 'firebase/firestore'
import { db } from '../../firebaseApp'
import { useState, useEffect, useRef } from 'react'
import {
  articleDraftTranslator,
  ArticlePreview,
  articlePreviewTranslator,
} from './useArticle'
import { useAuth } from './useAuth'

export interface UserData {
  role: string
  profile_image: string
  username: string
  uid: string
}

export interface AdminUserData {
  role: string
  profile_image: string
  username: string
  uid: string
  promotion_request: string | null;
}

export const userTranslator = (
  docs: QuerySnapshot<DocumentData>,
): UserData[] => {
  const userData: AdminUserData[] = []
  docs.forEach((doc) => {
    userData.push({
      role: doc.data().role,
      profile_image: doc.data().profile_image,
      username: doc.data().username,
      uid: doc.id,
      promotion_request: doc.data().promotion_request
    })
  })

  return userData
}

export const useUserRoleDirectory = (n: number | null, roles: string[]) => {
  const [error, setError] = useState<FirestoreErrorCode>()
  const [loading, setLoading] = useState(true)
  const [loadingNext, setLoadingNext] = useState(false)
  const [users, setUsers] = useState<DocumentData[]>([])
  const q = query(
    collection(db, 'users'),
    where('role', 'in', roles),
    orderBy('username'),
  )

  const [lastUser, setLastUser] =
    useState<QueryDocumentSnapshot<DocumentData>>()
  const [endOfCollection, setEndOfCollection] = useState(false)

  useEffect(() => {
    getDocs(n !== null ? query(q, limit(n)) : q)
      .then((docs: QuerySnapshot<DocumentData>) => {
        setLoading(false)
        setUsers(userTranslator(docs))
        setLastUser(docs.docs[docs.docs.length - 1])
        setEndOfCollection(n !== null ? docs.docs.length < n : true)
      })
      .catch((err) => {
        setError(err.code)
      })
  }, [])

  const getNext = (n: number) => {
    setLoadingNext(true)
    getDocs(query(q, startAfter(lastUser), limit(n)))
      .then((docs: QuerySnapshot<DocumentData>) => {
        setLoadingNext(false)
        setUsers(users.concat(userTranslator(docs)))
        setLastUser(docs.docs[docs.docs.length - 1])
        setEndOfCollection(docs.docs.length < n)
      })
      .catch((err: FirestoreError) => {
        setError(err.code)
      })
  }

  return { getNext, error, loading, loadingNext, users, endOfCollection }
}

export const useUserArticles = (uid: string, n: number) => {
  const { user: currentUser } = useAuth()
  const [error, setError] = useState<FirestoreErrorCode>()
  const [loading, setLoading] = useState(true)
  const [loadingNext, setLoadingNext] = useState(false)
  const [articles, setArticles] = useState<ArticlePreview[]>([])

  const q = useRef<Query<DocumentData> | null>(null)

  const [lastArticle, setLastArticle] =
    useState<QueryDocumentSnapshot<DocumentData>>()
  const [endOfCollection, setEndOfCollection] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      setError('unauthenticated')
    } else {
      q.current = query(
        collection(db, 'article'),
        where('author_uid', '==', uid),
        where('published', '==', true),
        orderBy('publish_time', 'desc'));
      getDocs(query(q.current, limit(n)))
        .then((docs: QuerySnapshot<DocumentData>) => {
          setLoading(false)
          setArticles(articlePreviewTranslator(docs))
          setLastArticle(docs.docs[docs.docs.length - 1])
          setEndOfCollection(docs.docs.length < n)
        })
        .catch((err: FirestoreError) => {
          setError(err.code)
        })
    }
  }, [uid])

  const getNext = (n: number) => {
    if (q.current) {
      setLoadingNext(true)
      getDocs(query(q.current, startAfter(lastArticle), limit(n)))
        .then((docs: QuerySnapshot<DocumentData>) => {
          setLoadingNext(false)
          setArticles(articles.concat(articlePreviewTranslator(docs)))
          setLastArticle(docs.docs[docs.docs.length - 1])
          setEndOfCollection(docs.docs.length < n)
        })
        .catch((err: FirestoreError) => {
          setError(err.code)
        })
    }
  }

  return { getNext, error, loading, loadingNext, articles, endOfCollection }
}

export const useUserDrafts = (n: number) => {
  const { user: currentUser } = useAuth()
  const [error, setError] = useState<FirestoreErrorCode>()
  const [loading, setLoading] = useState(true)
  const [loadingNext, setLoadingNext] = useState(false)
  const [articles, setArticles] = useState<ArticlePreview[]>([])

  const q = useRef<Query | null>(null)

  const [lastArticle, setLastArticle] =
    useState<QueryDocumentSnapshot<DocumentData>>()
  const [endOfCollection, setEndOfCollection] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      setError('unauthenticated')
    } else {
      q.current = query(
        collection(db, 'article'),
        where('author_uid', '==', currentUser.uid),
        where('published', '==', false),
        orderBy('edit_time', 'desc'))
      getDocs(query(q.current, limit(n)))
        .then((docs: QuerySnapshot<DocumentData>) => {
          setLoading(false)
          setArticles(articleDraftTranslator(docs))
          setLastArticle(docs.docs[docs.docs.length - 1])
          setEndOfCollection(docs.docs.length < n)
        })
        .catch((err: FirestoreError) => {
          setError(err.code)
        })
    }
  }, [currentUser])

  const getNext = (n: number) => {
    if (!currentUser) {
      setError('unauthenticated')
    } else {
      if (q.current) {
        setLoadingNext(true)
        getDocs(query(q.current, startAfter(lastArticle), limit(n)))
          .then((docs: QuerySnapshot<DocumentData>) => {
            setLoadingNext(false)
            setArticles(articles.concat(articleDraftTranslator(docs)))
            setLastArticle(docs.docs[docs.docs.length - 1])
            setEndOfCollection(docs.docs.length < n)
          })
          .catch((err: FirestoreError) => {
            setError(err.code)
          })
      }
    }
  }

  return { getNext, error, loading, loadingNext, articles, endOfCollection }
}

export const useApplyPromotion = () => {
  const { user: currentUser } = useAuth()
  const [error, setError] = useState<FirestoreErrorCode>()
  const [loading, setLoading] = useState(true)

  const applyPromotion = () => {
    if (currentUser) {
      updateDoc(
        doc(db, 'users', currentUser.uid),
        'promotion_request',
        'requested',
      ).then(
        () => {
          setLoading(false)
        },
        (err) => {
          setError(err.code)
        },
      )
    } else {
      setError('unauthenticated')
    }
  }

  return { applyPromotion, error, loading }
}

export const useSetRole = () => {
  const [error, setError] = useState<FirestoreErrorCode>()
  const [loading, setLoading] = useState(true)

  const setRole = (uid: string, role: string) => {
    if (
      role == 'reader' ||
      role == 'contributor' ||
      role == 'admin' ||
      role == 'banned'
    ) {
      updateDoc(doc(db, 'users', uid), 'role', role)
        .then(() => {
          setLoading(false)
        })
        .catch((err) => {
          setError(err.code)
        })
    } else {
      setError('invalid-argument')
    }
  }

  return { setRole, error, loading }
}

export const useUser = () => {
  const { user: currentUser } = useAuth()
  const [error, setError] = useState<FirestoreErrorCode>()
  const [loading, setLoading] = useState(true)
  const [queriedUser, setQueriedUser] = useState<UserData>({
    role: '',
    profile_image: '',
    username: '',
    uid: '',
  })

  useEffect(() => {
    getUser(currentUser?.uid ?? null)
      .then((user) => {
        setQueriedUser(user)
        setLoading(false)
      })
      .catch((err: FirestoreErrorCode) => {
        setError(err)
      })
  }, [currentUser])

  return { error, loading, queriedUser }
}

export const getUser = async (uid: string | null): Promise<UserData> => {
  if (uid === null) {
    return Promise.reject('unauthenticated')
  }
  const document = await getDoc(doc(db, 'users', uid))
  if (document.exists()) {
    return {
      role: document.data().role,
      profile_image: document.data().profile_image,
      username: document.data().username,
      uid: document.id,
    }
  } else {
    return Promise.reject('not-found')
  }
}
