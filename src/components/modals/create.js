import { AiOutlineClose } from 'react-icons/ai';
import './create.css';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MdEdit } from 'react-icons/md';
import { createContractInstance, getTokenAmount, multiplyBigDecimals, parseBigInt, sendFile, setMessageFn } from '../../util';
import { AppContext } from '../../context';
import { adminAddress, MB, mintCharge, tokenSymbol } from '../../config';
import Skeleton from '../skeleton';

const CreateSong = ({ closeModal, addSong }) => {

    const modalRef = useRef();
    const creating = useRef(false);
    const [details, setDetails] = useState({});
    const [coverFile, setCoverFile] = useState({});
    const [mp3File, setMp3File] = useState({});
    const [loading, setLoading] = useState(false);
    const [walletloading, setWalletLoading] = useState(true);
    const [duration, setDuration] = useState('00:00');
    const { contract, user, setUser, setMessage, wallet, setWallet } = useContext(AppContext);

    function clickFn(e) {
        if(!modalRef.current) return;
        if(modalRef.current && !modalRef.current.contains(e.target)) { 
            // creating so don't close modal
            if(creating.current) return;
            closeModal(); 
        }
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

        return () => document.removeEventListener("click", clickFn, true);

    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setDetails({ ...details, [name]: value });
    };

    function handleImageFileChange(e) {
        const file = e.target.files[0];
        if(!file?.size) return;

        if(file.size > (MB * 1024 * 1024)) {
            return setMessageFn(setMessage, { status: 'error', message: `File cannot be more than ${MB}MB` });
        }
        if(coverFile?.type?.startsWith('image/')) URL.revokeObjectURL(coverFile);
        setCoverFile(file);
    };

    const formatTime = (time) => {
        const zeros = (val) => val >= 10 ? val : '0'+val;
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${zeros(min)}:${zeros(sec)}`;
    };

    function handleFileChange(e) {
        const file = e.target.files[0];
        if(!file?.size) return;

        if(file.size > (MB * 1024 * 1024)) {
            return setMessageFn(setMessage, { status: 'error', message: `File cannot be more than ${MB}MB` });
        }
        setMp3File(file);

        // get duration time, so we easily be using it in our app after on
        const aud = new Audio();
        aud.src = URL.createObjectURL(file);
        aud.addEventListener('loadedmetadata', () => {
            setDuration(formatTime(aud.duration));
            URL.revokeObjectURL(file);
        });
    }

    const getImageURL = useMemo(() => {
        if(coverFile.type && coverFile.type.startsWith('image/')) return URL.createObjectURL(coverFile);
        return null;
    }, [coverFile.name]);

    const handleCreate = async () => {
        
        if(walletloading) return setMessageFn(setMessage, { status: 'error', message: 'Fetch wallet data.' });

        if(loading) return setMessageFn(setMessage, { status: 'error', message: `Currently making a request` });
        
        if(details.price * details.qty > wallet) {
            return setMessageFn(setMessage, { status: 'error', message: `Amount exceeds available funds in your wallet` });
        }
  
        setLoading(true);
        creating.current = true;
        try {
            const contractInstance = await createContractInstance(contract.signer);

            const missing = Object.keys(details).find(key => !details[key]) || (
                !coverFile.name ? 'Song cover': (!mp3File.name ? 'Song file' : '')
            );
            if(missing) {
                setLoading(false);
                creating.current = false;
                return setMessageFn(setMessage, { status: 'error', message: `Fill ${missing} field` });
            }
            let cover = '';
            let mp3 = '';
            {
                const formData = new FormData();
                formData.append('file', coverFile);
                formData.append('filename', coverFile.name);
                formData.append('file_type', 'image');

                cover = (await sendFile(formData)).data.data.secure_url;
            }

            {
                const formData_ = new FormData();
                formData_.append('file', mp3File);
                formData_.append('filename', mp3File.name);
                formData_.append('file_type', 'audio');
                formData_.append('resource_type', 'video'); // resource_type should be video for audio for cloudinary use

                mp3 = (await sendFile(formData_)).data.data.secure_url;
            }
            
            // 'https://res.cloudinary.com/osatocloud9/image/upload/v1734174286/voting-hackathon/contents/tap3kjrkr8vyrqdkeacw.jpg'
            // 'https://res.cloudinary.com/osatocloud9/video/upload/v1734174301/voting-hackathon/contents/lhnk7n1emy2qsuvblclt.mp3' 


            const coverSrc = cover; // add link from ipfs uplaod
            const audioSrc = mp3; //add link from ipfs upload
            const date = new Date().getTime();

            const data = (
                Object.keys(details).map(key => `${key}=${details[key]}`).join('%x3') + `%x3duration=${duration}` +
                `%x3ownerAddress=${contract.address}%x3audioSrc=${audioSrc}%x3coverSrc=${coverSrc}%x3date=${date}`
            );

            const new_user_data = { ...user, totalSongs: (user.totalSongs - 0) + 1 };
            const acct_data = Object.keys(new_user_data).map(key => `${key}=${new_user_data[key]}`).join('%x3');

            const amount = details.qty * mintCharge;
            if(amount > wallet) {
                return setMessageFn(setMessage, { 
                    status: 'error', message: `Amount exceeds available funds in your wallet. Reduce the qty.` 
                });
            }

            const bigIntAmount = parseBigInt(multiplyBigDecimals(amount));
            // console.log('bigIntAmount', bigIntAmount);

            const tx = await contractInstance.buySong(
                contract.address, data, acct_data, adminAddress, '', '', ''
                // `To,Created song,${adminAddress},${amount},${date}`,
                // `From,Minted song for,${contract.address},${amount},${date}`,
                // bigIntAmount
            );
            await tx.wait();

            setMessageFn(setMessage, { 
                status: 'success', message: `Song created. Now Saving...` 
            });
            
            // self.send_token(buyer, seller, amount, sender_activity, receiver_activity);
            const txn = await contractInstance.sendToken(
                contract.address, adminAddress, bigIntAmount,
                `To,Created song,${adminAddress},${amount},${date}`,
                `From,Minted song for,${contract.address},${amount},${date}`
            );
            await txn.wait();

            setUser(new_user_data);
            addSong(data);
            setLoading(false);
            creating.current = false;
            closeModal();
        } catch(err) {
            // console.log(err);
            setLoading(false);
            creating.current = false;
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Please try again.' });
        }
    };

    return (
        <div className='__Create__Modal__Overlay__'>
            <div className='create-modal-wrapper' ref={modalRef}>
                <div className="create-song w-full">
                    <div className="cs-header w-full">
                        <h3>Create a song</h3>
                        <button className="csh-btn pointer" onClick={() => closeModal()}>
                            <AiOutlineClose className='cshb-icon' />
                        </button>
                    </div>
                    <div className='cs-main w-full'>
                        <div className='csm-form w-full'>
                            <div className='csmf-field w-full'>
                                <label>Song Title</label>
                                <input placeholder='Enter a title' name='title' onChange={handleChange} />
                            </div>
                            <div className='csmf-field w-full'>
                                <label>Artiste(s) on the song</label>
                                <input placeholder='Enter artiste name(s)' name='artiste' onChange={handleChange} />
                            </div>
                            <div className='csmf-field w-full'>
                                <label>Add a cover for song</label>
                                <input type='file' id='cover-file' accept='image/*' onChange={handleImageFileChange} />
                                <div className='csmff-file'>
                                    {
                                        coverFile.name ?
                                        <div className='csmff-img'>
                                            <img src={getImageURL} alt='' />
                                            <label className='csmffi pointer' htmlFor='cover-file'>
                                                <MdEdit className='csmffi-icon' />
                                            </label>
                                        </div> :
                                        <label className='csmff-no-file pointer' htmlFor='cover-file'>Select an image</label>
                                    }
                                </div>
                            </div>
                            <div className='csmf-field w-full'>
                                <label>Add the song file</label>
                                <input type='file' id='mp3-file' accept='audio/*' onChange={handleFileChange} />
                                <div className='csmff-mp3'>
                                    <label className='csmffm-label pointer' htmlFor='mp3-file'>
                                        {mp3File?.name ? 'Change' : 'Select'} song
                                    </label>
                                    <span>{mp3File?.name || 'No file selected'}</span>
                                </div>
                            </div>
                            <div className='csmf-field w-full'>
                                <label className='csmff-label-price'>
                                    Price of song
                                    <div>{
                                            walletloading === true ? <Skeleton /> : 
                                            walletloading === 'error'?
                                            <div className='csmfflp-btn pointer' onClick={()=>fetchData()}>Refresh wallet</div> :
                                            <span>{`${wallet} ${tokenSymbol}`}</span>
                                        }
                                    </div>
                                </label>
                                <input placeholder='Enter an amount as price' type='number' name='price' onChange={handleChange} />
                            </div>
                            <div className='csmf-field w-full'>
                                <label>{`Quantity (Note you will charged ${mintCharge} ${tokenSymbol} per qty)`}</label>
                                <input placeholder='Enter number of qty' type='number' name='qty' onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                    <div className='cs-footer w-full'>
                        <button className={`csf-btn ${!loading && 'pointer'}`} onClick={() => handleCreate()} disabled={loading}>
                            <span>{loading ? 'Creating...' : 'Create'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default CreateSong;