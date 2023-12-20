import axios from "axios";

export const toTimeString = (totalMiliSeconds) => {
  const totalMs = totalMiliSeconds;
  const result = new Date(totalMs).toISOString().slice(11, 19);

  return result;
};

export const parseSearchRes = async (
  searchResults,
  TOPK,
  CLIPS_PER_PAGE,
  searchAssets
) => {
  const data =
    searchAssets === true
      ? searchResults["results"]
      : searchResults["contents"];
  // pagination on topk res for search v2 fuzzy method
  const topkRes = [];
  let topkResPage = [];
  let firstContent = "";
  let topkCount = 0;
  for (let i = 0; i < data.length; i++) {
    // if (i >= TOPK) {
    //   break;
    // }
    // get currernt item
    const item = JSON.parse(JSON.stringify(data[i]));
    item["rank"] = i + 1;
    // for asset search res
    if (searchAssets) {
      item["start"] = 0;
      item["end"] = 0;
      item["f_start_time"] = 0;
      item["f_end_time"] = 0;
    }
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
    item["rank"] = i + 1;
    // for asset search res
    if (searchAssets) {
      item["start"] = 0;
      item["end"] = 0;
      item["f_start_time"] = 0;
      item["f_end_time"] = 0;
    }
    // if not in clips_per_content: need to add them in
    if (!(item["id"] in clips_per_content)) {
      clips_per_content[item["id"]] = { processed: false, clips: [item] };
      idNameMap[item["id"]] =
        "public" in item.meta
          ? item.meta.public.asset_metadata.title.split(",")[0]
          : item.sources[0]["prefix"].split("/")[1];
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
  versionHash,
  libraryId,
  searchVersion,
  search,
  fuzzySearchPhrase,
  fuzzySearchField,
  searchAssets,
}) => {
  try {
    if (searchVersion === "v1") {
      console.log("doing V1 search");
      // searchV1
      const url = await client.Rep({
        libraryId,
        objectId,
        versionHash,
        rep: "search",
        service: "search",
        makeAccessRequest: true,
        queryParams: {
          terms: `(${search})`,
          select: "...,text,/public/asset_metadata/title",
          start: 0,
          limit: 160,
          clips_include_source_tags: true,
          clips: true,
          sort: "f_start_time@asc",
        },
      });
      return { url, status: 0 };
    } else {
      // search v2
      console.log("doing V2 search");
      const queryParams = {
        // terms:
        //   fuzzySearchPhrase === ""
        //     ? `(${search})`
        //     : search === ""
        //     ? fuzzySearchPhrase
        //     : `((${fuzzySearchPhrase}) AND ${search})`,
        terms: fuzzySearchPhrase,
        filters: search,
        select: "/public/asset_metadata/title",
        start: 0,
        limit: 160,
        display_fields: "all",
        clips: true,
        scored: true,
        clips_include_source_tags: true,
        clips_max_duration: 55,
      };
      if (fuzzySearchField.length > 0) {
        queryParams.search_fields = fuzzySearchField.join(",");
      }
      if (fuzzySearchPhrase === "") {
        queryParams.sort = "f_start_time@asc";
        queryParams.scored = false;
      } else {
        // only  set the max-total when we are using fuzzy search
        queryParams.max_total = 160;
      }
      // for the two pass approach,
      // if we do not have the exact match filters, we should enable semantic=true
      if (search === "") {
        queryParams.semantic = true;
      }
      // for assets index type, disable clip and relevant parms
      if (searchAssets === true) {
        queryParams.clips = false;
      }
      const url = await client.Rep({
        libraryId,
        objectId,
        versionHash,
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
  try {
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
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const getEmbedUrl = async ({
  client,
  objectId,
  clipStart,
  clipEnd,
  duration,
}) => {
  try {
    const permission = await client.Permission({ objectId });
    if (["owner", "editable", "viewable"].includes(permission)) {
      const networkInfo = await client.NetworkInfo();
      const networkName =
        networkInfo.name === "demov3"
          ? "demo"
          : networkInfo.name === "test" && networkInfo.id === 955205
          ? "testv4"
          : networkInfo.name;
      let embedUrl = new URL("https://embed.v3.contentfabric.io");

      embedUrl.searchParams.set("p", "");
      embedUrl.searchParams.set("net", networkName);
      embedUrl.searchParams.set("oid", objectId);
      embedUrl.searchParams.set("end", clipEnd);
      embedUrl.searchParams.set("start", clipStart);
      embedUrl.searchParams.set("ct", "s");
      embedUrl.searchParams.set("st", "");
      embedUrl.searchParams.set("off", "default");

      const token = await client.CreateSignedToken({
        objectId,
        duration,
      });
      embedUrl.searchParams.set("ath", token);
      return {
        embedUrl: embedUrl.toString(),
      };
    } else {
      // const playoutUrl = await getPlayoutUrl({ client, objectId });
      // return {
      //   playoutUrl: `${playoutUrl}&resolve=false&clip_start=${clipStart}&clip_end=${clipEnd}&ignore_trimming=true`,
      // };
      return { reason: "Account has no permission to create the embed URL" };
    }
  } catch (err) {
    console.log(err);
    console.log("Create embed URL error");
    return { reason: "Create embed URL error" };
  }
};
