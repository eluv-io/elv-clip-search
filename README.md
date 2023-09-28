# Eluvio Automatic Clip Generation and Search

Eluvio Clip Search App is a versatile digital tool designed to simplify the process of searching for specific content within a vast collection and automatic generating clips from that content. The app also includes feedback collection features, allowing users to participate in tag correction, and rate the search ranking results.

Key features include:

1. **Search Functionality:** The app provides a powerful search engine that allows users to enter keywords, tags, or criteria to find content quickly and accurately.

2. **Clip Generation:** The app automatic generates clips matching the search phrases, where the start and end time of the clips are determined by a ML shot boundary detection model.

3. **Multi-Media Support:** The app works with various media types, including video, audio, and image.

4. **Feedback and Rating:** User can feedback on labels or tags, content quality, accuracy, and search results ranking.

## Developer mode

Develop App at [core-dev](https://eluvio-core-v3-dev.web.app/#/apps/Clip%20Search)

To host the application on your local machine, user should install below applications.

- [**elv-core-js**](/docs/devMode.md)
- [**elv-clip-search**](/docs/devMode.md)
- [**Firebase Local Emulator**](/docs/devLocalDB.md)

## Clip Search App Usage

Access clip-search through [Fabric Apps](https://core.v3.contentfabric.io/#/apps) or use [URL shortcut](elv.lv/apps)

You will get

<img width="1000" alt="image" src="docs/images/clipsearch_deployed.png">

### Search Index Status

| Search v1                          | Search v2                          | Note                                             |
| ---------------------------------- | ---------------------------------- | ------------------------------------------------ |
| `iq__44VReNyWedZ1hAACRDBF6TdrBXAE` | `iq__2oENKiVcWj9PLnKjYupCw1wduUxj` | 260 full-length videos                           |
| `iq__KeALttw1e5suBNYcdKHoEVEhfN8`  |                                    | 2 clips tagged w/ GIT                            |
| `iq__2oTG3eei6xUFjkaaBpfx4Ry4wrJm` |                                    | 41 full-length videos                            |
| `iq__2DTx9v7gYNFhYa2uNWEtT5qG2Jn3` |                                    | 10 full-length videos customized w/ tenante data |
|                                    | `iq__4Dezn5i6EZs4vFCD4qE8Xc4QbXsf` | 187 full-length videos tagged w/ GIT             |

The rendered UI depends on the version of the search index.

**with v1 index, user will get**

<img width="1000" alt="image" src="docs/images/search%20UI%20v1.png">

- `Search phrase` has the following possible formats:

  - `Add Keywords` conducts an exact match and is madataory for v1 search index.
  - `<keyword>` performs a global search regardless of the field name.
  - `f_<searchable_field_name>:=<keyword>` restricts the search to the field `<searchable_field_name>`.
  - multiple keywords are joined by default using `"AND"`, i.e., `f_celebrity:= "Daniel Craig" AND f_speech_to_text:= "shaken not stirred"`.

- What are the searchable fields of my Index Object ?

  - Known `<QID>` of the Index Object, you can retrieve the searchable fields running this command:

    `curl -s 'https://<HOST>/qlibs/<LIB>/q/<QID>/meta/indexer/config/indexer/arguments/fields?authorization=<TOKEN>' | jq "keys"`

- See [Search API](https://github.com/eluv-io/elv-search/blob/master/SearchAPI.md) for more details.

**with v2 index, user will get**

<img width="1000" alt="image" src="docs/images/search%20UI%20v2.png">

- the major difference between search v1 and search v2 lies in the 'Search phrase' feature, which enables typo tolerance, as opposed to exact match functionality in search v1.
  - `search_fields` limits the fields that will be searched by the query; if not specified, search v2 makes a global search.
- if users leave `Search Phrase` blank and input only `Add Keywords`, clip search performs almost identitcally to search v1.
