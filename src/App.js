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

const button = {
  width: "10%",
  border: "None",
  borderRadius: 5,
  padding: 5,
  color: "white",
  backgroundColor: "#3b87eb",
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
  borderRadius: 10,
};

const hint = {
  width: "100%",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 40,
};

const clipResContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
};

const clipResInfoContainer = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
};

const clipResTotal = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignContent: "center",
  backgroundColor: "whitesmoke",
  width: "20%",
  padding: 10,
  borderRadius: 10,
};

const clipResTitleSelector = {
  backgroundColor: "whitesmoke",
  width: "50%",
  border: "none",
  padding: 10,
  borderRadius: 10,
};

const clipResShowContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  paddingTop: 10,
  paddingBottom: 10,
  marginBottom: 10,
  marginTop: 20,
  backgroundColor: "whitesmoke",
  borderRadius: 10,
};

const loadingUrlContainer = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  backgroundColor: "whitesmoke",
  marginTop: 20,
  padding: 10,
  borderRadius: 10,
};

const App = () => {
  const CLIPS_PER_PAGE = 3;
  // basic info
  const [search, setSearch] = useState("");
  const [objId, setObjId] = useState("");
  const [url, setUrl] = useState("");
  const [response, setResponse] = useState([]);

  // loading status
  const [loadingSearchRes, setLoadingSearchRes] = useState(false);
  const [haveSearchRes, setHaveSearchRes] = useState(false);
  const [loadingPlayoutUrl, setLoadingPlayoutUrl] = useState(false);
  const [havePlayoutUrl, setHavePlayoutUrl] = useState(false);
  const [err, setErr] = useState(false);
  const [totalContent, setTotalContent] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  // processed info
  const contents = useRef({});
  const contentsInfo = useRef({});
  const numPages = useRef(0);
  const currentPage = useRef(1);
  const client = useRef(null);
  const [currentContent, setCurrentContent] = useState("");

  const resetLoadStatus = () => {
    setHavePlayoutUrl(false);
    setLoadingPlayoutUrl(false);
    setHaveSearchRes(false);
    setLoadingSearchRes(false);
    setErr(false);
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
          limit: 160,
          clips_include_source_tags: false,
          clips: true,
          // sort: "f_display_title_as_string@asc,f_start_time@asc",
          sort: "f_start_time@asc",
        },
      });
      setUrl(url);
      return { url, client };
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const jumpToPage = (pageIndex) => {
    currentPage.current = pageIndex;
    return contents.current[currentContent].clips[pageIndex];
  };

  const jumpToContent = async (objectId) => {
    try {
      // loading playout url for each clip res
      setLoadingPlayoutUrl(true);
      currentPage.current = 1;
      const clips_per_content = contents.current;
      setResponse(clips_per_content[objectId].clips[1]);
      if (clips_per_content[objectId].processed) {
        // if it is processed, just return that
        numPages.current = Object.keys(
          clips_per_content[objectId].clips
        ).length;
        setLoadingPlayoutUrl(false);
        setHavePlayoutUrl(true);
        return clips_per_content[objectId].clips[1];
      }
      // get the possible offerings
      let offering = null;
      const offerings = await client.current.AvailableOfferings({
        objectId,
      });
      if ("default_clear" in offerings) {
        offering = "default_clear";
      } else {
        offering = "default";
      }
      // given the offering, load the playout url for this content
      const playoutOptions = await client.current.PlayoutOptions({
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
      for (let pageIndex in clips_per_content[objectId].clips) {
        for (let item of clips_per_content[objectId].clips[pageIndex]) {
          item.url = videoUrl;
        }
      }
      clips_per_content[objectId].processed = true;
      contents.current = clips_per_content;
      numPages.current = Object.keys(clips_per_content[objectId].clips).length;
      setLoadingPlayoutUrl(false);
      setHavePlayoutUrl(true);
      return clips_per_content[objectId].clips[1];
    } catch (err) {
      console.log(`Error message : ${err.message} - `, err.code);
      setLoadingPlayoutUrl(false);
      setHavePlayoutUrl(false);
      setErrMsg("loading playout url error");
      setErr(true);
      return null;
    }
  };

  const parseSearchRes = (data) => {
    const clips_per_content = {};
    let firstContent = "";
    for (let i = 0; i < data.length; i++) {
      // get currernt item
      const item = data[i];
      // if not in clips_per_content: need to add them in
      if (!(item["id"] in clips_per_content)) {
        clips_per_content[item["id"]] = { processed: false, clips: [item] };
        contentsInfo.current[item["id"]] =
          item.meta.public.asset_metadata.title.split(",")[0];
        // set the first content to be current content
        if (firstContent === "") {
          firstContent = item["id"];
          setCurrentContent(item["id"]);
        }
      } else {
        // if already in the dic, just push it in
        clips_per_content[item["id"]].clips.push(item);
      }
    }
    for (let id in clips_per_content) {
      // pagitation the clips under this contents
      const clips = clips_per_content[id].clips;
      const clips_per_page = {};
      const num_pages = Math.ceil(clips.length / CLIPS_PER_PAGE);
      numPages.current = num_pages;
      for (let i = 1; i <= num_pages; i++) {
        clips_per_page[i] = [];
      }
      for (let i = 0; i < clips.length; i++) {
        const pageIndex = Math.floor(i / CLIPS_PER_PAGE) + 1;
        clips_per_page[pageIndex].push(clips[i]);
      }
      clips_per_content[id].clips = clips_per_page;
    }
    return { clips_per_content, firstContent };
  };

  const curl = async (url) => {
    let clips_per_content = {};
    let firstContent = "";
    // load and parse the res from curling search url
    try {
      const res = await axios.get(url, { timeout: 10000 });
      setTotalContent(res["data"]["contents"].length);
      const parseRes = parseSearchRes(res["data"]["contents"]);
      firstContent = parseRes["firstContent"];
      clips_per_content = parseRes["clips_per_content"];
      contents.current = clips_per_content;
      setLoadingSearchRes(false);
      setHaveSearchRes(true);
    } catch (err) {
      setLoadingSearchRes(false);
      setHaveSearchRes(false);
      setErrMsg(
        "Curl search url timeout err, search node retrieving index, please try again later"
      );
      setErr(true);
      return null;
    }
    setResponse(clips_per_content[firstContent].clips[1]);
    const res = await jumpToContent(firstContent);
    return res;
  };
  const getRes = async () => {
    if (search === "" || objId === "") {
      console.log("err");
      setErr(true);
      setErrMsg("Need to give reasonable search obj Id and search condition");
    } else {
      setLoadingSearchRes(true);
      const res = await getSearchUrl();
      if (res != null) {
        const { url } = res;
        const searchRes = await curl(url);
        if (res != null) {
          setResponse(searchRes);
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
            setUrl("");
            resetLoadStatus();
            setObjId(txt);
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
            currentPage.current = 1;
          }}
          statusHandler={resetLoadStatus}
        />
      </div>

      {/* show the text info for both input and the search output */}
      {!(haveSearchRes || loadingSearchRes) ? (
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
            style={button}
            onClick={getRes}
            disabled={loadingSearchRes || loadingPlayoutUrl}
          >
            Let's go
          </button>
        </div>
      ) : haveSearchRes ? (
        <div style={curlResContainer}>
          <div style={curlRes}>
            <div style={{ flex: 1 }}>Search url</div>
            <textarea style={curlResTextArea} value={url} readOnly></textarea>
          </div>
          <div style={curlRes}>
            <div style={{ flex: 1 }}>contents on this page</div>
            <textarea
              style={curlResTextArea}
              value={JSON.stringify(response, null, 4)}
              readOnly
            ></textarea>
          </div>
        </div>
      ) : null}

      {/* loading status or video player */}
      {loadingSearchRes ? (
        <div style={hint}>loading res</div>
      ) : haveSearchRes ? (
        <div style={clipResContainer}>
          <div style={clipResInfoContainer}>
            <div style={clipResTotal}>total results {totalContent}</div>
            <select
              style={clipResTitleSelector}
              onChange={(event) => {
                setCurrentContent(event.target.value);
                jumpToContent(event.target.value).then((res) => {
                  setResponse(res);
                });
              }}
            >
              {Object.keys(contents.current).map((key) => {
                return <option value={key}>{contentsInfo.current[key]}</option>;
              })}
            </select>
          </div>

          {loadingPlayoutUrl ? (
            <div style={loadingUrlContainer}>loading playout URL</div>
          ) : havePlayoutUrl ? (
            <div style={clipResShowContainer}>
              {numPages.current > 1 ? (
                <ReactPaginate
                  breakLabel="..."
                  nextLabel=">"
                  onPageChange={(data) => {
                    const pageIndex = data.selected + 1;
                    const res = jumpToPage(pageIndex);
                    setResponse(res);
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

              {response.map((clip) => {
                return (
                  <ClipRes
                    clipInfo={clip}
                    key={clip.id + clip.start_time}
                  ></ClipRes>
                );
              })}
            </div>
          ) : null}
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
