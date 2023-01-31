import React, { useState } from "react";
import { ElvClient } from "@eluvio/elv-client-js/dist/ElvClient-min.js";
import AuthorizationClient from "@eluvio/elv-client-js/src/AuthorizationClient";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import SearchBox from "./components/SearchBox";
import PKBox from "./components/PrivateKeyInputBox";
// import AuthTokenBox from "./components/AuthTokenBox";
import ObjectInfoBox from "./components/ObjectInfo";
import ClipRes from "./components/ClipRes";
const App = () => {
  const [search, setSearch] = useState("");
  const [pk, setPK] = useState();
  const [objId, setObjId] = useState("");
  const [libId, setLibId] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [url, setUrl] = useState("");
  const [response, setResopnse] = useState([]);
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
    const client = await getClient({ pk });
    const libId = await client.ContentObjectLibraryId({
      objectId: objId,
    });
    setLibId(libId);
    console.log(libId);
    const authClient = new AuthorizationClient({
      client,
      contentSpaceId: "ispc2RUoRe9eR2v33HARQUVSp1rYXzw1",
    });
    const token = await authClient.AuthorizationToken({
      libraryId: libId,
      objectId: objId,
    });
    console.log(token);
    setAuthToken(token);
    const searchTxt = "%22" + search.trim().split(" ").join("%20") + "%22";
    console.log(searchTxt);
    const url = `https://host-76-74-29-35.contentfabric.io/qlibs/${libId}/q/${objId}/rep/search?terms=(${searchTxt})&authorization=${token}&select=...,text,/public/asset_metadata/title&stats=f_celebrity_as_string,f_segment_as_string,f_object_as_string,f_display_title_as_string&start=0&limit=80&clips&clips_include_source_tags=false&sort=f_start_time@asc`;
    console.log(url);
    setUrl(url);
    return url;
  };
  const curl = async (url) => {
    const res = await axios.get(url);
    return res;
  };
  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 className="mt-3">Elv ML Clip Search</h1>
      </div>

      <div className="row mt-3">
        <PKBox
          handleSubmitClick={(txt) => {
            console.log(txt);
            setPK(txt);
          }}
        />
      </div>
      <div className="row mt-3">
        <ObjectInfoBox
          handleSubmitClick={(txt) => {
            console.log(txt);
            setObjId(txt);
          }}
        />
      </div>
      <div className="row mt-3">
        <SearchBox
          handleSubmitClick={(txt) => {
            console.log(txt);
            setSearch(txt);
          }}
        />
      </div>
      <div className="row mt-3">
        <span>PK: {pk}</span>
        <span>Object txt: {objId}</span>
        <span>Search txt: {search}</span>
        <textarea value={url} readOnly></textarea>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          genUrl().then((url) => {
            curl(url)
              .then((res) => {
                // setResopnse(res["data"]["contents"]);
                console.log(res["data"]["contents"]);
                setResopnse(res["data"]["contents"]);
              })
              .catch((err) => {
                console.log(err);
              });
          });
        }}
      >
        Let's go
      </button>
      <div
        style={{
          backgroundColor: "gray",
          margin: 10,
          height: 400,
          width: "95%",
          // flexDirection: "column",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <textarea
          style={{ height: "90%", width: "95%" }}
          value={JSON.stringify(response, null, 2)}
        ></textarea>
      </div>

      <div>
        {response.map((clip) => {
          console.log(clip);
          return (
            <ClipRes
              clipInfo={clip}
              baseUrl="https://host-76-74-91-12.contentfabric.io"
              token={authToken}
              libId={libId}
            ></ClipRes>
          );
        })}
        {/* {response.length > 0 ? (
          <ClipRes
            clipInfo={{
              hash: "hq__5HRjVJf2fmjCNQxALJdG6DkU9GM91SkeXSqRXiuj4AE6JStHtSZmcn87ciagZamH6V7GJcwxHd",
              id: "iq__bQt9d3PwJtUzLjowrwEYyA5ryRh",
              qlib_id: "ilib2dh1ywazUPz4caGCkDhtgGRyztTi",
              type: "hq__4vPghs9YV2vQcEJ5m3gah2VbNFxkmwGxU7u33EBc8yLb6DhhSAcwSJwHizE1wfFQUa1nKvKkFG",
              meta: {
                public: {
                  asset_metadata: {
                    title: "MASK OF ZORRO, THE",
                  },
                },
              },
              url: "/q/hq__5HRjVJf2fmjCNQxALJdG6DkU9GM91SkeXSqRXiuj4AE6JStHtSZmcn87ciagZamH6V7GJcwxHd/rep/playout/clips/options.json?clip_start=806.723000&clip_end=844.886000&ignore_trimming=true",
              image_url:
                "/q/hq__5HRjVJf2fmjCNQxALJdG6DkU9GM91SkeXSqRXiuj4AE6JStHtSZmcn87ciagZamH6V7GJcwxHd/rep/frame/clips/video?t=806.723000&ignore_trimming=true",
              start: "13m26.723s",
              end: "14m4.886s",
              start_time: 806723,
              end_time: 844886,
              source_count: 1,
            }}
          ></ClipRes>
        ) : null} */}
      </div>
    </div>
  );
};

export default App;
