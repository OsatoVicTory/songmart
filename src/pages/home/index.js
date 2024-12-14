import { FaPlus } from 'react-icons/fa';
import './styles.css';
import { createContractInstance, pad_array, parseCount, parseStringData, setMessageFn } from '../../util';
import CreateSong from '../../components/modals/create';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context';
import { Link } from 'react-router-dom';
import HomeLoading from './loading';
import ErrorPage from '../../components/error';

const Home = () => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [modal, setModal] = useState(false);
    const { contract, usersList, setUsersList, setModalActive, setMessage } = useContext(AppContext);

    const fetchData = async () => {
        if(usersList.length === 0) setLoading(true);
        setError(false);
        const contractInstance = await createContractInstance(contract.signer);
        try {
            // user data will have been gotten from nowallet page, so need to fetch it
            const d_ = await contractInstance.getUsers();
            console.log(d_);
            const usersRes = Array.from(d_).reverse();
            const users = [];
            for(const userAddress of usersRes) {
                const user = await contractInstance.getUser(userAddress);
                users.push({ ownerAddress: userAddress, ...parseStringData(user) });
            }
            setUsersList(users);
            setLoading(false);
        } catch (err) {
            console.log(err);
            setError(true);
            setLoading(false);
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Please try again.' });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleModal = (arg = false) => {
        setModal(arg);
        setModalActive(arg);
    };
    
    return (
        <div className="Home w-full">
            {
                error ?

                <ErrorPage fireFn={fetchData} /> :

                (loading ?

                <HomeLoading /> :

                <div className="h-container w-full">
                    <div className="hc-header w-full">
                        <h3>All Songs</h3>
                        <button className="add-song pointer" onClick={() => handleModal(true)}>
                            <FaPlus className='as-icon' />
                            <span>Add Song</span>
                        </button>
                    </div>
                    <div className="hc-main w-full">
                        <ul className="hc-ul">
                            {usersList.map((val, idx) => (
                                <li className="hc-li" key={`hc-li-${idx}`}>
                                    <Link to={`user${val.ownerAddress === contract.address ? '' : '/'+val.ownerAddress}`} 
                                    className='hc-div pointer'>
                                        <div className='hcd-top'>
                                            <img src={val.img} alt='' />
                                            <div className='hcd-cloak'></div>
                                        </div>
                                        <div className='hcd-txt'>
                                            <span className='hcdt-title'>
                                                {val.ownerAddress === contract.address ? 'YOU' : val.userName}
                                            </span>
                                            <span className='hcdt-artiste'>Total songs: {parseCount(val.totalSongs - 0)}</span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                            {pad_array.map((val, idx) => (
                                <li className="hc-li hcl-padding" key={`hc-li-padding-${idx}`}></li>
                            ))}
                        </ul>
                    </div>
                </div>
                )
            }

            {modal && <CreateSong closeModal={() => handleModal()} />}
        </div>
    )
};

export default Home;