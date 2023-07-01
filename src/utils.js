import axios from "axios";

export const toTimeString = (totalMiliSeconds) => {
  const totalMs = totalMiliSeconds;
  const result = new Date(totalMs).toISOString().slice(11, 19);

  return result;
};

export const parseSearchRes = async (data, TOPK, CLIPS_PER_PAGE) => {
  // pagination on topk res for search v2 fuzzy method
  const topkRes = [];
  let topkResPage = [];
  let firstContent = "";
  let topkCount = 0;
  for (let i = 0; i < data.length; i++) {
    if (i >= TOPK) {
      break;
    }
    // get currernt item
    const item = JSON.parse(JSON.stringify(data[i]));
    topkCount += 1;
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

  // the normal display method: group by contentId and pagination inside each content
  const clips_per_content = {};
  const idNameMap = {};
  for (let i = 0; i < data.length; i++) {
    // get currernt item
    const item = data[i];
    // if not in clips_per_content: need to add them in
    if (!(item["id"] in clips_per_content)) {
      clips_per_content[item["id"]] = { processed: false, clips: [item] };
      idNameMap[item["id"]] =
        item.meta.public.asset_metadata.title.split(",")[0];
      // set the first content to be current content
      if (firstContent === "") {
        firstContent = item["id"];
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
    for (let i = 1; i <= num_pages; i++) {
      clips_per_page[i] = [];
    }
    for (let i = 0; i < clips.length; i++) {
      const pageIndex = Math.floor(i / CLIPS_PER_PAGE) + 1;
      clips_per_page[pageIndex].push(clips[i]);
    }
    clips_per_content[id].clips = clips_per_page;
  }
  return {
    // the following three are for "group by content" display mode
    clips_per_content,
    firstContent,
    idNameMap,
    // the following three are for "show topk" display mode
    topkRes,
    topkCount,
  };
};

export const createSearchUrl = async ({
  client,
  objectId,
  libraryId,
  searchVersion,
  search,
  fuzzySearchPhrase,
  fuzzySearchField,
}) => {
  try {
    if (searchVersion === "v1") {
      console.log("doing V1 search");
      // searchV1
      const url = await client.Rep({
        libraryId,
        objectId,
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
      return { url, status: 0 };
    } else {
      // search v2
      console.log("doing V2 search");
      const queryParams = {
        terms:
          fuzzySearchPhrase === ""
            ? `(${search})`
            : search === ""
            ? `(${fuzzySearchPhrase})`
            : `(${[fuzzySearchPhrase, search].join(" AND ")})`,
        select: "/public/asset_metadata/title",
        start: 0,
        limit: 160,
        max_total: 160,
        display_fields: "f_start_time,f_end_time",
        // sort: "f_display_title_as_string@asc,f_start_time@asc",
        clips: true,
        scored: true,
      };
      if (fuzzySearchField.length > 0) {
        queryParams.search_fields = fuzzySearchField.join(",");
      }
      const url = await client.Rep({
        libraryId,
        objectId,
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
      return { url: newUrl, status: 0 };
    }
  } catch (err) {
    console.log(err);
    return { url: "", status: 1 };
  }
};

export const getPlayoutUrl = async ({ client, objectId }) => {
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
