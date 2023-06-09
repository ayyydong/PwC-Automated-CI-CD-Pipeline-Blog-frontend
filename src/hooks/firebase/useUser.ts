import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
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
import { useState, useEffect, useRef, useContext } from 'react'
import { useAuth } from './useAuth'
import { userTranslator } from 'utils/firebase/user'
import { UserContext } from 'context/UserContext'
import { ArticlePreview } from 'types/Article'
import {
  articleDraftTranslator,
  articlePreviewTranslator,
} from 'utils/firebase/article'

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
        orderBy('publish_time', 'desc'),
      )
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
        orderBy('edit_time', 'desc'),
      )
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
  const {
    state: { queriedUser, loading, error },
  } = useContext(UserContext)
  return { queriedUser, loading, error }
}
