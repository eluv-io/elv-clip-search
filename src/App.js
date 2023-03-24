import React, { useState, useRef } from "react";
import { ElvClient } from "@eluvio/elv-client-js/dist/ElvClient-min.js";
import AuthorizationClient from "@eluvio/elv-client-js/src/AuthorizationClient";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import InputBox from "./components/InputBox";
import ClipRes from "./components/ClipRes";
// import PageBar from "./components/PageBar";
import ReactPaginate from "react-paginate";
import logo from "./static/images/Eluvio Favicon full.png";
import config from "./config.json";
const title = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  height: 100,
};

const inputCheckContainer = {
  margin: 10,
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const inputInfoContainer = {
  backgroundColor: "whitesmoke",
  borderRadius: 10,
  margin: 10,
  width: "100%",
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const inputInfo = {
  margin: 10,
  width: "90%",
  flexDirection: "row",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const curlResContainer = {
  backgroundColor: "whitesmoke",
  borderRadius: 10,
  marginTop: 20,
  marginBottom: 40,
  padding: 10,
  height: 600,
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const curlRes = {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
};

const curlResTextArea = {
  width: "95%",
  flex: 9,
  padding: 10,
  marginBottom: 20,
  borderStyle: "None",
  borderRadius: 20,
};

const hint = {
  width: "100%",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 40,
};

const App = () => {
  const [search, setSearch] = useState("");
  const [objId, setObjId] = useState("");
  const [url, setUrl] = useState("");
  const [response, setResopnse] = useState([]);
  const [haveRes, setHaveRes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPlauoutUrl, setLoadingPlayoutUrl] = useState(false);
  const [loadedPlauoutUrl, setLoadedPlayoutUrl] = useState(0);
  const [timeoutErr, setTimeoutErr] = useState(false);
  const pages = useRef({});
  const currentPage = useRef(1);
  const playoutTokens = useRef({});
  const [client, setClient] = useState(null);

  const getClient = async ({ pk }) => {
    var client = await ElvClient.FromConfigurationUrl({
      configUrl: "https://main.net955305.contentfabric.io/config",
    });
    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({ privateKey: pk });
    client.SetSigner({ signer });
    setClient(client);
    return client;
  };
  const getSearchUrl = async () => {
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
  const jumpToPage = async (pageIndex) => {
    currentPage.current = pageIndex;
    const clip_per_page = pages.current;
    if (clip_per_page[pageIndex]["processed"]) {
      return clip_per_page[pageIndex]["clips"];
    }
    setLoadingPlayoutUrl(true);
    setHaveRes(false);
    const dic = playoutTokens.current;
    let cnt = 0;
    setLoadedPlayoutUrl(0);
    for (let item of clip_per_page[pageIndex]["clips"]) {
      const objectId = item["id"];
      if (objectId in dic) {
        console.log("find in dic");
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
        item["url"] = videoUrl;
      }
      cnt += 1;
      setLoadedPlayoutUrl(cnt);
    }
    setLoadingPlayoutUrl(false);
    setHaveRes(true);
    playoutTokens.current = dic;
    pages.current = clip_per_page;
    return clip_per_page[pageIndex]["clips"];
  };
  const curl = async (url, client) => {
    try {
      const res = await axios.get(url, { timeout: 10000 });
      const dic = {};
      const num_pages = Math.ceil(res["data"]["contents"].length / 5);
      const clip_per_page = {};
      for (let i = 1; i <= num_pages; i++) {
        clip_per_page[i] = { processed: false, clips: [] };
      }
      for (let i = 0; i < res["data"]["contents"].length; i++) {
        const pageIndex = Math.floor(i / 5) + 1;
        console.log(pageIndex);
        clip_per_page[pageIndex]["clips"].push(res["data"]["contents"][i]);
      }
      setLoading(false);
      setLoadingPlayoutUrl(true);
      pages.current = clip_per_page;
      currentPage.current = 1;
      console.log(clip_per_page);
      let cnt = 0;
      for (let item of clip_per_page[1]["clips"]) {
        const objectId = item["id"];
        if (objectId in dic) {
          console.log("find in dic");
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
          item["url"] = videoUrl;
        }
        cnt += 1;
        setLoadedPlayoutUrl(cnt);
      }
      setLoadingPlayoutUrl(false);
      setHaveRes(true);
      playoutTokens.current = dic;
      pages.current = clip_per_page;
      return clip_per_page[1]["clips"];
    } catch (err) {
      console.log(`Error message : ${err.message} - `, err.code);
      setLoading(false);
      setTimeoutErr(true);
      return null;
    }
  };
  const getRes = () => {
    setLoading(true);
    setLoadedPlayoutUrl(0);
    getSearchUrl().then(({ url, client }) => {
      curl(url, client)
        .then((res) => {
          if (res != null) {
            console.log(res);
            setResopnse(res);
          } else {
            // maybe popup window to alert here
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };
  return (
    <div className="container">
      <div style={title}>
        <img src={logo} alt="logo" style={{ height: "90%", margin: 30 }} />
        <h1 className="mt-3">Eluvio Automatic Clip Generation</h1>
      </div>
      <div className="row mt-3">
        <InputBox
          text="Search object"
          disabled={loading || loadingPlauoutUrl}
          handleSubmitClick={(txt) => {
            setHaveRes(false);
            setLoading(false);
            setTimeoutErr(false);
            setObjId(txt);
            pages.current = {};
            currentPage.current = 1;
          }}
        />
      </div>
      <div className="row mt-3">
        <InputBox
          text="Search term"
          disabled={loading || loadingPlauoutUrl}
          handleSubmitClick={(txt) => {
            setHaveRes(false);
            setLoading(false);
            setTimeoutErr(false);
            setSearch(encodeURI(txt.trim()));
            pages.current = {};
            currentPage.current = 1;
          }}
        />
      </div>

      {/* show the text info for both input and the search output */}
      {!haveRes ? (
        <div style={inputCheckContainer}>
          <div style={inputInfoContainer}>
            <div style={inputInfo}>
              <div style={{ flex: 1 }}>Search Objext Index:</div>
              <div style={{ flex: 3 }}>{objId}</div>
            </div>
            <div style={inputInfo}>
              <div style={{ flex: 1 }}>Search Phrase:</div>
              <div style={{ flex: 3 }}>{search}</div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={getRes}
            disabled={loading || loadingPlauoutUrl}
          >
            Let's go
          </button>
        </div>
      ) : (
        <div style={curlResContainer}>
          <div style={curlRes}>
            <div style={{ flex: 1 }}>Search url</div>
            <textarea style={curlResTextArea} value={url} readOnly></textarea>
          </div>
          <div style={curlRes}>
            <div style={{ flex: 1 }}>returned content</div>
            <textarea
              style={curlResTextArea}
              value={JSON.stringify(response, null, 4)}
              readOnly
            ></textarea>
          </div>
        </div>
      )}

      {/* paginaiton bar */}
      <ReactPaginate
        breakLabel="..."
        nextLabel=">"
        onPageChange={(data) => {
          const pageIndex = data.selected + 1;
          jumpToPage(pageIndex).then((res) => {
            if (res != null) {
              console.log(res);
              setResopnse(res);
            } else {
              // maybe popup window to alert here
            }
          });
        }}
        pageRangeDisplayed={3}
        pageCount={Object.keys(pages.current).length}
        previousLabel="<"
        renderOnZeroPageCount={null}
        containerClassName="pagination justify-content-center"
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="page-item"
        previousLinkClassName="page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link"
        activeClassName="active"
      />

      {loading ? (
        <div style={hint}>
          <p>curling the search object</p>
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
        <div style={hint}>
          <p>
            {`loading playoutUrl for each clip, please wait for a moment; finished: ${loadedPlauoutUrl} / ${
              pages.current[currentPage.current]["clips"].length
            }`}
          </p>
        </div>
      ) : timeoutErr ? (
        <div style={hint}>
          <p>Curl search node timeout err </p>
        </div>
      ) : null}
    </div>
  );
};

export default App;
