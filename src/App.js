import React, { useState } from "react";
import { ElvClient } from "@eluvio/elv-client-js/dist/ElvClient-min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import SearchBox from "./components/SearchBox";
import PKBox from "./components/PrivateKeyInputBox";
import ObjectInfoBox from "./components/ObjectInfo";
const App = () => {
  const [value, setValue] = useState("");
  const [pk, setPK] = useState("");
  const [objId, setObjId] = useState("");

  const getClient = async ({ pk }) => {
    var client = await ElvClient.FromConfigurationUrl({
      configUrl: "https://main.net955305.contentfabric.io/config",
    });
    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({ privateKey: pk });
    client.SetSigner({ signer });
    return client;
  };
  const getToken = async ({ client, libId, objId }) => {
    const authToken = await client.CreateSignedToken({
      libraryId: libId,
      objectId: objId,
      // grantType: "access",
    });
    return authToken;
  };
  const genUrl = async () => {
    const client = await getClient({ pk });
    const libId = await client.ContentObjectLibraryId({
      objectId: objId,
    });
    const token = await getToken({ client, libId, objId });
    console.log(token);
    const url = `https://host-76-74-29-35.contentfabric.io/qlibs/${libId}/q/${objId}/rep/search?terms=${value}&authorization=${token}&select=...,text,/public/asset_metadata/title&stats=f_celebrity_as_string,f_segment_as_string,f_object_as_string,f_display_title_as_string&start=0&limit=80&clips&clips_include_source_tags=false&sort=f_start_time@asc`;
    return url;
  };
  const curl = async (url) => {
    const response = await fetch(url, {
      method: "GET",
    });
    return response;
  };
  return (
    <div className="container">
      <h1 className="mt-3">Elv ML Clip Search</h1>
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
            setValue(txt);
          }}
        />
      </div>
      <div className="row mt-3">
        <span>Search txt: {value}</span>
        <span>Object txt: {objId}</span>
        <span>PK: {pk}</span>
      </div>
      <button
        type="button"
        class="btn btn-primary"
        onClick={() => {
          genUrl().then((url) => {
            curl(url).then((res) => {
              console.log(res);
            });
          });
        }}
      >
        Let's go
      </button>
    </div>
  );
};

export default App;
