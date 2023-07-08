import React, { useState } from "react";
import { isEqual } from "lodash";

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

  const thumbsUp = (lst, t) => {
    const idx = lst.findIndex((dic) => isEqual(dic, t));
    lst[idx] = { [Object.keys(t)]: "like" };
    console.log("You liked me");
  };

  const thumbsDown = (lst, t) => {
    const idx = lst.findIndex((dic) => isEqual(dic, t));
    lst[idx] = { [Object.keys(t)]: "dislike" };
    console.log("You disliked me");
  };

  const hasTags = "text" in props.clipInfo.sources[0].document;

  if (hasTags) {
    for (let src of props.clipInfo.sources) {
      const doc = src.document;
      for (let k in tags) {
        for (let v of doc.text[k]) {
          for (let text of v.text) {
            const dic = { [text]: null };
            // console.log(dic)
            const found = tags[k].some(
              (dictionary) => JSON.stringify(dic) === JSON.stringify(dictionary)
            );
            if (!found) {
              tags[k].push(dic);
            }
            // if (!tags[k].includes(text)) {
            //   // tags[k].push({text: null});
            //   tags[k].push(text);
            // }
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
        return (
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
                  {Object.keys(t)}
                  {/* {t} */}
                  <div>
                    <button
                      style={{ border: "none", backgroundColor: "#E6E6E6" }}
                      onClick={() => thumbsUp(tags[k], t)}
                    >
                      👍
                    </button>
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
        );
      })}
    </div>
  );
};

export default TagsPad;
