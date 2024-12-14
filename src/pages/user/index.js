import { Route, Routes } from "react-router-dom";
import CurUser from "./curUser";
import OtherUser from "./otherUser";

const User = () => {

    return (
        <Routes>
            <Route path="/" element={<CurUser />} />
            <Route path="/:user_id" element={<OtherUser />} />
        </Routes>
    );
};

export default User;