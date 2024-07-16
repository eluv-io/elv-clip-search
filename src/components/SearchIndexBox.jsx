import {Combobox, Group, useCombobox, Text, CloseButton, TextInput, Flex} from "@mantine/core";
import {useState, useEffect} from "react";

const button = {
  border: "None",
  borderRadius: 5,
  padding: "5px 25px",
  color: "white",
  backgroundColor: "#3b87eb",
};

const SelectOption = ({name, id}) => {
  return (
    <Group>
      <Flex direction="column">
        <Text fz="sm" fw={500}>
          {name || id}
        </Text>
        <Text fz="xs" opacity={0.6}>
          {name ? id : ""}
        </Text>
      </Flex>
    </Group>
  );
}

const SearchIndexBox = ({
  getClient,
  searchValue,
  setSearchValue,
  handleAddItem,
  disabled
}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption()
  });

  const [indexes, setIndexes] = useState([]);
  const client = getClient();

  useEffect(() => {
    const LoadIndexes = async() => {
      const tenantId = await client.userProfileClient.TenantContractId();

      if(!tenantId) {
        return;
      }

      const tenantIndexes = await client.ContentObjectMetadata({
        libraryId: tenantId.replace("iten", "ilib"),
        objectId: tenantId.replace("iten", "iq__"),
        metadataSubtree: "public/search/indexes"
      });

      if(tenantIndexes) {
        setIndexes(tenantIndexes);
      }
    };

    LoadIndexes();
  }, []);

  const options = indexes.map((item) => (
    <Combobox.Option value={item.id} key={item.id}>
      <SelectOption {...item} />
    </Combobox.Option>
  ));

  return (
    <Flex
      direction="row"
      mt={16}
      p="0 12"
      align="center"
      gap={16}
    >
      <Combobox
        w="100%"
        store={combobox}
        withinPortal={false}
        onOptionSubmit={val => {
          setSearchValue(val);
          combobox.closeDropdown();
        }}
      >
          <Text style={{textWrap: "nowrap", flex: "0 0 170px", display: "flex"}}>Search Index</Text>
          <Combobox.Target>
            <TextInput
              value={searchValue}
              placeholder={indexes.length > 0 ? "Select or enter an object ID" : "Enter an object ID"}
              onChange={(event) => {
                setSearchValue(event.currentTarget.value);
                combobox.toggleDropdown();
              }}
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              rightSection={
                searchValue !== "" ? (
                  <CloseButton
                    size="sm"
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => setSearchValue("")}
                    aria-label="Clear Value"
                  />
                ) : (
                  <Combobox.Chevron/>
                )
              }
              rightSectionPointerEvents={searchValue === "" ? "none" : "all"}
              multiline
            />
          </Combobox.Target>

        {
          indexes.length > 0 ? (
            <Combobox.Dropdown>
              <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
          ) : null
        }
      </Combobox>
      <button
        type="button"
        onClick={handleAddItem}
        disabled={disabled}
        style={button}
      >
        ADD
      </button>
    </Flex>
  )
};

export default SearchIndexBox;
