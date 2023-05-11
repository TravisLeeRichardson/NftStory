import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import Moralis from 'moralis';

dotenv.config({ path: './back-end/.env' });

const app = express();

app.use(cors());
app.use(express.static('public'));

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function main() {
    try {
        await Moralis.start({
            apiKey: process.env.MORALIS_API_KEY
        });
        console.log("Moralis started");
    } catch (e) {
        console.error(e);
    }
}

const getOpenAiStory = async (traits) => {
    try {
        const completion = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `Create a story about this NFT character based on these traits ${traits}`,
            max_tokens: 200,
        });
        return completion.data.choices[0].text;
    } catch (e) {
        console.error(e);
    }
};

const getTokenMetadata = async (collectionId, token) => {
    try {
        const response = await Moralis.EvmApi.nft.getNFTMetadata({
            "chain": "0x1",
            "format": "decimal",
            "mediaItems": true,
            "address": collectionId,
            "tokenId": token
        });

        const image = response.raw.media.media_collection.medium.url;
        const traits = JSON.parse(response.raw.metadata).attributes
        const story = await getOpenAiStory(traits);
        return { image, story };
    } catch (e) {
        console.error('Moralis error', e);
    }
};

app.get('/results', async (req, res) => {

    const openSeaUrl = req.query.contractAddress;
    const regex = /^https:\/\/opensea\.io\/assets\/ethereum\/(0x[0-9a-fA-F]{40})\/(\d+)$/;
    const [, collection, tokenID] = openSeaUrl.match(regex);

    try {
        const { image, story } = await getTokenMetadata(collection, tokenID);
        const imageUrl = image
        res.json({ image: imageUrl, story: story });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

main();
