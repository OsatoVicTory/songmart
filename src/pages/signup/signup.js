import { useNavigate } from 'react-router-dom';
import '../../components/modals/create.css';
import './styles.css';
import { useContext, useMemo, useState } from 'react';
import { MdEdit } from 'react-icons/md';
import { AppContext } from '../../context';
import { createContractInstance, multiplyBigDecimals, parseBigInt, parseStringData, sendFile, setMessageFn } from '../../util';
import { adminAddress, logo, MB, newUserReward } from '../../config';

const SignUp = () => {
    
    const [coverFile, setCoverFile] = useState({});
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { contract, setUser, setWallet, setMessage } = useContext(AppContext);

    async function signup() {
        
        if(!contract.address) {
            setMessageFn(setMessage, { status: 'error', message: 'Wallet not conneted yet.' });
            return navigate('/login');
        }

        if(!coverFile.name || !userName) {
            return setMessageFn(setMessage, { status: 'error', 
                message: `Fill ${!coverFile.name ? 'cover file' : 'userName'} field` 
            });
        }

        setLoading(true);
        try {
            const date = new Date().getTime();

            const formData = new FormData();
            formData.append('file', coverFile);
            formData.append('filename', coverFile.name);
            formData.append('file_type', 'image');

            const img = (await sendFile(formData)).data.data.secure_url;
            console.log('img', img);

            const data = `userName=${userName}%x3img=${img}%x3totalSongs=0%x3totalSales=0%x3joinedAt=${date}`;
            const contractInstance = await createContractInstance(contract.signer);
            
            const bigIntAmount = parseBigInt(multiplyBigDecimals(newUserReward));
            console.log('bigInt', bigIntAmount);
            // zero in below is important n should be constant
            const tx = await contractInstance.createNewuser(
                contract.address, contract.address, data, 0, bigIntAmount,
                `From,Received rewards from,${adminAddress},${newUserReward},${date}`
            );
            await tx.wait();
            setMessageFn(setMessage, { status: 'success', message: 'Saved successfully.' });
            setUser(parseStringData(data));
            setWallet(newUserReward);
            setLoading(false);
            navigate('/app');
        } catch(err) {
            console.log(err);
            setLoading(false);
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Please try again.' });
        }
    }

    function handleImageFileChange(e) {
        const file = e.target.files[0];
        if(!file?.size) return;

        if(file.size > (MB * 1024 * 1024)) {
            return setMessageFn(setMessage, { status: 'error', message: `File cannot be more than ${MB}MB` });
        }
        if(coverFile?.type?.startsWith('image/')) URL.revokeObjectURL(coverFile);
        setCoverFile(file);
    };

    const getImageURL = useMemo(() => {
        if(coverFile.type && coverFile.type.startsWith('image/')) return URL.createObjectURL(coverFile);
        return null;
    }, [coverFile.name]);

    return (
        <div className='signup-signin'>
            <div className='ss-wrapper'>
                <div className="ssc-brand-link">
                    <img src={logo} alt="logo" />
                    <span>SongMart</span>
                </div>
                <div className='ss-container'>
                    <div className='ssc-header w-full'>
                        <h3>Sign up</h3>
                    </div>
                    <div className='cs-main w-full'>
                        <div className='csm-form w-full'>
                            <div className='csmf-field w-full'>
                                <label>Profile name</label>
                                <input placeholder='Enter your name' onChange={(e) => setUserName(e.target.value)} />
                            </div>
                            <div className='csmf-field w-full'>
                                <label>Add a cover for your profile</label>
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
                        </div>
                    </div>
                    <div className='cs-footer w-full'>
                        <button className={`csf-btn ${!loading && 'pointer'}`} onClick={() => signup()} disabled={loading}>
                            <span>{loading ? 'Saving...' : 'Sign up'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default SignUp;