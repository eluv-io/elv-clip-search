import React, { useState } from "react";
import { ElvClient } from "@eluvio/elv-client-js/dist/ElvClient-min.js";
import AuthorizationClient from "@eluvio/elv-client-js/src/AuthorizationClient";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import InputBox from "./components/InputBox";
import ClipRes from "./components/ClipRes";
import logo from "./static/images/Eluvio Favicon full.png";
import config from "./config.json";

const App = () => {
  const [search, setSearch] = useState("");
  const [objId, setObjId] = useState("");
  const [url, setUrl] = useState("");
  const [response, setResopnse] = useState([]);
  const [haveRes, setHaveRes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPlauoutUrl, setLoadingPlayoutUrl] = useState(false);
  const [loadedPlauoutUrl, setLoadedPlayoutUrl] = useState(0);
  const [totalPlauoutUrl, setTotalPlayoutUrl] = useState(0);
  const [timeoutErr, setTimeoutErr] = useState(false);
  const getClient = async ({ pk }) => {
    var client = await ElvClient.FromConfigurationUrl({
      configUrl: "https://main.net955305.contentfabric.io/config",
    });
    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({ privateKey: pk });
    client.SetSigner({ signer });
    return client;
  };
  const genUrl = async () => {
    const client = await getClient({ pk: config["ethereum"]["private_key"] });
    const libId = await client.ContentObjectLibraryId({
      objectId: objId,
    });
    const authClient = new AuthorizationClient({
      client,
      contentSpaceId: config["space_id"],
    });
    const token = await authClient.AuthorizationToken({
      libraryId: libId,
      objectId: objId,
    });
    console.log(token);

    const url = `https://host-76-74-29-35.contentfabric.io/qlibs/${libId}/q/${objId}/rep/search?terms=(${search})&authorization=${token}&select=...,text,/public/asset_metadata/title&stats=f_celebrity_as_string,f_segment_as_string,f_object_as_string,f_display_title_as_string&start=0&limit=80&clips&clips_include_source_tags=false&sort=f_start_time@asc`;
    console.log(url);
    setUrl(url);
    return { url, client };
  };
  const curl = async (url, client) => {
    try {
      const res = await axios.get(url, { timeout: 100 });
      console.log(res);
      setLoading(false);
      setTotalPlayoutUrl(res["data"]["contents"].length);
      setLoadingPlayoutUrl(true);
      const dic = {};
      let cnt = 0;
      for (let item of res["data"]["contents"]) {
        const objectId = item["id"];
        if (objectId in dic) {
          item["url"] = dic[objectId];
        } else {
          const playoutOptions = await client.PlayoutOptions({
            objectId,
            protocols: ["hls"],
            drms: ["aes-128"],
          });
          const playoutMethods = playoutOptions["hls"].playoutMethods;
          const playoutInfo = playoutMethods["aes-128"];
          const videoUrl = playoutInfo.playoutUrl;
          dic[objectId] = videoUrl;
          console.log(videoUrl);
          item["url"] = videoUrl;
        }
        cnt += 1;
        setLoadedPlayoutUrl(cnt);
      }
      console.log(dic);
      setLoadingPlayoutUrl(false);
      setHaveRes(true);
      return res;
    } catch (err) {
      console.log(`Error message : ${err.message} - `, err.code);
      setLoading(false);
      setTimeoutErr(true);
      return null;
    }
  };
  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          height: 100,
        }}
      >
        <img src={logo} alt="logo" style={{ height: "90%", margin: 30 }} />
        <h1 className="mt-3">Eluvio Automatic Clip Generation</h1>
      </div>
      <div className="row mt-3">
        <InputBox
          text="Search object"
          handleSubmitClick={(txt) => {
            setHaveRes(false);
            setLoading(false);
            setTimeoutErr(false);
            setObjId(txt);
          }}
        />
      </div>
      <div className="row mt-3">
        <InputBox
          text="Search term"
          handleSubmitClick={(txt) => {
            setHaveRes(false);
            setLoading(false);
            setTimeoutErr(false);
            setSearch(encodeURI(txt.trim()));
          }}
        />
      </div>
      {!haveRes ? (
        <div
          style={{
            margin: 10,
            flexDirection: "column",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "lightgray",
              borderRadius: 10,
              margin: 10,
              width: "100%",
              flexDirection: "column",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                margin: 10,
                width: "80%",
                flexDirection: "row",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <text style={{ width: "30%" }}>Search Objext Index:</text>
              <text style={{ width: "70%" }}>{objId}</text>
            </div>
            <div
              style={{
                margin: 10,
                width: "80%",
                flexDirection: "row",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <text style={{ width: "30%" }}>Search Phrase:</text>
              <text style={{ width: "70%" }}>{search}</text>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setLoading(true);
              setLoadedPlayoutUrl(0);
              genUrl().then(({ url, client }) => {
                curl(url, client)
                  .then((res) => {
                    // setResopnse(res["data"]["contents"]);
                    if (res != null) {
                      console.log(res["data"]["contents"]);
                      setResopnse(res["data"]["contents"]);
                    } else {
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              });
            }}
          >
            Let's go
          </button>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "lightgray",
            borderRadius: 10,
            marginTop: 20,
            marginBottom: 40,
            height: 600,
            flexDirection: "column",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <text>Search url</text>
          <textarea
            value={url}
            style={{ height: "30%", width: "95%", marginBottom: "1%" }}
            readOnly
          ></textarea>
          <text>returned content</text>
          <textarea
            style={{ height: "60%", width: "95%", marginBottom: "1%" }}
            value={JSON.stringify(response, null, 4)}
            readOnly
          ></textarea>
        </div>
      )}

      {loading ? (
        <div>
          <text>curling the search object</text>
        </div>
      ) : haveRes ? (
        <div>
          {response.map((clip) => {
            return (
              <ClipRes
                clipInfo={clip}
                key={clip.id + clip.start_time}
              ></ClipRes>
            );
          })}
        </div>
      ) : loadingPlauoutUrl ? (
        <div>
          <text>
            {`loading playoutUrl for each clip, please wait for a moment; finished: ${loadedPlauoutUrl} / ${totalPlauoutUrl}`}
          </text>
        </div>
      ) : timeoutErr ? (
        <div>
          <text>Curl search node timeout err </text>
        </div>
      ) : null}
    </div>
  );
};

export default App;
