import React, { useEffect, useState } from "react";
import EluvioPlayer, { EluvioPlayerParameters } from "@eluvio/elv-player-js";
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
  const [player, setPlayer] = useState(undefined);

  useEffect(() => {
    return () => {
      if (player) {
        player.Destroy();
      }
    };
  }, []);

  const InitializeVideo = ({ element }) => {
    if (!element || player) {
      return;
    }

    setPlayer(
      new EluvioPlayer(element, {
        clientOptions: {
          network:
            EluvioPlayerParameters.networks[
              props.network === "main" ? "MAIN" : "DEMO"
            ],
          client: props.client,
        },
        sourceOptions: {
          playoutParameters: {
            versionHash: props.clipInfo.hash,
            clipStart: props.clipInfo.start_time / 1000,
            clipEnd: props.clipInfo.end_time / 1000,
            ignoreTrimming: true,
            //resolve: true
          },
        },
        playerOptions: {
          controls: EluvioPlayerParameters.controls.AUTO_HIDE,
        },
      })
    );
  };

  return (
    <div style={body}>
      <div style={videoPlayerContainer}>
        {url !== null ? (
          <div ref={(element) => InitializeVideo({ element })}></div>
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
