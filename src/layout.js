import { Link, useNavigate } from "react-router-dom";
import logo from './logo.svg';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { AiOutlineSearch, AiOutlineClose } from 'react-icons/ai';
import './layout.css';
import { useContext, useEffect, useRef, useState } from "react";
import WalletModal from "./components/modals/wallet";
import { AppContext } from "./context";
import NoWallet from "./components/no-wallet";
import { createContractInstance, getTokenAmount, parseStringData, setMessageFn, shortenAddy } from "./util";
import { BrowserProvider } from "ethers";

const Layout = ({ children }) => {

    const [search, setSearch] = useState(false);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const scrolledRef = useRef(false);
    const { contract, setContract, modalActive, setModalActive, setMessage, setWallet, setUser } = useContext(AppContext);

    const handleScroll = (e) => {
        const { scrollTop } = e.target;
        if(scrollTop >= 70) {
            if(!scrolledRef.current) {
                setScrolled(true);
                scrolledRef.current = true;
            }
        } else {
            if(scrolledRef.current) {
                setScrolled(false);
                scrolledRef.current = false;
            }
        }
    };

    useEffect(() => {
        const ele = document.getElementById('main-scroll');

        if(ele) ele.addEventListener('scroll', handleScroll);

        return () => {
            if(ele) ele.removeEventListener('scroll', handleScroll);
        }
    }, []);

    function handleChange(e) {
        // 
    };

    const connect_ = async () => { 
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
            const contractInstance = await createContractInstance(signer_val);
            const isUser = await contractInstance.getUser(signerAddress);
            if(!isUser) {
                setContract({ signer: signer_val, address: signerAddress });
                navigate('/signup');
            } else {
                const wallet = await contractInstance.getWallet(signerAddress);
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

    const handleWallet = () => {
        if(!contract.address) {
            connect_();
        } else {
            setShow(true);
            setModalActive(true);
        }
    };

    const closeModal = () => {
        setShow(false);
        setModalActive(false);
    };

    return (
        <div className={`__Layout__ ${modalActive}`} id="main-scroll">
            
                <div className="l-wrapper">
                    <div className={`l-container ${scrolled&&'scrolled'} w-full`}>
                        <header className={`true`}>
                            <div className="brand">
                                <Link to='' className="brand-link">
                                    <img src={logo} alt="logo" />
                                    <span>SongMart</span>
                                </Link>
                            </div>
                            <div className="l-search">
                                    <AiOutlineSearch className={`ls-icon left ${search?true:false}`} />

                                    <input className={`l-search-input w-full ${search?true:false}`} 
                                    value={search||""} placeholder='Search...' onChange={(e) => handleChange(e)} />

                                    <AiOutlineClose className='ls-icon right pointer close-icon' />
                            </div>
                            <button className="connect-wallet-btn pointer" onClick={() => handleWallet()}>
                                <MdAccountBalanceWallet className='cwb-icon' />
                                <span>{
                                    loading ? 'Connecting...' :
                                    contract.address ? shortenAddy(contract.address) : 'Connect'
                                }</span>
                            </button>
                        </header>
                        <main>
                            {
                                !contract.address ?

                                <NoWallet /> :
                                
                                children
                            }
                        </main>
                    </div>
                    
            </div>

            <WalletModal show={show} closeModal={() => closeModal()} />

        </div>
    )
};

export default Layout;