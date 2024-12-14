import { AiOutlineClose } from 'react-icons/ai';
import Skeleton from '../skeleton';
import './wallet.css';

const WalletLoading = ({ closeModal }) => {

    const walletHistory = Array(10).fill(0);

    return (
        <aside className="wallet-modal-slider">
            <div className="wms-header w-full">
                <h3>Wallet</h3>
                <button className="wmsh-btn pointer" onClick={() => closeModal()}>
                    <AiOutlineClose className='wmsh-icon' />
                </button>
            </div>
            <div className="wms-main w-full">
                <div className="wmsm-top w-full">
                    <div className='wmsm-h2 loading'>
                        <Skeleton />
                    </div>
                    <div className='balance'>
                        <div className='bal-h1 loading'>
                            <Skeleton />
                        </div>
                    </div>
                    <div className='wmsb w-full'>
                        <div className='wms-btn loading'><Skeleton /></div>
                    </div>
                    <div className='wmsb w-full'>
                        <div className='wms-btn loading'><Skeleton /></div>
                    </div>
                </div>
            </div>
            <div className="wms-footer w-full">
                {/* <h3>Transaction History</h3> */}
                <div className='wms-footer-h3 loading'>
                    <Skeleton />
                </div>
                <ul className='wms-ul'>
                    {walletHistory.map((val, idx) => (
                        <li className='wms-li loading' key={`wms-li-${idx}`}>
                            <div className='whl-img loading'>
                                <Skeleton />
                            </div>
                            <div className='whl-txt'>
                                <span className='whl-type loading'><Skeleton /></span>
                                <span className='whl-address loading'>
                                    <Skeleton />
                                </span>
                            </div>
                            <div className='whl-det'>
                                <span className='whl-amount loading'><Skeleton /></span>
                                <span className='whl-time loading'>
                                    <Skeleton />
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    )
};

export default WalletLoading;