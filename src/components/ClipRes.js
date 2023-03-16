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
            }/rep/playout/clips/hls-aes128/playlist.m3u8?authorization=${"ascsj_LhPvmqhaaUqJCyUdfnvH79hXGFEE2FXUgNGSdxMPa7RvscFe3bt4ohw62NioAh9J9f4SinztJePmfAnNoo98GHsVQj9z2jnbyBSfGP2nn2mt8eFq7Rv1UUvkGbmcz2hBZTS5eUPDkA7yV2RkCUJQkUseLSdgiDwwjFc8rM18jZWnj79YyAxBwhVvy4EypSYmEEFFWXVoMtBK4Tnxyp6cXdYbL3ye4WRnWUK4TUeh1cShkwcXY6PU848xBS8VNaNMvmfAQmNWvJajBpVTWMoA53TBAhhqamAm7zXJd7V1J4RwuiGNJHSP8QrF8PiQQK6pkBjLr6eVSs9k6p3ae7rck19Md6AdM3pvLbZHzEC8U7C8i1p95EjmYCaM9spTee3VFrriaS9S9THvjMVyTpQHsora8wZC56oCjUbXajfgtesByUf6SMKWp8DPQfKxG6y5EDuB4uKXum9yaKB8H7DrwEKB8TXnRooeryzEsW3mHNXQoZQzzgfzPvcsP8RKvwtkHiWxsnABr9jDdiT9ZhVDXp3iZTczb4FBJTr9rZPFbHK5yT3E3N7X44CLaUFZfxHckTA6qqb6hV2dHWQdEaj7FzfTD3koJjzDi8HSLiY1HQ999a6UY1shg8rN25ktzEGoY6Lp9boz4uxCf3tbYq4Cx82MEQZsQPZHeQiMAquyAwhGdNizSuY1sfpFakjo4KTRpYRWH9TUQrzT2EmGzspkKLE7aGENWdb4zo443J2mWCknQC22Q9RDp2b9nJLfNQPN5mTrbyR86KyyZMm9Snv5XPRPKxjPEyz7bbEAWgMuuwfeiZbkZUK7BwVSGsnS7PGKKB7oGG6PKFmt4qnJNFg9YoCZxY1LMmNqTzRKtGw6tSYCbkwDQ65XuzTJA6donStkP1mTCE9mCJBAE1XPV7mJffPJ1Qo8gKXstMXSNcyMGX9LaYhK4CEg"}&&resolve=false&sid=DFE4232B8A12&player_profile=hls-js&clip_start=${
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
          }/rep/playout/clips/hls-aes128/playlist.m3u8?authorization=${"ascsj_LhPvmqhaaUqJCyUdfnvH79hXGFEE2FXUgNGSdxMPa7RvscFe3bt4ohw62NioAh9J9f4SinztJePmfAnNoo98GHsVQj9z2jnbyBSfGP2nn2mt8eFq7Rv1UUvkGbmcz2hBZTS5eUPDkA7yV2RkCUJQkUseLSdgiDwwjFc8rM18jZWnj79YyAxBwhVvy4EypSYmEEFFWXVoMtBK4Tnxyp6cXdYbL3ye4WRnWUK4TUeh1cShkwcXY6PU848xBS8VNaNMvmfAQmNWvJajBpVTWMoA53TBAhhqamAm7zXJd7V1J4RwuiGNJHSP8QrF8PiQQK6pkBjLr6eVSs9k6p3ae7rck19Md6AdM3pvLbZHzEC8U7C8i1p95EjmYCaM9spTee3VFrriaS9S9THvjMVyTpQHsora8wZC56oCjUbXajfgtesByUf6SMKWp8DPQfKxG6y5EDuB4uKXum9yaKB8H7DrwEKB8TXnRooeryzEsW3mHNXQoZQzzgfzPvcsP8RKvwtkHiWxsnABr9jDdiT9ZhVDXp3iZTczb4FBJTr9rZPFbHK5yT3E3N7X44CLaUFZfxHckTA6qqb6hV2dHWQdEaj7FzfTD3koJjzDi8HSLiY1HQ999a6UY1shg8rN25ktzEGoY6Lp9boz4uxCf3tbYq4Cx82MEQZsQPZHeQiMAquyAwhGdNizSuY1sfpFakjo4KTRpYRWH9TUQrzT2EmGzspkKLE7aGENWdb4zo443J2mWCknQC22Q9RDp2b9nJLfNQPN5mTrbyR86KyyZMm9Snv5XPRPKxjPEyz7bbEAWgMuuwfeiZbkZUK7BwVSGsnS7PGKKB7oGG6PKFmt4qnJNFg9YoCZxY1LMmNqTzRKtGw6tSYCbkwDQ65XuzTJA6donStkP1mTCE9mCJBAE1XPV7mJffPJ1Qo8gKXstMXSNcyMGX9LaYhK4CEg"}&&resolve=false&sid=DFE4232B8A12&player_profile=hls-js&clip_start=${
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
