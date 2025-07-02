import React, { useEffect, useState } from 'react';
import '../Css/Balance.css'; // קובץ CSS לעיצוב
import { useSelector } from 'react-redux';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Balance = () => {
    const [revenue, setRevenues] = useState([]); // העברת useState לתוך הקומפוננטה
    const [expenses, setExpenses] = useState([]);
    const [allData, setAllData] = useState([]);
    const sum = useSelector((state) => state.user.user.sumMoney);
    const [balance, setBalance] = useState(0);
    const id = useSelector((state) => state.user.user._id);
    const API_URL = import.meta.env.VITE_API_URL;
    //מערך הכנסות
    const revenueArr = [
        { id: 1, name: 'משכורת', Total: 0 },
        { id: 2, name: 'החזר מס', Total: 0 },
        { id: 3, name: 'החזר הלוואה', Total: 0 },
        { id: 4, name: 'קצבת נכות', Total: 0 },
        { id: 5, name: 'השכרת דירה', Total: 0 },
        { id: 6, name: 'רווחי השקעות', Total: 0 },
        { id: 7, name: 'מתנות', Total: 0 },
        { id: 8, name: 'הכנסה מעסק', Total: 0 },
        { id: 9, name: 'קצבת ילדים', Total: 0 },
        { id: 10, name: 'פנסיה', Total: 0 },
        { id: 11, name: 'שירותים מקצועיים', Total: 0 },
        { id: 12, name: 'מכירת מוצרים', Total: 0 },
        { id: 13, name: 'תמלוגים', Total: 0 },
        { id: 14, name: 'פרסום', Total: 0 },
        { id: 15, name: 'הוראה פרטית', Total: 0 },
        { id: 16, name: 'שירותי ייעוץ', Total: 0 },
        { id: 17, name: 'השקעות נדל"ן', Total: 0 },
        { id: 18, name: 'תוכניות חיסכון', Total: 0 },
        { id: 19, name: 'אחר', Total: 0 }
    ];


    const downloadPDF = async () => {
        const input = document.getElementById('balance-table'); // תן ID לטבלה שלך
        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgWidth = 190; // רוחב התמונה
        const pageHeight = pdf.internal.pageSize.height;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        pdf.save('monthly_report.pdf'); // שם הקובץ
    };

    // שליפת כל ההכנסות
    const getAllRevenue = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/Revenue/getAllRevenueById/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setRevenues(response.data);
        } catch (error) {
            console.error('Error pulling revenue:', error);
        }
    };

    // שליפת כל ההוצאות
    const getAllExpenses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://reactnode-server.onrender.com/Expenses/pullExpenses/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setExpenses(response.data.expenses);
        } catch (error) {
            console.error('Error pulling expenses:', error);
        }
    };

    // שילוב הכנסות והוצאות
    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                await getAllRevenue();
                await getAllExpenses();
            };
            fetchData();
        }
    }, [id]);
    //type: 1 הכנסות, type: 2 הוצאות
    useEffect(() => {
        if (revenue.length > 0 || expenses.length > 0) {
            debugger
            const combinedData = revenue.map((item) => ({
                ...item,
                price: item.price || 0, // ברירת מחדל ל-0 אם אין שדה amount
                category: item.category || "לא ידוע",
                notes: item.notes || "אין הערות",
                type: 1
            }));
            debugger
            combinedData.push(
                ...expenses.map((item) => ({
                    ...item,
                    price: item.price || 0, // ברירת מחדל ל-0 אם אין שדה amount
                    notes: item.notes || "לא ידוע",
                    type: 2,
                    category: item.category.name || "לא ידוע"
                }))
            );
            debugger
            combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAllData(combinedData);
        }
    }, [revenue, expenses]);

    // אנימציה להעלאת היתרה בהדרגה
    useEffect(() => {
        if (sum > 0) {
            const interval = setInterval(() => {
                setBalance((prevBalance) => {
                    return prevBalance + 10 <= sum ? prevBalance + 10 : sum;
                });
            }, 10);
            return () => clearInterval(interval);
        } else {
            const interval = setInterval(() => {
                setBalance((prevBalance) => {
                    return prevBalance - 10 >= sum ? prevBalance - 10 : sum;
                });
            }, 10);
            return () => clearInterval(interval);
        }
    }, [sum]);
    const lineInTable = () => {
        return allData.map((item, index) => (
            <tr key={index}>
                <td>{new Date(item.date).toLocaleDateString('he-IL')}</td>
                <td style={{ color: 'red' }}>
                    {item.type === 2
                        ? Math.abs(item.price).toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })
                        : ''}
                </td>
                <td style={{ color: 'green' }}>
                    {item.type === 1
                        ? item.price.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })
                        : ''}
                </td>
                <td>{item.category}</td>
                <td>{item.notes || 'אין הערות'}</td>
            </tr>
        ));
    };
    return (
        <>
            <div className="balance-container">
                <h1 className="balance-title">יתרה נוכחית</h1>
                <div className="balance-amount" style={sum < 0 ? { color: 'red' } : { color: 'green' }}>
                    {balance.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
                </div>
            </div>
            <div className="balance-sheet">
                <h2 className="balance-sheet-title">
                    <ArrowDownwardIcon />
                    &nbsp; דוח יתרות &nbsp;
                    <ArrowDownwardIcon />
                </h2>
                <table id="balance-table" className="balance-table">
                    <thead>
                        <tr>
                            <th>תאריך</th>
                            <th>חובה</th>
                            <th>זכות</th>
                            <th>קטגוריה</th>
                            <th>הערות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lineInTable()}
                    </tbody>
                </table>
            </div>
            <div id="space-beetwin"></div>
            {/* כפתור הורדת סיכום חודשי */}
            <div className="download-summary-section">
                <button className="download-summary-btn" onClick={downloadPDF}>
                    הורד סיכום חודשי (PDF)
                </button>
            </div>
        </>
    );
};

export default Balance;