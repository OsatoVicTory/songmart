import { createContext, useState } from 'react';

const AppContext = createContext({
    contract: {},
    setContract: () => {},
    message: {},
    setMessage: () => {},
    usersList: [],
    setUsersList: () => {},
    modalActive: false,
    setModalActive: () => {},
    user: {},
    setUser: () => {},
    curUserSongs: [],
    setCurUserSongs: () => {},
    wallet: '',
    setWallet: () => {},
    walletHistory: [],
    setWalletHistory: () => {}
});

const AppProvider = ({ children }) => {
    const [contract, setContract] = useState({});
    const [message, setMessage] = useState({});
    const [usersList, setUsersList] = useState([]);
    const [modalActive, setModalActive] = useState(false);
    const [user, setUser] = useState({});
    const [wallet, setWallet] = useState('');
    const [walletHistory, setWalletHistory] = useState([]);
    const [curUserSongs, setCurUserSongs] = useState([]);

    return (
        <AppContext.Provider value={{ 
            contract, setContract, message, setMessage, 
            usersList, setUsersList, modalActive, setModalActive, curUserSongs, setCurUserSongs,
            user, setUser, wallet, setWallet, walletHistory, setWalletHistory
        }}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };