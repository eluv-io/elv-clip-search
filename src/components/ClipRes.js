import React, {useEffect} from "react";
import { useRef, useState } from "react";
import ReactPlayer from "react-player";
import EluvioPlayer, {EluvioPlayerParameters} from "@eluvio/elv-player-js";
const body = {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "whitesmoke",
  borderWidth: 2,
  borderColor: "grey",
  border: "solid",
  alignItems: "center",
  marginTop: 10,
  marginBottom: 10,
  borderRadius: 10,
  width: "96%",
};

const videoPlayerContainer = {
  width: "90%",
  height: "70%",
  marginTop: "2%",
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const audioCtrlContainer = {
  display: " flex",
  flexDirection: "row",
  width: "100%",
  height: "5%",
  alignItems: "center",
  justifyContent: "center",
};

const info = {
  display: " flex",
  flexDirection: "column",
  width: "100%",
  height: "20%",
  margin: "2%",
  alignItems: "center",
  justifyContent: "center",
};

const shortInfo = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "95%",
  height: "8%",
  marginTop: "0.5%",
};

const longInfo = {
  width: "95%",
  height: "50%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const ClipRes = (props) => {
  const url =
    props.clipInfo.url === null
      ? null
      : `${props.clipInfo.url}&resolve=false&clip_start=${
          props.clipInfo.start_time / 1000
        }&clip_end=${props.clipInfo.end_time / 1000}&ignore_trimming=true`;
  const token = new URL(url).searchParams.get("authorization");
  const playerRef = useRef(null);
  const [audioTracks, setAudioTracks] = useState(null);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState(0);
  const [player, setPlayer] = useState(undefined);
  const [playoutUrl, setPlayoutUrl] = useState("");

  // useEffect(() => {
  //   const GenerateEmbedUrl = async () => {
  //     const networkInfo = await props.client.NetworkInfo();
  //     let embedUrl = new URL("http://localhost:8088");
  //     const networkName = networkInfo.name === "demov3" ? "demo" : (networkInfo.name === "test" && networkInfo.id === 955205) ? "testv4" : networkInfo.name;
  //
  //     embedUrl.searchParams.set("vid", props.clipInfo.hash);
  //     embedUrl.searchParams.set("ath", token);
  //     embedUrl.searchParams.set("p", "");
  //     embedUrl.searchParams.set("lp", "");
  //     embedUrl.searchParams.set("net", networkName);
  //     embedUrl.searchParams.set("ct", "s");
  //     embedUrl.searchParams.set("cap", "");
  //     embedUrl.searchParams.set("start", props.clipInfo.start_time);
  //     embedUrl.searchParams.set("end", props.clipInfo.end_time);
  //     embedUrl.searchParams.set("igt", "");
  //     embedUrl.searchParams.set("nr", "")
  //
  //     setPlayoutUrl(embedUrl.toString());
  //     console.log("embed", embedUrl.toString())
  //   };
  //
  //   GenerateEmbedUrl();
  // }, []);


  const InitializeVideo = async ({element}) => {
    if (!element) { return; }

    const networkName = await props.client.NetworkInfo().name;
    new EluvioPlayer(
      element,
      {
        clientOptions: {
          network: EluvioPlayerParameters.networks[networkName === "main" ? "MAIN" : "DEMO"],
          client: props.client
        },
        sourceOptions: {
          playoutParameters: {
            versionHash: props.clipInfo.hash,
            clipStart: props.clipInfo.start_time,
            clipEnd: props.clipInfo.end_time,
            ignoreTrimming: true,
            resolve: false
          }
        },
        playerOptions: {
          controls: EluvioPlayerParameters.controls.ON
        }
      }
    );
    setPlayer(player);
  };

  return (
    <div style={body}>
      <div className={`${player ? "loaded" : "loading"}`} style={videoPlayerContainer}>
        {/*{ playoutUrl ? <iframe*/}
        {/*  width="100%" height="500"*/}
        {/*  type="text/html"*/}
        {/*  src={playoutUrl}*/}
        {/*  allowtransparency="true"*/}
        {/*/> : null }*/}
        {url !== null ? (
          <div className="player-container" ref={element => InitializeVideo({element})}></div>
          // Goal is to replace the below code
          //
          //
          // <ReactPlayer
          //   ref={playerRef}
          //   url={url}
          //   width="100%"
          //   height="auto"
          //   autoPlay={false}
          //   controls={true}
          //   config={{
          //     capLevelToPlayerSize: true,
          //     maxBufferLength: 0,
          //   }}
          //   onReady={() => {
          //     console.log("new player ready");
          //     const hls = playerRef.current.getInternalPlayer("hls");
          //     const tracks = hls.audioTrackController.tracks;
          //     if (tracks !== null && tracks.length > 1) {
          //       setAudioTracks(tracks);
          //       setSelectedAudioTrack(0);
          //     }
          //   }}
          // ></ReactPlayer>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Playout URL Err
          </div>
        )}
      </div>

      {audioTracks && (
        <div style={audioCtrlContainer}>
          audio track:
          <select
            onChange={(event) => {
              const audioTrackId = event.target.value;
              setSelectedAudioTrack(audioTrackId);
              console.log(`set audio track to ${audioTrackId}`);
              const hls = playerRef.current.getInternalPlayer("hls");
              hls.audioTrackController.setAudioTrack(audioTrackId);
            }}
            value={selectedAudioTrack}
            style={{ height: "100%", width: "20%", marginLeft: 5 }}
          >
            {audioTracks.map((track) => {
              return (
                <option key={`option-${track.id}`} value={track.id}>
                  {track.name}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <div style={info}>
        <div style={shortInfo}>
          <div>title: </div>
          <div>{props.clipInfo.meta.public.asset_metadata.title}</div>
        </div>
        <div style={shortInfo}>
          <div>library id: </div>
          <div>{props.clipInfo.qlib_id}</div>
        </div>
        <div style={shortInfo}>
          <div>content id: </div>
          <div>{props.clipInfo.id}</div>
        </div>
        <div style={shortInfo}>
          <div>start_time: </div>
          <div>{props.clipInfo.start}</div>
        </div>
        <div style={shortInfo}>
          <div>end_time: </div>
          <div>{props.clipInfo.end}</div>
        </div>
        {url !== null && (
          <div style={longInfo}>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ClipRes;
