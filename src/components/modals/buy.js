import { AiOutlineClose } from 'react-icons/ai';
// import { GiTakeMyMoney } from 'react-icons/gi';
import './modal.css';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { IoMdPlay } from 'react-icons/io';
import { IoPauseSharp } from 'react-icons/io5';
// import img from '../../assets/nft 4.png';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
// import mp from '../../assets/song.mp3';
import { AppContext } from '../../context';
import { createContractInstance, getTokenAmount, multiplyBigDecimals, parseBigInt, parseStringData, setMessageFn } from '../../util';
import { tokenSymbol } from '../../config';
import Skeleton from '../skeleton';

const BuySongModal = ({ closeModal, seller, updateSeller, songs, updateSellerSongs, s_index }) => {

    const modalRef = useRef();
    const buyRef = useRef();
    const buying = useRef(false);
    const inputRef = useRef();
    const audio = useRef();
    const [state, setState] = useState('');
    const [playingTime, setPlayingTime] = useState(0);
    const [qty, setQty] = useState(0);
    const [loading, setLoading] = useState(false);
    const [walletloading, setWalletLoading] = useState(true);
    const { contract, user, setUser, setMessage, wallet, setWallet, curUserSongs, setCurUserSongs } = useContext(AppContext);

    const [songIndex, setSongIndex] = useState(s_index);

    function clickFn(e) {
        if(!modalRef.current) return;
        if(modalRef.current && !modalRef.current.contains(e.target)) { 
            if(buying.current) return;
            closeModal(); 
        }

        // if there is modalRef mounted there would definitely be buy modal ref too
        if(buyRef.current && !buyRef.current.contains(e.target)) { 
            // if(buying.current) return;
            buyRef.current.style.display = 'none';
        }
    };


    function slided(e) {
        const value = inputRef.current.value;
        inputRef.current.style.backgroundSize = value + "% 105%";
        const seekto = audio.current.duration * (value / 100);
        audio.current.currentTime = seekto;
    };

    const updateTime = () => {
        const curTime = Math.floor(audio.current.currentTime);
        setPlayingTime(curTime);
        const val = (curTime / audio.current.duration) * 100;
        inputRef.current.value = val;
        inputRef.current.style.backgroundSize = val + "% 105%";
    };

    const fetchData = async () => {
        setWalletLoading(true);
        const contractInstance = await createContractInstance(contract.signer);
        try {
            const wallet_data = await contractInstance.getWallet(contract.address);
            setWallet(getTokenAmount(wallet_data));
            setWalletLoading(false);
        } catch(err) { 
            setWalletLoading('error');
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Please try again.' });
        }
    };

    useEffect(() => {
        fetchData();

        document.addEventListener("click", clickFn, true);
        const inp = inputRef.current;
        if(inp) inp.addEventListener('input', slided);


        return () => {
            document.removeEventListener("click", clickFn, true);
            if(inp) inp.removeEventListener('input', slided);
        }

    }, []);

    useEffect(() => {

        if(songIndex > -1 && audio.current) {
            if(audio.current.src !== songs[songIndex].audioSrc) {
                audio.current.src = songs[songIndex].audioSrc;
                audio.current.play();
                setState('playing');
            }
        }
    }, [songIndex]);
    
    useEffect(() => {
        const aud = audio.current;
        
        if(state === 'playing' && aud) aud.addEventListener('timeupdate', updateTime);
        return () => aud && aud.removeEventListener('timeupdate', updateTime);
    }, [state]);

    const innerModalFn = (display='block') => {
        if(buyRef.current) { 
            buyRef.current.style.display = display;
        }
    };

    const formatTime = useMemo(() => {
        const zeros = (val) => val >= 10 ? val : '0'+val;
        const min = Math.floor(playingTime / 60);
        const sec = Math.floor(playingTime % 60);
        return `${zeros(min)}:${zeros(sec)}`;
    }, [playingTime]);

    const togglePlay = () => {
        if(state === 'playing') {
            if(audio.current) audio.current.pause(); 
            setState('paused');
        }
        if(state !== 'playing') {
            if(audio.current) audio.current.play(); 
            setState('playing');
        }
    };
    console.log(''+0);

    const ctrls = (type) => {
        if(type === 'N') {
            if(loading) return setMessageFn(setMessage, { status: 'error', message: `Currently making a request` });
            setSongIndex(Math.min(songs.length - 1, songIndex + 1));
        } else {
            if(loading) return setMessageFn(setMessage, { status: 'error', message: `Currently making a request` });
            setSongIndex(Math.max(0, songIndex - 1));
        }
    };

    // console.log(wallet, typeof wallet);
    const handleBuy = async () => {
        
        if(walletloading) return setMessageFn(setMessage, { status: 'error', message: 'Fetch wallet data.' });

        if(loading) return setMessageFn(setMessage, { status: 'error', message: `Currently making a request` });

        if(!qty) return setMessageFn(setMessage, { status: 'error', message: `Quantity should be greater than zero` }); 

        if(songs[songIndex].qty - 0 < qty) {
            return setMessageFn(setMessage, { status: 'error', message: `Quantity exceeds available amount. Reduce it.` });
        }
        
        if((songs[songIndex].price - 0) * qty > wallet) {
            return setMessageFn(setMessage, { status: 'error', message: `Amount exceeds available funds in your wallet` });
        }
  
        setLoading(true);
        buying.current = true;
        try {
            const contractInstance = await createContractInstance(contract.signer);
            const date = new Date().getTime();

            const keys = ['title','artiste','price','coverSrc','audioSrc','duration'];
            const data = (
                keys.map(key => `${key}=${songs[songIndex][key]}`).join('%x3') +
                `%x3ownerAddress=${contract.address}%x3date=${date}%x3qty=${qty}`
            );

            const ok = songs[songIndex].qty - qty > 0;

            const seller_song_data = !ok ? '' : (
                keys.map(key => `${key}=${songs[songIndex][key]}`).join('%x3') +
                `%x3ownerAddress=${songs[songIndex].owneraddress}%x3date=${songs[songIndex].date}%x3qty=${songs[songIndex].qty - qty}`
            );

            const new_user_data = { ...user, totalSongs: (user.totalSongs - 0) + 1 };
            setUser(new_user_data);
            const acct_data = Object.keys(new_user_data).map(key => `${key}=${new_user_data[key]}`).join('%x3');

            const seller_acct_data = {
                ...seller, totalSales: (seller.totalSales - 0) + qty,
                totalSongs: Math.max(0, seller.totalSongs - (!ok ? 1 : 0))
            };
            const seller_acct_data_str = Object.keys(seller_acct_data).map(key => `${key}=${seller_acct_data[key]}`).join('%x3');

            const amount = (songs[songIndex].price - 0) * qty;
            const bigIntAmount = parseBigInt(multiplyBigDecimals(amount));

            const tx = await contractInstance.buySong(
                contract.address, data, acct_data, 
                songs[songIndex].ownerAddress, seller_song_data, seller_acct_data_str, ''+songs[songIndex].index,
                // `To,Bought song from,${songs[songIndex].owneraddress},${amount},${date}`,
                // `From,Song sales to,${contract.address},${amount},${date}`,
                // bigIntAmount
            );
            await tx.wait();

            setMessageFn(setMessage, { 
                status: 'success', message: `Song created. Now Saving...` 
            });
            
            // self.send_token(buyer, seller, amount, sender_activity, receiver_activity);
            const txn = await contractInstance.sendToken(
                contract.address, songs[songIndex].ownerAddress, bigIntAmount,
                `To,Bought song from,${songs[songIndex].owneraddress},${amount},${date}`,
                `From,Song sales to,${contract.address},${amount},${date}`,
            );
            await txn.wait();
            
            setCurUserSongs([{ ...parseStringData(data), index: curUserSongs.length }, ...curUserSongs]);

            const newData = [];

            for(const dt of songs) {
                // if !ok then data = '' and parseStringData('') will yield error
                if(dt.index === songs[songIndex].index && ok) {
                    newData.push({ ...parseStringData(seller_song_data), index: dt.index });
                } else newData.push(dt);
            }
            updateSeller(seller_acct_data);
            updateSellerSongs(newData);
            // if qty is not greater than zero, we remove the song and to avoid errors 
            // close the playing song modal (which is the entire modal)
            if(!ok) closeModal();
            // fetchData(); //keep async as we don't really need wallet data again
            setLoading(false);
            buying.current = false;
            innerModalFn('none');
        } catch(err) {
            console.log(err);
            setLoading(false);
            buying.current = false;
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Please try again.' });
        }
    };

    return (
        <div className='__Modal__Overlay__'>
            <div className='modal-wrapper' ref={modalRef}>
                <div className='modal-container w-full'>
                    <div className='mw-bg' style={{backgroundImage: `url(${songs[songIndex].coverSrc})`}}></div>
                    <div className='mw-cloak'></div>
                    <div className="mc-header w-full">
                        <button className="mch-btn pointer" onClick={() => closeModal()}>
                            <AiOutlineClose className='mchb-icon' />
                        </button>
                        <span style={{color: 'white'}}>{`${songs[songIndex].qty} Qty`}</span>
                        <button className="mch-btn buy-btn pointer" onClick={() => innerModalFn('block')}>
                            {/* <GiTakeMyMoney className='mchb-icon' /> */}
                            <span>Buy song</span>
                        </button>

                        <div className='mch-abs' ref={buyRef} style={{display: 'none'}}>
                            <div className='mcha'>
                                <div className='mcha-head w-full'>
                                    <h3>Buy this Song</h3>
                                    <AiOutlineClose className='mcha-icon pointer' onClick={() => innerModalFn('none')} />
                                </div>
                                <div className='mcha-main'>
                                    <label className='mcham-label-price'>
                                        Quantity
                                        <div>
                                        {
                                            walletloading === true ? <Skeleton /> : 
                                            walletloading === 'error'?
                                            <div className='mchamlp-btn pointer' onClick={()=>fetchData()}>Refresh wallet</div> :
                                            <span>{`${wallet} ${tokenSymbol}`}</span>
                                        }
                                        </div>
                                    </label>
                                    <input placeholder="Enter amount" type='number' onChange={(e) => setQty(e.target.value)}/>
                                </div>
                                <div className='mcha-base'>
                                    <button className={`mcha-btn ${!loading && 'pointer'}`} 
                                    onClick={() => handleBuy()} disabled={loading}>
                                        {loading ? 'Buying...' : 'Buy now'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className='mc-song w-full'>
                        <div className='mc-song-cover w-full'>
                            <img src={songs[songIndex].coverSrc} alt='cover' />
                        </div>
                        <div className='mc-main w-full'>
                            <div className='hide_scrollbar'><span className='song-title'>{songs[songIndex].title}</span></div>
                            <div className='hide_scrollbar'><span className='song-artiste'>{songs[songIndex].artiste}</span></div>
                            <div className='music-player w-full'>
                                <input type='range' min={'0'} max={'100'} className='slider' ref={inputRef} />
                                <audio style={{display: 'none'}} ref={audio} />
                                <div className='music-durations'>
                                    <span>{formatTime}</span>
                                    <span>{songs[songIndex].duration}</span>
                                </div>
                            </div>
                            <div className='controls w-full'>
                                <div>
                                    <button className={`ctrl-btn ${songIndex > 0 && 'pointer'}`} 
                                    onClick={() => ctrls('P')}>
                                        <MdSkipPrevious className='pp-icon' />
                                    </button>
                                    <button className='ctrl-btn pointer pause-play' onClick={() => togglePlay()}>
                                        {state === 'playing' && <IoPauseSharp className='pp-icon' />}
                                        {state !== 'playing' && <IoMdPlay className='pp-icon' />}
                                    </button>
                                    <button className={`ctrl-btn ${songIndex < songs.length - 1 && 'pointer'}`}  
                                    onClick={() => ctrls('N')}>
                                        <MdSkipNext className='pp-icon' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default BuySongModal;