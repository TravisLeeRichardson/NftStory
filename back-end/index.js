require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const { SDK, Auth } = require('@infura/sdk');

app.use(cors());

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const auth = new Auth({
    projectId: process.env.INFURA_API_KEY,
    secretId: process.env.INFURA_API_KEY_SECRET,
    privateKey: process.env.WALLET_PRIVATE_KEY,
    chainId: 1,
});

const sdk = new SDK(auth);
let image = null;
let traits = null;

const getNFTs = async (collectionId) => {
    const nfts = await sdk.api.getNFTsForCollection({
        contractAddress: collectionId,
    });
};

const getOpenAiStory = async (traits) => {
    const completion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `Create a story about this NFT character based on these traits ${traits}`,
        max_tokens: 200,
    });
    return completion.data.choices[0].text;
};

const getTokenMetadata = async (collectionId, token) => {
    const tokenMetadata = await sdk.api.getTokenMetadata({
        contractAddress: collectionId,
       // tokenId: 5260
        tokenId: token
    });
    const image = JSON.stringify(tokenMetadata.metadata.image);
    const traits = JSON.stringify(tokenMetadata.metadata.attributes);
    const story = await getOpenAiStory(traits);

    return { image, story };
};

app.get('/results', async (req, res) => {

    const openSeaUrl = req.query.contractAddress;

    // Define a regular expression to match the OpenSea URL format and extract the collection address and token ID
    const regex = /^https:\/\/opensea\.io\/assets\/ethereum\/(0x[0-9a-fA-F]{40})\/(\d+)$/;

    // Extract the collection address and token ID using the regular expression
    const [, collection, tokenID] = openSeaUrl.match(regex);

    // Get NFTs from the specified contract address
    const nfts = await getNFTs(collection);

    // Get token metadata for the first NFT in the list
    const { image, story } = await getTokenMetadata(collection, tokenID); //might not even need to get all these NFTs. just use this.
    const imageUrl = `https://ipfs.io/ipfs/${image.replace(/^"ipfs:\/\/(.*)"$/, '$1')}`;
    res.json({ image: imageUrl, story: story });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
