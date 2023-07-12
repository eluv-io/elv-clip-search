import React, { useState, useRef } from "react";
import { FrameClient } from "@eluvio/elv-client-js/dist/ElvFrameClient-min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import InputBox from "./components/InputBox";
import SearchBox from "./components/SearchBox";
import ClipRes from "./components/ClipRes";
import PaginationBar from "./components/Pagination";
import FuzzySearchBox from "./components/FuzzySearch";
import { parseSearchRes, createSearchUrl, getPlayoutUrl } from "./utils";

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
  height: 400,
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
  const [libId, setLibId] = useState("");
  const [url, setUrl] = useState("");
  const [displayingContents, setDisplayingContents] = useState([]);

  // for help the topk showing method to rescue the BM25 matching results
  const topk = useRef([]);
  const topkCnt = useRef(0); // because the actual returned results may be less than TOPK
  const topkPages = useRef(1);
  const [loadingTopkPage, setLoadingTopkPage] = useState(false);
  const playoutUrlMemo = useRef({});

  // loading status
  const [loadingSearchRes, setLoadingSearchRes] = useState(false);
  const [haveSearchUrl, setHaveSearchUrl] = useState(false);
  const [haveSearchRes, setHaveSearchRes] = useState(false);
  const [loadingPlayoutUrl, setLoadingPlayoutUrl] = useState(false);
  const [havePlayoutUrl, setHavePlayoutUrl] = useState(false);

  // other helpful status
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
  const contentsIdNameMap = useRef({});
  const numPages = useRef(0);
  const currentPage = useRef(1);
  const client = useRef(null);
  const [currentContent, setCurrentContent] = useState("");
  const filteredSearchFields = useRef([]);

  const resetLoadStatus = () => {
    setHavePlayoutUrl(false);
    setLoadingPlayoutUrl(false);
    setHaveSearchUrl(false);
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
      return _client;
    } else {
      return client.current;
    }
  };

  const jumpToPageInAll = (pageIndex) => {
    currentPage.current = pageIndex;
    setDisplayingContents(contents.current[currentContent].clips[pageIndex]);
  };

  // TODO not sure if it is a good apporach to wrap the whole process using try catch
  const jumpToPageInTopk = async (pageIndex) => {
    setLoadingTopkPage(true);
    setHavePlayoutUrl(false);
    try {
      for (let i = 0; i < topk.current[pageIndex].length; i++) {
        if (!topk.current[pageIndex][i].processed) {
          const objectId = topk.current[pageIndex][i].id;
          if (objectId in playoutUrlMemo.current) {
            topk.current[pageIndex][i].url = playoutUrlMemo.current[objectId];
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
      setLoadingTopkPage(false);
      setHavePlayoutUrl(true);
      setDisplayingContents(topk.current[pageIndex]);
    } catch (err) {
      console.log(err);
      setLoadingTopkPage(false);
      setHavePlayoutUrl(false);
      setDisplayingContents([]);
      setErr(true);
      setErrMsg("Loading playout url for contents on this page went wrong");
    }
  };

  const jumpToContent = async (objectId) => {
    try {
      // loading playout url for each clip res
      setHavePlayoutUrl(false);
      setLoadingPlayoutUrl(true);
      currentPage.current = 1;
      const clips_per_content = contents.current;
      if (clips_per_content[objectId].processed) {
        // if it is processed, just return that
        numPages.current = Object.keys(
          clips_per_content[objectId].clips
        ).length;
        setLoadingPlayoutUrl(false);
        setHavePlayoutUrl(true);
        setDisplayingContents(clips_per_content[objectId].clips[1]);
        return;
      } else {
        // get the possible offerings
        let videoUrl = "";
        if (objectId in playoutUrlMemo.current) {
          videoUrl = playoutUrlMemo.current[objectId];
        } else {
          videoUrl = await getPlayoutUrl({
            client: client.current,
            objectId,
          });
          playoutUrlMemo.current[objectId] = videoUrl;
        }
        for (let pageIndex in clips_per_content[objectId].clips) {
          for (let item of clips_per_content[objectId].clips[pageIndex]) {
            item.url = videoUrl;
          }
        }
        clips_per_content[objectId].processed = true;
        contents.current = clips_per_content;
        numPages.current = Object.keys(
          clips_per_content[objectId].clips
        ).length;
        setLoadingPlayoutUrl(false);
        setHavePlayoutUrl(true);
        setDisplayingContents(clips_per_content[objectId].clips[1]);
        return;
      }
    } catch (err) {
      console.log(`Error message : ${err.message} - `, err.code);
      setLoadingPlayoutUrl(false);
      setHavePlayoutUrl(false);
      setErrMsg("Playout URL error");
      setErr(true);
      return null;
    }
  };

  const getRes = async () => {
    playoutUrlMemo.current = {};
    const _client = getClient();
    if (search === "" && fuzzySearchPhrase === "") {
      console.log("err");
      setErr(true);
      setErrMsg("Missing search phrases or filters");
      return;
    } else if (objId === "") {
      console.log("err");
      setErr(true);
      setErrMsg("Missing search index");
      return;
    } else {
      // reset the status
      resetLoadStatus();
      setLoadingSearchRes(true);
      setDisplayingContents([]);
      // try to create the search url
      const res = await createSearchUrl({
        client: _client,
        objectId: objId,
        libraryId: libId,
        searchVersion: searchVersion.current,
        search,
        fuzzySearchPhrase,
        fuzzySearchField,
      });
      if (res.status === 0) {
        // we got the search Url
        setHaveSearchUrl(true);
        console.log(res.url);
        setUrl(res.url);
        let searchRes = {};
        // try to query
        try {
          searchRes = await axios.get(res.url);
        } catch (err) {
          console.log(err);
          setLoadingSearchRes(false);
          setErr(true);
          setErrMsg(
            "Query request already sent, but fail to get results from search engine"
          );
          return;
        }
        // try to parse
        let firstContentToDisplay = "";
        try {
          const {
            clips_per_content,
            firstContent,
            idNameMap,
            topkRes,
            topkCount,
          } = await parseSearchRes(
            searchRes["data"]["contents"],
            TOPK,
            CLIPS_PER_PAGE
          );
          // update the result information for "show topk" display mode
          topkCnt.current = topkCount;
          topk.current = topkRes;
          topkPages.current = topkRes.length;
          // update the result infomation for "group by content" display mode
          setTotalContent(searchRes["data"]["contents"].length);
          contents.current = clips_per_content;
          contentsIdNameMap.current = idNameMap;
          setCurrentContent(firstContent);
          firstContentToDisplay = firstContent;
          numPages.current =
            firstContent !== ""
              ? clips_per_content[firstContent].clips.length
              : 0;
          // update the loading status
          setLoadingSearchRes(false);
          setHaveSearchRes(true);
        } catch (err) {
          console.log(err);
          setLoadingSearchRes(false);
          setErr(true);
          setErrMsg(
            "Parse the query result err, might because search engine change the result format"
          );
          return;
        }
        // try to load and show the first contents infomation
        if (firstContentToDisplay !== "") {
          // there are err handling things inside this function
          await jumpToContent(firstContentToDisplay);
        }
      } else {
        // create search url err
        setLoadingSearchRes(false);
        setErr(true);
        setErrMsg("Fail to create the search query url");
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
            setLibId(libId);
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
              "Permission Error, check you account and the input index please"
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
                  setFuzzySearchPhrase(text);
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
      {!(haveSearchRes || loadingSearchRes) && haveSearchVersion && (
        <div style={inputCheckContainer}>
          <div style={inputInfoContainer}>
            <div style={inputInfo}>
              <div style={{ flex: 1 }}>Search Index:</div>
              <div style={{ flex: 3 }}>{objId}</div>
            </div>
            {showFuzzy && (
              <div style={inputInfo}>
                <div style={{ flex: 1 }}>Search Phrase (BM 25):</div>
                <div style={{ flex: 3 }}>{fuzzySearchPhrase}</div>
              </div>
            )}
            {showFuzzy && (
              <div style={inputInfo}>
                <div style={{ flex: 1 }}>Search Fields (BM 25):</div>
                <div style={{ flex: 3 }}>{fuzzySearchField.join(",")}</div>
              </div>
            )}
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
      )}

      {haveSearchUrl && (
        <div style={curlResContainer}>
          <div style={curlRes}>
            <div style={{ flex: 1 }}>
              Search url {err && !haveSearchRes && "(FAILED)"}
            </div>
            <textarea style={curlResTextArea} value={url} readOnly></textarea>
          </div>
        </div>
      )}

      {/* loading status or video player */}
      {loadingSearchRes ? (
        haveSearchUrl ? (
          <div style={hint}>Query sent, waiting for search engine response</div>
        ) : (
          <div style={hint}>Creating search url</div>
        )
      ) : haveSearchRes ? (
        totalContent > 0 ? (
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
                    setShowTopk(true);
                    await jumpToPageInTopk(0);
                  }}
                >
                  Show Top {topkCnt.current}
                </button>
                <button
                  style={{
                    ...clipResShowMethodButton,
                    ...(showTopk && { border: "none" }),
                  }}
                  onClick={async () => {
                    setShowTopk(false);
                    await jumpToContent(currentContent);
                  }}
                >
                  Show {totalContent} returned results
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
                    await jumpToContent(event.target.value);
                  }}
                >
                  {Object.keys(contents.current).map((k) => {
                    return (
                      <option value={k} key={k}>
                        {contentsIdNameMap.current[k]}
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
                    await jumpToContent(event.target.value);
                  }}
                >
                  {Object.keys(contents.current).map((k) => {
                    return (
                      <option value={k} key={k}>
                        {contentsIdNameMap.current[k]}
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
                <PaginationBar
                  pageCount={showTopk ? topkPages.current : numPages.current}
                  onPageChangeHandler={
                    showTopk
                      ? async (data) => {
                          const pageIndex = data.selected;
                          await jumpToPageInTopk(pageIndex);
                        }
                      : (data) => {
                          const pageIndex = data.selected + 1;
                          jumpToPageInAll(pageIndex);
                        }
                  }
                />
              )}
              {havePlayoutUrl ? (
                displayingContents.map((clip) => {
                  return (
                    <ClipRes
                      clipInfo={clip}
                      key={clip.id + clip.start_time}
                    ></ClipRes>
                  );
                })
              ) : loadingPlayoutUrl || loadingTopkPage ? (
                <div style={loadingUrlContainer}>Loading playout URL</div>
              ) : err ? (
                <div style={hint}>
                  <p>{errMsg}</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div style={hint}>
            <p>No clip returned! </p>
          </div>
        )
      ) : err ? (
        <div style={hint}>
          <p>{errMsg}</p>
        </div>
      ) : null}
    </div>
  );
};

export default App;
