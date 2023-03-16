import React, { useState } from "react";
import { ElvClient } from "@eluvio/elv-client-js/dist/ElvClient-min.js";
import AuthorizationClient from "@eluvio/elv-client-js/src/AuthorizationClient";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import SearchBox from "./components/SearchBox";
import ObjectInfoBox from "./components/ObjectInfo";
import ClipRes from "./components/ClipRes";
import logo from "./static/images/Eluvio Favicon full.png";
import config from "./config.json";

const App = () => {
  const [search, setSearch] = useState("");
  // const [pk, setPK] = useState();
  const [objId, setObjId] = useState("");
  const [libId, setLibId] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [url, setUrl] = useState("");
  const [response, setResopnse] = useState([]);
  const [haveRes, setHaveRes] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLibId(libId);
    console.log(libId);
    const authClient = new AuthorizationClient({
      client,
      contentSpaceId: config["space_id"],
    });
    const token = await authClient.AuthorizationToken({
      libraryId: libId,
      objectId: objId,
    });
    console.log(token);
    setAuthToken(token);

    const url = `https://host-76-74-29-35.contentfabric.io/qlibs/${libId}/q/${objId}/rep/search?terms=(${search})&authorization=${token}&select=...,text,/public/asset_metadata/title&stats=f_celebrity_as_string,f_segment_as_string,f_object_as_string,f_display_title_as_string&start=0&limit=80&clips&clips_include_source_tags=false&sort=f_start_time@asc`;
    console.log(url);
    setUrl(url);
    return url;
  };
  const curl = async (url) => {
    const res = await axios.get(url);
    setHaveRes(true);
    setLoading(false);
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
          height: 100,
        }}
      >
        <img src={logo} alt="logo" style={{ height: "90%", margin: 30 }} />
        <h1 className="mt-3">Eluvio Automatic Clip Generation</h1>
      </div>
      <div className="row mt-3">
        <ObjectInfoBox
          handleSubmitClick={(txt) => {
            console.log(txt);
            setHaveRes(false);
            setLoading(false);
            setObjId(txt);
          }}
        />
      </div>
      <div className="row mt-3">
        <SearchBox
          handleSubmitClick={(txt) => {
            console.log(txt);
            setHaveRes(false);
            setLoading(false);
            setSearch(encodeURI(txt.trim()));
          }}
        />
      </div>
      {!haveRes ? (
        <>
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
          </div>
        </>
      ) : (
        <div
          style={{
            backgroundColor: "lightgray",
            borderRadius: 10,
            margin: 10,
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
            style={{ height: "30%", width: "95%", margin: "1%" }}
            readOnly
          ></textarea>
          <text>returned content</text>
          <textarea
            style={{ height: "60%", width: "95%", margin: "1%" }}
            value={JSON.stringify(response, null, 2)}
            readOnly
          ></textarea>
        </div>
      )}

      {loading ? (
        <div>
          <text>loading</text>
        </div>
      ) : haveRes ? (
        <div>
          {response.map((clip) => {
            console.log(clip);
            return (
              <ClipRes
                clipInfo={clip}
                baseUrl="https://host-76-74-91-12.contentfabric.io"
                token={config["playout_token"]}
                libId={libId}
              ></ClipRes>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default App;
