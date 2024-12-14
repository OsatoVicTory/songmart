import { useState } from "react";
import { sendFile } from "./util";

const Test = () => {

    const [mFile, setMfile] = useState({});

    const upload = async () => {
        try {
            const formData = new FormData();
            formData.append('file', mFile);
            formData.append('filename', mFile.name);
            formData.append('file_type', 'audio');
            formData.append('resource_type', 'video');

            console.log('loading...');
            const res = await sendFile(formData);
            console.log(res);
        } catch(err) {
            console.log(err);
        }
    };

    return (
        <div>
            <input type="file" accept="audio/*" onChange={(e) => setMfile(e.target.files[0])} style={{display: 'block'}}/>
            <button onClick={() => upload()}>Upload</button>
        </div>
    )
};

export default Test;