import { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';

import '../Css/Home.css';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser, setUserConect } from '../Store/UserSlice';
import useAuthValidation from "../hooks/useAuthValidation";

const API_URL = import.meta.env.VITE_API_URL;

const Login = ({ onClose }) => {
    const [isRegistering, setIsRegistering] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { errors, validate } = useAuthValidation();

    const showMessage = async (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const isValid = validate({ name, email, password }, isRegistering);
        if (!isValid) return;
        isRegistering ? saveUser() : connectUser();
    };

    const connectUser = async () => {
        try {
            const response = await axios.post(`${API_URL}/User/IfUserExists`, {
                password,
                email,
            }, {
                headers: { 'Content-Type': 'application/json' },
            });
            const user = response.data;
            const token = response.data.token;
            localStorage.setItem('token', token);
            dispatch(setUserConect(user.user));
            await showMessage('התחברת בהצלחה!');
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            if (error.response?.data?.message) {
                showMessage(error.response.data.message, 'error');
            } else {
                showMessage('שגיאה בהתחברות', 'error');
            }
        }
    };

    const saveUser = async () => {
        try {
            const response = await axios.post(`${API_URL}/User/addUser`, {
                password,
                name,
                email,
                sumMoney: 0,
            }, {
                headers: { 'Content-Type': 'application/json' },
            });
            const user = response.data.user;
            const token = response.data.token;
            localStorage.setItem('token', token);
            dispatch(setUser({ _id: user.id, name: user.name, email: user.email, sumMoney: 0 }));
            await showMessage('נרשמת בהצלחה!');
            setTimeout(() => {
                onClose();
                navigate('/Home');
            }, 1000);
        } catch (error) {
            if (error.response?.data?.message) {
                showMessage(error.response.data.message, 'error');
            } else {
                showMessage('שגיאה בהרשמה', 'error');
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        }}>
            <div className="modal" dir="rtl">
                <p className="title" style={{ fontFamily: 'inherit', fontWeight: 700, color: '#22334d', fontSize: '2.1rem', marginBottom: 28 }}>
                    {isRegistering ? 'צור חשבון'
                        : 'התחברות לחשבון'}
                </p>
                <form className="form" onSubmit={handleSubmit}>
                    {isRegistering && (
                        <>
                            <input
                                type="text"
                                className="input"
                                placeholder="שם מלא"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </>
                    )}
                    <input
                        type="email"
                        className="input"
                        placeholder="אימייל"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="input"
                            placeholder="סיסמה"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <span
                            className="password-eye"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </span>
                    </div>
                    {errors.password && <div className="error-message">{errors.password}</div>}
                    <button className="form-btn" type="submit">
                        {isRegistering ? 'צור חשבון' : 'התחבר'}
                    </button>
                </form>
                <button
                    className="google-btn"
                    type="button"
                    onClick={() => window.location.href = `${API_URL}/auth/google`}
                >
                    <GoogleIcon style={{ color: "#ea4335", fontSize: "1.5rem" }} />
                    התחברות עם Google
                </button>
                <p className="sign-up-label">
                    {isRegistering ? 'כבר יש לך חשבון?' : "אין לך חשבון?"}
                    <span className="sign-up-link" onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? 'התחבר' : 'להרשמה'}
                    </span>
                </p>
            </div>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Login;