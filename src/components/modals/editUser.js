import { AiOutlineClose } from 'react-icons/ai';
import './create.css';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MdEdit } from 'react-icons/md';
import { AppContext } from '../../context';
import { createContractInstance, sendFile, setMessageFn } from '../../util';
import { MB } from '../../config';

const EditUser = ({ closeModal }) => {

    const modalRef = useRef();
    const [coverFile, setCoverFile] = useState({});
    const [loading, setLoading] = useState(false);
    const { contract, user, setUser, setMessage } = useContext(AppContext);
    const [userName, setUserName] = useState(user.userName);

    const handleSave = async () => {
        if(!userName || (!coverFile.name && !user.img)) {
            const missing = !userName ? 'userName' : 'cover pic';
            return setMessageFn(setMessage, { status: 'error', message: `Fill ${missing} field` });
        }

        setLoading(true);
        try {
            let img = user.img || '';
            if(coverFile.name) {
                const formData = new FormData();
                formData.append('file', coverFile);
                formData.append('filename', coverFile.name);
                formData.append('file_type', 'image');

                img = (await sendFile(formData)).data.data.secure_url;
            }

            const new_user_data = { ...user, userName, img };
            const acct_data = Object.keys(new_user_data).map(key => `${key}=${new_user_data[key]}`).join('%x3');

            const contractInstance = await createContractInstance(contract.signer);
            const tx = await contractInstance.createUser(contract.address, contract.address, acct_data, 0);
            await tx.wait();

            setUser(new_user_data);
            setMessageFn(setMessage, { status: 'success', message: 'Saved successfully.' });
            setLoading(false);
        } catch(err) {
            setLoading(false);
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Please try again.' });
        }
    }

    function clickFn(e) {
        if(!modalRef.current) return;
        if(modalRef.current && !modalRef.current.contains(e.target)) { 
            closeModal(); 
        }
    };

    useEffect(() => {

        document.addEventListener("click", clickFn, true);

        return () => document.removeEventListener("click", clickFn, true);

    }, []);

    function handleImageFileChange(e) {
        const file = e.target.files[0];
        if(!file?.size) return;

        if(file.size > (MB * 1024 * 1024)) {
            return setMessageFn(setMessage, { status: 'error', message: `File cannot be more than ${MB}MB` });
        }
        if(coverFile?.type?.startsWith('image/')) URL.revokeObjectURL(coverFile);
        setCoverFile(file);
    };

    const getImageURL = useMemo(() => {
        if(coverFile.type && coverFile.type.startsWith('image/')) return URL.createObjectURL(coverFile);
        else if(user.img) return user.img;
        else return null;
    }, [coverFile.name]);

    return (
        <div className='__Create__Modal__Overlay__'>
            <div className='create-modal-wrapper Edit-user' ref={modalRef}>
                <div className="create-song w-full">
                    <div className="cs-header w-full">
                        <h3>Edit your profile</h3>
                        <button className="csh-btn pointer" onClick={() => closeModal()}>
                            <AiOutlineClose className='cshb-icon' />
                        </button>
                    </div>
                    <div className='cs-main w-full'>
                        <div className='csm-form w-full'>
                            <div className='csmf-field w-full'>
                                <label>Profile name</label>
                                <input placeholder={userName} onChange={(e) => setUserName(e.target.value)} />
                            </div>
                            <div className='csmf-field w-full'>
                                <label>Add a cover for your profile</label>
                                <input type='file' id='cover-file' accept='image/*' onChange={handleImageFileChange} />
                                <div className='csmff-file'>
                                    {
                                        (coverFile.name || user.img) ?
                                        <div className='csmff-img'>
                                            <img src={getImageURL} alt='' />
                                            <label className='csmffi pointer' htmlFor='cover-file'>
                                                <MdEdit className='csmffi-icon' />
                                            </label>
                                        </div> :
                                        <label className='csmff-no-file pointer' htmlFor='cover-file'>Select an image</label>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='cs-footer w-full'>
                        <button className={`csf-btn ${!loading && 'pointer'}`} onClick={handleSave} disabled={loading}>
                            <span>{!loading ? 'Saving...' : 'Save'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

};

export default EditUser;