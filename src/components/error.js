import './styles.css';
import { BiSolidError } from 'react-icons/bi';

const ErrorPage = ({ fireFn }) => {

    return (
        <div className="error-page">
            <div>
                <div className='ep-iocn-div'>
                    <BiSolidError className='ep-icon' />
                </div>
                <p className='ep-h3'>
                    There was an error loading the data. Check internet connection and Retry
                </p>
                <button className={`ep-btn 'pointer`} onClick={() => fireFn()}>
                    Retry
                </button>
            </div>
        </div>
    );
};

export default ErrorPage;