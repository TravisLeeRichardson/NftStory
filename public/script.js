const submitButton = document.getElementById('submit-button');
const contractAddressInput = document.getElementById('contract-address');
const nftImage = document.getElementById('nft-image');
const nftStory = document.querySelector('#feed');

const getStory = async () => {
    console.log('Getting story');
    const urlSearchParams = new URLSearchParams({
        contractAddress: contractAddressInput.value,
    });
    const url = `/results?${urlSearchParams}`;

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            nftImage.src = data.image;
            nftStory.innerHTML = data.story;
        } else {
            throw new Error('Failed to fetch data');
        }
    } catch (error) {
        console.error(error);
    }
};

submitButton.addEventListener('click', () => {
    getStory();
});
