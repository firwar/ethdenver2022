const PINATA_BASE_URL = "https://api.pinata.cloud/";
const PINATA_PINNING_PATH = "pinning/pinFileToIPFS";
const PINATA_HASH_METADATA_PATH = "pinning/hashMetadata";
const PIN_URL = `${PINATA_BASE_URL}${PINATA_PINNING_PATH}`;

// Ref https://pinata.cloud/documentation#PinFileToIPFS
const pinFileToPinata = async ({ file, metadata }) => {
  // Create the form data
  const formData = new FormData();

  if (file !== null) {
    // Pinata expects the name to be "file"
    formData.append("file", file);
  }

  if (metadata != null) {
    formData.append("pinataMetadata", metadata);
  }

  try {
    const res = await fetch(PIN_URL, {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
      body: formData,
    });

    const responseJson = await res.json();
    console.log(responseJson);
    return responseJson.IpfsHash;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const hashMetadata = async () => {};

export const PinataClient = {
  pinFileToPinata,
  hashMetadata,
};
