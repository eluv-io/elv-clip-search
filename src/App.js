import React, { useState, useRef } from "react";
import { FrameClient } from "@eluvio/elv-client-js/dist/ElvFrameClient-min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import InputBox from "./components/InputBox";
import SearchBox from "./components/SearchBox";
import ClipRes from "./components/ClipRes";
import ReactPaginate from "react-paginate";
import FuzzySearchBox from "./components/FuzzySearch";

const title = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  height: 100,
};

const inputCheckContainer = {
  marginTop: 10,
  marginBottom: 10,
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

const clipResShowMethodContainer = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "90%",
  marginBottom: 10,
};

const clipResShowMethodButton = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignContent: "center",
  backgroundColor: "whitesmoke",
  width: "30%",
  padding: 10,
  borderRadius: 10,
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
  marginBottom: 40,
  padding: 10,
  borderRadius: 10,
};

const App = () => {
  const CLIPS_PER_PAGE = 3;
  const TOPK = 20;
  const ALL_SEARCH_FIELDS = [
    "celebrity",
    "characters",
    "display_title",
    "logo",
    "object",
    "segment",
    "speech_to_text",
  ];
  // basic info
  const [search, setSearch] = useState("");
  const [fuzzySearchPhrase, setFuzzySearchPhrase] = useState("");
  const [fuzzySearchField, setFuzzySearchField] = useState([]);
  const [objId, setObjId] = useState("");
  const [url, setUrl] = useState("");
  const [response, setResponse] = useState([]);

  // for help the topk showing method to rescue the BM25 matching results
  const topk = useRef([]);
  const topkPages = useRef(1);
  const [loadingTopkPage, setLoadingTopkPage] = useState(false);
  const playoutUrlMemo = useRef({});

  // loading status
  const [loadingSearchRes, setLoadingSearchRes] = useState(false);
  const [haveSearchRes, setHaveSearchRes] = useState(false);
  const [loadingPlayoutUrl, setLoadingPlayoutUrl] = useState(false);
  const [havePlayoutUrl, setHavePlayoutUrl] = useState(false);
  const [err, setErr] = useState(false);
  const [totalContent, setTotalContent] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  const [loadingSearchVersion, setLoadingSearchVersion] = useState(false);
  const [haveSearchVersion, setHaveSearchVersion] = useState(false);
  const [showTopk, setShowTopk] = useState(false);

  // processed info
  const searchVersion = useRef("v1");
  const [showFuzzy, setShowFuzzy] = useState(false);
  const contents = useRef({});
  const contentsInfo = useRef({});
  const numPages = useRef(0);
  const currentPage = useRef(1);
  const client = useRef(null);
  const [currentContent, setCurrentContent] = useState("");
  const filteredSearchFields = useRef([]);

  const resetLoadStatus = () => {
    setHavePlayoutUrl(false);
    setLoadingPlayoutUrl(false);
    setHaveSearchRes(false);
    setLoadingSearchRes(false);
    setErr(false);
    setTotalContent(0);
    setShowTopk(false);
  };

  const getClient = () => {
    if (client.current == null) {
      const _client = new FrameClient({
        target: window.parent,
      });
      client.current = _client;
      window.client = _client;
      return _client;
    } else {
      window.client = client.current;
      return client.current;
    }
  };

  const getPlayoutUrl = async ({ client, objectId }) => {
    let offering = null;
    const offerings = await client.AvailableOfferings({
      objectId,
    });
    if ("default_clear" in offerings) {
      offering = "default_clear";
    } else {
      offering = "default";
    }
    // given the offering, load the playout url for this content
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
    return videoUrl;
  };

  const getSearchUrl = async () => {
    const client = getClient();
    let libId;
    try {
      libId = await client.ContentObjectLibraryId({
        objectId: objId,
      });
    } catch (err) {
      console.log(err);
      return 0;
    }
    try {
      if (searchVersion.current === "v1") {
        console.log("doing V1 search");
        // searchV1
        const url = await client.Rep({
          libraryId: libId,
          objectId: objId,
          rep: "search",
          service: "search",
          makeAccessRequest: true,
          queryParams: {
            terms: `(${search})`,
            select: "...,text,/public/asset_metadata/title",
            start: 0,
            limit: 160,
            clips_include_source_tags: false,
            clips: true,
            sort: "f_start_time@asc",
          },
        });
        setUrl(url);
        return { url, client };
      } else {
        // search v2
        console.log("doing V2 search");
        const topK = fuzzySearchPhrase === "" ? 160 : 80;
        const queryParams = {
          terms:
            fuzzySearchPhrase === ""
              ? `(${search})`
              : search === ""
              ? `(${fuzzySearchPhrase})`
              : `(${[fuzzySearchPhrase, search].join(" AND ")})`,
          select: "/public/asset_metadata/title",
          start: 0,
          limit: topK,
          max_total: topK,
          display_fields: "f_start_time,f_end_time",
          // sort: "f_display_title_as_string@asc,f_start_time@asc",
          clips: true,
          scored: true,
        };
        if (fuzzySearchField.length > 0) {
          queryParams.search_fields = fuzzySearchField.join(",");
        }
        const url = await client.Rep({
          libraryId: libId,
          objectId: objId,
          rep: "search",
          service: "search",
          makeAccessRequest: true,
          queryParams: queryParams,
        });
        const cfgUrl = await client.ConfigUrl();
        const cfg = await axios.get(cfgUrl);
        const searchV2Node = cfg.data.network.services.search_v2[0];
        const s1 = url.indexOf("contentfabric");
        const s2 = searchV2Node.indexOf("contentfabric");
        const newUrl = searchV2Node.slice(0, s2).concat(url.slice(s1));
        setUrl(newUrl);
        console.log(newUrl);
        return { url: newUrl, client };
      }
    } catch (err) {
      console.log(err);
      return 1;
    }
  };

  const jumpToPage = (pageIndex) => {
    currentPage.current = pageIndex;
    return contents.current[currentContent].clips[pageIndex];
  };

  const jumpToPageinTopk = async (pageIndex) => {
    setResponse(topk.current[pageIndex]);
    for (let i = 0; i < topk.current[pageIndex].length; i++) {
      if (!topk.current[pageIndex][i].processed) {
        const objectId = topk.current[pageIndex][i].id;
        if (objectId in playoutUrlMemo.current) {
          topk.current[i].url = playoutUrlMemo.current[objectId];
        } else {
          const videoUrl = await getPlayoutUrl({
            client: client.current,
            objectId,
          });
          playoutUrlMemo.current[objectId] = videoUrl;
          topk.current[pageIndex][i].url = videoUrl;
        }
        topk.current[pageIndex][i].processed = true;
      }
    }
    return topk.current[pageIndex];
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
      const videoUrl = await getPlayoutUrl({
        client: client.current,
        objectId,
      });
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
      setErrMsg("Playout URL error");
      setErr(true);
      return null;
    }
  };

  // const toTimeString = (totalMiliSeconds) => {
  //   const totalMs = totalMiliSeconds;
  //   const result = new Date(totalMs).toISOString().slice(11, 19);

  //   return result;
  // };

  const parseSearchRes = (data) => {
    // pagination on topk res for search v2 fuzzy method
    const topkRes = [];
    let topkResPage = [];
    let firstContent = "";
    for (let i = 0; i < data.length; i++) {
      if (i >= TOPK) {
        break;
      }
      // get currernt item
      const item = JSON.parse(JSON.stringify(data[i]));
      item.processed = false;
      topkResPage.push(item);
      if (topkResPage.length === CLIPS_PER_PAGE) {
        topkRes.push(topkResPage);
        topkResPage = [];
      }
    }
    if (topkResPage.length > 0) {
      topkRes.push(topkResPage);
    }
    topk.current = topkRes;
    topkPages.current = topkRes.length;

    // the normal display method: group by contentId and pagination inside each content
    const clips_per_content = {};
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
      const res = await axios.get(url);
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
      setErrMsg("Search timeout, please try again later");
      setErr(true);
      return null;
    }
    if (firstContent !== "") {
      setResponse(clips_per_content[firstContent].clips[1]);
      const res = await jumpToContent(firstContent);
      return res;
    } else {
      setResponse([]);
      return [];
    }
  };
  const getRes = async () => {
    playoutUrlMemo.current = {};
    if (search === "" && fuzzySearchPhrase === "") {
      console.log("err");
      setErr(true);
      setErrMsg("Missing search phrases or filters");
    } else if (objId === "") {
      console.log("err");
      setErr(true);
      setErrMsg("Missing search index");
    } else {
      setLoadingSearchRes(true);
      setResponse([]);
      const res = await getSearchUrl();
      if (res !== 1 && res !== 0) {
        const { url } = res;
        const searchRes = await curl(url);
        if (res != null) {
          setResponse(searchRes);
        }
      } else {
        setLoadingSearchRes(false);
        setErr(true);
        if (res === 1) {
          setErrMsg("ACCESS DENIED");
        } else {
          setErrMsg(
            "Fail to make search query, please verify the search index content iq"
          );
        }
      }
    }
  };

  const searchIndexInputBlock = (
    <InputBox
      text="Search Index"
      disabled={loadingSearchRes || loadingPlayoutUrl}
      handleSubmitClick={async (txt) => {
        setUrl("");
        resetLoadStatus();
        setObjId(txt);
        setHaveSearchVersion(false);
        setLoadingSearchVersion(true);
        setSearch("");
        setFuzzySearchField([]);
        setFuzzySearchPhrase("");

        currentPage.current = 1;
        let libId = "";
        const client = getClient();

        try {
          libId = await client.ContentObjectLibraryId({
            objectId: txt,
          });
        } catch (err) {
          setHaveSearchVersion(false);
          setLoadingSearchVersion(false);
          setErr(true);
          setErrMsg("Invalid search index Id");
        }
        if (libId !== "") {
          try {
            const searchObjMeta = await client.ContentObjectMetadata({
              libraryId: libId,
              objectId: txt,
              metadataSubtree: "indexer",
            });
            if (searchObjMeta["version"] === "2.0") {
              setShowFuzzy(true);
              searchVersion.current = "v2";
            } else {
              setShowFuzzy(false);
              searchVersion.current = "v1";
            }
            filteredSearchFields.current = Object.keys(
              searchObjMeta.config.indexer.arguments.fields
            )
              .filter((n) => {
                return ALL_SEARCH_FIELDS.includes(n);
              })
              .map((n) => {
                return `f_${n}`;
              });
            setLoadingSearchVersion(false);
            setHaveSearchVersion(true);
          } catch (err) {
            setHaveSearchVersion(false);
            setLoadingSearchVersion(false);
            setErr(true);
            setErrMsg(
              "Permisson Err, check you account and the input index please"
            );
          }
        }
      }}
    />
  );
  return (
    <div className="container">
      <div style={title}>
        <h1 className="mt-3">Eluvio Clip Generation & Search</h1>
      </div>

      <div className="row mt-3">{searchIndexInputBlock}</div>

      {haveSearchVersion ? (
        searchVersion.current === "v1" ? (
          <div className="row mt-3">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Search
            </div>
            <SearchBox
              text="Search term"
              disabled={loadingSearchRes || loadingPlayoutUrl}
              filteredSearchFields={filteredSearchFields.current}
              searchVersion="1.0"
              handleSubmitClick={(txt) => {
                resetLoadStatus();
                setSearch(txt.trim());
                currentPage.current = 1;
              }}
              statusHandler={resetLoadStatus}
            />
          </div>
        ) : (
          <div>
            <div className="row mt-3">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Search (BM 25)
              </div>
              <FuzzySearchBox
                text="Search Phrase"
                disabled={loadingSearchRes || loadingPlayoutUrl}
                filteredSearchFields={filteredSearchFields.current}
                handleSubmitClick={({ text, fields }) => {
                  resetLoadStatus();
                  setFuzzySearchPhrase(text.trim());
                  setFuzzySearchField(fields);
                  currentPage.current = 1;
                }}
                statusHandler={resetLoadStatus}
              />
            </div>
            <div className="row mt-3">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                More Filters
              </div>
              <SearchBox
                text="Search term"
                filteredSearchFields={filteredSearchFields.current}
                disabled={loadingSearchRes || loadingPlayoutUrl}
                searchVersion="2.0"
                handleSubmitClick={(txt) => {
                  resetLoadStatus();
                  setSearch(txt.trim());
                  currentPage.current = 1;
                }}
                statusHandler={resetLoadStatus}
              />
            </div>
          </div>
        )
      ) : loadingSearchVersion ? (
        <div style={hint}> Checking Search index Version</div>
      ) : null}

      {/* show the text info for both input and the search output */}
      {!(haveSearchRes || loadingSearchRes) && haveSearchVersion ? (
        <div style={inputCheckContainer}>
          <div style={inputInfoContainer}>
            <div style={inputInfo}>
              <div style={{ flex: 1 }}>Search Index:</div>
              <div style={{ flex: 3 }}>{objId}</div>
            </div>
            {showFuzzy ? (
              <div style={inputInfo}>
                <div style={{ flex: 1 }}>Search Phrase (BM 25):</div>
                <div style={{ flex: 3 }}>{fuzzySearchPhrase}</div>
              </div>
            ) : null}
            {showFuzzy ? (
              <div style={inputInfo}>
                <div style={{ flex: 1 }}>Search Fields (BM 25):</div>
                <div style={{ flex: 3 }}>{fuzzySearchField.join(",")}</div>
              </div>
            ) : null}
            <div style={inputInfo}>
              <div style={{ flex: 1 }}>
                {showFuzzy ? "More Filters:" : "Search Phrase"}
              </div>
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
        <div style={hint}>Searching tags and generating clips</div>
      ) : haveSearchRes ? (
        <div style={clipResContainer}>
          {/* if search version is V2,  we have two display options: either group by movie title or show top k and keep the original order */}
          {searchVersion.current === "v2" ? (
            <div style={clipResShowMethodContainer}>
              <button
                style={{
                  ...clipResShowMethodButton,
                  ...(!showTopk && { border: "none" }),
                }}
                onClick={async () => {
                  setLoadingTopkPage(true);
                  setHavePlayoutUrl(false);
                  setShowTopk(true);
                  const res = await jumpToPageinTopk(0);
                  setLoadingTopkPage(false);
                  setHavePlayoutUrl(true);
                  setResponse(res);
                }}
              >
                Show Top {TOPK}
              </button>
              <button
                style={{
                  ...clipResShowMethodButton,
                  ...(showTopk && { border: "none" }),
                }}
                onClick={async () => {
                  setShowTopk(false);
                  const res = await jumpToContent(currentContent);
                  setResponse(res);
                }}
              >
                Show All {totalContent} results
              </button>
            </div>
          ) : (
            <div style={clipResInfoContainer}>
              <div style={clipResTotal}>total results {totalContent}</div>
              <select
                style={clipResTitleSelector}
                value={currentContent}
                onChange={async (event) => {
                  setCurrentContent(event.target.value);
                  const res = await jumpToContent(event.target.value);
                  setResponse(res);
                }}
              >
                {Object.keys(contents.current).map((k) => {
                  return (
                    <option value={k} key={k}>
                      {contentsInfo.current[k]}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* need to display the movie selector is search version is V2 and grouping by movir title */}
          {!showTopk && searchVersion.current === "v2" && (
            <div
              style={{
                ...clipResInfoContainer,
                justifyContent: "center",
              }}
            >
              <select
                style={{
                  ...clipResTitleSelector,
                  width: "90%",
                }}
                value={currentContent}
                onChange={async (event) => {
                  setCurrentContent(event.target.value);
                  const res = await jumpToContent(event.target.value);
                  setResponse(res);
                }}
              >
                {Object.keys(contents.current).map((k) => {
                  return (
                    <option value={k} key={k}>
                      {contentsInfo.current[k]}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div style={clipResShowContainer}>
            {/* if have multiplr pages, we need to display the navigation bar */}
            {((!showTopk && numPages.current > 1) ||
              (showTopk && topkPages.current > 1)) && (
              <ReactPaginate
                breakLabel="..."
                nextLabel=">"
                onPageChange={
                  showTopk
                    ? async (data) => {
                        const pageIndex = data.selected;
                        setLoadingTopkPage(true);
                        setHavePlayoutUrl(false);
                        const res = await jumpToPageinTopk(pageIndex);
                        setLoadingTopkPage(false);
                        setHavePlayoutUrl(true);
                        setResponse(res);
                      }
                    : (data) => {
                        const pageIndex = data.selected + 1;
                        const res = jumpToPage(pageIndex);
                        setResponse(res);
                      }
                }
                pageRangeDisplayed={3}
                pageCount={showTopk ? topkPages.current : numPages.current}
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
            )}

            {havePlayoutUrl ? (
              response.map((clip) => {
                return (
                  <ClipRes
                    clipInfo={clip}
                    key={clip.id + clip.start_time}
                  ></ClipRes>
                );
              })
            ) : loadingPlayoutUrl || loadingTopkPage ? (
              <div style={loadingUrlContainer}>Loading playout URL</div>
            ) : null}
          </div>
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
