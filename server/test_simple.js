require('dotenv').config();
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function test() {
    console.log("Testing with key:", process.env.HUGGINGFACE_API_KEY ? "EXISTS" : "MISSING");
    try {
        // Just a simple model info or small request
        const result = await hf.textToImage({
            model: 'stabilityai/stable-diffusion-2-1',
            inputs: 'a small red apple',
        });
        console.log("SUCCESS: Received response from Hugging Face!");
    } catch (e) {
        console.error("FAILURE:", e.message);
    }
}

test();
