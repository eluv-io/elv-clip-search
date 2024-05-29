export const tagsFormat = {
  v2: {
    asset: {
      entry: "",
      srcInListFormat: false,
      prefix: "prefix",
      tagsPath: "fields",
      tagsTracks: {
        f_celebrity: "Celebrity",
        f_landmark: "LandMark",
        f_logo: "Logo",
        f_object: "Object",
        f_characters: "OCR",
        f_segment: "Segment",
        f_speech_to_text: "STT",
      },
      tagsTextPath: "",
      shotStart: "fields/f_start_time",
      shotEnd: "fields/f_end_time",
    },
    clip: {
      entry: "sources",
      srcInListFormat: true,
      prefix: "prefix",
      tagsPath: "fields",
      tagsTracks: {
        f_celebrity: "Celebrity",
        f_landmark: "LandMark",
        f_logo: "Logo",
        f_object: "Object",
        f_characters: "OCR",
        f_segment: "Segment",
        f_speech_to_text: "STT",
        f_game_events: "Game Events",
        f_game_player: "Game Player",
        f_game_team: "Game Team",
      },
      tagsTextPath: "",
      shotStart: "fields/f_start_time",
      shotEnd: "fields/f_end_time",
    },
  },
  v1: {
    clip: {
      entry: "sources",
      srcInListFormat: true,
      prefix: "prefix",
      tagsPath: "document/text",
      tagsTracks: {
        "Celebrity Detection": "Celebrity",
        "Landmark Recognition": "LandMark",
        "Logo Detection": "Logo",
        "Object Detection": "Object",
        "Optical Character Recognition": "OCR",
        "Segment Labels": "Segment",
        "Speech to Text": "STT",
      },
      tagsTextPath: "text",
      shotStart: "document/start_time",
      shotEnd: "document/end_time",
    },
  },
};
