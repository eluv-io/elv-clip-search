import React, { useState, useRef, useEffect } from "react";
import { isEqual } from "lodash";
import { toTimeString } from "../utils";
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { BiArrowFromTop, BiArrowToTop, BiDislike } from "react-icons/bi";

const TagsPad = (props) => {
  const tags = useRef({
    "Celebrity Detection": [],
    "Landmark Recognition": [],
    "Logo Detection": [],
    "Object Detection": [],
    "Optical Character Recognition": [],
    "Segment Labels": [],
    "Speech to Text": [],
  });

  const shots = useRef({});

  const tagsMap = {
    "Celebrity Detection": "Celebrity",
    "Landmark Recognition": "LandMark",
    "Logo Detection": "logo",
    "Object Detection": "Object",
    "Optical Character Recognition": "OCR",
    "Segment Labels": "Segment",
    "Speech to Text": "STT",
  };

  const [show, setShow] = useState({
    "Celebrity Detection": true,
    "Landmark Recognition": true,
    "Logo Detection": true,
    "Object Detection": true,
    "Optical Character Recognition": true,
    "Segment Labels": true,
    "Speech to Text": true,
  });

  const [refresh, setRefresh] = useState(false);
  const db = props.db;
  const shotInfoRef = collection(db, "Shot_info");

  // TODO maybe need a Hash to reduce the length
  const hash = (s) => {
    return s;
  };

  // TODO check if shotID exists in DB
  const shotInDB = (shotID) => {
    console.log("checking if shot is already in DB ...... ");
    const shotRef = doc(shotInfoRef, shotID);
    getDoc(shotRef).then((shot) => {
      if (shot.exists()) {
        return true
      } else {
        return false
      }
    })
    return false;
  };

  // TODO push the shot and its tags to DB
  const pushShotT0oDB = (shot) => {
    console.log("pushing shot into DB ...... ");
    console.log(shot)
  };

  // TODO prepareTags
  const prepareTags = () => {
    const _hasTags = "text" in props.clipInfo.sources[0].document;
    if (_hasTags) {
      const iqHash = props.clipInfo.hash;
      for (let src of props.clipInfo.sources) {
        const doc = src.document;
        const shotID = hash(
          iqHash + doc.start_time + "-" + doc.end_time
        );
        const inDB = shotInDB(shotID);
        const shot = {
          iqHash: iqHash,
          start: doc.start_time,
          end: doc.end_time,
          shotID: shotID,
          tags: [],
          inDB: inDB,
        };

        // tag index inside one shot
        // since tags in shot is saved as a list, can use this index directly target at that tag
        let idx = 0;
        // TODO
        for (let k in tags.current) {
          for (let v of doc.text[k]) {
            for (let text of v.text) {
              const dic = {
                status: 
                  text
                  // toTimeString(
                  //   Math.max(0, v.start_time - doc.start_time)
                  // ).slice(3) +
                  //   "-" +
                  //   toTimeString(
                  //     Math.min(
                  //       v.end_time - doc.start_time,
                  //       doc.end_time - doc.start_time
                  //     )
                  //   ).slice(3),
                ,
                dislike: {[props.searchID]: false},
                shotID: shotID,
                tagIdx: idx,
              };
              if (!tags.current[k].some(dictionary => dictionary.status === dic.status)) {
                tags.current[k].push(dic); 
              }

              // save tags into shot
              shot.tags.push({
                track: k,
                text: text,
                idx: idx,
              });

              // idx +1
              idx = idx + 1;
            }
          }
        }
        shots.current[shotID] = shot;
      }
    }
    setRefresh((v) => !v);
  };

  useEffect(() => {
    console.log("parsing tags");
    prepareTags();
  }, []);

  // TODO Need to change from "pushing the dislike state to clip-info table" to "pushing to shot table"
  const thumbsDown = async (lst, t) => {
    console.log(shots.current);
    console.log(tags.current)
    const idx = lst.findIndex((dic) => isEqual(dic, t));
    lst[idx].dislike = true;
    console.log("You disliked me");

    const clipInfo = props.clipInfo;
    const clipRank = clipInfo.rank;
    const clipInfoRef = collection(db, "Clip_info");
    const clipStart = clipInfo.start;
    const clipEnd = clipInfo.end;
    const contentHash = clipInfo.hash;
    const clipRef = doc(
      clipInfoRef,
      contentHash + "_" + clipStart + "-" + clipEnd
    );
    const clip = await getDoc(clipRef);
    if (!clip.exists()) {
      setDoc(clipRef, {
        contentHash: contentHash,
        start_time: clipStart,
        end_time: clipEnd,
        rank: [{ saerchID: props.searchID, rank: clipRank }],
        tags: tags.current,
      }).then(() => {
        console.log("clip stored successfully!");
      });
    } else {
      const tempRank = clip.data().rank;
      if (
        !(
          tempRank[tempRank.length - 1].rank === clipRank &&
          tempRank[tempRank.length - 1].saerchID === props.searchID
        )
      ) {
        tempRank.push({ saerchID: props.searchID, rank: clipRank });
        updateDoc(clipRef, {
          rank: tempRank,
        }).then(() => {
          console.log("clip rank updated successfully!");
        });
      }
      updateDoc(clipRef, {
        tags: tags.current,
      }).then(() => {
        console.log("clip feedback updated successfully!");
      });
    }
    setRefresh((v) => !v);
  };

  return (
    <div
      style={{
        width: "100%",
        maxHeight: 360,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        overflowY: "scroll",
        scrollbarWidth: "thin",
      }}
    >
      {Object.keys(tags.current).map((k) => {
        return tags.current[k].length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "95%",
              marginBottom: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                backgroundColor: "lightgray",
                marginTop: 10,
                marginBottom: 10,
                paddingLeft: 5,
                paddingRight: 5,
                borderRadius: 5,
              }}
            >
              <div>{tagsMap[k]}</div>
              <button
                style={{ border: "none", backgroundColor: "lightgray" }}
                onClick={() => {
                  const newStatus = {};
                  for (let kk in show) {
                    if (kk === k) {
                      newStatus[kk] = !show[kk];
                    } else {
                      newStatus[kk] = show[kk];
                    }
                  }

                  setShow(newStatus);
                }}
              >
                {show[k] ? <BiArrowToTop /> : <BiArrowFromTop />}
              </button>
            </div>
            {show[k] &&
              tags.current[k].map((t) => (
                <div
                  style={{
                    width: "90%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingLeft: "5%",
                    backgroundColor: "#E6E6E6",
                    borderRadius: 10,
                    marginBottom: 3,
                  }}
                >
                  {t.status}
                  <div>
                    <button
                      style={{ border: "none", backgroundColor: "#E6E6E6" }}
                      onClick={() => thumbsDown(tags.current[k], t)}
                    >
                      <BiDislike
                        style={{
                          color: t.dislike[props.searchID] ? "red" : "black",
                        }}
                      />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : null;
      })}
    </div>
  );
};

export default TagsPad;
