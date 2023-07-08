import QAPad from "./QAPad";
import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";

const container = {
  width: "97%",
  height: 700,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "whitesmoke",
  padding: 10,
  marginBottom: 10,
  marginTop: 10,
};

const videoContainer = {
  width: "70%",
  height: "95%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "whitesmoke",
  borderWidth: 2,
  borderColor: "grey",
  border: "solid",
  borderRadius: 10,
};

const videoPlayer = {
  width: "95%",
  height: "80%",
  marginTop: "1%",
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const videoInfo = {
  width: "95%",
  height: "18%",
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

const ClipRes = (props) => {
  const viewTime = useRef(0);
  const startTime = useRef(null);

  const handlePlay = () => {
    startTime.current = Date.now();
  };
  const handlePause = () => {
    if (startTime.current) {
      const elapsedTime = (Date.now() - startTime.current) / 1000;
      viewTime.current = viewTime.current + elapsedTime;
      startTime.current = null;
    }
    console.log("total view time", viewTime.current);
  };

  const url = `${props.clipInfo.url}&resolve=false&clip_start=${
    props.clipInfo.start_time / 1000
  }&clip_end=${props.clipInfo.end_time / 1000}&ignore_trimming=true`;

  const hasTags = "text" in props.clipInfo.sources[0].document;

  return (
    <div style={container}>
      <div style={{ ...videoContainer, width: hasTags ? "80%" : "100%" }}>
        <div style={videoPlayer}>
          <ReactPlayer
            url={url}
            width="100%"
            height="100%"
            autoPlay={false}
            controls={true}
            config={{
              capLevelToPlayerSize: true,
              maxBufferLength: 1,
            }}
            // onProgress={handleProgress}
            onPlay={handlePlay}
            onPause={handlePause}
          ></ReactPlayer>
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
            <div>time interval: </div>
            <div>
              {props.clipInfo.start} - {props.clipInfo.end}
            </div>
          </div>

          {props.searchVersion === "v2" ? (
            <div style={shortInfo}>
              <div>rank: </div>
              <div>{props.clipInfo.rank}</div>
            </div>
          ) : null}
        </div>
      </div>

      {/* <div style={QAContainer}> */}
      <QAPad
        clipInfo={props.clipInfo}
        db={props.db}
        clientadd={props.clientadd}
        searchID={props.searchID}
        viewTime={viewTime.current}
        contents={props.contents}
      ></QAPad>
      {/* </div> */}
    </div>
  );
};

export default ClipRes;
