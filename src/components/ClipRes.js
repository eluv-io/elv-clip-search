import React from "react";
// import ReactPlayer from "react-player";
import ReactHlsPlayer from "react-hls-player";
// import placeholdImage from "../static/images/smallLogo.jpg";
const ClipRes = (props) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        backgroundColor: "lavender",
        alignItems: "center",
        margin: 10,
        borderRadius: 10,
        height: 400,
      }}
    >
      <div
        style={{
          display: " flex",
          flexDirection: "column",
          width: "40%",
          height: "80%",
          margin: "2%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ flexDirection: "row", width: "90%", height: "8%" }}>
          <text>title: </text>
          <text>{props.clipInfo.meta.public.asset_metadata.title}</text>
        </div>
        <div style={{ flexDirection: "row", width: "90%", height: "8%" }}>
          <text>library id: </text>
          <text>{props.clipInfo.qlib_id}</text>
        </div>
        <div style={{ flexDirection: "row", width: "90%", height: "8%" }}>
          <text>content id: </text>
          <text>{props.clipInfo.id}</text>
        </div>
        <div style={{ flexDirection: "row", width: "90%", height: "8%" }}>
          <text>start_time: </text>
          <text>{props.clipInfo.start}</text>
        </div>
        <div style={{ flexDirection: "row", width: "90%", height: "8%" }}>
          <text>end_time: </text>
          <text>{props.clipInfo.end}</text>
        </div>
        <div
          style={{
            width: "80%",
            height: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <text>playout url</text>
          <textarea
            name="playout url"
            value={`${props.baseUrl}/qlibs/${props.clipInfo.qlib_id}/q/${
              props.clipInfo.hash
            }/rep/playout/clips/hls-aes128/playlist.m3u8?authorization=${
              props.token
            }&&resolve=false&sid=DFE4232B8A12&player_profile=hls-js&clip_start=${
              props.clipInfo.start_time / 1000
            }&clip_end=${
              props.clipInfo.end_time / 1000
            }&ignore_trimming=true&sid=E7CFDAA6711A`}
            style={{ height: "100%", width: "100%" }}
            readOnly
          ></textarea>
        </div>
      </div>
      <div
        style={{
          width: "55%",
          height: "90%",
          flexDirection: "colomn",
          margin: "2%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ReactHlsPlayer
          src={`${props.baseUrl}/qlibs/${props.clipInfo.qlib_id}/q/${
            props.clipInfo.hash
          }/rep/playout/clips/hls-aes128/playlist.m3u8?authorization=${
            props.token
          }&&resolve=false&sid=DFE4232B8A12&player_profile=hls-js&clip_start=${
            props.clipInfo.start_time / 1000
          }&clip_end=${
            props.clipInfo.end_time / 1000
          }&ignore_trimming=true&sid=E7CFDAA6711A`}
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
