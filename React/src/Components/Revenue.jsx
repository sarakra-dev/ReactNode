import { useState, useEffect } from 'react';
import '../Css/Revenue.css';
import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { useSelector } from "react-redux";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const API_URL = import.meta.env.VITE_API_URL;

// מערך סוגי הכנסות
const revenueTypes = [
    { id: 1, name: 'משכורת' },
    { id: 2, name: 'החזר מס' },
    { id: 3, name: 'החזר הלוואה' },
    { id: 4, name: 'קצבת נכות' },
    { id: 5, name: 'השכרת דירה' },
    { id: 6, name: 'רווחי השקעות' },
    { id: 7, name: 'מתנות' },
    { id: 8, name: 'הכנסה מעסק' },
    { id: 9, name: 'קצבת ילדים' },
    { id: 10, name: 'פנסיה' },
    { id: 11, name: 'שירותים מקצועיים' },
    { id: 12, name: 'מכירת מוצרים' },
    { id: 13, name: 'תמלוגים' },
    { id: 14, name: 'פרסום' },
    { id: 15, name: 'הוראה פרטית' },
    { id: 16, name: 'שירותי ייעוץ' },
    { id: 17, name: 'השקעות נדל"ן' },
    { id: 18, name: 'תוכניות חיסכון' },
    { id: 19, name: 'אחר' }
];

