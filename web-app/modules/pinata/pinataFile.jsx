import React, { useContext, useState, useEffect } from "react";
import { Box, Button, FileInput, Image, Spinner, Text } from "grommet";
import ToastContext from "../hooks/useToast";

const PINATA_BASE_URL = "https://api.pinata.cloud/";
const PINATA_PINNING_PATH = "pinning/pinFileToIPFS";
// const PINATA_HASH_METADATA_PATH = "pinning/hashMetadata";
const PINATA_API_KEY = "872fa5a2b23604d3cfed";
const PINATA_API_SECRET =
  "fad70e08da1164570ccb51eb114e1b769091fc4adfe1299cd2a0bfb0f1c809e2";
// const PINATA_JWT =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjZDBlYTFkYi1hYTVjLTQwZDYtOTQwOS0xYzRlMTg1MmVhNzMiLCJlbWFpbCI6InRoZWFydGh1cmNoZW5AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZX0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6Ijg3MmZhNWEyYjIzNjA0ZDNjZmVkIiwic2NvcGVkS2V5U2VjcmV0IjoiZmFkNzBlMDhkYTExNjQ1NzBjY2I1MWViMTE0ZTFiNzY5MDkxZmM0YWRmZTEyOTljZDJhMGJmYjBmMWM4MDllMiIsImlhdCI6MTYyNDI1Mjc0MX0.XScr9kymMj0Vc2EfZVMBpJwVH-WhI9KJjsS7MVJ4xs8";

const PinataFile = ({ setIpfsHash }) => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setToast } = useContext(ToastContext);

  const renderFile = (targetFile) => {
    const objectUrl = URL.createObjectURL(targetFile);
    return (
      <Box height="medium" width="medium">
        <Image fit="cover" src={objectUrl} />
      </Box>
    );
  };

  // Ref https://pinata.cloud/documentation#PinFileToIPFS
  const pinFileToPinata = async () => {
    const formData = new FormData();
    if (file !== null) {
      // Pinata expects the name to be "file"
      formData.append("file", file);
    }

    if (metadata != null) {
      formData.append("pinataMetadata", metadata);
    }

    const pinURL = `${PINATA_BASE_URL}${PINATA_PINNING_PATH}`;
    setLoading(true);
    try {
      const res = await fetch(pinURL, {
        method: "POST",
        headers: {
          // 'Content-Type': 'multipart/form-data;',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
        body: formData,
      });

      const responseJson = await res.json();
      console.log(responseJson);
      setIpfsHash(responseJson.IpfsHash);
      if (responseJson.IpfsHash !== null) {
        setToast({ status: "ok", message: "Uploaded file!" });
      }
    } catch (e) {
      console.log(e);
      setToast({ status: "error", message: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (file !== null) {
      pinFileToPinata();
    }
  }, [file]);

  return (
    <Box gap="small" margin="small">
      <Text>Upload an Image</Text>
      <Box gap="small" margin="small" align="center" justify="center">
        <FileInput
          name="file"
          multiple={false}
          renderFile={renderFile}
          onChange={(event) => {
            const fileList = event.target.files;
            setFile(fileList[0]);
          }}
        />
        {loading && <Spinner message="Start Built-in Spinner Announcement" />}
      </Box>
    </Box>
  );
};

export default PinataFile;
