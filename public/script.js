const submitButton = document.getElementById('submit-button');
const contractAddressInput = document.getElementById('contract-address');
const nftImage = document.getElementById('nft-image');
const nftStory = document.querySelector('#feed');

const getStory = () => {
    const urlSearchParams = new URLSearchParams({
        contractAddress: contractAddressInput.value,

    });
    const url = `/results?${urlSearchParams}`;

    fetch(url)
        .then(response => {
            return response.json();
        })
        .then(data => {
            nftImage.src = data.image;
            nftStory.innerHTML = data.story;
        })
        .catch(error => console.error(error));
};

submitButton.addEventListener('click', async () => {

    getStory();


});
