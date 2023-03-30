import React, { useState, useRef } from "react";
import { FrameClient } from "@eluvio/elv-client-js/dist/ElvFrameClient-min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import InputBox from "./components/InputBox";
import SearchBox from "./components/SearchBox";
import ClipRes from "./components/ClipRes";
import ReactPaginate from "react-paginate";
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
  // basic info
  const [search, setSearch] = useState("");
  const [objId, setObjId] = useState("");
  const [url, setUrl] = useState("");
  const [response, setResopnse] = useState([]);

  // loading status
  const [loadingSearchRes, setLoadingSearchRes] = useState(false);
  const [haveSearchRes, setHaveSearchRes] = useState(false);
  const [loadingPlayoutUrl, setLoadingPlayoutUrl] = useState(false);
  const [havePlayoutUrl, setHavePlayoutUrl] = useState(false);
  const [err, setErr] = useState(false);
  const [loadedContent, setLoadedContent] = useState(0);
  const [totalContent, setTotalContent] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  // processed info
  const pages = useRef({});
  const numPages = useRef(0);
  const currentPage = useRef(1);
  const client = useRef(null);

  const resetLoadStatus = () => {
    setHavePlayoutUrl(false);
    setLoadingPlayoutUrl(false);
    setHaveSearchRes(false);
    setLoadingSearchRes(false);
    setErr(false);
    setLoadedContent(0);
    setTotalContent(0);
  };

  const setErrorStatus = () => {
    setHavePlayoutUrl(false);
    setLoadingPlayoutUrl(false);
    setHaveSearchRes(false);
    setErr(true);
    setLoadedContent(0);
    setTotalContent(0);
  };

  const getClient = () => {
    if (client.current == null) {
      const _client = new FrameClient({
        target: window.parent,
      });
      client.current = _client;
      return _client;
    } else {
      return client.current;
    }
  };
  const getSearchUrl = async () => {
    const client = getClient();
    try {
      const libId = await client.ContentObjectLibraryId({
        objectId: objId,
      });
      const url = await client.Rep({
        libraryId: libId,
        objectId: objId,
        rep: "search",
        service: "search",
        makeAccessRequest: true,
        queryParams: {
          terms: search,
          select: "...,text,/public/asset_metadata/title",
          start: 0,
          limit: 80,
          clips_include_source_tags: false,
          clips: true,
          sort: "f_display_title_as_string@asc,f_start_time@asc",
        },
      });
      setUrl(url);
      return { url, client };
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const jumpToPage = async (pageIndex) => {
    currentPage.current = pageIndex;
    return pages.current[pageIndex]["clips"];
  };

  const curl = async (url, client) => {
    const clip_per_page = {};
    // load and parse the res from curling search url
    try {
      const res = await axios.get(url, { timeout: 10000 });
      const num_pages = Math.ceil(res["data"]["contents"].length / 5);
      setTotalContent(res["data"]["contents"].length);
      numPages.current = num_pages;
      for (let i = 1; i <= num_pages; i++) {
        clip_per_page[i] = { processed: false, clips: [] };
      }
      for (let i = 0; i < res["data"]["contents"].length; i++) {
        const pageIndex = Math.floor(i / 5) + 1;
        clip_per_page[pageIndex]["clips"].push(res["data"]["contents"][i]);
      }
      setLoadingSearchRes(false);
      setHaveSearchRes(true);
    } catch (err) {
      setErrMsg(
        "Curl search url timeout err, search node retrieving index, please try again later"
      );
      setErrorStatus();
      return null;
    }

    try {
      // loading playout url for each clip res
      setLoadingPlayoutUrl(true);
      currentPage.current = 1;
      const dic = {};
      let offering = null;
      let cnt = 0;
      for (let pageIndex in clip_per_page) {
        for (let item of clip_per_page[pageIndex]["clips"]) {
          const objectId = item["id"];
          if (objectId in dic) {
            item["url"] = dic[objectId];
          } else {
            // without setting offering, sony will use fairplay, too slow
            // an ugly way , but it works well
            if (offering == null) {
              const offerings = await client.AvailableOfferings({
                objectId,
              });
              if ("default_clear" in offerings) {
                offering = "default_clear";
              } else {
                offering = "default";
              }
            }

            const playoutOptions = await client.PlayoutOptions({
              objectId,
              protocols: ["hls"],
              offering: offering,
              drms: ["clear", "aes-128", "fairplay"],
            });
            const playoutMethods = playoutOptions["hls"].playoutMethods;
            const playoutInfo =
              playoutMethods.clear ||
              playoutMethods["aes-128"] ||
              playoutMethods.fairplay;
            const videoUrl = playoutInfo.playoutUrl;
            dic[objectId] = videoUrl;
            item["url"] = videoUrl;
          }
          cnt += 1;
          setLoadedContent(cnt);
        }
        clip_per_page[pageIndex]["processed"] = true;
      }
      pages.current = clip_per_page;
      setLoadingPlayoutUrl(false);
      setHavePlayoutUrl(true);
      return clip_per_page[1]["clips"];
    } catch (err) {
      console.log(`Error message : ${err.message} - `, err.code);
      setErrMsg("loading playout url error");
      setErrorStatus();
      return null;
    }
  };
  const getRes = async () => {
    if (search === "" || objId === "") {
      console.log("err");
      setErrorStatus();
      setErrMsg("Need to give reasonable search obj Id and search condition");
    } else {
      setLoadingSearchRes(true);
      const res = await getSearchUrl();
      if (res != null) {
        const { url, client } = res;
        const searchRes = await curl(url, client);
        if (res != null) {
          setResopnse(searchRes);
        }
      } else {
        setLoadingSearchRes(false);
        setErr(true);
        setErrMsg("creating search URL err, check the search index Id again");
      }
    }
  };
  return (
    <div className="container">
      <div style={title}>
        <h1 className="mt-3">Eluvio Clip Search</h1>
      </div>
      <div className="row mt-3">
        <InputBox
          text="Search object"
          disabled={loadingSearchRes || loadingPlayoutUrl}
          handleSubmitClick={(txt) => {
            resetLoadStatus();
            setObjId(txt);
            pages.current = {};
            currentPage.current = 1;
          }}
        />
      </div>
      <div className="row mt-3">
        <SearchBox
          text="Search term"
          disabled={loadingSearchRes || loadingPlayoutUrl}
          handleSubmitClick={(txt) => {
            resetLoadStatus();
            setSearch(txt.trim());
            pages.current = {};
            currentPage.current = 1;
          }}
          statusHandler={resetLoadStatus}
        />
      </div>

      {/* show the text info for both input and the search output */}
      {!haveSearchRes ? (
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
            disabled={loadingSearchRes || loadingPlayoutUrl}
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
      {haveSearchRes ? (
        <ReactPaginate
          breakLabel="..."
          nextLabel=">"
          onPageChange={(data) => {
            const pageIndex = data.selected + 1;
            jumpToPage(pageIndex).then((res) => {
              if (res != null) {
                setResopnse(res);
              }
            });
          }}
          pageRangeDisplayed={3}
          pageCount={numPages.current}
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
      ) : null}

      {/* loading status or video player */}
      {loadingSearchRes || loadingPlayoutUrl ? (
        <div style={hint}>
          <p>
            loading res, progress {loadedContent} / {totalContent}
          </p>
        </div>
      ) : havePlayoutUrl && response.length > 0 ? (
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
      ) : err ? (
        <div style={hint}>
          <p>{errMsg}</p>
        </div>
      ) : null}
    </div>
  );
};

export default App;
