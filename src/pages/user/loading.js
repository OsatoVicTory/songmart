import Skeleton from '../../components/skeleton';
import './styles.css';

const UserLoading = () => {

    const arr = Array(10).fill(0);

    return (
        <div className={`User w-full`}>
            <div className='user w-full'>
                <div className='user-header w-full'>
                    <div className='uh-banner'></div>
                    <div className='uh-cloak'></div>
                    <div className='uh-txt'>
                        <div className='uht w-full'>
                            <div className='uht-name'>
                                <div>
                                    {/* <span className='uhtn'>Osato.shi</span> */}
                                    <div className='uhtn loading'><Skeleton /></div>
                                    <div className='uhtn-edit loading'>
                                        <Skeleton />
                                    </div>
                                </div>
                                <div className='uht-join loading'><Skeleton /></div>
                            </div>
                            <div className='uht-data'>
                                <div>
                                    <div className='uhtd-value loading'><Skeleton /></div>
                                    <div className='uhtd-name loading'><Skeleton /></div>
                                </div>
                                <div>
                                    <div className='uhtd-value loading'><Skeleton /></div>
                                    <div className='uhtd-name loading'><Skeleton /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='user-main w-full'>
                    <div className='um-main-h'>
                        <div className='ummh-h3'><Skeleton /></div>
                        <button className="ummh-btn loading">
                            <Skeleton />
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
                                    <span className='umdt-streams'>SALES</span>
                                    <div className='umdt _d'>
                                        <span className='umdt-date'>DATE</span>
                                        <span className='umdt-streams'>SALES</span>
                                    </div>
                                </button>
                            </li>
                            {arr.map((val, idx) => (
                                <li className="um-li loading w-full" key={`um-li-${idx}`}>
                                    <button className='um-div w-full'>
                                        <div className='umd-rank'>
                                            <span className='loading'><Skeleton /></span>
                                        </div>
                                        <div className='umd-img'>
                                            <div className='umdi loading'>
                                                <Skeleton />
                                            </div>
                                        </div>
                                        <div className='umdt _f'>
                                            <span className='umdt-title loading'><Skeleton /></span>
                                            <span className='umdt-artiste loading'><Skeleton /></span>
                                        </div>
                                        <span className='umdt-artiste loading'><Skeleton /></span>
                                        <span className='umdt-streams loading'><Skeleton /></span>
                                        <div className='umdt _d'>
                                            <span className='umdt-date loading'><Skeleton /></span>
                                            <span className='umdt-streams loading'><Skeleton /></span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    )
};

export default UserLoading;