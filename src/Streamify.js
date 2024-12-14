import { Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './layout';
import Home from './pages/home';
import User from './pages/user';

function Streamify() {
  return (
    <div className="App">
      <Layout>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/user/*' element={<User />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default Streamify;