const Revenue = () => {
    const userId = useSelector((state) => state.user.user._id);
    const [revenues, setRevenues] = useState([]); // כל ההכנסות ממונגו
    const [revenueData, setRevenueData] = useState([]); // נתונים לגרף
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [currentRevenue, setCurrentRevenue] = useState({ id: null, name: "" });
    const [newAmounts, setNewAmounts] = useState({}); // סכומים חדשים לכל סוג
    const [refresh, setRefresh] = useState(false);
    const [otherNote, setOtherNote] = useState("");
    const [showOtherDialog, setShowOtherDialog] = useState(false);
    const [otherItem, setOtherItem] = useState(null);

    // שליפת כל ההכנסות מהשרת
    const getAllRevenue = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/Revenue/getAllRevenueById/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setRevenues(response.data);
        } catch (error) {
            console.error('Error pulling revenues:', error);
        }
    };

    // הוספת הכנסה חדשה
    const addRevenue = async (item) => {
        try {
            const token = localStorage.getItem('token');
            const price = parseFloat(newAmounts[item.id]) || 0;
            if (!price) return;
            await axios.post(`${API_URL}/Revenue/addRevenue/${userId}`, {
                userId,
                price,
                revenueId: item.id,
                category: item.name,
                notes: otherItem ? otherNote : ""
            }, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            setNewAmounts((prev) => ({ ...prev, [item.id]: "" }));
            setRefresh(r => !r);
            MessagePopup(item);
        } catch (error) {
            console.error('Error adding revenue:', error);
        }
    };

    // מחיקת הכנסה לפי מזהה ההכנסה
    const deleteRevenue = async (revenueId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/Revenue/deleteRevenue/${userId}/${revenueId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
            setRefresh(r => !r); // רענון הנתונים אחרי מחיקה
        } catch (error) {
            console.error("Error deleting revenue:", error);
        }
    };

    // עדכון סכום חדש בשדה
    const handleInputChange = (id, value) => {
        setNewAmounts((prev) => ({ ...prev, [id]: value }));
    };
    const event = (event, item) => {
        if (event.type === 'keypress' && event.key === 'Enter') {
            setOtherItem(item);
            setShowOtherDialog(true);
        }
    }
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const MessagePopup = (item) => {
        setOpenSnackbar(true);
        setCurrentRevenue(item);
        setTimeout(() => {
            setOpenSnackbar(false);
            setDrawerOpen(true);
        }, 2000);
    }
    // עיבוד נתונים לגרף: סכום כולל לכל סוג
    useEffect(() => {
        const grouped = {};
        revenues.forEach((item) => {
            grouped[item.revenueId] = (grouped[item.revenueId] || 0) + item.price;
        });
        const data = revenueTypes.map(type => ({
            name: type.name,
            Total: grouped[type.id] || 0
        }));
        setRevenueData(data);
    }, [revenues]);

    // שליפת נתונים מהשרת
    useEffect(() => {
        getAllRevenue();
    }, [userId, refresh]);

    // הצגת רשימת הכנסות לפי סוג
    const getRelatedRevenues = () => {
        if (!currentRevenue.id) return [];
        return revenues.filter(item => item.revenueId === currentRevenue.id);
    };
    const chengeColor = (item) => {
        let count = revenues.filter((revenue) => revenue.revenueId === item.id).length;
        if (count > 0) {
            return "red"
        }
        else {
            return "gray"
        }
    }
    // הצגת כרטיסי הכנסה
    let counter = 0;
    const renderRevenueItems = (backgroundColor, itemsToShow) => {
        const items = revenueTypes.slice(counter, counter + itemsToShow);
        counter += itemsToShow;
        return items.map((item) => (
            <div className="revenue-simple" key={item.id}>
                <div id="name" style={{ backgroundColor }}>
                    <h3>{item.name}</h3>
                </div>
                <div id="price">
                    <input
                        id="inputTotal"
                        placeholder="הכנס סכום חדש"
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        value={newAmounts[item.id] || ""}
                        onKeyPress={(!newAmounts[item.id] || isNaN(parseFloat(newAmounts[item.id])) || parseFloat(newAmounts[item.id]) === 0) ? null : e => event(e, item)}
                    />
                    <div
                        id="addIcon"
                        className='add-income-plus'
                        style={{ cursor: 'pointer' }}
                        onKeyPress={e => event(e, item)}
                        onClick={() => {
                            if (!newAmounts[item.id] || isNaN(parseFloat(newAmounts[item.id])) || parseFloat(newAmounts[item.id]) === 0) {
                                setOpenSnackbar(true);
                                setSnackbarMsg("יש להכניס סכום לפני הוספה!");
                                return;
                            }
                            setOtherItem(item);
                            setShowOtherDialog(true);
                        }}
                    >
                        <AddIcon />
                    </div>
                </div>
                <div id="threePoints" onClick={() => { setDrawerOpen(true); setCurrentRevenue(item); }}>
                    <h6 style={{ color: chengeColor(item) }}>* לפירוט</h6>
                    <ArrowDropDownCircleIcon style={{ color: chengeColor(item), width: "15px" }} />
                </div>
            </div>
        ));
    };

    return (
        <div className="main-revenue">
            <div className="odd">{renderRevenueItems("#d81b60", 2)}</div>
            <div className="even">{renderRevenueItems("#82b1ff", 3)}</div>
            <div className="odd" style={{ height: "100vh" }}>{renderRevenueItems("#ffee58", 4)}</div>
            <div className="even">{renderRevenueItems("#a5d6a7", 3)}</div>
            <div className="odd">{renderRevenueItems("#ab47bc", 2)}</div>
            <div className="even">{renderRevenueItems("#ef9a9a", 3)}</div>
            <div className="odd">{renderRevenueItems("#bbdefb", 2)}</div>
            <br />
            <br />
            <br />
            <div className="main-pie">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ef" />
                        <XAxis dataKey="name" tick={{ fontSize: 14, fontFamily: 'Varela Round' }} />
                        <YAxis tick={{ fontSize: 13, fontFamily: 'Varela Round' }} />
                        <Tooltip
                            contentStyle={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px #0002", fontFamily: 'Varela Round' }}
                            labelStyle={{ color: "#1976d2", fontWeight: "bold" }}
                        />
                        <Legend />
                        <Bar
                            dataKey="Total"
                            fill="#1976d2"
                            name="סה״כ הכנסה"
                            stroke="#1976d2"
                            strokeWidth={0.5}
                            barSize={28}
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <SwipeableDrawer
                anchor="bottom"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <Box sx={{ padding: 7 }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 700, color: '#1976d2', mb: 2 }}>
                        רשימת הכנסות עבור - {currentRevenue.name}
                    </Typography>
                    <ul className="revenue-list">
                        {getRelatedRevenues().map(item => (
                            <li className="revenue-list-item" key={item._id || item.id}>
                                <span className="revenue-date">{new Date(item.date).toLocaleDateString('he-IL')}</span>
                                <span className="revenue-amount">{item.price} <b>ש"ח</b></span>
                                <span className="revenue-nptes">{item.notes || "לא ידוע"}</span>
                                <span className="revenue-space"></span>
                                <IconButton className="revenue-delete-btn" onClick={() => deleteRevenue(item._id || item.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </li>
                        ))}
                    </ul>
                </Box>
            </SwipeableDrawer>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={2000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <MuiAlert elevation={6} variant="filled" onClose={() => setOpenSnackbar(false)} severity={snackbarMsg ? "warning" : 'success'}>
                    {snackbarMsg || "הסכום הוכנס בהצלחה!"}
                </MuiAlert>
            </Snackbar>
            <Dialog open={showOtherDialog} onClose={() => { setShowOtherDialog(false); setOtherNote(""); }}>
                <DialogTitle>הוסף הערה</DialogTitle>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        if (otherNote.trim()) {
                            addRevenue({ ...otherItem, note: otherNote });
                            setShowOtherDialog(false);
                            setOtherNote("");
                        }
                    }}
                >
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="הערה"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={otherNote}
                            inputProps={{ maxLength: 30 }}
                            onChange={e => setOtherNote(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setShowOtherDialog(false);
                                setOtherNote("");
                            }}
                            color="primary"
                        >
                            ביטול
                        </Button>
                        <Button
                            type="submit"
                            disabled={!otherNote.trim()}
                        >
                            שמור
                        </Button>
                        <Button
                            onClick={() => {
                                addRevenue({ ...otherItem, note: "" });
                                setShowOtherDialog(false);
                                setOtherNote("");
                            }}
                            color="secondary"
                        >
                            דלג
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default Revenue;
