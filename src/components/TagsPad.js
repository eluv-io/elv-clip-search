import React, { useState, useRef, useEffect } from "react";
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { BiArrowFromTop, BiArrowToTop, BiDislike, BiLike } from "react-icons/bi";

const TagsPad = (props) => {
  const tags = useRef({
    "f_celebrity": [],
    "f_landmark": [],
    "f_logo": [],
    "f_object": [],
    "f_characters": [],
    "f_segment": [],
    "f_speech_to_text": [],
  });

  const shots = useRef({});

  const tagsMap = {
    "f_celebrity": "Celebrity",
    "f_landmark": "LandMark",
    "f_logo": "logo",
    "f_object": "Object",
    "f_characters": "OCR",
    "f_segment": "Segment",
    "f_speech_to_text": "STT",
  };

  const [show, setShow] = useState({
    "f_celebrity": true,
    "f_landmark": true,
    "f_logo": true,
    "f_object": true,
    "f_characters": true,
    "f_segment": true,
    "f_speech_to_text": true,
  });

  const [refresh, setRefresh] = useState(false);
  const [tagsReady, setTagsReady] = useState(false);
  const db = props.db;



  useEffect(() => {
    console.log("parsing tags");
    try{
      prepareTags()
        .then(() => {
          // props.prevS.current = shots.current
          console.log("Before clicking", props.prevS.current)
          setTagsReady(true);
          setRefresh((v) => !v);
        })
      } catch(err) {
        console.log(err)
      }
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
    });
  };

  const prepareTags = async () => {
    const _hasTags = "f_start_time" in props.clipInfo.sources[0].fields && "f_end_time" in props.clipInfo.sources[0].fields;
    if (_hasTags) {
      const iqHash = props.clipInfo.hash;
      for (let src of props.clipInfo.sources) {
        const currdoc = src.fields;
        console.log(currdoc)
        const shotStart = currdoc.f_start_time
        const shotEnd = currdoc.f_end_time
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
          if (!(k in currdoc)) {
            continue
          }
          for (let i in currdoc[k]) {
            let text = currdoc[k][i]
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
            // const start = v.start_time - shotStart
            // const startmin = Math.floor((start/60000) << 0);
            // const startsec = ((start % 60000) / 1000).toFixed(0);
            // const end = v.end_time - shotStart
            // const endmin = Math.floor((end/60000) << 0);
            // const endsec = ((end % 60000) / 1000).toFixed(0);
            // const timeline = `${startmin}:${(startsec < 10 ? '0' : '')}${startsec} - ${endmin}:${(endsec < 10 ? '0' : '')}${endsec}`
            // console.log(text, timeline)
            // console.log(v.start_time, v.end_time, shotStart, shotEnd)
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

            shot.tags.push({
              status: { track: k, text: text, idx: idx },
              feedback: { [props.searchID.current]: dislikeState },
            });
            // props.initializePrevShots(shotID, {
            //   status: { track: k, text: text, idx: idx },
            //   feedback: { [props.searchID]: dislikeState },
            // })

            idx = idx + 1;
          }
        }
        shots.current[shotID] = shot;
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