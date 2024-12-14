import { useContext, useState } from 'react';
import './styles.css';
import { BiSolidError } from 'react-icons/bi';
import { AppContext } from '../context';
import { createContractInstance, getTokenAmount, parseStringData, setMessageFn } from '../util';
import { BrowserProvider } from 'ethers';
import { useNavigate } from 'react-router-dom';

const NoWallet = () => {

    const { setContract, setUser, setWallet, setMessage } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fireFn = async () => {
        if(loading) return;
        
        try {
            
            setLoading(true);

            if (!window.ethereum) {
                setLoading(false);
                setMessageFn(setMessage, { 
                    status: 'error', message: "No crypto wallet found. Please install MetaMask." 
                });
                return;
            }
            const provider = await new BrowserProvider(window.ethereum);
            const signer_val = await provider.getSigner();
            const signerAddress = await signer_val.getAddress();
            console.log('address', signerAddress);
            const contractInstance = await createContractInstance(signer_val);
            const isUser = await contractInstance.getUser(signerAddress);
            console.log('isUser', isUser);
            if(!isUser) {
                setContract({ signer: signer_val, address: signerAddress });
                navigate('/signup');
            } else {
                const wallet = await contractInstance.getWallet(signerAddress);
                console.log('wallet', wallet);
                setWallet(getTokenAmount(wallet));
                setUser(parseStringData(isUser));
                setContract({ signer: signer_val, address: signerAddress });
            }
            setLoading(false);
        } catch (err) {
            console.log(err);
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Check internet.' });
            setLoading(false);
        }
    };

    return (
        <div className="error-page">
            <div>
                <div className='ep-iocn-div'>
                    <BiSolidError className='ep-icon' />
                </div>
                <p className='ep-h3'>
                    No wallet detected. Connect your wallet to continue.
                </p>
                <button className={`ep-btn ${!loading && 'pointer'}`} onClick={() => fireFn()} disabled={loading}>
                    {loading ? 'Connecting...' : 'Connect wallet'}
                </button>
            </div>
        </div>
    );
};

export default NoWallet;