import { useNavigate } from 'react-router-dom';
import '../../components/modals/create.css';
import './styles.css';
import { BrowserProvider } from "ethers";
import { useContext, useState } from 'react';
import { AppContext } from '../../context';
import { createContractInstance, getTokenAmount, parseStringData, setMessageFn } from '../../util';
import { logo } from '../../config';

const Login = () => {

    const [connecting, setConnecting] = useState(false);

    const navigate = useNavigate();
    const { setContract, setMessage, setWallet, setUser } = useContext(AppContext);

    async function loadContract() {
        
        if (!window.ethereum) {
          throw new Error("No crypto wallet found. Please install MetaMask.");
        }
        setConnecting(true);
        const provider = await new BrowserProvider(window.ethereum);
        const signer_val = await provider.getSigner();
        const signerAddress = await signer_val.getAddress();
        const contractInstance = await createContractInstance(signer_val);
        setContract({ signer: signer_val, address: signerAddress });
        const isMember = await contractInstance.getUser(signerAddress);
        console.log(isMember);

        if(!isMember) navigate('/signup');
        else {
            setUser(parseStringData(isMember));
            const wallet = await contractInstance.getWallet(signerAddress);
            console.log('wallet', wallet);
            setWallet(getTokenAmount(wallet));
            navigate('/app');
        }
    };
    
    
    function handleLogin() {
        
        if (!window.ethereum) return setMessageFn(setMessage, { status: 'error', message: 'Install Metamask extension!' });

        loadContract().catch(error => {
            console.log(error);
            if(error.message === "No crypto wallet found. Please install MetaMask.") {
                setMessageFn(setMessage, { status: 'error', message: error.message });
            } else setMessageFn(setMessage, { status: 'error', message: 'Error connecting wallet' });
            setConnecting(false);
        });
    };

    return (
        <div className='signup-signin'>
            <div className='ss-wrapper'>
                <div className="ssc-brand-link">
                    <img src={logo} alt="logo" />
                    <span>SongMart</span>
                </div>
                <div className='ss-container ssc-login'>
                    <div className='ssc-header ssch-login w-full'>
                        <h3>Log in</h3>
                    </div>
                    <div className='ssc-main w-full'>
                        <span>Connect wallet to continue</span>
                        <p>Ensure you have Metamask wallet extension to connect</p>
                    </div>
                    <div className='cs-footer w-full'>
                        <button className={`csf-btn ${!connecting && 'pointer'}`} 
                        onClick={() => handleLogin()} disabled={connecting}>
                            <span>{connecting ? 'Connecting...' : 'Connect wallet'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Login;