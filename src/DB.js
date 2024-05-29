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
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            walletAddress: walletAddr,
            emailAddress: null,
            userInformation: {},
          });
          console.log("New user added");
        } else {
          console.log("User already exists");
        }
        const loginHistoryCollectionRef = collection(
          userDocRef,
          "loginHistory"
        );
        await addDoc(loginHistoryCollectionRef, {
          timestamp: serverTimestamp(),
        });
      } catch (err) {
        console.log("Err: Save user into DB failed", err);
      }
    }
  }

  async setTenancy({ tenantID }) {
    if (this.db !== null) {
      try {
        const tenantDocRef = doc(this.db, "tenants", tenantID);
        const tenantDocSnap = await getDoc(tenantDocRef);

        if (!tenantDocSnap.exists()) {
          // If tenant doesn't exist, create a new tenant document
          await setDoc(tenantDocRef, {
            tenantAddress: tenantID,
          });
          console.log("New tenant added");
        } else {
          console.log("Tenant already exists");
        }

        const loginHistoryCollectionRef = collection(
          tenantDocRef,
          "loginHistory"
        );
        await addDoc(loginHistoryCollectionRef, {
          timestamp: serverTimestamp(),
        });
        console.log("Login history updated");
      } catch (err) {
        console.log("Err: Save tenant into DB failed", err);
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
        console.log("Err: Set the engagement table failed", err);
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
    searchUrl,
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
          searchURL: searchUrl,
        });
        console.log(`DB: Search history updated with docID ${docRef.id}`);
        return docRef.id;
      } catch (err) {
        console.log("Error: Failed to Store the search history", err);
        return null;
      }
    }
  }

  async setShot({ shot }) {
    if (this.db !== null) {
      let shotId;
      try {
        shotId = shot.sid;
        const shotDocRef = doc(this.db, "shotInfo", shotId);
        const shotDoc = await getDoc(shotDocRef);
        if (shotDoc.exists()) {
          await updateDoc(shotDocRef, { tags: shot.tags });
        } else {
          await setDoc(shotDocRef, {
            start: shot.start,
            end: shot.end,
            versionHash: shot.iqHash,
            tags: shot.tags,
          });
        }
        console.log("shotId in DB", shotDocRef.id);
      } catch (err) {
        console.log(`Err: Save shot info for ${shotId} failed`, err);
      }
    }
  }

  async getShot({ shotId }) {
    if (!this.db) {
      return null;
    }

    try {
      const shotRef = doc(this.db, "shotInfo", shotId);
      const shot = await getDoc(shotRef);
      if (shot.exists()) {
        return shot.data();
      }
      return null;
    } catch (err) {
      console.log(`Err: Get shot ${shotId} failed`, err);
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
          contentHash + "_" + clipStart + "_" + clipEnd
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
