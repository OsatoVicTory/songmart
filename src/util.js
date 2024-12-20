import BigDecimal from 'js-big-decimal';
import axios from "axios";
import { Contract, ethers } from "ethers";  
import abi from './contractAbi.json';
import { contractAddress, SERVER_URL } from "./config";

export const shortenAddy = (addy) => {
    return addy.slice(0, 4) + '...' + addy.slice(-4);
};

export const sendFile = (data) => {
    const url = `${SERVER_URL}/upload_contents_file`;
    return axios.post(url, data);
};

export const createContractInstance = async (signer) => {
    return await new Contract(contractAddress, abi, signer);
};

export const setMessageFn = (fn, text) => {
    fn(text);
    setTimeout(() => fn(''), 2000);
};

export const parseStringData = (arg) => {
    // arg = arg.replaceAll('\n', '\%x2');
    // replacing not needed as we are not doing JSON.parse() anywhere
    const spls = arg.split('%x3');
    const res = {};
    for(let spl of spls) {
        const [key, value] = spl.split('=');
        res[key] = value; //.replaceAll('%x2', '\n');
    }
    return res;
};

export const parseCount = (cnt) => {
    if(cnt >= 1E6) return (cnt / 1E6).toFixed(2) + 'M';
    else if(cnt >= 1100) return (cnt / 1000).toFixed(2) + 'K';
    else return cnt;
};

export const parseBigInt = (uint256) => {
    return ethers.getBigInt(uint256, "myBigInt");
};

export const getTokenAmount = (value, decimals=1000000000000000000n) => {
    const n1 = new BigDecimal(value+'');
    const n2 = new BigDecimal(decimals+'');
    const result = BigDecimal.stripTrailingZero((n1.divide(n2)).getValue());
    console.log('token responds', result);
    return result;
};

export const multiplyBigDecimals = (value, mul=1000000000000000000n) => {
    const n1 = new BigDecimal(value+'');
    const n2 = new BigDecimal(mul+'');
    const result = BigDecimal.stripTrailingZero((n1.multiply(n2)).getValue());
    return result;
};

export const subtractBigDecimals = (value, amt) => {
    const n1 = new BigDecimal(value+'');
    const n2 = new BigDecimal(amt+'');
    const result = (n1.subtract(n2)).getValue();
    return result;
};

const imgs = [];

export const songs = Array(10).fill(0).map((v, i) => {
    return {
        name: 'The Best Song',
        artiste: 'Osato.shi', img: imgs[i % 5],
        streams: '990.67K', date: '24 Dec 2024'
    }
});

export const pad_array = Array(6).fill(0);

export const formatDate = (date) => {
    date = date - 0;
    return String(new Date(date)).slice(4, 16);
};