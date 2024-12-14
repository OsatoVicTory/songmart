import { MdEdit } from 'react-icons/md';
import './styles.css';
import { createContractInstance, formatDate, parseCount, parseStringData, setMessageFn } from '../../util';
// import img1 from '../../assets/music 1.jpg';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context';
import EditUser from '../../components/modals/editUser';
import UserLoading from './loading';
import ErrorPage from '../../components/error';
import NoData from '../../components/no-data';
import CreateSong from '../../components/modals/create';
import { tokenSymbol } from '../../config';
import CurUserBuySongModal from '../../components/modals/curUserBuy';
import { FaPlus } from 'react-icons/fa';

const CurUser = () => {

    // const bg = img1;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [modal, setModal] = useState(false);
    const [s_index, setSIndex] = useState(0);
    const { contract, user, setModalActive, setMessage, curUserSongs, setCurUserSongs } = useContext(AppContext);

    const fetchData = async () => {
        if(curUserSongs.length === 0) setLoading(true);
        setError(false);
        const contractInstance = await createContractInstance(contract.signer);
        try {
            const s_ = await contractInstance.getSongs(contract.address);
            console.log('s_', s_, Array.from(s_));
            const songsRes = Array.from(s_).map((val, index) => {
                if(!val) return { title: '' };
                else return { ...parseStringData(val), index }
            }).reverse().filter(val => val.title); // filter is to get rid of empty or sold-out songs
            setCurUserSongs(songsRes);
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

    const addSong = (song_data) => {
        setCurUserSongs([{ ...parseStringData(song_data), index: curUserSongs.length }, ...curUserSongs]);
    };

    return (
        // <div className={`User ${modal} w-full`}>
        <div className={`User w-full`}>
            {
                error ?

                <ErrorPage fireFn={fetchData} /> :

                loading ?

                <UserLoading /> :

                <div className='user w-full'>
                    <div className='user-header w-full'>
                        <div className='uh-banner' style={{backgroundImage: `url(${user.img})`}}></div>
                        <div className='uh-cloak'></div>
                        <div className='uh-txt'>
                            <div className='uht w-full'>
                                <div className='uht-name'>
                                    <div>
                                        <span className='uhtn'>{user.userName + ' (YOU)'}</span>
                                        <div className='uhtn-edit pointer' onClick={() => handleModal('edit-user')}>
                                            <MdEdit className='uhtn-icon' />
                                        </div>
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

                    {
                    curUserSongs.length === 0 ?

                    <NoData btnFn={() => handleModal('create-song')} btnTxt={'Create song'}
                    text={'No song created yet. Click button below to create one.'}  /> :

                    <div className='user-main w-full'>
                        <div className='um-main-h'>
                            <h3>All Your Songs</h3>
                            <button className="ummh-btn pointer" onClick={() => handleModal('create-song')}>
                                <FaPlus className='ummhb-icon' />
                                <span>Create new Song</span>
                            </button>
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
                                {curUserSongs.map((val, idx) => (
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
                    }
                </div>
            }

            {modal === 'song' && <CurUserBuySongModal closeModal={() => handleModal()} songs={curUserSongs} s_index={s_index} />}

            {modal === 'create-song' && <CreateSong closeModal={() => handleModal()} addSong={addSong} />}

            {modal === 'edit-user' && <EditUser closeModal={() => handleModal()} />}

        </div>
    )
};

export default CurUser;