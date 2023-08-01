import React, { useState, useRef, useEffect } from "react";
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { BiArrowFromTop, BiArrowToTop, BiDislike, BiLike } from "react-icons/bi";
import { select } from "./ExtractDes";

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

  const git = useRef({})

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
  const [tagsReady, setTagsReady] = useState(false);
  const db = props.db;



  useEffect(() => {
    console.log("parsing tags");
    prepareTags()
      .then(() => {
        git.current = select(git.current)
        console.log(git.current)
        tags.current["Object Detection"] = []
        for (const s in git.current) {
          for (const d in git.current[s]) {
            if (!tags.current["Object Detection"].some(
              (dic) => dic.status.toLowerCase() === git.current[s][d].status.toLowerCase())
            )
            tags.current["Object Detection"].push(git.current[s][d])
          }
        }
        console.log(tags.current)
        setTagsReady(true);
        setRefresh((v) => !v);
      }).catch((err) => {
        console.log(err)
      })
  }, []);

  const hash = (s) => {
    return s;
  };

  const pushShotToDB = (shot) => {
    console.log("pushing shot into DB ...... ");
    if (db === null) {
      return
    }
    const shotInfoRef = collection(db, "Shot_info");
    const shotRef = doc(shotInfoRef, shot.shotID);
    getDoc(shotRef).then((s) => {
      if (s.exists()) {
        updateDoc(shotRef, {
          start: shot.start,
          end: shot.end,
          iqHash: shot.iqHash,
          "iqHash_start-end": shot.shotID,
          tags: shot.tags,
        }).then(() => {
          console.log("shot updated successfully!");
        }).catch((err) => {
          console.log(err);
        });
      } else {
        setDoc(shotRef, {
          start: shot.start,
          end: shot.end,
          iqHash: shot.iqHash,
          "iqHash_start-end": shot.shotID,
          tags: shot.tags,
        }).then(() => {
          console.log("shot created successfully");
        }).catch((err) => {
          console.log(err);
        })
      }
    }).catch((err) => {
      console.log(err);
    });
  };

  const prepareTags = async () => {
    const _hasTags = "text" in props.clipInfo.sources[0].document;
    if (_hasTags) {
      const iqHash = props.clipInfo.hash;
      for (let src of props.clipInfo.sources) {
        const currdoc = src.document;
        const shotStart = currdoc.start_time
        const shotEnd = currdoc.end_time
        const shotID = hash(iqHash + "_" + shotStart + "-" + shotEnd);
        const shot = {
          iqHash: iqHash,
          start: shotStart,
          end: shotEnd,
          shotID: shotID,
          tags: [],
        };

        // tag index inside one shot
        // since tags in shot is saved as a list, can use this index directly target at that tag
        let idx = 0;
        for (let k in tags.current) {
          for (let v of currdoc.text[k]) {
            for (let text of v.text) {
              let dislikeState = 0;
              // if (shotID in props.prevShots && props.prevShots[shotID].tags.length !== 0) {
              if (shotID in props.prevS.current) {
                // console.log(props.prevShots[shotID].tags)
                const prevDislike = props.prevS.current[shotID].tags[idx].feedback
                // console.log("prevDislike", prevDislike)
                // console.log(props.searchID)
                if (props.searchID.current in prevDislike) {
                  // console.log(prevDislike[props.searchID])
                  dislikeState = prevDislike[props.searchID.current]
                }
              }
              const dic = {
                track: k,
                status: text,
                dislike: dislikeState,
                shotID: shotID,
                tagIdx: idx,
              };
              if (
                !tags.current[k].some(
                  (dictionary) => dictionary.status.toLowerCase() === dic.status.toLowerCase()
                )
              ) {
                tags.current[k].push(dic);
              }

              if (k === "Object Detection") {
                if (shotID in git.current) {
                  git.current[shotID].push(dic);
                } else {
                  git.current[shotID] = [];
                  git.current[shotID].push(dic)
                }
              }

              shot.tags.push({
                status: { track: k, text: text, idx: idx },
                feedback: { [props.searchID.current]: dislikeState },
              });

              idx = idx + 1;
            }
          }
        }
        shots.current[shotID] = shot;
        // console.log(tags.current["Object Detection"])
        // tags.current["Object Detection"] = select(tags.current["Object Detection"], shotID)
        pushShotToDB(shot);
      }
    }
  };


  const collect = async (lst, t, score) => {
    console.log("You disliked me");
    props.dislikeTagHook(t.track + t.status);
    const shotID = t.shotID;
    const currTags = shots.current[shotID].tags;
    const allIndices = currTags.reduce((indices, dic, idx) => {
      if (dic.status.text === t.status) {
        indices.push(idx);
      }
      return indices;
    }, [])
    allIndices.forEach((i) => {
      shots.current[shotID].tags[i].feedback[props.searchID.current] = score;
      // props.updatePrevShots(shotID, i, score)
    })
    // props.setShots(shots.current)
    props.prevS.current = shots.current
    // console.log(shots.current, props.prevS.current)
    console.log("After clicking", props.prevS.current)
    
    const idx = lst.findIndex((dic) => dic.status === t.status);
    lst[idx].dislike = score;
    setRefresh((v) => !v);
    pushShotToDB(shots.current[shotID]);

    const clipInfo = props.clipInfo;
    const clipRank = clipInfo.rank;
    const clipStart = clipInfo.start;
    const clipEnd = clipInfo.end;
    const contentHash = clipInfo.hash;

    try {
      const clipInfoRef = collection(db, "Clip_info");
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
          rank: [{ searchID: props.searchID.current, rank: clipRank }],
          shots: Object.keys(shots.current),
        }).then(() => {
          console.log("clip stored successfully!");
        });
      } else {
        const tempRank = clip.data().rank;
        if (
          !(
            tempRank[tempRank.length - 1].rank === clipRank &&
            tempRank[tempRank.length - 1].searchID === props.searchID.current
          )
        ) {
          tempRank.push({ searchID: props.searchID.current, rank: clipRank });
          updateDoc(clipRef, {
            rank: tempRank,
          }).then(() => {
            console.log("clip rank updated successfully!");
          });
        }
      }
    } catch (err) {
      console.log(err)
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
      {!tagsReady ? (
        <div style={
          {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
          }
        }>Loading tags... 
        </div>
        
      ) : null}

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
                  //TODO add globally unique keys
                  // key={}
                >
                  {t.status}
                  <div>

                    <button
                      style={{ border: "none", backgroundColor: "transparent" }}
                      onClick={() => collect(tags.current[k], t, 1)}
                    >
                      <BiLike
                        style={{
                          color: t.dislike === 1 ? "#EAA14F" : "black",
                        }}
                      />
                    </button>

                    <button
                      style={{ border: "none", backgroundColor: "transparent" }}
                      onClick={() => collect(tags.current[k], t, -1)}
                    >
                      <BiDislike
                        style={{
                          color: t.dislike === -1 ? "#EAA14F" : "black",
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
