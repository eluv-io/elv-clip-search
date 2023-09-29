import React, { useState, useRef, useEffect } from "react";
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

  useEffect(() => {
    try {
      prepareTags().then(() => {
        setTagsReady(true);
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  const prepareTags = async () => {
    const sourceFields =
      props.searchVersion === "v2" && props.searchAssets
        ? props.clipInfo.fields
        : props.clipInfo.sources[0].fields;
    let _hasTags =
      props.searchVersion === "v2"
        ? Object.keys(sourceFields).some((k) => k in tags.current)
        : "text" in props.clipInfo.sources[0].document;

    console.log("parsing tags");
    if (_hasTags) {
      const contentHash = props.clipInfo.hash;
      let sourceData = props.searchAssets
        ? [props.clipInfo]
        : props.clipInfo.sources;
      for (let src of sourceData) {
        // each represents a shot
        // in asset mode, we have extra useful content related information
        // in clip mode, we only have tags information
        let currdoc = props.searchVersion === "v2" ? src.fields : src.document;
        // currdoc is representing the shot's tags

        let shotStart, shotEnd, shotId;
        if (props.searchAssets) {
          shotStart = 0;
          shotEnd = 0;
          shotId = contentHash + src.prefix;
        } else {
          shotStart =
            props.searchVersion === "v2"
              ? currdoc.f_start_time
              : currdoc.start_time;
          shotEnd =
            props.searchVersion === "v2"
              ? currdoc.f_end_time
              : currdoc.end_time;
          shotId = contentHash + "_" + shotStart + "_" + shotEnd;
        }

        const shot = {
          iqHash: contentHash,
          start: shotStart,
          end: shotEnd,
          shotId: shotId,
          tags: [],
        };

        let needToPush = false;
        // try to see  if we have this shot in Memo, if not, try to load from DB.
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
        if (props.searchVersion === "v2") {
          let idx = 0;
          for (let trackname in tags.current) {
            if (!(trackname in currdoc)) {
              continue;
            }
            for (let text of currdoc[trackname]) {
              let like = 0;
              if (props.shotsMemo.current[shotId] != null) {
                const prevLike =
                  props.shotsMemo.current[shotId].tags[idx].feedback;
                if (props.searchId in prevLike) {
                  like = prevLike[props.searchId];
                }
              }
              const tag = {
                track: trackname,
                text: text,
                like: like,
                shotId: shotId,
                tagIdx: idx,
              };
              if (
                !tags.current[trackname].some(
                  (dictionary) =>
                    dictionary.text.toLowerCase() === tag.text.toLowerCase()
                )
              ) {
                tags.current[trackname].push(tag);
              }

              shot.tags.push({
                status: { track: trackname, text: text, idx: idx },
                feedback: { [props.searchId]: like },
              });
              idx = idx + 1;
            }
          }
        } else {
          let idx = 0;
          for (let trackname in tags.current) {
            for (let v of currdoc.text[trackname]) {
              for (let text of v.text) {
                let like = 0;
                if (props.shotsMemo.current[shotId] != null) {
                  const prevLike =
                    props.shotsMemo.current[shotId].tags[idx].feedback;
                  if (props.searchId in prevLike) {
                    like = prevLike[props.searchId];
                  }
                }
                const tag = {
                  track: trackname,
                  text: text,
                  like: like,
                  shotId: shotId,
                  tagIdx: idx,
                };
                if (
                  !tags.current[trackname].some(
                    (dictionary) =>
                      dictionary.text.toLowerCase() === tag.text.toLowerCase()
                  )
                ) {
                  tags.current[trackname].push(tag);
                }

                shot.tags.push({
                  status: { track: trackname, text: text, idx: idx },
                  feedback: { [props.searchId]: like },
                });

                idx = idx + 1;
              }
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
    console.log("Processing tags review");
    const shotId = t.shotId;
    const currTags = props.shotsMemo.current[shotId].tags;
    const allIndices = currTags.reduce((indices, dic, idx) => {
      if (dic.status.text === t.text) {
        indices.push(idx);
      }
      return indices;
    }, []);
    allIndices.forEach((i) => {
      props.shotsMemo.current[shotId].tags[i].feedback[props.searchId] = score;
    });

    const idx = lst.findIndex((dic) => dic.text === t.text);
    lst[idx].like = score;
    setRefresh((v) => !v);
    try {
      if (props.dbClient !== null) {
        await props.dbClient.setShot({ shot: props.shotsMemo.current[shotId] });
        console.log("Shot saved");
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
      if (props.dbClient !== null) {
        await props.dbClient.setClip({
          searchId: props.searchId,
          contentHash,
          clipStart,
          clipEnd,
          clipRank,
          shotIds: Object.keys(props.shotsMemo.current),
        });
        console.log("clip updated");
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
                  key={`${t.text}`}
                >
                  {t.text}
                  <div>
                    <button
                      style={{ border: "none", backgroundColor: "transparent" }}
                      onClick={() => collect(tags.current[k], t, 1)}
                    >
                      <BiLike
                        style={{
                          color: t.like === 1 ? "#EAA14F" : "black",
                        }}
                      />
                    </button>

                    <button
                      style={{ border: "none", backgroundColor: "transparent" }}
                      onClick={() => collect(tags.current[k], t, -1)}
                    >
                      <BiDislike
                        style={{
                          color: t.like === -1 ? "#EAA14F" : "black",
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
