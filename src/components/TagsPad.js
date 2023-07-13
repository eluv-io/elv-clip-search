import React, { useState, useRef, useEffect } from "react";
import { isEqual } from "lodash";
import { toTimeString } from "../utils";
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
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

  const [hasTags, setHasTags] = useState(null);

  // TODO maybe need a Hash to reduce the length
  const hash = (s) => {
    return s;
  };

  // TODO check if shotID exists in DB
  const shotInDB = (shotID) => {
    console.log("checking if shot is already in DB ...... ");
    return false;
  };

  // TODO push the shot and its tags to DB
  const pushShotToDB = (shot) => {
    console.log("pushing shot into DB ...... ");
  };

  // TODO prepareTags
  const prepareTags = () => {
    const _hasTags = "text" in props.clipInfo.sources[0].document;
    if (_hasTags) {
      const iqHash = props.clipInfo.hash;
      for (let src of props.clipInfo.sources) {
        const doc = src.document;
        const shotID = hash(
          iqHash + toString(doc.start_time) + toString(doc.end_time)
        );
        const inDB = shotInDB();
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
                status: [
                  text,
                  toTimeString(
                    Math.max(0, v.start_time - doc.start_time)
                  ).slice(3) +
                    "-" +
                    toTimeString(
                      Math.min(
                        v.end_time - doc.start_time,
                        doc.end_time - doc.start_time
                      )
                    ).slice(3),
                ],
                dislike: false,
                shotID: shotID,
                tagIdx: idx,
              };
              tags.current[k].push(dic);

              // save tags into shot
              shot.tags.push({
                track: k,
                text: text,
                start: v.start_time,
                end: v.end_time,
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
    setHasTags(_hasTags);
  };

  useEffect(() => {
    console.log("parsing tags");
    prepareTags();
  }, []);

  // TODO Need to change from "pushing the dislike state to clip-info table" to "pushing to shot table"
  const thumbsDown = async (lst, t) => {
    // adjust the color of the icon
    // console.log(`thumbs down${t}`)
    const svgElement = document.getElementById(
      `thumbs down${JSON.stringify(t.status)}`
    );
    // svgElement.setAttribute("data-shaded", "true");
    // if (!svgElement === null) {
    svgElement.style.background = "rgba(0, 0, 0, 0.3)";
    // }

    const idx = lst.findIndex((dic) => isEqual(dic, t));
    lst[idx].dislike = true;
    console.log("You disliked me");

    const clipInfo = props.clipInfo;
    const clipRank = clipInfo.rank;
    const db = props.db;
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
                {show[k] ? (
                  // <svg xmlns="http://www.w3.org/2000/svg" height="1.25em" viewBox="0 0 512 512"><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM135.1 217.4c-4.5 4.2-7.1 10.1-7.1 16.3c0 12.3 10 22.3 22.3 22.3H208v96c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V256h57.7c12.3 0 22.3-10 22.3-22.3c0-6.2-2.6-12.1-7.1-16.3L269.8 117.5c-3.8-3.5-8.7-5.5-13.8-5.5s-10.1 2-13.8 5.5L135.1 217.4z"/></svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1.25em"
                    viewBox="0 0 512 512"
                  >
                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM135.1 217.4l107.1-99.9c3.8-3.5 8.7-5.5 13.8-5.5s10.1 2 13.8 5.5l107.1 99.9c4.5 4.2 7.1 10.1 7.1 16.3c0 12.3-10 22.3-22.3 22.3H304v96c0 17.7-14.3 32-32 32H240c-17.7 0-32-14.3-32-32V256H150.3C138 256 128 246 128 233.7c0-6.2 2.6-12.1 7.1-16.3z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1.25em"
                    viewBox="0 0 512 512"
                  >
                    <path d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM376.9 294.6L269.8 394.5c-3.8 3.5-8.7 5.5-13.8 5.5s-10.1-2-13.8-5.5L135.1 294.6c-4.5-4.2-7.1-10.1-7.1-16.3c0-12.3 10-22.3 22.3-22.3l57.7 0 0-96c0-17.7 14.3-32 32-32l32 0c17.7 0 32 14.3 32 32l0 96 57.7 0c12.3 0 22.3 10 22.3 22.3c0 6.2-2.6 12.1-7.1 16.3z" />
                  </svg>
                )}
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
                  {t.status.join(" ")}
                  <div>
                    <button
                      style={{ border: "none", backgroundColor: "#E6E6E6" }}
                      onClick={() => thumbsDown(tags.current[k], t)}
                    >
                      {/* https://fontawesome.com/icons/thumbs-down?f=classic&s=regular&sz=2xl&pc=%2341464e */}
                      <svg
                        id={`thumbs down${JSON.stringify(t.status)}`}
                        xmlns="http://www.w3.org/2000/svg"
                        height="2em"
                        viewBox="0 0 512 512"
                      >
                        <path d="M323.8 477.2c-38.2 10.9-78.1-11.2-89-49.4l-5.7-20c-3.7-13-10.4-25-19.5-35l-51.3-56.4c-8.9-9.8-8.2-25 1.6-33.9s25-8.2 33.9 1.6l51.3 56.4c14.1 15.5 24.4 34 30.1 54.1l5.7 20c3.6 12.7 16.9 20.1 29.7 16.5s20.1-16.9 16.5-29.7l-5.7-20c-5.7-19.9-14.7-38.7-26.6-55.5c-5.2-7.3-5.8-16.9-1.7-24.9s12.3-13 21.3-13L448 288c8.8 0 16-7.2 16-16c0-6.8-4.3-12.7-10.4-15c-7.4-2.8-13-9-14.9-16.7s.1-15.8 5.3-21.7c2.5-2.8 4-6.5 4-10.6c0-7.8-5.6-14.3-13-15.7c-8.2-1.6-15.1-7.3-18-15.2s-1.6-16.7 3.6-23.3c2.1-2.7 3.4-6.1 3.4-9.9c0-6.7-4.2-12.6-10.2-14.9c-11.5-4.5-17.7-16.9-14.4-28.8c.4-1.3 .6-2.8 .6-4.3c0-8.8-7.2-16-16-16H286.5c-12.6 0-25 3.7-35.5 10.7l-61.7 41.1c-11 7.4-25.9 4.4-33.3-6.7s-4.4-25.9 6.7-33.3l61.7-41.1c18.4-12.3 40-18.8 62.1-18.8H384c34.7 0 62.9 27.6 64 62c14.6 11.7 24 29.7 24 50c0 4.5-.5 8.8-1.3 13c15.4 11.7 25.3 30.2 25.3 51c0 6.5-1 12.8-2.8 18.7C504.8 238.3 512 254.3 512 272c0 35.3-28.6 64-64 64l-92.3 0c4.7 10.4 8.7 21.2 11.8 32.2l5.7 20c10.9 38.2-11.2 78.1-49.4 89zM32 384c-17.7 0-32-14.3-32-32V128c0-17.7 14.3-32 32-32H96c17.7 0 32 14.3 32 32V352c0 17.7-14.3 32-32 32H32z" />
                      </svg>
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
