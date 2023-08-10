import React, { useState, useRef, useEffect } from "react";
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import {
  BiArrowFromTop,
  BiArrowToTop,
  BiDislike,
  BiLike,
} from "react-icons/bi";

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

  const setRefresh = useState(false)[1];
  const [tagsReady, setTagsReady] = useState(false);

  useEffect(() => {
    console.log("parsing tags");
    try {
      prepareTags().then(() => {
        console.log("Before clicking", props.shotsMemo.current);
        setTagsReady(true);
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  const prepareTags = async () => {
    if ("text" in props.clipInfo.sources[0].document) {
      const contentHash = props.clipInfo.hash;
      for (let src of props.clipInfo.sources) {
        const currdoc = src.document;
        const shotStart = currdoc.start_time;
        const shotEnd = currdoc.end_time;
        const shotId = contentHash + "_" + shotStart + "-" + shotEnd;
        const shot = {
          iqHash: contentHash,
          start: shotStart,
          end: shotEnd,
          shotId: shotId,
          tags: [],
        };
        let needToPush = false;
        // try to see  if we have  this shot in Memo, if not, try to load from DB.
        // the shot from DB could be null as well
        if (props.shotsMemo.current[shotId] == null) {
          console.log("trying to load from DB");
          if (props.dbClient !== null) {
            const shotInDB = await props.dbClient.getShot({ shotId });
            if (shotInDB == null) {
              needToPush = true;
            } else {
              props.shotsMemo.current[shotId] = shotInDB;
            }
          }
        }
        // tag index inside one shot
        // since tags in shot is saved as a list, can use this index directly target at that tag
        let idx = 0;
        for (let k in tags.current) {
          for (let v of currdoc.text[k]) {
            for (let text of v.text) {
              let dislikeState = 0;
              if (props.shotsMemo.current[shotId] != null) {
                const prevDislike =
                  props.shotsMemo.current[shotId].tags[idx].feedback;
                if (props.searchId in prevDislike) {
                  dislikeState = prevDislike[props.searchId];
                }
              }
              const dic = {
                track: k,
                status: text,
                dislike: dislikeState,
                shotId: shotId,
                tagIdx: idx,
              };
              if (
                !tags.current[k].some(
                  (dictionary) =>
                    dictionary.status.toLowerCase() === dic.status.toLowerCase()
                )
              ) {
                tags.current[k].push(dic);
              }

              shot.tags.push({
                status: { track: k, text: text, idx: idx },
                feedback: { [props.searchId]: dislikeState },
              });
              idx = idx + 1;
            }
          }
        }
        // save only when we do not have that shot in shotsMemo
        if (props.shotsMemo.current[shotId] == null) {
          props.shotsMemo.current[shotId] = shot;
          if (needToPush && props.dbClient !== null) {
            await props.dbClient.setShot({ shot });
          }
        }
      }
    }
  };

  const collect = async (lst, t, score) => {
    console.log("You disliked me");
    const shotId = t.shotId;
    const currTags = props.shotsMemo.current[shotId].tags;
    const allIndices = currTags.reduce((indices, dic, idx) => {
      if (dic.status.text === t.status) {
        indices.push(idx);
      }
      return indices;
    }, []);
    allIndices.forEach((i) => {
      props.shotsMemo.current[shotId].tags[i].feedback[props.searchID.current] =
        score;
    });
    props.shotsMemo.current = props.shotsMemo.current;
    console.log("After clicking", props.shotsMemo.current);

    const idx = lst.findIndex((dic) => dic.status === t.status);
    lst[idx].dislike = score;
    setRefresh((v) => !v);
    try {
      if (props.dbClient.current !== null) {
        await props.dbClient.setShot({ shot: props.shotsMemo.current[shotId] });
      }
    } catch (err) {
      console.log(err);
    }

    const clipInfo = props.clipInfo;
    const clipRank = clipInfo.rank;
    const clipStart = clipInfo.start;
    const clipEnd = clipInfo.end;
    const contentHash = clipInfo.hash;
    try {
      if (props.dbClient.current !== null) {
        await props.dbClient.setClip({
          searchId: props.searchId,
          contentHash,
          clipStart,
          clipEnd,
          clipRank,
          shotIds: Object.keys(props.shotsMemo.current),
        });
      }
    } catch (err) {
      console.log(err);
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
