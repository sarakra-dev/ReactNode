import * as React from 'react';
import axios from 'axios';

import { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearUser } from '../Store/UserSlice';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const settings = [
    { label: 'הגדר זמן קבלת דוח למייל', icon: <AccessTimeIcon sx={{ color: "#222", ml: 1 }} /> },
    { label: 'צור קשר', icon: <ContactMailIcon sx={{ color: "#222", ml: 1 }} /> },
    { label: 'התנתקות', icon: <LogoutIcon sx={{ color: "#222", ml: 1 }} /> },
];

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [value, setValue] = useState(-1)

    const user = useSelector((state) => state.user.user);
    const isRegistered = !!user.name; // או כל לוגיקה אחרת לזיהוי משתמש רשום

    const [openTimeDialog, setOpenTimeDialog] = useState(false);
    const [reportTime, setReportTime] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const location = useLocation();
    const pathname = location.pathname;

    useEffect(() => {
        if (pathname === '/Home' || pathname === '/') {
            setValue(-1);
        }
        else if (pathname === '/Expenses') {
            setValue(0);
        }
        else if (pathname === '/Revenue') {
            setValue(1);
        }
        else if (pathname === '/Balance') {
            setValue(2);
        }
    }, [pathname]);

    const userId = useSelector((state) => state.user.user._id);


    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const SettingsMenu = () => {
        const [anchorEl, setAnchorEl] = React.useState(null);

        const handleOpenMenu = (event) => {
            setAnchorEl(event.currentTarget);
        };
        const handleCloseMenu = () => {
            setAnchorEl(null);
        };

        return (
            <>
                <Tooltip title={isRegistered ? "הגדרות" : "יש להירשם כדי לגשת להגדרות"}>
                    <span>
                        <IconButton
                            id="SettingBtn"
                            onClick={isRegistered ? handleOpenMenu : undefined}
                            style={{ background: "none", border: "none" }}
                            disabled={!isRegistered}
                        >
                            <SettingsSuggestIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Menu
                    className="settings-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && isRegistered}
                    onClose={handleCloseMenu}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    {settings.map((setting) => (
                        <MenuItem
                            key={setting.label}
                            onClick={() => isRegistered && doAccordingTo(setting.label)}
                            disabled={!isRegistered}
                            className="settings-menu-item"
                        >
                            <span className="settings-menu-icon">{setting.icon}</span>
                            <span className="settings-menu-label">{setting.label}</span>
                        </MenuItem>
                    ))}
                </Menu>
            </>
        );
    };
    const Logging_out = () => {
        localStorage.removeItem('token');
        dispatch(clearUser());
        navigate('/'); // מעבר ל-Home
    }
    const doAccordingTo = (setting) => {
        switch (setting) {
            case 'הגדר זמן קבלת דוח למייל':
                setOpenTimeDialog(true);
                break;
            case 'צור קשר': {
                const mailto = `https://mail.google.com/mail/?view=cm&fs=1&to=financialman123456789@gmail.com&su=פנייה מהמערכת`;
                window.open(mailto, '_blank');
                break;
            }
            case 'התנתקות':
                Logging_out();
                break;
            default:
                break;
        }
    }


    const API_URL = import.meta.env.VITE_API_URL;

    const handleTimeDialogOk = async () => {
        if (reportTime) {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.post(`${API_URL}/User/addReportTime/${user._id}`, {
                    email: user.email,
                    name: user.name,
                    reportTime: reportTime
                }, {
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                });

                setSnackbarMsg('השעה נשמרה בהצלחה!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            } catch (error) {
                setSnackbarMsg('הייתה שגיאה בעדכון זמן הדוח.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        }
        setOpenTimeDialog(false);
        setReportTime('');
    };


    const handleTimeDialogClose = () => {
        setOpenTimeDialog(false);
        setReportTime('');
    };

    return (
        <>
            <header>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <SettingsMenu />
                    <p style={{
                        fontSize: "22px",
                        color: "#0ca57a",
                        margin: 0,
                        padding: 0,
                        fontWeight: 500,
                        letterSpacing: "1px"
                    }}>
                        {isRegistered ? `היי ${user.name}` : "ברוך הבא לאפליקציה לניהול כספים!"}
                    </p>

                </div>
                <Box className="data-in-header" style={{ opacity: isRegistered ? 1 : 0 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                            <Tab component={Link} to="/Expenses" label="הוצאות" {...a11yProps(0)} />
                            <Tab component={Link} to='/Revenue' label="הכנסות" {...a11yProps(1)} />
                            <Tab component={Link} to='/Balance' label="יתרה" {...a11yProps(2)} />
                        </Tabs>
                    </Box>
                </Box>
                <Link to={isRegistered ? '/Home' : '/login'} style={{ textDecoration: "none", color: "inherit" }}>
                    <img src={"img/miniLogo.png"} id="logo" alt="logo" />
                </Link>
            </header>
            <div className="under-header"></div>

            {/* <Suspense fallback={<div>Loading...</div>}>

            </Suspense> */}
            <Dialog open={openTimeDialog} onClose={handleTimeDialogClose}>
                <DialogTitle>בחר שעה לקבלת דוח למייל</DialogTitle>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleTimeDialogOk();
                    }}
                >
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="שעה (לדוג' 08:00)"
                            type="time"
                            fullWidth
                            value={reportTime}
                            onChange={(e) => setReportTime(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 300,
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleTimeDialogClose}>ביטול</Button>
                        <Button type="submit" variant="contained" color="primary">אישור</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <MuiAlert
                    elevation={6}
                    variant="filled"
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMsg}
                </MuiAlert>
            </Snackbar>
        </>
    )
}
export default Header