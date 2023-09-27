import { firebaseConfig, useEmulator } from "./firebaseConfiguration";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  connectFirestoreEmulator,
  serverTimestamp,
} from "firebase/firestore";

class DB {
  constructor() {
    let app;
    if (useEmulator) {
      const emulatorConfig = {
        apiKey: "",
        authDomain: "",
        databaseURL: "https://elv-clip-search-default-rtdb.firebaseio.com",
        projectId: "elv-clip-search",
        storageBucket: "",
        messagingSenderId: "426199348320",
        appId: "",
        measurementId: "",
      };
      app = initializeApp(emulatorConfig);
      this.db = getFirestore(app);
      connectFirestoreEmulator(this.db, "127.0.0.1", 8080);
    } else if (
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId
    ) {
      app = initializeApp(firebaseConfig);
      this.db = getFirestore(app);
    } else {
      console.error(
        "Either set up the local DB emulator for the development environment as per src/firebase/emulator.md or ensure that the production Firebase configuration is present."
      );
      this.db = null;
    }
  }

  async setUser({ walletAddr }) {
    if (this.db !== null) {
      try {
        const userDocRef = doc(this.db, "users", walletAddr);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          console.log("User already exists");
          await updateDoc(userDocRef, { userLoginTime: serverTimestamp() });
        } else {
          await setDoc(userDocRef, {
            walletAddress: walletAddr,
            emailAddress: null,
            userCreateTime: serverTimestamp(),
            userLoginTime: null, //last login time
            userInformation: {},
          });
          console.log("New user added");
        }
      } catch (err) {
        console.log("Err: Save user into DB failed");
      }
    }
  }

  async setEngagement({ searchId, walletAddr, engagement, init }) {
    if (this.db !== null) {
      try {
        const engDocRef = doc(
          this.db,
          "engagements",
          walletAddr + "_" + searchId
        );
        console.log("engagement", engDocRef.id);
        if (init) {
          await setDoc(engDocRef, {
            engagement: engagement,
            walletAddress: walletAddr,
            searchId: searchId,
          });
        } else {
          await updateDoc(engDocRef, {
            engagement: engagement,
          });
        }

        console.log(`Engagement table saved`);
      } catch (err) {
        console.log("Err: Set the engagement table failed");
        console.log(err);
      }
    }
  }

  async setSearchHistory({
    walletAddr,
    fuzzySearchPhrase,
    fuzzySearchFields,
    searchKeywords,
    searchObjId,
    tenantID,
  }) {
    if (this.db !== null) {
      try {
        const colRef = collection(this.db, "searchHistory");
        const now = Timestamp.now().toDate().toUTCString();
        const docRef = await addDoc(colRef, {
          walletAddress: walletAddr,
          searchTime: now,
          searchIndex: searchObjId,
          tenantAddress: tenantID,
          fuzzySearchPhrase: fuzzySearchPhrase,
          fuzzySearchFields: fuzzySearchFields,
          searchKeywords: searchKeywords,
        });
        console.log(`DB: Search history updated with docID ${docRef.id}`);
        return docRef.id;
      } catch (err) {
        console.log("Error: Failed to Store the search history");
        console.log(err);
        return null;
      }
    }
  }

  async setShot({ shot }) {
    if (this.db !== null) {
      try {
        const shotDocRef = doc(this.db, "shotInfo", shot.shotId);
        const shotDoc = await getDoc(shotDocRef);
        const payload = {
          start: shot.start,
          end: shot.end,
          iqHash: shot.iqHash,
          "iqHash_start-end": shot.shotId,
          tags: shot.tags,
        };
        if (shotDoc.exists()) {
          await updateDoc(shotDocRef, payload);
        } else {
          await setDoc(shotDocRef, payload);
        }
      } catch (err) {
        console.log(`Err: Save shot info for ${shot.shotId} failed`);
      }
    }
  }

  async getShot({ shotId }) {
    if (this.db !== null) {
      try {
        const shotRef = doc(this.db, "shotInfo", shotId);
        const shot = await getDoc(shotRef);
        if (shot.exists()) {
          return shot.data();
        } else return null;
      } catch (err) {
        console.log(`Err: Get Shot ${shotId} failed`);
        return null;
      }
    } else {
      return null;
    }
  }

  async setClip({
    searchId,
    contentHash,
    clipStart,
    clipEnd,
    clipRank,
    shotIds,
  }) {
    if (this.db !== null) {
      try {
        const clipDocRef = doc(
          this.db,
          "clipInfo",
          contentHash + "_" + clipStart + "-" + clipEnd
        );
        const clip = await getDoc(clipDocRef);
        if (!clip.exists()) {
          await setDoc(clipDocRef, {
            contentHash: contentHash,
            start_time: clipStart,
            end_time: clipEnd,
            rank: [{ searchId: searchId, rank: clipRank }],
            shots: shotIds,
          });
          console.log("Clip stored successfully!");
        } else {
          const tempRank = clip.data().rank;
          if (
            !(
              tempRank[tempRank.length - 1].rank === clipRank &&
              tempRank[tempRank.length - 1].searchID === searchId
            )
          ) {
            tempRank.push({ searchId, rank: clipRank });
            await updateDoc(clipDocRef, {
              rank: tempRank,
            });
            console.log("Clip updated successfully!");
          }
        }
      } catch (err) {
        console.log(
          `Err: Save clip info for ${contentHash}, [${clipStart} : ${clipEnd}] failed`
        );
        console.log(err);
      }
    }
  }

  async getFeedback({ walletAddr, clipHash, searchId }) {
    if (this.db !== null) {
      try {
        const userRef = collection(this.db, "feedbacks", walletAddr, "Data");
        const q = query(
          userRef,
          where("clipHash", "==", clipHash),
          where("searchId", "==", searchId),
          orderBy("feedbackTime", "desc"),
          limit(1)
        );
        const res = await getDocs(q);
        return res;
      } catch (err) {
        console.log(
          `Err: Get feedback for wallet ${walletAddr} on clip ${clipHash} in search ${searchId} failed`
        );
        return [];
      }
    } else {
      return [];
    }
  }

  async setFeedback({
    walletAddr,
    clipHash,
    searchId,
    score,
    reason,
    otherReasons,
  }) {
    if (this.db !== null) {
      try {
        const userRef = collection(this.db, "feedbacks", walletAddr, "Data");
        const now = Timestamp.now().toDate().toUTCString();
        const docRef = doc(userRef, now);
        await setDoc(docRef, {
          walletAddress: walletAddr,
          feedbackTime: now,
          rating: score,
          clipHash: clipHash,
          reason: reason,
          otherReasons: otherReasons,
          searchId: searchId,
        });
        console.log("Feedback collected successfully!");
      } catch (err) {
        console.log("Err: Store the feedback failed");
        console.log(err);
      }
    }
  }
}

export default DB;
