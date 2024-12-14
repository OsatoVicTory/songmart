import './styles.css';
import Skeleton from '../../components/skeleton';

const HomeLoading = () => {

    const arr = Array(16).fill(0);
    
    return (
        <div className="Home w-full">
            <div className="h-container w-full">
                <div className="hc-header w-full">
                    <div className='hch-h3'><Skeleton /></div>
                    <div className="add-song loading">
                        <Skeleton />
                    </div>
                </div>
                <div className="hc-main w-full">
                    <ul className="hc-ul">
                        {arr.map((val, idx) => (
                            <li className="hc-li" key={`hc-li-${idx}`}>
                                <div className='hc-div'>
                                    <div className='hcd-top loading'>
                                        {/* <img src={val.img} alt='' />
                                        <div className='hcd-cloak'></div> */}
                                        <Skeleton />
                                    </div>
                                    <div className='hcd-txt'>
                                        <div className='hcdt-title'><Skeleton /></div>
                                        <div className='hcdt-artiste'><Skeleton /></div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
};

export default HomeLoading;