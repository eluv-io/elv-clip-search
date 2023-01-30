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
      {/* <div
        style={{
          width: "20%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          //   objectFit: "contain",
        }}
      >
        <img
          //   src={`${props.baseUrl}/qlibs/${props.clipInfo.qlib_id}${props.clipInfo.image_url}/rep/playout/clips_clear/hls-clear/playlist.m3u8?authorization=${props.token}`}
          src={placeholdImage}
          alt="poster"
          style={{ width: "80%" }}
        ></img>
      </div> */}
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
        <div style={{ flexDirection: "row", width: "80%" }}>
          <text>title: </text>
          <text>{props.clipInfo.meta.public.asset_metadata.title}</text>
        </div>
        {/* <div style={{ flexDirection: "row", width: "80%" }}>
          <text>hash: </text>
          <text>{props.clipInfo.hash}</text>
        </div> */}
        <div style={{ flexDirection: "row", width: "80%" }}>
          <text>qlibid: </text>
          <text>{props.clipInfo.qlib_id}</text>
        </div>
        <div style={{ flexDirection: "row", width: "80%" }}>
          <text>id: </text>
          <text>{props.clipInfo.id}</text>
        </div>
        <div style={{ flexDirection: "row", width: "80%" }}>
          <text>start_time: </text>
          <text>{props.clipInfo.start_time}</text>
        </div>
        <div style={{ flexDirection: "row", width: "80%" }}>
          <text>end_time: </text>
          <text>{props.clipInfo.end_time}</text>
        </div>
        <div
          style={{
            height: "20%",
            width: "80%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <textarea
            value={props.clipInfo.image_url}
            style={{ heigth: "100%", width: "100%" }}
            readOnly
          ></textarea>
        </div>
        <div
          style={{
            height: "20%",
            width: "80%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* <text>{props.clipInfo.url}</text>
           */}
          <textarea
            value={`${props.baseUrl}/qlibs/${props.libId}/q/${
              props.clipInfo.hash
            }/rep/playout/clips_clear/hls-clear/playlist.m3u8?authorization=${
              props.token
            }&&resolve=false&clip_start=${
              props.clipInfo.start_time / 1000
            }&clip_end=${props.clipInfo.end_time / 1000}&ignore_trimming=true`}
            style={{ heigth: "100%", width: "100%" }}
            readOnly
          ></textarea>
        </div>
      </div>
      {/* <div style={{ width: "30%", flexDirection: "column" }}>
        <text>Playout url</text>
        <textarea>{props.clipInfo.url}</textarea>
      </div> */}
      <div
        style={{
          width: "40%",
          heigtt: "100%",
          flexDirection: "colomn",
          margin: "2%",
          display: "flex",
        }}
      >
        <ReactHlsPlayer
          src={`${props.baseUrl}/qlibs/${props.libId}/q/${
            props.clipInfo.hash
          }/rep/playout/clips_clear/hls-clear/playlist.m3u8?authorization=${
            props.token
          }&&resolve=false&clip_start=${
            props.clipInfo.start_time / 1000
          }&clip_end=${props.clipInfo.end_time / 1000}&ignore_trimming=true`}
          //   url="https://www.youtube.com/watch?v=ysz5S6PUM-U"
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
