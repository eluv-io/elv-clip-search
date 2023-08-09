import firebaseConfig from "./configuration";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

class DB {
  constructor(firebaseConfig) {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  async saveUser({ clientAddr }) {
    if (this.db !== null) {
      try {
        const userDocRef = doc(this.db, "User", clientAddr);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          console.log("User already exists");
        } else {
          await setDoc(clientRef, {
            Client_address: clientAddr,
            Wallet_id: null,
            Email_add: null,
            Creation_time: null,
            Updated_time: null,
            Personal_info: {},
          });
        }
      } catch (err) {
        console.log("Save user into DB err");
      }
    }
  }

  async saveEngagement({ searchId, clientAddr, engagement, init = false }) {
    if (this.db !== null) {
      try {
        const engDocRef = doc(
          this.db,
          "Engagement",
          clientAddr + "_" + searchId
        );
        if (init) {
          await setDoc(engDocRef, {
            engagement: engagement,
            User_id: clientAddr,
            Search_id: searchId,
          });
        } else {
          await updateDoc(engDocRef, {
            engagement: engagement,
          });
        }

        console.log(`Engagement table saved`);
      } catch (err) {
        console.log("Error occured when initializing the engagement table");
        console.log(err);
      }
    }
  }

  async saveSearchHistory({
    clientAddr,
    fuzzysearchPhrase,
    fuzzySearchFields,
    searchKeywords,
  }) {
    if (db !== null) {
      try {
        const colRef = collection(this.db, "Search_history");
        const now = Timestamp.now().toDate().toUTCString();
        const docRef = await addDoc(colRef, {
          client: clientAddr,
          search_time: now,
          fuzzySearchPhrase: fuzzysearchPhrase,
          fuzzySearchFields: fuzzySearchFields,
          searchKeywords: searchKeywords,
        });
        console.log(`search history updated with docID ${docRef.id}`);
        return docRef.id;
      } catch (err) {
        console.log("Error occured when storing the search history");
        console.log(err);
        return null;
      }
    }
  }

  async saveShot({ shot }) {
    if (this.db !== null) {
      try {
        const shotDocRef = doc(this.db, "Shot_info", shot.shotID);
        const shorDoc = await getDoc(shotRef);
        const payload = {
          start: shot.start,
          end: shot.end,
          iqHash: shot.iqHash,
          "iqHash_start-end": shot.shotID,
          tags: shot.tags,
        };
        if (shorDoc.exists()) {
          await updateDoc(shotDocRef, payload);
        } else {
          await setDoc(shotDocRef, payload);
        }
      } catch (err) {
        console.log(`Save shot info err for ${shot.shotID}`);
      }
    }
  }
}

export default DB;
