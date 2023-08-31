import React, { useState, useRef, useEffect } from "react";
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import {
  BiArrowFromTop,
  BiArrowToTop,
  BiDislike,
  BiLike,
} from "react-icons/bi";

const TagsPad = (props) => {
  const tags = useRef(
    props.searchVersion === "v2"
      ? {
          f_celebrity: [],
          f_landmark: [],
          f_logo: [],
          f_object: [],
          f_characters: [],
          f_segment: [],
          f_speech_to_text: [],
        }
      : {
          "Celebrity Detection": [],
          "Landmark Recognition": [],
          "Logo Detection": [],
          "Object Detection": [],
          "Optical Character Recognition": [],
          "Segment Labels": [],
          "Speech to Text": [],
        }
  );

  const shots = useRef({});

  const tagsMap =
    props.searchVersion === "v2"
      ? {
          f_celebrity: "Celebrity",
          f_landmark: "LandMark",
          f_logo: "Logo",
          f_object: "Object",
          f_characters: "OCR",
          f_segment: "Segment",
          f_speech_to_text: "STT",
        }
      : {
          "Celebrity Detection": "Celebrity",
          "Landmark Recognition": "LandMark",
          "Logo Detection": "Logo",
          "Object Detection": "Object",
          "Optical Character Recognition": "OCR",
          "Segment Labels": "Segment",
          "Speech to Text": "STT",
        };

  const [show, setShow] = useState(
    props.searchVersion === "v2"
      ? {
          f_celebrity: true,
          f_landmark: true,
          f_logo: true,
          f_object: true,
          f_characters: true,
          f_segment: true,
          f_speech_to_text: true,
        }
      : {
          "Celebrity Detection": true,
          "Landmark Recognition": true,
          "Logo Detection": true,
          "Object Detection": true,
          "Optical Character Recognition": true,
          "Segment Labels": true,
          "Speech to Text": true,
        }
  );

  const setRefresh = useState(false)[1];
  const [tagsReady, setTagsReady] = useState(false);
  const db = props.db;

  useEffect(() => {
    console.log("parsing tags");
    try {
      prepareTags().then(() => {
        console.log("Before clicking", props.prevS.current);
        setTagsReady(true);
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  const hash = (s) => {
    return s;
  };

  const pushShotToDB = (shot) => {
    if (db === null) {
      return;
    }
    console.log("pushing shot into DB ...... ");
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
        })
          .then(() => {
            console.log("shot updated successfully!");
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        setDoc(shotRef, {
          start: shot.start,
          end: shot.end,
          iqHash: shot.iqHash,
          "iqHash_start-end": shot.shotID,
          tags: shot.tags,
        })
          .then(() => {
            console.log("shot created successfully");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };

  const prepareTags = async () => {
    const _hasTags =
      props.searchVersion === "v2"
        ? Object.keys(props.clipInfo.sources[0].fields).some((k) => {
            return k in tags.current;
          })
        : "text" in props.clipInfo.sources[0].document;

    if (_hasTags) {
      const iqHash = props.clipInfo.hash;
      for (let src of props.clipInfo.sources) {
        const currdoc =
          props.searchVersion === "v2" ? src.fields : src.document;
        console.log(currdoc);
        const shotStart =
          props.searchVersion === "v2"
            ? currdoc.f_start_time
            : currdoc.start_time;
        const shotEnd =
          props.searchVersion === "v2" ? currdoc.f_end_time : currdoc.end_time;
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
        if (props.searchVersion === "v2") {
          let idx = 0;
          for (let k in tags.current) {
            if (!(k in currdoc)) {
              continue;
            }
            for (let i in currdoc[k]) {
              let text = currdoc[k][i];
              let dislikeState = 0;
              if (shotID in props.prevS.current) {
                const prevDislike =
                  props.prevS.current[shotID].tags[idx].feedback;
                if (props.searchID.current in prevDislike) {
                  dislikeState = prevDislike[props.searchID.current];
                }
              }
              const tag = {
                track: k,
                status: text,
                dislike: dislikeState,
                shotID: shotID,
                tagIdx: idx,
              };
              if (
                !tags.current[k].some(
                  (dictionary) =>
                    dictionary.status.toLowerCase() === tag.status.toLowerCase()
                )
              ) {
                tags.current[k].push(tag);
              }

              shot.tags.push({
                status: { track: k, text: text, idx: idx },
                feedback: { [props.searchID.current]: dislikeState },
              });
              idx = idx + 1;
            }
          }
        } else {
          let idx = 0;
          for (let k in tags.current) {
            for (let v of currdoc.text[k]) {
              for (let text of v.text) {
                let dislikeState = 0;
                if (shotID in props.prevS.current) {
                  const prevDislike =
                    props.prevS.current[shotID].tags[idx].feedback;
                  if (props.searchID.current in prevDislike) {
                    dislikeState = prevDislike[props.searchID.current];
                  }
                }
                const tag = {
                  track: k,
                  status: text,
                  dislike: dislikeState,
                  shotID: shotID,
                  tagIdx: idx,
                };
                if (
                  !tags.current[k].some(
                    (dictionary) =>
                      dictionary.status.toLowerCase() ===
                      tag.status.toLowerCase()
                  )
                ) {
                  tags.current[k].push(tag);
                }

                shot.tags.push({
                  status: { track: k, text: text, idx: idx },
                  feedback: { [props.searchID.current]: dislikeState },
                });

                idx = idx + 1;
              }
            }
          }
        }

        shots.current[shotID] = shot;
        pushShotToDB(shot);
      }
    }
  };

  const collect = async (lst, t, score) => {
    console.log("review tag");
    props.dislikeTagHook(t.track + t.status);
    const shotID = t.shotID;
    const currTags = shots.current[shotID].tags;
    const allIndices = currTags.reduce((indices, dic, idx) => {
      if (dic.status.text === t.status) {
        indices.push(idx);
      }
      return indices;
    }, []);
    allIndices.forEach((i) => {
      shots.current[shotID].tags[i].feedback[props.searchID.current] = score;
    });
    props.prevS.current = shots.current;
    console.log("After clicking", props.prevS.current);

    const idx = lst.findIndex((dic) => dic.status === t.status);
    lst[idx].dislike = score;
    setRefresh((v) => !v);

    if (db !== null) {
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
        console.log(err);
      }
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          Loading tags...
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
