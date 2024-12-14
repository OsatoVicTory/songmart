import { Route, Routes } from 'react-router-dom';
import './App.css';
import SignUp from './pages/signup/signup';
import Streamify from './Streamify';
import Login from './pages/signup/login';
import { useContext } from 'react';
import { AppContext } from './context';
import { MdError } from 'react-icons/md';
import { FaCircleCheck } from 'react-icons/fa6';
// import Test from './test';

function App() {

  const { message } = useContext(AppContext);

  return (
    <div className="App">

      <div className={`message-alert ${message.message ? true : false}`}>
        <div className='alert'>
          {
            message.status === 'error' ?
            <MdError className='alert-icon alert-error' /> :
            <FaCircleCheck className='alert-icon alert-success' />
          }
          <span className='alert-txt'>{message.message}</span>
        </div>
      </div>

      <Routes>
        {/* <Route path='/' element={<Test />} /> */}
        <Route path='/' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/app/*' element={<Streamify />} />
      </Routes>
    </div>
  );
}

export default App;
