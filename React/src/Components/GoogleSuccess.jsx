import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../Store/UserSlice";
import { useNavigate, useLocation } from "react-router-dom";

const GoogleSuccess = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const name = params.get("name");
        const email = params.get("email");
        const token = params.get("token");
        const _id = params.get("_id"); // אם יש מזהה משתמש

        if (token) {
            localStorage.setItem('token', token);
        }

        // אם יש נתוני משתמש, עדכן את הסטור
        if (name && email) {
            dispatch(setUser({
                _id: _id || "", // אם יש לך מזהה מהשרת, תכניס כאן
                name,
                email,
                sumMoney: 0,
                categories: [],
                Incomes: []
            }));
            navigate("/Home");
        }
    }, [dispatch, location, navigate]);

    return <div>מתחבר עם גוגל...</div>;
};

export default GoogleSuccess;