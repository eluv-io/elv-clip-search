import React, { useState } from "react";
import { isEqual } from "lodash";
import { toTimeString } from "../utils";
import {
  collection, doc, setDoc, Timestamp, getDoc, updateDoc
} from 'firebase/firestore' ;
const TagsPad = (props) => {
  const tags = {
    "Celebrity Detection": [],
    "Landmark Recognition": [],
    "Logo Detection": [],
    "Object Detection": [],
    "Optical Character Recognition": [],
    "Segment Labels": [],
    "Speech to Text": [],
  };

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

  
  const thumbsDown = async (lst, t) => {
    const idx = lst.findIndex((dic) => isEqual(dic, t));
    lst[idx].dislike = true;
    console.log("You disliked me");
    
    const clipInfo = props.clipInfo;
    const clipRank = clipInfo.rank
    const db = props.db;
    const clipInfoRef = collection(db, 'Clip_info');
    const clipStart = clipInfo.start;
    const clipEnd = clipInfo.end;
    const contentHash = clipInfo.hash;
    const clipRef = doc(clipInfoRef, contentHash + "_" + clipStart + "-" + clipEnd);
    const clip = await getDoc(clipRef);
    if (!clip.exists()) {
      setDoc(clipRef, {
          contentHash: contentHash,
          start_time: clipStart,
          end_time: clipEnd,
          rank: [{saerchID: props.searchID, rank: clipRank}],
          tags: tags
      }).then(() => {
          console.log("clip stored successfully!");
      })
    } else {
        const tempRank = clip.data().rank;
        if (!(tempRank[tempRank.length - 1].rank === clipRank && 
              tempRank[tempRank.length - 1].saerchID === props.searchID)) {
          tempRank.push({saerchID: props.searchID, rank: clipRank});
          updateDoc(clipRef, {
              rank: tempRank,
          }).then(() => {
            console.log("clip rank updated successfully!");
          })
        }
        updateDoc(clipRef, {
          tags: tags
        }).then(() => {
          console.log("clip feedback updated successfully!");
        })
    }
  };

  const hasTags = "text" in props.clipInfo.sources[0].document;

  if (hasTags) {
    for (let src of props.clipInfo.sources) {
      const doc = src.document;
      for (let k in tags) {
        for (let v of doc.text[k]) {
          for (let text of v.text) {
            const dic = {
              status: [text, toTimeString(v.start_time - doc.start_time).slice(3) +
                "-" +
                toTimeString(v.end_time - doc.start_time).slice(3)], 
              dislike: false
              // [text]: null,
              // [toTimeString(v.start_time - doc.start_time).slice(3) +
              // "-" +
              // toTimeString(v.end_time - doc.start_time).slice(3)]: null,
            };
            tags[k].push(dic);
          }
        }
      }
    }

    // for (const k in tags) {
    //   // Modify the element
    //   const temp = tags[k].map(x => ({[x]: null}));
    //   console.log(typeof(temp))
    //   // const temp = tags[k].map(x => ({x: null}))
    //   for (let j = 0; j < tags[k].length; j++) {
    //     const temp = tags[k][j];
    //     // console.log(temp);
    //     tags[k][j] = {[tags[k][j]]: null};
    //     // console.log(tags[k], tags[k][j])
    //   }
    // }
  }

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
      {Object.keys(tags).map((k) => {
        return tags[k].length > 0 ? (
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
                {show[k] ? "⏫️" : "👀"}
              </button>
            </div>
            {show[k] &&
              tags[k].map((t) => (
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
                  {t.status.join(" ")}
                  <div>
                    <button
                      style={{ border: "none", backgroundColor: "#E6E6E6" }}
                      onClick={() => thumbsDown(tags[k], t)}
                    >
                      👎
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
