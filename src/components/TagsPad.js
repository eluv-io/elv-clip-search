import React, { useState, useRef, useEffect } from "react";
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

  // TODO push the shot and its tags to DB
  const pushShotToDB = (shot) => {
    console.log("pushing shot into DB ...... ");
    console.log(shot);

    // TODO加判断是否在DB
    const shotRef = doc(shotInfoRef, shot.shotID);
    getDoc(shotRef).then((s) => {
      if (s.exists()) {
        updateDoc(shotRef, {
          tags: shot.tags,
        }).then(() => {
          console.log("shot updated successfully!");
        });
      } else {
        setDoc(shotRef, {
          start: shot.start,
          end: shot.end,
          iqHash: shot.iqHash,
          shotID: shot.shotID,
          tags: shot.tags,
        }).then(() => {
          console.log("shot created successfully");
        });
      }
    });
  };

  // TODO prepareTags
  const prepareTags = async () => {
    const _hasTags = "text" in props.clipInfo.sources[0].document;
    if (_hasTags) {
      const iqHash = props.clipInfo.hash;
      for (let src of props.clipInfo.sources) {
        const doc = src.document;
        const shotID = hash(iqHash + doc.start_time + "-" + doc.end_time);
        // const inDB = await shotInDB(shotID);
        const shot = {
          iqHash: iqHash,
          start: doc.start_time,
          end: doc.end_time,
          shotID: shotID,
          tags: [],
          // inDB: inDB,
        };

        // tag index inside one shot
        // since tags in shot is saved as a list, can use this index directly target at that tag
        let idx = 0;
        // TODO
        for (let k in tags.current) {
          for (let v of doc.text[k]) {
            for (let text of v.text) {
              const dic = {
                track: k,
                status: text,
                dislike: props.dislikedTags.includes(k + text) ? true : false,
                shotID: shotID,
                tagIdx: idx,
              };
              if (
                !tags.current[k].some(
                  (dictionary) => dictionary.status === dic.status
                )
              ) {
                tags.current[k].push(dic);
              }

              // save tags into shot
              shot.tags.push({
                status: { track: k, text: text, idx: idx },
                feedback: { [props.searchID]: props.dislikedTags.includes(k + text) ? true : false },
              });

              // idx +1
              idx = idx + 1;
            }
          }
        }
        shots.current[shotID] = shot;
        pushShotToDB(shot);
      }
    }
  };

  useEffect(() => {
    console.log("parsing tags");
    prepareTags()
      .then(() => {
        setRefresh((v) => !v);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // TODO Need to change from "pushing the dislike state to clip-info table" to "pushing to shot table"
  const thumbsDown = async (lst, t) => {
    console.log("You disliked me");
    props.dislikeTagHook(t.track + t.status);
    const shotID = t.shotID;
    const idx = lst.findIndex((dic) => dic.status === t.status);
    // console.log("lalallallallallla", lst[idx].dislike)
    lst[idx].dislike = true;
    const tagIdx = t.tagIdx;
    shots.current[shotID].tags[tagIdx].feedback[props.searchID] = true;
    // console.log("updatedshots", shots.current);
    // console.log("updatedtags", tags.current);
    setRefresh((v) => !v);
    pushShotToDB(shots.current[shotID]);

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
        shots: Object.keys(shots.current),
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
      // updateDoc(clipRef, {
      //   tags: tags.current,
      // }).then(() => {
      //   console.log("clip feedback updated successfully!");
      // });
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxHeight: 660,
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
                    backgroundColor: "transparent",
                    borderRadius: 10,
                    marginBottom: 3,
                  }}
                >
                  {t.status}
                  <div>
                    <button
                      style={{ border: "none", backgroundColor: "transparent" }}
                      onClick={() => thumbsDown(tags.current[k], t)}
                    >
                      <BiDislike
                        style={{
                          color: t.dislike ? "#EAA14F" : "black",
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
