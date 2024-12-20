import logo_img from './assets/logo.jpg';

export const contractAddress = "0x197fa4c6b4fc0732fdab76063b598f937dc980b8";

export const adminAddress = "0xa778cE308fcB1d35db8B2E40d86d979387b31965";

export const tokenSymbol = "$SMT";

export const mintCharge = 1;

export const newUserReward = 10000; 

export const SERVER_URL = 'https://stylus-web3-hackathon-backend.onrender.com';

export const MB = 10;

export const logo = logo_img;

// interface ISong {
//     function buySong(address buyer, string calldata buyer_song_data, string calldata update_buyer_data, address seller, string calldata seller_song_data, string calldata update_seller_data, string calldata song_id, string calldata sender_activity, string calldata receiver_activity, uint256 amount) external;

//     function changePrice(address user, uint8 song_id, string calldata update_song_data) external;

//     function sendToken(address sender, address receiver, uint256 amount, string calldata sender_activity, string calldata receiver_activity) external;

//     function createNewuser(address user, string calldata _address, string calldata data, uint8 zero_id, uint256 amount, string calldata activity) external;

//     function createUser(address user, string calldata _address, string calldata data, uint8 zero_id) external;

//     function getUser(address user_address) external view returns (string memory);

//     function getUsers() external view returns (string[] memory);

//     function getWallet(address user_address) external view returns (uint256);

//     function getSongs(address user_address) external view returns (string[] memory);

//     function getTxns(address user_address) external view returns (string[] memory);
// }