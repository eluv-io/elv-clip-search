import React, { useState, useRef, useEffect } from "react";
import { FrameClient } from "@eluvio/elv-client-js/src/FrameClient";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import InputBox from "./components/InputBox";
import SearchBox from "./components/SearchBox";
import ClipRes from "./components/ClipRes";
import AssetRes from "./components/AssetRes";
import PaginationBar from "./components/Pagination";
import FuzzySearchBox from "./components/FuzzySearch";
import { parseSearchRes, createSearchUrl } from "./utils";
import { BsSearch } from "react-icons/bs";
import DB from "./DB";

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
  const TOPK_BY_DEFAULT = true;
  const ALL_SEARCH_FIELDS = [
    "celebrity",
    // delete for MGM
    // "characters",
    "display_title",
    "logo",
    "object",
    "segment",
    "speech_to_text",
  ];
  const ASSETS_SEARCH_FIELDS = [
    "celebrity",
    "characters",
    "display_title",
    "logo",
    "object",
  ];

  // basic info
  const [search, setSearch] = useState("");
  const [fuzzySearchPhrase, setFuzzySearchPhrase] = useState("");
  const [fuzzySearchField, setFuzzySearchField] = useState([]);
  const [objId, setObjId] = useState("");
  const [libId, setLibId] = useState("");
  const [tenId, setTenId] = useState("");
  const [url, setUrl] = useState("");
  const [searchTerms, setSearchTerms] = useState([]);
  const searchAssets = useRef(false);
  const [displayingContents, setDisplayingContents] = useState([]);
  const [showSearchBox, setShowSearchBox] = useState(false);

  // for help the topk showing method to rescue the BM25 matching results
  const topk = useRef([]);
  const topkCnt = useRef(0); // because the actual returned results may be less than TOPK
  const topkPages = useRef(1);
  const [loadingTopkPage, setLoadingTopkPage] = useState(false);
  // const playoutUrlMemo = useRef({});

  // loading status
  const [loadingSearchRes, setLoadingSearchRes] = useState(false);
  const [haveSearchUrl, setHaveSearchUrl] = useState(false);
  const [haveSearchRes, setHaveSearchRes] = useState(false);
  const [loadingPlayoutUrl, setLoadingPlayoutUrl] = useState(false);
  const [havePlayoutUrl, setHavePlayoutUrl] = useState(false);
  const [processingDB, setProcessingDB] = useState(false);

  // other helpful status
  const [err, setErr] = useState(false);
  const [totalContent, setTotalContent] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  const [loadingSearchVersion, setLoadingSearchVersion] = useState(false);
  const [haveSearchVersion, setHaveSearchVersion] = useState(false);
  const [showTopk, setShowTopk] = useState(TOPK_BY_DEFAULT);

  // processed info
  const network = useRef("main");
  const searchVersion = useRef("v1");
  const [showFuzzy, setShowFuzzy] = useState(false);
  const contents = useRef({});
  const contentsIdNameMap = useRef({});
  const numPages = useRef(0);
  const currentPage = useRef(1);
  const client = useRef(null);
  const [currentContent, setCurrentContent] = useState("");
  const filteredSearchFields = useRef([]);

  const dbClient = useRef(null);
  const walletAddr = useRef(null);
  const searchId = useRef(null);

  const engagement = useRef({});

  //initialize the DB and store the wallet_address and tenancy
  useEffect(() => {
    const storeUserInfo = async () => {
      try {
        const _dbClient = getDBClient();
        if (_dbClient == null) return;

        const addr = await getClient().CurrentAccountAddress();
        walletAddr.current = addr;
        await _dbClient.setUser({ walletAddr: addr });
      } catch (err) {
        if (err.message.include("wallet")) {
          console.log(`Error: getting user wallet address failed`);
        } else {
          console.log("Error occured when storing the user info");
        }
        console.error(err);
      }
    };
    storeUserInfo();
  }, []);

  const resetLoadStatus = () => {
    setHavePlayoutUrl(false);
    setLoadingPlayoutUrl(false);
    setHaveSearchUrl(false);
    setHaveSearchRes(false);
    setLoadingSearchRes(false);
    setErr(false);
    setTotalContent(0);
    if (searchVersion.current === "v1") {
      setShowTopk(false);
    } else {
      setShowTopk(TOPK_BY_DEFAULT);
    }
    setProcessingDB(false);
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

  const getDBClient = () => {
    if (dbClient.current == null) {
      try {
        const _dbClient = new DB();
        dbClient.current = _dbClient;
        return _dbClient;
      } catch (err) {
        console.log(`Error occurred when creating the DB client`);
        return null;
      }
    } else {
      return dbClient.current;
    }
  };

  const jumpToPageInAll = (pageIndex) => {
    currentPage.current = pageIndex;
    setDisplayingContents(contents.current[currentContent].clips[pageIndex]);
  };

  const jumpToPageInTopk = (pageIndex) => {
    setLoadingTopkPage(false);
    setHavePlayoutUrl(true);
    setDisplayingContents(topk.current[pageIndex]);
  };

  const jumpToContent = (objectId) => {
    currentPage.current = 1;
    numPages.current = Object.keys(contents.current[objectId].clips).length;
    setLoadingPlayoutUrl(false);
    setHavePlayoutUrl(true);
    setDisplayingContents(contents.current[objectId].clips[1]);
  };

  const getRes = async () => {
    // playoutUrlMemo.current = {};
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
        [objId.startsWith("iq") ? "objectId" : "versionHash"]: objId,
        libraryId: libId,
        searchVersion: searchVersion.current,
        search,
        fuzzySearchPhrase,
        fuzzySearchField,
        searchAssets: searchAssets.current,
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
        // try to update DB
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
            searchRes["data"],
            TOPK,
            CLIPS_PER_PAGE,
            searchAssets.current
          );
          // update the result information for "show topk" display mode
          topkCnt.current = topkCount;
          topk.current = topkRes;
          topkPages.current = topkRes.length;
          // update the result infomation for "group by content" display mode
          console.log("search assets", searchAssets.current);
          setTotalContent(
            searchAssets.current
              ? searchRes["data"]["results"].length
              : searchRes["data"]["contents"].length
          );
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
        } catch (err) {
          console.log(err);
          setLoadingSearchRes(false);
          setErr(true);
          setErrMsg(
            "Parse the query result err, might because search engine change the result format"
          );
          return;
        }
        // initial the emgage dic
        try {
          engagement.current = {};
          for (let content in contents.current) {
            for (let page in contents.current[content].clips) {
              const clips_per_page = contents.current[content].clips[page];
              for (let clip of clips_per_page) {
                if (
                  searchVersion.current === "v1" ||
                  (searchVersion.current === "v2" && clip.rank <= 20)
                ) {
                  const clipID = clip.hash + "_" + clip.start + "-" + clip.end;
                  engagement.current[clipID] = { numView: 0, watchedTime: 0 };
                }
              }
            }
          }
        } catch (err) {
          console.log(err);
          setLoadingSearchRes(false);
          setErr(true);
          setErrMsg("Initial the engagememt data err");
          return;
        }
        // process about DB: set search History and send engagement data
        // could have err, but it would not affect whole page. the page can still work
        if (dbClient.current !== null || walletAddr.current !== null) {
          setProcessingDB(true);
          try {
            const _searchId = await dbClient.current.setSearchHistory({
              walletAddr: walletAddr.current,
              fuzzySearchFields: fuzzySearchField,
              fuzzySearchPhrase: fuzzySearchPhrase,
              searchKeywords: searchTerms,
              searchObjId: objId,
              tenantID: tenId,
            });
            if (_searchId !== null) {
              searchId.current = _searchId;
              await dbClient.current.setEngagement({
                searchId: _searchId,
                walletAddr: walletAddr.current,
                engagement: engagement.current,
                init: true,
              });
            } else {
              console.log(
                "Save search History failed, will not save enegement data"
              );
            }
          } catch (err) {
            console.log("Err: Set search history and engagement data err");
          } finally {
            setProcessingDB(false);
          }
        } else {
          // fake a searchId
          searchId.current = objId;
        }
        // try to load and show the first contents infomation
        if (firstContentToDisplay !== "") {
          // there are err handling things inside this function
          if (showTopk) {
            jumpToPageInTopk(0);
          } else {
            jumpToContent(firstContentToDisplay);
          }
        }
        // finally set have search res to be True
        setHaveSearchRes(true);
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
        setSearchTerms("");

        currentPage.current = 1;
        let libId = "";
        const client = getClient();
        try {
          network.current = await client.NetworkInfo().name;
        } catch (err) {
          setHaveSearchVersion(false);
          setLoadingSearchVersion(false);
          setErr(true);
          setErrMsg("Extract network err");
        }
        try {
          libId = await client.ContentObjectLibraryId({
            [txt.startsWith("iq") ? "objectId" : "versionHash"]: txt,
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
              [txt.startsWith("iq") ? "objectId" : "versionHash"]: txt,
              metadataSubtree: "indexer",
            });
            if (searchObjMeta["version"] === "2.0") {
              setShowFuzzy(true);
              searchVersion.current = "v2";
              searchAssets.current = false;
              try {
                const indexerType =
                  searchObjMeta["config"]["indexer"]["arguments"]["document"][
                    "prefix"
                  ];
                if (indexerType.includes("assets")) {
                  searchAssets.current = true;
                }
              } catch (error) {
                console.log(error);
              }
            } else {
              setShowFuzzy(false);
              setShowTopk(false);
              searchVersion.current = "v1";
            }
            const selectedFields = searchAssets.current
              ? ASSETS_SEARCH_FIELDS
              : ALL_SEARCH_FIELDS;
            console.log("selectedFields", selectedFields);
            filteredSearchFields.current = Object.keys(
              searchObjMeta.config.indexer.arguments.fields
            )
              .filter((n) => selectedFields.includes(n))
              .map((n) => `f_${n}`);
            setLoadingSearchVersion(false);
            setHaveSearchVersion(true);
          } catch (err) {
            setHaveSearchVersion(false);
            setLoadingSearchVersion(false);
            setErr(true);
            setErrMsg(err.message);
          }
          try {
            let fetchedTenId = "";
            fetchedTenId = await client.ContentObjectTenantId({
              [txt.startsWith("iq") ? "objectId" : "versionHash"]: txt,
            });
            setTenId(fetchedTenId);
          } catch (err) {
            console.log("Error: TenantID is not available");
          }
        }
      }}
    />
  );
  return (
    <div className="container" style={{ maxWidth: 1600 }}>
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
              setSearchTerm={(terms) => {
                setSearchTerms(terms);
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
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10,
                height: 40,
                width: "100%",
              }}
            >
              <button
                style={{
                  border: "none",
                  borderRadius: 10,
                  height: "90%",
                  width: 150,
                }}
                onClick={() => {
                  document.getElementById("searchBox").style.display =
                    showSearchBox ? "none" : "block";
                  setShowSearchBox((x) => !x);
                }}
              >
                {showSearchBox ? "Hide Filters" : "More filters"}
              </button>
            </div>

            <div
              className="row mt-3"
              id="searchBox"
              style={{ display: "none" }}
            >
              <SearchBox
                filteredSearchFields={filteredSearchFields.current}
                disabled={loadingSearchRes || loadingPlayoutUrl}
                searchVersion="2.0"
                handleSubmitClick={(txt) => {
                  resetLoadStatus();
                  setSearch(txt.trim());
                  currentPage.current = 1;
                }}
                setSearchTerm={(terms) => {
                  setSearchTerms(terms);
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
      {!(haveSearchRes || loadingSearchRes) &&
        haveSearchVersion &&
        !haveSearchUrl && (
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
              <BsSearch />
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
                  onClick={() => {
                    if (!showTopk) {
                      setShowTopk(true);
                      jumpToPageInTopk(0);
                    }
                  }}
                >
                  Sort by relevance
                </button>
                <button
                  style={{
                    ...clipResShowMethodButton,
                    ...(showTopk && { border: "none" }),
                  }}
                  onClick={() => {
                    if (showTopk) {
                      setShowTopk(false);
                      jumpToContent(currentContent);
                    }
                  }}
                >
                  Sort by content id
                </button>
              </div>
            ) : (
              <div style={clipResInfoContainer}>
                <div style={clipResTotal}>total results {totalContent}</div>
                <select
                  style={clipResTitleSelector}
                  value={currentContent}
                  onChange={(event) => {
                    setCurrentContent(event.target.value);
                    jumpToContent(event.target.value);
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
                  onChange={(event) => {
                    setCurrentContent(event.target.value);
                    jumpToContent(event.target.value);
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
              {!showTopk && numPages.current > 1 && (
                <PaginationBar
                  pageCount={numPages.current}
                  onPageChangeHandler={(data) => {
                    const pageIndex = data.selected + 1;
                    jumpToPageInAll(pageIndex);
                  }}
                />
              )}
              {showTopk && topkPages.current > 1 && (
                <PaginationBar
                  pageCount={topkPages.current}
                  onPageChangeHandler={async (data) => {
                    const pageIndex = data.selected;
                    jumpToPageInTopk(pageIndex);
                  }}
                />
              )}
              {havePlayoutUrl ? (
                displayingContents.map((clip) => {
                  return searchAssets.current ? (
                    <AssetRes
                      clipInfo={clip}
                      key={clip.id + clip.rank}
                      client={getClient()}
                      network={network.current}
                      walletAddr={walletAddr.current}
                      searchId={searchId.current}
                      searchAssets={searchAssets.current}
                      contents={contents.current}
                      searchVersion={searchVersion.current}
                      engagement={engagement}
                      dbClient={dbClient.current}
                    ></AssetRes>
                  ) : (
                    <ClipRes
                      clipInfo={clip}
                      key={clip.id + clip.start_time}
                      client={getClient()}
                      network={network.current}
                      walletAddr={walletAddr.current}
                      searchId={searchId.current}
                      searchAssets={searchAssets.current}
                      contents={contents.current}
                      searchVersion={searchVersion.current}
                      engagement={engagement}
                      dbClient={dbClient.current}
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
      ) : processingDB ? (
        <div style={hint}>
          <p>Clips are coming ... </p>
        </div>
      ) : null}
    </div>
  );
};

export default App;
