import { AiOutlineClose } from 'react-icons/ai';
import { BsFillSendFill } from 'react-icons/bs';
import { FaArrowDown } from 'react-icons/fa';
import { IoIosCopy } from 'react-icons/io';
import './wallet.css';
import { createContractInstance, formatDate, getTokenAmount, multiplyBigDecimals, parseBigInt, setMessageFn, subtractBigDecimals } from '../../util';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context';
import WalletLoading from './walletLoading';
import { tokenSymbol } from '../../config';
import ErrorPage from '../error';

const WalletModal = ({ show, closeModal }) => {

    const [formType, setFormType] = useState('');
    const [sendLoading, setSendLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [tf, setTf] = useState({});
    const { contract, setMessage, wallet, setWallet, walletHistory, setWalletHistory } = useContext(AppContext);

    const formatData = (val) => {
        const [op, text, address, amt, time] = val.split(',');
        return { op, text, address, amt, time };
    };

    const fetchData = async () => {
        setError(false);
        setLoading(true);
        const contractInstance = await createContractInstance(contract.signer);
        try {
            const history_data = Array.from(await contractInstance.getTxns(contract.address)).reverse().map(v => formatData(v));
            const wallet_data = await contractInstance.getWallet(contract.address);
            console.log('wallet_data', wallet_data);
            setWallet(getTokenAmount(wallet_data));
            setWalletHistory(history_data);
            setLoading(false);
        } catch(err) { 
            setError(true);
            setLoading(false);
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Please try again.' });
        }
    };

    useEffect(() => {
        if(show) fetchData();
    }, [show]);

    function handleChange(e) {
        const { name, value } = e.target;
        setTf({ ...tf, [name]: value });
    };

    const sendTokens = async () => {
        if(sendLoading) return setMessageFn(setMessage, { status: 'error', message: `Currently making a request` });

        const missing = Object.keys(tf).find(key => !tf[key]);
        if(missing) return setMessageFn(setMessage, { status: 'error', message: `Fill ${missing} field` });
        
        if(tf.amount > wallet) {
            return setMessageFn(setMessage, { status: 'error', message: `Amount exceeds available funds in your wallet` });
        }

        setSendLoading(true);
        const contractInstance = await createContractInstance(contract.signer);
        try {
            const bigIntAmount = parseBigInt(multiplyBigDecimals(tf.amount));
            const new_wallet = getTokenAmount(wallet - tf.amount);

            const date = new Date().getTime();
            const tx = await contractInstance.sendToken(
                contract.address, tf.receiverAddress, bigIntAmount,
                `To,Transferred tokens to,${tf.receiverAddress},${tf.amount},${date}`,
                `From,Received tokens from,${contract.address},${tf.amount},${date}`,
            );
            await tx.wait();
            setWallet(new_wallet);
            setWalletHistory([`To,Transferred tokens to,${tf.receiverAddress},${tf.amount},${date}`, ...walletHistory]);
            setMessageFn(setMessage, { status: 'success', message: 'Tokens sent successfully.' });
            setSendLoading(false);
        } catch(err) { 
            setSendLoading(false);
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Please try again.' });
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(contract.address);
            setMessageFn(setMessage, { status: 'success', message: 'Address copied.' });
        } catch (err) {
            setMessageFn(setMessage, { status: 'error', message: 'Failed to copy.' });
        }
    };

    return (
        <div className={`__Wallet__Modal__Overlay ${show?'show':false}`}>
            {
                error ?

                <aside className="wallet-modal-slider"><ErrorPage fireFn={fetchData} /></aside> :

                loading ?

                <WalletLoading closeModal={closeModal} /> :

                <aside className="wallet-modal-slider">
                    <div className="wms-header w-full">
                        <h3>Wallet</h3>
                        <button className="wmsh-btn pointer" onClick={() => closeModal()}>
                            <AiOutlineClose className='wmsh-icon' />
                        </button>
                    </div>
                    <div className="wms-main w-full">
                        <div className="wmsm-top w-full">
                            <h2>Total Balance</h2>
                            <div className='balance'>
                                <h1>{`${wallet} ${tokenSymbol}`}</h1>
                            </div>
                            <div className='wmsb w-full' onClick={() => setFormType('receive')}>
                                <button className='wms-btn pointer wms-receive'>Receive</button>
                            </div>
                            <div className='wmsb w-full' onClick={() => setFormType('transfer')}>
                                <button className='wms-btn pointer wms-send'>Transfer</button>
                            </div>
                        </div>
                        {formType && <div className="wmsm-base w-full">
                            { 
                                formType === 'receive' ?
                                <div className='wmsm-form w-full'>
                                    <div className='wmsmf w-full'>
                                        <div className='wmsmf-h w-full'>
                                            <h3>Receive</h3>
                                            <AiOutlineClose className='wmsmf-h-icon pointer' onClick={() => setFormType('')} />
                                        </div>
                                        <div className='wsmf-field'>
                                            <div className='wsmf-addy pointer' onClick={handleCopy}>
                                                <IoIosCopy className='wsmfa-icon' />
                                                <span>Copy your address</span>
                                            </div>
                                        </div>
                                    </div>
                                </div> :
                                <div className='wmsm-form w-full'>
                                    <div className='wmsmf w-full'>
                                        <div className='wmsmf-h w-full'>
                                            <h3>Transfer</h3>
                                            <AiOutlineClose className='wmsmf-h-icon pointer' onClick={() => setFormType('')} />
                                        </div>
                                        <div className='wsmf-field'>
                                            <label>Address</label>
                                            <input placeholder='Enter address' name='receiverAddress' onChange={handleChange} required />
                                        </div>
                                        <div className='wsmf-field'>
                                            <label>Amount</label>
                                            <input placeholder='Enter amount' type='number' name='amount' onChange={handleChange} required />
                                        </div>
                                        <div className='wsmf-send'>
                                            <button className={`wsmf-btn ${!sendLoading && 'pointer'}`}
                                            onClick={() => sendTokens()} disabled={sendLoading}>
                                                <BsFillSendFill className='wsmfb-icon' />
                                                <span>{sendLoading ? 'Sending...' : 'Send'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>}
                    </div>
                    <div className="wms-footer w-full">
                        <h3>Transaction History</h3>
                        <ul className='wms-ul'>
                            {walletHistory.map((val, idx) => (
                                <li className='wms-li' key={`wms-li-${idx}`}>
                                    <div className='whl-img'>
                                        {val.op === 'To' ?
                                            <BsFillSendFill className='whl-icon' /> :
                                            <FaArrowDown className='whl-icon' /> 
                                        }
                                    </div>
                                    <div className='whl-txt'>
                                        <span className='whl-type'>{val.text}</span>
                                        <span className='whl-address'>
                                            {val.address}
                                        </span>
                                    </div>
                                    <div className='whl-det'>
                                        {/* note, amt here is in normal int form, not in uint256 so no conversion */}
                                        <span className='whl-amount'>{val.amt} $ETH</span>
                                        <span className='whl-time'>
                                            {formatDate(val.time)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            }
        </div>
    )
};

export default WalletModal;