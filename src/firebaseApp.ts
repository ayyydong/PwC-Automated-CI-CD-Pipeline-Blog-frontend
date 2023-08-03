import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { connectStorageEmulator, getStorage } from '@firebase/storage'

let firebaseConfig

switch (process.env.REACT_APP_ENV) {
  case 'PROD':
    firebaseConfig = {
      apiKey: "AIzaSyDZaRO-s-X-mWnzekSTvwyXpcdoRhG20vg",
      authDomain: "pwc-blog-prod-394806.firebaseapp.com",
      projectId: "pwc-blog-prod-394806",
      storageBucket: "pwc-blog-prod-394806.appspot.com",
      messagingSenderId: "735888875657",
      appId: "1:735888875657:web:54949880fee7e94fc32658"
    };
    break

  case 'QA':
    firebaseConfig = {
      apiKey: "AIzaSyCwsR_QUkMHWoSA2cHaFutgjVnm1rrrcNU",
      authDomain: "pwc-blog-qa-394806.firebaseapp.com",
      projectId: "pwc-blog-qa-394806",
      storageBucket: "pwc-blog-qa-394806.appspot.com",
      messagingSenderId: "621990839487",
      appId: "1:621990839487:web:a428bce9dc509a7489720a"
    };
    break

  default:
    firebaseConfig = {
      apiKey: "AIzaSyDAIOUeooTsdu363EBrhK5VM91_RVV6Ylc",
      authDomain: "pwc-blog-dev-394805.firebaseapp.com",
      projectId: "pwc-blog-dev-394805",
      storageBucket: "pwc-blog-dev-394805.appspot.com",
      messagingSenderId: "590991621157",
      appId: "1:590991621157:web:055412bac80b923a4093cc"
    };
    break
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

if (!process.env.REACT_APP_ENV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  connectStorageEmulator(storage, 'localhost', 9199)
}

export { db, auth, storage }
