import React from "react";
import ReactHlsPlayer from "react-hls-player";
const body = {
  display: "flex",
  flexDirection: "row",
  backgroundColor: "lavender",
  alignItems: "center",
  marginTop: 10,
  borderRadius: 10,
  height: 400,
};

const info = {
  display: " flex",
  flexDirection: "column",
  width: "40%",
  height: "80%",
  margin: "2%",
  alignItems: "center",
  justifyContent: "center",
};

const shortInfo = {
  flexDirection: "row",
  width: "90%",
  height: "8%",
};

const longInfo = {
  width: "90%",
  height: "50%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const videoPlayer = {
  width: "55%",
  height: "90%",
  flexDirection: "colomn",
  margin: "5%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const ClipRes = (props) => {
  const url = `${props.clipInfo.url}&resolve=false&clip_start=${
    props.clipInfo.start_time / 1000
  }&clip_end=${props.clipInfo.end_time / 1000}&ignore_trimming=true`;
  return (
    <div style={body}>
      <div style={info}>
        <div style={shortInfo}>
          <text>title: </text>
          <text>{props.clipInfo.meta.public.asset_metadata.title}</text>
        </div>
        <div style={shortInfo}>
          <text>library id: </text>
          <text>{props.clipInfo.qlib_id}</text>
        </div>
        <div style={shortInfo}>
          <text>content id: </text>
          <text>{props.clipInfo.id}</text>
        </div>
        <div style={shortInfo}>
          <text>start_time: </text>
          <text>{props.clipInfo.start}</text>
        </div>
        <div style={shortInfo}>
          <text>end_time: </text>
          <text>{props.clipInfo.end}</text>
        </div>
        <div style={longInfo}>
          <text>playout url</text>
          <textarea
            name="playout url"
            value={url}
            style={{ height: "100%", width: "100%" }}
            readOnly
          ></textarea>
        </div>
      </div>
      <div style={videoPlayer}>
        <ReactHlsPlayer
          src={url}
          width="100%"
          height="auto"
          autoPlay={false}
          controls={true}
        ></ReactHlsPlayer>
      </div>
    </div>
  );
};

export default ClipRes;
