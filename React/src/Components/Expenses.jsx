import '../Css/Expenses.css';
import { useEffect, useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SimplePieChart from './SimplePieChart';
import SimpleBarChart from './SimpleBarChart'; // צור קובץ זה או השתמש בקומפוננטה קיימת
import SimpleLineChart from './SimpleLineChart'; // צור קובץ זה או השתמש בקומפוננטה קיימת
import * as React from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

//Icons 
import FlatwareIcon from '@mui/icons-material/Flatware';
import MinorCrashIcon from '@mui/icons-material/MinorCrash';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import WaterIcon from '@mui/icons-material/Water';
import AddHomeIcon from '@mui/icons-material/AddHome';
import WeekendIcon from '@mui/icons-material/Weekend';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import DirectionsBusFilledIcon from '@mui/icons-material/DirectionsBusFilled';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import DoneAllIcon from '@mui/icons-material/DoneAll';

///
import { useDispatch } from 'react-redux';
import { fetchCategories } from '../Store/ListCategoriesSlice';
import { useSelector } from 'react-redux';

const iconMap = {
    FlatwareIcon: FlatwareIcon,
    MinorCrashIcon: MinorCrashIcon,
    AutoStoriesIcon: AutoStoriesIcon,
    CheckroomIcon: CheckroomIcon,
    WaterIcon: WaterIcon,
    AddHomeIcon: AddHomeIcon,
    WeekendIcon: WeekendIcon,
    LocalPhoneIcon: LocalPhoneIcon,
    MedicalInformationIcon: MedicalInformationIcon,
    EditNoteIcon: EditNoteIcon,
    ElectricBoltIcon: ElectricBoltIcon,
    AirplanemodeActiveIcon: AirplanemodeActiveIcon,
    DirectionsBusFilledIcon: DirectionsBusFilledIcon,
    TableRestaurantIcon: TableRestaurantIcon,
    DoneAllIcon: DoneAllIcon
};

const API_URL = import.meta.env.VITE_API_URL;

const Expenses = () => {
    const dispatch = useDispatch();
    const [pieCategory, setPieCategory] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [state, setState] = useState({ right: false });
    const [text, setText] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentExpense, setCurrentExpense] = useState(null);
    const [chartType, setChartType] = useState('pie');
    const [openNoExpenses, setOpenNoExpenses] = useState(false);

    const id = useSelector((state) => state.user?.user?._id);
    const categories = useSelector((state) => state.categories.list);
    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        debugger
        const fetchData = async () => {
            await dispatch(fetchCategories());
            await getAllExpenses();
        };
        fetchData();
    }, [dispatch]);

    const getAllExpenses = async () => {
        console.log("id", id)
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/Expenses/pullExpenses/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            setExpenses(response.data.expenses);
            updatePieCategory(response.data.expenses);
            if (response.data.expenses.length === 0) {
                setOpenNoExpenses(true);
            } else {
                setOpenNoExpenses(false);
            }
        } catch (error) {
            console.error('Error making request:', error);
        }
    };

    const updatePieCategory = (expenses) => {
        const newPieCategories = [];
        expenses.forEach(expense => {
            const existingCategory = newPieCategories.find(item => item.name === expense.category.name);
            if (existingCategory) {
                existingCategory.price += parseFloat(expense.price);
            } else {
                newPieCategories.push({ name: expense.category.name, price: parseFloat(expense.price), color: expense.category.color });
            }
        });
        setPieCategory(newPieCategories);
    };

    const toggleDrawer = (open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setState({ ...state, right: open });
        setCategory(null)
    };
    //חלונית הוספת הוצאה
    const list = () => (
        <>
            <Box
                sx={{ width: '380px', height: '100vh', overflow: 'hidden', outline: 'none', mt: 0 }} // הוספת mt: 0 כדי להדק את החלונית למעלה
                role="presentation"
                onKeyDown={handleKeyDown}
            >


                <div className="add-expense" style={{ margin: 5, padding: 20 }}>

                    <b><p>בחר קטגוריה:</p></b>
                    <div className="categorys" style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {
                            categories.map(category => (
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    key={category.id}
                                    className='c'
                                    onClick={() => handleCategorySelect(category)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Avatar sx={{ bgcolor: category.color, width: 50, height: 50 }}>
                                        {getIconByCategory(category)}
                                    </Avatar>
                                </Stack>
                            ))}
                    </div>
                    <b><p style={{ color: 'red' }}>&nbsp;&nbsp; {category ? category.name : ""}</p></b>
                    <p>הערות:</p>
                    <textarea
                        rows="3"
                        cols="35"
                        name="textarea1"
                        style={{ padding: '5%' }}
                        value={text}
                        onChange={handleTextChange}
                    >
                    </textarea>
                    <br></br>
                    <b><p> הכנס מחיר:</p></b>
                    <Box
                        component="form"
                        sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
                        noValidate
                        autoComplete="off"
                    >
                        <TextField
                            type="number"
                            variant="standard"
                            onChange={handleChangePrice}
                            value={price}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                        />
                    </Box>
                    <br></br>
                    <a style={{ cursor: 'pointer', color: 'red', display: 'block', textAlign: 'left' }} onClick={handleAddExpense} >
                        <b><p>הוסף הוצאה</p></b>
                    </a>
                    <div style={{ height: '15vh', width: '100%' }}></div>
                </div>
            </Box>
        </>
    );
    //שאיבת נתונים מהמסך
    const handleTextChange = (event) => {
        setText(event.target.value);
    }
    const handleChangePrice = (event) => {
        const value = event.target.value;
        // אם המשתמש מתחיל להקליד, ננקה את הערך ברירת המחדל
        if (value === '0') {
            setPrice('');
        } else {
            setPrice(value);
        }
    };

    const handleCategorySelect = (category) => {

        setCategory(category);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAddExpense()
            toggleDrawer(false)();
        }
    };
    const saveExpense = async () => {
        try {
            const dateNow = new Date(Date.now());
            const userId = user._id;
            const name = user.name;
            const email = user.email;

            const response = await axios.post(`${API_URL}/Expenses/addExpenses/${userId}`, {
                email,
                name,
                userId,
                date: dateNow,
                price,
                category,
                notes: text
            }, {
                headers: { 'Content-Type': 'application/json' },
            });
            const res = response.data;
            console.log(res);
        } catch {
            alert("ההוצאה לא נשמרה עקב תקלה");
        }
    }

    const deleteExpense = async (expenseId) => {
        try {
            debugger
            await axios.delete(`https://reactnode-server.onrender.com/Expenses/deleteExpense/${id}/${expenseId}`, {
                headers: { 'Content-Type': 'application/json' },
            });


            // עדכן את רשימת ההוצאות לאחר המחיקה
            setExpenses(prevExpenses => prevExpenses.filter(expense => expense._id !== expenseId));
            updatePieCategory(expenses); // עדכן את קטגוריות הפאי לאחר המחיקה
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert("ההוצאה לא נמחקה עקב תקלה");
        }
    };
    const handleAddExpense = () => {
        if (price && category) {
            setExpenses((prevExpenses) => {
                if (prevExpenses) {
                    return [
                        ...prevExpenses,
                        { name: category.name, price: price, category: category, data: text }
                    ];
                }
                return [{ name: category.name, price: price, category: category, data: text }];
            });
            setPieCategory((prevPieCategories) => {
                const existingCategory = prevPieCategories.find(item => item.name === category.name);
                if (existingCategory) {
                    return prevPieCategories.map(item =>
                        item.name === category.name ? { ...item, price: item.price + parseFloat(price) } : item
                    );
                } else {
                    return [...prevPieCategories, { name: category.name, price: parseFloat(price), color: category.color }];
                }
            });
            setPrice(0);
            setText('');
            setCategory(null);
            toggleDrawer(false)();
        }
        else {
            if (!price && !category) {
                alert("אנא הכנס מחיר וקטגוריה")
                return;
            }
            if (!price) {
                alert("אנא הכנס מחיר")
                return;
            }
            if (!category) {
                alert("אנא בחר קטגוריה")
                return;
            }
        }
        saveExpense()
    };
    //עד כאן
    //פונקציות נוסxxx לחלונית זו-
    const getIconByCategory = (category) => {
        if (!category || !category.Icon) {
            return null;
        }
        const IconComponent = iconMap[category.Icon];
        return IconComponent ? <IconComponent /> : null;
    };
    const getSumPrice = () => {
        let sum = 0;
        if (expenses) {
            expenses.forEach(expense => {
                sum += parseFloat(expense.price);
            });
            return sum.toFixed(2);
        }// מחזיר את הסכום עם 2 ספרות אחרי הנקודה
        else { return 0 }
    }

    const handlePopoverOpen = (event, expense) => {
        if (expense.data) {
            setCurrentExpense(expense);
            setAnchorEl(event.currentTarget);
        }
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
        setCurrentExpense(null); // לנקות את ההוצאה הנוכחית
    };

    const open = Boolean(anchorEl);

    // הוסף את ה-useEffect הבא אחרי כל ה-useState שלך ולפני ה-return
    useEffect(() => {
        if (openNoExpenses) {
            const timer = setTimeout(() => setOpenNoExpenses(false), 2000); // 3 שניות
            return () => clearTimeout(timer);
        }
    }, [openNoExpenses]);

    //
    return (
        <>
            <div className="main-expenses">
                <div className="expenses-data">
                    <p>&nbsp;&nbsp;&nbsp;{new Date().toLocaleDateString()}</p>
                    <div className="button-add-expenses" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'warp' }}>
                            <Box sx={{ '& > :not(style)': { m: 1 } }}>
                                <Fab color="red" aria-label="add" sx={{ width: 40, height: 40 }}>
                                    <div>
                                        <React.Fragment key="right">
                                            <span onClick={toggleDrawer(true)} style={{ minWidth: 'unset', padding: 0 }}>
                                                <AddIcon style={{ border: 'none', outline: 'none' }} />
                                            </span>
                                            <Drawer
                                                anchor="right"
                                                open={state.right}
                                                onClose={toggleDrawer(false)}
                                            >
                                                {list()}
                                            </Drawer>
                                        </React.Fragment>
                                    </div>
                                </Fab>
                            </Box>
                            <p>&nbsp; הוסף הוצאה</p>
                        </div>
                        <b>
                            <p style={{ marginLeft: '50px', color: 'red', opacity: getSumPrice() > 0 ? 1 : 0 }}>
                                {getSumPrice()}
                            </p>
                        </b>
                    </div>
                    <div className="expenses-content">
                        <div className="list-expenses">
                            {(!expenses || expenses.length === 0) ? (
                                <div className="empty-expenses-bg">
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                                        alt="אין הוצאות"
                                        className="empty-expenses-img"
                                    />
                                    <div className="empty-expenses-title">
                                        אין הוצאות להצגה
                                    </div>
                                    <div className="empty-expenses-desc">
                                        הוסף הוצאה חדשה כדי להתחיל לעקוב אחרי התקציב שלך
                                    </div>
                                </div>
                            ) : (
                                [...expenses]
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    .map((expense, index, sortedExpenses) => {
                                        const expenseDateStr = new Date(expense.date).toLocaleDateString();
                                        const prevExpenseDateStr =
                                            index > 0
                                                ? new Date(sortedExpenses[index - 1].date).toLocaleDateString()
                                                : null;
                                        const showDate = index === 0 || expenseDateStr !== prevExpenseDateStr;

                                        return (
                                            <React.Fragment key={expense._id || index}>
                                                {showDate && (
                                                    <div
                                                        className="expense-date-row"
                                                        style={{
                                                            textAlign: "center",
                                                            color: "#0ca57a",
                                                            fontWeight: "bold",
                                                            margin: "10px 0",
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        {expenseDateStr}
                                                    </div>
                                                )}
                                                <div className="row-expense">
                                                    <div className="category-circle">
                                                        <Stack direction="row" spacing={2}>
                                                            <Avatar sx={{ bgcolor: expense.category.color, width: 34, height: 34 }}>
                                                                {getIconByCategory(expense.category)}
                                                            </Avatar>
                                                        </Stack>
                                                    </div>
                                                    <div>
                                                        <Typography
                                                            aria-owns={open ? 'mouse-over-popover' : undefined}
                                                            aria-haspopup="true"
                                                            onMouseEnter={(event) => handlePopoverOpen(event, expense)}
                                                            onMouseLeave={handlePopoverClose}
                                                        >
                                                            <div id="name-expense">&nbsp;&nbsp;&nbsp;{expense.category.name}</div>
                                                        </Typography>
                                                        <Popover
                                                            id="mouse-over-popover"
                                                            sx={{ pointerEvents: 'none' }}
                                                            open={open}
                                                            anchorEl={anchorEl}
                                                            anchorOrigin={{
                                                                vertical: 'bottom',
                                                                horizontal: 'left',
                                                            }}
                                                            transformOrigin={{
                                                                vertical: 'top',
                                                                horizontal: 'left',
                                                            }}
                                                            onClose={handlePopoverClose}
                                                            disableRestoreFocus
                                                        >
                                                            <Typography sx={{ p: 1 }}>{currentExpense ? currentExpense.data : ''}</Typography>
                                                        </Popover>
                                                    </div>
                                                    <div id="price-expense">{expense.price} ש'ח</div>
                                                    <Tooltip title="Delete">
                                                        <IconButton onClick={() => deleteExpense(expense._id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })
                            )}
                        </div>
                    </div>

                </div>
                <div className="pie">
                    <div id="chart-type-selector" style={{ opacity: getSumPrice() > 0 ? 1 : 0 }}>
                        <FormControl fullWidth>
                            <InputLabel id="chart-type-label">סוג גרף</InputLabel>
                            <Select
                                labelId="chart-type-label"
                                value={chartType}
                                label="סוג גרף"
                                onChange={e => setChartType(e.target.value)}
                            >
                                <MenuItem value="pie">גרף עוגה</MenuItem>
                                <MenuItem value="bar">גרף עמודות</MenuItem>
                                <MenuItem value="line">גרף קווי</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div className="chart-container">
                        {chartType === 'pie' && <SimplePieChart arr={pieCategory} sum={getSumPrice()} />}
                        {chartType === 'bar' && <SimpleBarChart arr={pieCategory} sum={getSumPrice()} />}
                        {chartType === 'line' && <SimpleLineChart arr={pieCategory} sum={getSumPrice()} />}
                    </div>
                </div>

                <div id="button" style={{ height: "20vh", width: '100vw' }}></div>
            </div >
            <Dialog
                open={openNoExpenses}
                onClose={() => setOpenNoExpenses(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 2,
                        minWidth: 350,
                        background: 'linear-gradient(135deg, #fff 80%, #ffe082 100%)',
                        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)'
                    }
                }}
            >
                <DialogTitle sx={{ color: '#d81b60', fontWeight: 'bold', fontSize: '2rem', textAlign: 'center' }}>
                    אין הוצאות
                </DialogTitle>
                <DialogContent sx={{ color: '#333', fontSize: '1.2rem', textAlign: 'center', pb: 3 }}>
                    עדיין לא הוספת הוצאות.<br />
                    לחץ על כפתור <b style={{ color: '#d81b60' }}>הפלוס</b> כדי להוסיף הוצאה חדשה!
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Expenses;
