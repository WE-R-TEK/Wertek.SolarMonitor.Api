import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCrWnir_5M64si-pcJHvLvgrlFN6Pg1pY8',
  authDomain: 'solarmonitor-633ce.firebaseapp.com',
  databaseURL: 'https://solarmonitor-633ce-default-rtdb.firebaseio.com',
  projectId: 'solarmonitor-633ce',
  storageBucket: 'solarmonitor-633ce.appspot.com',
  messagingSenderId: '723606347987',
  appId: '1:723606347987:web:629fc620f3d17c1275f426',
  measurementId: 'G-3WGNKVH4LL',
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

export { database };

export default app;
