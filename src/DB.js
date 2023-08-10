import firebaseConfig from "./configuration";
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
} from "firebase/firestore";

class DB {
  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  async setUser({ clientAddr }) {
    if (this.db !== null) {
      try {
        const userDocRef = doc(this.db, "User", clientAddr);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          console.log("User already exists");
        } else {
          await setDoc(userDocRef, {
            Client_address: clientAddr,
            Wallet_id: null,
            Email_add: null,
            Creation_time: null,
            Updated_time: null,
            Personal_info: {},
          });
        }
      } catch (err) {
        console.log("Err: Save user into DB failed");
      }
    }
  }

  async setEngagement({ searchId, clientAddr, engagement, init }) {
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
        console.log("Err: Set the engagement table failed");
        console.log(err);
      }
    }
  }

  async setSearchHistory({
    clientAddr,
    fuzzySearchPhrase,
    fuzzySearchFields,
    searchKeywords,
  }) {
    if (this.db !== null) {
      try {
        const colRef = collection(this.db, "Search_history");
        const now = Timestamp.now().toDate().toUTCString();
        const docRef = await addDoc(colRef, {
          client: clientAddr,
          search_time: now,
          fuzzySearchPhrase: fuzzySearchPhrase,
          fuzzySearchFields: fuzzySearchFields,
          searchKeywords: searchKeywords,
        });
        console.log(`search history updated with docID ${docRef.id}`);
        return docRef.id;
      } catch (err) {
        console.log("Err: Store the search history failed");
        console.log(err);
        return null;
      }
    }
  }

  async setShot({ shot }) {
    if (this.db !== null) {
      try {
        const shotDocRef = doc(this.db, "Shot_info", shot.shotId);
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
        const shotRef = doc(this.db, "Shot_info", shotId);
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
          "Clip_info",
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

  async getFeedback({ clientAddr, clipHash, searchId }) {
    if (this.db !== null) {
      try {
        const userRef = collection(this.db, "Feedback", clientAddr, "Data");
        const q = query(
          userRef,
          where("clipHash", "==", clipHash),
          where("search_id", "==", searchId),
          orderBy("feedback_time", "desc"),
          limit(1)
        );
        const res = await getDocs(q);
        return res;
      } catch (err) {
        console.log(
          `Err: Get feedback for client ${clientAddr} on clip ${clipHash} in search ${searchId} failed`
        );
        return [];
      }
    } else {
      return [];
    }
  }

  async setFeedback({
    clientAddr,
    clipHash,
    searchId,
    score,
    reason,
    otherReasons,
  }) {
    if (this.db !== null) {
      try {
        const userRef = collection(this.db, "Feedback", clientAddr, "Data");
        const now = Timestamp.now()
          .toDate()
          .toString()
          .replace(/\([^()]*\)/g, "");
        const docRef = doc(userRef, now);
        await setDoc(docRef, {
          client: clientAddr,
          feedback_time: new Date(now),
          rating: score,
          clipHash: clipHash,
          reason: reason,
          other_reasons: otherReasons,
          search_id: searchId,
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
