import React from "react";

import { Search, SearchAdvanced } from "grommet-icons";
import { Box, Button, grommet, Grommet, TextInput } from "grommet";

const theme = {};

export const SearchBar = ({ setQuery }) => {
  const [value, setValue] = React.useState("");

  return (
    <Box
      width="medium"
      direction="row"
      margin="none"
      align="center"
      round="small"
      border
    >
      <TextInput
        plain
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        focusIndicator={false}
        placeholder="Search"
      />
      <Box
        justify="center"
        align="center"
        overflow="hidden"
        styl
        style={{
          borderTopRightRadius: "12px",
          borderBottomRightRadius: "12px",
        }}
      >
        <Button
          icon={<Search />}
          hoverIndicator
          onClick={() => {
            setQuery(value);
          }}
        />
      </Box>
    </Box>
  );
};
