import React from "react";
import { Box, Card, CardBody, Text, Heading } from "grommet";

export const CardWithText = ({ text }) => (
  <Card elevation="large" width="medium">
    <CardBody height="small">
      <Box align="center" width="medium" pad="small">
        <Heading level="4" margin={{ vertical: "medium" }}>
          {text}
        </Heading>
      </Box>
    </CardBody>
  </Card>
);
