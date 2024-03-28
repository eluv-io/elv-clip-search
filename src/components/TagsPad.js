import React, { useState, useRef, useEffect } from "react";
import {
  BiArrowFromTop,
  BiArrowToTop,
  BiDislike,
  BiLike,
} from "react-icons/bi";
import { tagsFormat } from "../TagsFormat";

const TagsPad = (props) => {
  const tagsMap =
    tagsFormat[props.searchVersion][props.searchAssets ? "asset" : "clip"][
      "tagsTracks"
    ];
  const _tags = {};
  const _show = {};
  Object.keys(tagsMap).forEach((track) => {
    _tags[track] = [];
    _show[track] = true;
  });
  const tags = useRef(_tags);
  const [show, setShow] = useState(_show);

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
    const contentHash = props.clipInfo.hash;
    const format =
      tagsFormat[props.searchVersion][props.searchAssets ? "asset" : "clip"];
    const entry = format.entry;
    const tagPaths = format.tagsPath.split("/");

    let sourceData;
    if (entry === "") {
      sourceData = props.clipInfo;
    } else {
      sourceData = props.clipInfo[entry];
    }
    if (!format.srcInListFormat) {
      sourceData = [sourceData];
    }

    // srcData is a list of shots
    // just to check if it has tags=
    let firstShotTags = sourceData[0];
    for (let path of tagPaths) {
      firstShotTags = firstShotTags[path];
    }
    const _hasTags = Object.keys(firstShotTags).some((k) => k in tags.current);

    if (_hasTags) {
      console.log("parsing tags");
      for (let src of sourceData) {
        // each src represent a shot

        let shotStart = src,
          shotEnd = src,
          prefix = src;
        for (let p of format.shotStart.split("/")) {
          shotStart = shotStart[p];
        }
        for (let p of format.shotEnd.split("/")) {
          shotEnd = shotEnd[p];
        }
        for (let p of format.prefix.split("/")) {
          prefix = prefix[p];
        }
        shotStart = shotStart || 0;
        shotEnd = shotEnd || 0;
        const shotId = props.searchAssets
          ? contentHash + src.prefix
          : contentHash + "_" + shotStart + "_" + shotEnd;
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
        let currShot = src;
        for (let p of format.tagsPath.split("/")) {
          currShot = currShot[p];
        }
        let idx = 0;
        for (let trackname in tags.current) {
          if (!(trackname in currShot)) {
            continue;
          } else {
            for (let tagInTrack of currShot[trackname]) {
              let texts = tagInTrack;
              if (format.tagsTextPath !== "") {
                for (let p of format.tagsTextPath.split("/")) {
                  texts = texts[p];
                }
              }
              if (typeof texts === "string") {
                texts = [texts];
              }
              for (let text of texts) {
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
                    (_tag) => _tag.text.toLowerCase() === tag.text.toLowerCase()
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
            await props.dbClient.setShot({ shot: shot });
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
        maxHeight: 750,
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
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                width: "100%",
                marginTop: 5,
                borderRadius: 5,
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
                  padding: 5,
                  borderRadius: 5,
                }}
              >
                <div style={{fontSize: 14}}>{tagsMap[k]}</div>
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
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      backgroundColor: "transparent",
                      marginBottom: 10,
                      fontSize: 12,
                    }}
                    key={`${t.text}`}
                    
                  >
                    <div 
                      style={{
                        width: "15%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-around",
                        backgroundColor: "transparent",
                      }}
                    >
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


                    <div 
                      style={{
                        width: "80%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        backgroundColor: "transparent",
                        borderRadius: 5,
                        paddingLeft: 5,
                      }}
                      onMouseEnter={(event) => {event.target.style.backgroundColor = "lightgrey"}}
                      onMouseLeave={(event) => {event.target.style.backgroundColor = "transparent"}}
                    >
                      {t.text}
                    </div>
                  </div>
                ))
              }
            </div>
            
            
          </div>
        ) : null;
      })}
    </div>
  );
};

export default TagsPad;
