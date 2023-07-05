import React, { useState } from "react";
import ReactHlsPlayer from "react-hls-player";
const container = {
  width: "97%",
  height: 600,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "whitesmoke",
  borderWidth: 2,
  borderColor: "grey",
  border: "solid",
  borderRadius: 10,
  padding: 10,
  marginBottom: 10,
  marginTop: 10,
};
const videoContainer = {
  width: "75%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "whitesmoke",
  borderRadius: 10,
};

const videoPlayer = {
  width: "95%",
  height: "80%",
  marginBottom: "1%",
  marginTop: "1%",
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const videoInfo = {
  width: "95%",
  height: "20%",
  display: " flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
};

const shortInfo = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  flex: 1,
};

const longInfo = {
  width: "95%",
  height: "50%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const tagsContainer = {
  width: "25%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  padding: 10,
};

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
    "Object Detection": "Objcet",
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

  const hasTags = "text" in props.clipInfo.sources[0].document;

  if (hasTags) {
    for (let src of props.clipInfo.sources) {
      const doc = src.document;
      for (let k in tags) {
        for (let v of doc.text[k]) {
          if (!tags[k].includes(v.text)) {
            tags[k].push(v.text);
          }
        }
      }
    }

    console.log(tags);
  }

  return (
    <div
      style={{
        width: "100%",
        maxHeight: 600,
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
              marginBottom: 10,
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
                    justifyContent: "flex-start",
                    paddingLeft: "5%",
                    backgroundColor: "#E6E6E6",
                    borderRadius: 10,
                    marginBottom: 3,
                  }}
                >
                  {t}
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
};

const ClipRes = (props) => {
  const url = `${props.clipInfo.url}&resolve=false&clip_start=${
    props.clipInfo.start_time / 1000
  }&clip_end=${props.clipInfo.end_time / 1000}&ignore_trimming=true`;

  const hasTags = "text" in props.clipInfo.sources[0].document;

  return (
    <div style={container}>
      <div style={{ ...videoContainer, width: hasTags ? "80%" : "100%" }}>
        <div style={videoPlayer}>
          <ReactHlsPlayer
            src={url}
            width="100%"
            height="100%"
            autoPlay={false}
            controls={true}
            hlsConfig={{
              capLevelToPlayerSize: true,
              maxBufferLength: 1,
            }}
          ></ReactHlsPlayer>
        </div>
        <div style={videoInfo}>
          <div style={shortInfo}>
            <div>title: </div>
            <div>{props.clipInfo.meta.public.asset_metadata.title}</div>
          </div>

          <div style={shortInfo}>
            <div>content id: </div>
            <div>{props.clipInfo.id}</div>
          </div>

          <div style={shortInfo}>
            <div>time range: </div>
            <div>
              {props.clipInfo.start} - {props.clipInfo.end}
            </div>
          </div>
          {/* <div style={longInfo}>
          <div>playout url</div>
          <textarea
            name="playout url"
            value={url}
            style={{
              height: "100%",
              width: "100%",
              padding: 5,
              borderStyle: "None",
              borderRadius: 10,
            }}
            readOnly
          ></textarea>
        </div> */}
        </div>
      </div>

      <div style={tagsContainer}>
        <TagsPad clipInfo={props.clipInfo}></TagsPad>
      </div>
    </div>
  );
};

export default ClipRes;
