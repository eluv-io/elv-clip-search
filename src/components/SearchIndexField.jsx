import InputBox from "./InputBox.jsx";

const ALL_SEARCH_FIELDS = [
  "celebrity",
  // delete for MGM
  "characters",
  "display_title",
  "logo",
  "llava",
  "object",
  // "segment",
  "landmark",
  "speech_to_text",
  "game_events",
  "game_player",
  "game_team",
];

const ASSETS_SEARCH_FIELDS = [
  "celebrity",
  "characters",
  "display_title",
  "logo",
  "object",
];

const SearchIndexField = ({
  setUrl,
  setObjId,
  setHaveSearchVersion,
  setLoadingSearchVersion,
  setSearch,
  setFuzzySearchField,
  setFuzzySearchPhrase,
  setSearchTerms,
  resetLoadStatus,
  setErr,
  setErrMsg,
  loadingSearchRes,
  loadingPlayoutUrl,
  currentPage,
  setLibId,
  setShowFuzzy,
  setShowTopk,
  setTenId,
  getClient,
  searchVersion,
  searchAssets,
  filteredSearchFields
}) => {
  return (
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
};

export default SearchIndexField;
