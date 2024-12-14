import './styles.css';
import { createContractInstance, formatDate, parseCount, parseStringData, setMessageFn } from '../../util';
// import img1 from '../../assets/music 1.jpg';
import BuySongModal from '../../components/modals/buy';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context';
import UserLoading from './loading';
import ErrorPage from '../../components/error';
import NoData from '../../components/no-data';
import { tokenSymbol } from '../../config';
import { useParams } from 'react-router-dom';

const OtherUser = () => {

    // const bg = img1;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [modal, setModal] = useState(false);
    const [s_index, setSIndex] = useState(0);
    const [songs, setSongs] = useState([]);
    const [user, setUser] = useState({});
    const { contract, setModalActive, setMessage } = useContext(AppContext);
    const id = useParams().user_id;

    const fetchData = async () => {
        setLoading(true);
        setError(false);
        const contractInstance = await createContractInstance(contract.signer);
        try {
            const userRes = await contractInstance.getUser(id);
            const songsRes = Array.from(await contractInstance.getSongs(id)).map((val, index) => {
                if(!val) return { title: '' };
                else return { ...parseStringData(val), index }
            }).reverse().filter(val => val.title); // filter is to get rid of empty or sold-out songs
            setUser(parseStringData(userRes));
            setSongs(songsRes);
            setLoading(false);
        } catch (err) {
            setError(true);
            setLoading(false);
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Please try again.' });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleModal = (arg = false, sel = {}) => {
        setSIndex(sel.index);
        setModal(arg);
        setModalActive(arg ? true : false);
    };

    return (
        // <div className={`User ${modal} w-full`}>
        <div className={`User w-full`}>
            {
                error ?

                <ErrorPage fireFn={fetchData} /> :

                loading ?

                <UserLoading /> :

                ((songs.length === 0 || !user.userName) ?

                <NoData text={`User ${!user.userName ? 'does not exist' : 'has not created a song yet.'}`}  /> :

                <div className='user w-full'>
                    <div className='user-header w-full'>
                        <div className='uh-banner' style={{backgroundImage: `url(${user.img})`}}></div>
                        <div className='uh-cloak'></div>
                        <div className='uh-txt'>
                            <div className='uht w-full'>
                                <div className='uht-name'>
                                    <div>
                                        <span className='uhtn'>{user.userName}</span>
                                    </div>
                                    <span className='uht-join'>{formatDate(user.joinedAt)}</span>
                                </div>
                                <div className='uht-data'>
                                    <div>
                                        <span className='uhtd-value'>{parseCount(user.totalSongs - 0)}</span>
                                        <span className='uhtd-name'>Total Songs</span>
                                    </div>
                                    <div>
                                        <span className='uhtd-value'>{parseCount(user.totalSales - 0)}</span>
                                        <span className='uhtd-name'>Total Sales</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='user-main w-full'>
                        <div className='um-main-h'>
                            <h3>{`All ${user.userName} Songs`}</h3>
                        </div>
                        <div className="um-main w-full">
                            <ul className="um-ul">
                                <li className="um-li uml-header w-full">
                                    <button className='um-div w-full'>
                                        <div className='umd-rank'>
                                            <span>RNK</span>
                                        </div>
                                        <div className='umd-img'>
                                            <span className='umd-image'>COVER</span>
                                        </div>
                                        <div className='umdt _f'>
                                            <span className='umdt-title'>TITLE</span>
                                            <span className='umdt-artiste'>ARTISTE</span>
                                        </div>
                                        <span className='umdt-artiste'>ARTISTE</span>
                                        <span className='umdt-streams'>PRICE</span>
                                        <div className='umdt _d'>
                                            <span className='umdt-date'>DATE</span>
                                            <span className='umdt-streams'>PRICE</span>
                                        </div>
                                    </button>
                                </li>
                                {songs.map((val, idx) => (
                                    <li className="um-li w-full" key={`um-li-${idx}`}>
                                        <button className='um-div w-full pointer' onClick={() => handleModal('song', val)}>
                                            <div className='umd-rank'>
                                                <span>{idx + 1}</span>
                                            </div>
                                            <div className='umd-img'>
                                                <div className='umdi'>
                                                    <img src={val.coverSrc} alt='' />
                                                    <div className='umdi-duration'>{val.duration}</div>
                                                </div>
                                            </div>
                                            <div className='umdt _f'>
                                                <span className='umdt-title'>{val.title}</span>
                                                {/* artiste may include featured-artiste so dont use user.userName */}
                                                <span className='umdt-artiste'>{val.artiste}</span>
                                            </div>
                                            <span className='umdt-artiste'>{val.artiste}</span>
                                            <span className='umdt-streams'>{`${parseCount(val.price - 0)} ${tokenSymbol}`}</span>
                                            <div className='umdt _d'>
                                                <span className='umdt-date'>{formatDate(val.date)}</span>
                                                <span className='umdt-streams'>{`${parseCount(val.price - 0)} ${tokenSymbol}`}</span>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                )
            }

            {modal === 'song' && <BuySongModal closeModal={() => handleModal()} 
            seller={user} updateSeller={(data) => setUser(data)} songs={songs}
            updateSellerSongs={(data) => setSongs(data)} s_index={s_index} />}

        </div>
    )
};

export default OtherUser;