import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { getStartUp } from "../utils/tokenStorage";
import { setUser } from "../services/auth/authSlice";

const PrivateRoutes = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    //TODO: This use effect will be removed once we have a startup api to get user information on reload.
    useEffect(() => {
        console.log("const user = getStartUp();")
        const user = getStartUp();
        user !== undefined ? dispatch(setUser(user)) : navigate("/login");
    }, [navigate]);
    return (
        <Outlet />
    )
}

export default PrivateRoutes;