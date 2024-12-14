import { AiOutlineClose } from 'react-icons/ai';
import { GiTakeMyMoney } from 'react-icons/gi';
import './modal.css';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { IoMdPlay } from 'react-icons/io';
import { IoPauseSharp } from 'react-icons/io5';
import img from '../../assets/nft 4.png';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import mp from '../../assets/song.mp3';
import { AppContext } from '../../context';
import { createContractInstance, parseStringData, setMessageFn } from '../../util';
import { tokenSymbol } from '../../config';

const CurUserBuySongModal = ({ closeModal, songs, s_index }) => {

    const modalRef = useRef();
    const buyRef = useRef();
    const buying = useRef(false);
    const inputRef = useRef();
    const audio = useRef();
    const [state, setState] = useState('');
    const [playingTime, setPlayingTime] = useState(0);
    const [price, setPrice] = useState(0);
    const [loading, setLoading] = useState(false);
    const { contract, curUserSongs, setCurUserSongs, setMessage } = useContext(AppContext);

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

    useEffect(() => {

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

    const ctrls = (type) => {
        if(type === 'N') {
            if(loading) return setMessageFn(setMessage, { status: 'error', message: `Currently making a request` });
            setSongIndex(Math.min(songs.length - 1, songIndex + 1));
        } else {
            if(loading) return setMessageFn(setMessage, { status: 'error', message: `Currently making a request` });
            setSongIndex(Math.max(0, songIndex - 1));
        }
    };

    const handleUpdate = async () => {
        if(!price) setMessageFn(setMessage, { status: 'error', message: 'Fill price form.' });
        setLoading(true);
        buying.current = true;
        try {
            const contractInstance = await createContractInstance(contract.signer);

            const keys = ['title','artiste','ownerAddress','coverSrc','audioSrc','qty','date','duration'];
            // only price is what we are changing
            const data = keys.map(key => `${key}=${songs[songIndex][key]}`).join('%x3') + `%x3price=${price}`;

            // &mut self, user: Address, song_id: u8, update_song_data: String

            const tx = await contractInstance.changePrice(contract.address, songs[songIndex].index, data);
            await tx.wait();

            const newData = [];

            for(const dt of curUserSongs) {
                if(dt.index === songs[songIndex].index) newData.push({ ...parseStringData(data), index: dt.index });
                else newData.push(dt);
            }
            
            setCurUserSongs(newData);
            setLoading(false);
            buying.current = false;
            innerModalFn('none');
        } catch(err) {
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
                            <span>Update price</span>
                        </button>

                        <div className='mch-abs' ref={buyRef} style={{display: 'none'}}>
                            <div className='mcha'>
                                <div className='mcha-head w-full'>
                                    <h3>Update price of this song</h3>
                                    <AiOutlineClose className='mcha-icon pointer' onClick={() => innerModalFn('none')} />
                                </div>
                                <div className='mcha-main'>
                                    <label>Price</label>
                                    <input placeholder={songs[songIndex].price + ' ' + tokenSymbol} 
                                    type='number' onChange={(e) => setPrice(e.target.value)}/>
                                </div>
                                <div className='mcha-base'>
                                    <button className={`mcha-btn ${!loading && 'pointer'}`} 
                                    onClick={() => handleUpdate()} disabled={loading}>
                                        {loading ? 'Updating...' : 'Update'}
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

export default CurUserBuySongModal;