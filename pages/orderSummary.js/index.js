'use client';

import { useEffect, useState } from 'react';
import { FaTrash, FaFilePdf, FaWhatsapp } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from './orderSummary.module.scss';
import { toast } from 'react-toastify';

export default function OrderSummary({ selectedProducts = [], setSelectedProducts, goBack }) {
    const [totalAmount, setTotalAmount] = useState(0);
    const [deliveryDateTime, setDeliveryDateTime] = useState();

    useEffect(() => {
        if (!Array.isArray(selectedProducts)) {
            setTotalAmount(0);
            return;
        }
        const total = selectedProducts.reduce((sum, product) => sum + (product.proTotalPrice || 0), 0);
        setTotalAmount(total);
    }, [selectedProducts]);

    const handleRemove = (id) => {
        const updatedProducts = selectedProducts.filter(product => product.id !== id);
        setSelectedProducts(updatedProducts);
    };
    console.log("selectedProducts", selectedProducts)
    const generateAndStorePDF = async () => {
        const doc = new jsPDF();
        const storedUser = JSON.parse(localStorage.getItem('userInfo')) || {};
        const userName = storedUser.name || 'Unknown User';
        const userContact = storedUser.mobile || 'Unknown Contact';
        const shopName = "Test Shop";
        const shopContact = "+91 1234567890";

        // doc.setFontSize(16);
        // doc.text("Order Summary", 80, 10);

        // doc.setFontSize(12);
        // doc.text(`Customer: ${userName}`, 14, 20);
        // doc.text(`Contact: ${userContact}`, 14, 30);
        // doc.text(`Shop: ${shopName}`, 120, 20);
        // doc.text(`Shop Contact: ${shopContact}`, 120, 30);

        // let totalAmount = 0;
        // let totalProducts = selectedProducts.length;

        // const tableData = selectedProducts.map((product, index) => {
        //     let quantityNumber = parseFloat(product.quantity) || 0;

        //     const totalPrice = quantityNumber * (product.price || 0);
        //     totalAmount += totalPrice;
        //     return [index + 1, product.title, product.quantity, `Rs ${product.price}`, `Rs ${totalPrice.toFixed(2)}`];
        // });

        // doc.autoTable({
        //     head: [['#', 'Product', 'Quantity', 'Unit Price', 'Total Price']],
        //     body: [
        //         ...tableData,
        //         [
        //             {
        //                 content: ' ',
        //                 styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff' }
        //             },
        //             {
        //                 content: ' ',
        //                 styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff' }
        //             },
        //             {
        //                 content: ' ',
        //                 styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff' }
        //             },
        //             {
        //                 content: 'Total Products',
        //                 styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff', textColor: '#1d2a35' }
        //             },
        //             {
        //                 content: totalProducts,
        //                 styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff', textColor: '#1d2a35' }
        //             }
        //         ],
        //         [
        //             {
        //                 content: ' ',
        //                 styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff' }
        //             },
        //             {
        //                 content: ' ',
        //                 styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff' }
        //             },
        //             {
        //                 content: ' ',
        //                 styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff' }
        //             },
        //             {
        //                 content: 'Total Amount',
        //                 styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff', textColor: '#1d2a35' }
        //             },
        //             {
        //                 content: 'Rs ' + totalAmount.toFixed(2),
        //                 styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff', textColor: '#1d2a35' }
        //             }
        //         ]
        //     ],
        //     startY: 40,
        // });

        // const fileName = `${new Date().toLocaleDateString().replace(/\//g, '-')}-Order-Summary.pdf`;
        // doc.save(fileName);

        //WhatsApp message with order details
        const productList = selectedProducts
            .map((p, i) => `${i + 1}. ${p.title} x ${p.quantity}`)
            .join('\n');

        const whatsappMessage = encodeURIComponent(
            `*Order Summary*` +
            `\nName: ${userName}` +
            `\nContact: ${userContact}` +
            `\n\n*Products:*\n${productList}` +
            `\n\n*Total Products:* ${selectedProducts.length}` +
            `\n*Total Amount:* Rs ${totalAmount.toFixed(2)}` +
            `\n\nShop: ${shopName}` +
            `\n\nShop Contact: ${shopContact}`
        );

        // Open WhatsApp with the message
        window.open(`https://wa.me/+918602148689?text=${whatsappMessage}`, "_blank");
    };

    const placeOrder = async () => {
        if (!deliveryDateTime?.date || deliveryDateTime.hour === undefined) {
            alert("Please select delivery date and time.");
            return;
        }

        const storedUser = localStorage.getItem('userInfo');
        const userData = JSON.parse(storedUser);

        const fullDateTime = new Date(`${deliveryDateTime.date}T${String(deliveryDateTime.hour).padStart(2, '0')}:00:00`);

        const payload = {
            name: userData.name,
            mobileNumber: userData.mobile,
            order: selectedProducts,
            createdAt: new Date(),
            deliveryDateTime: fullDateTime.toISOString()
        };
        console.log("payload", payload)
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            generateAndStorePDF()
            toast.success("Order placed successfully!", { position: "top-center", autoClose: 3000 });
            setSelectedProducts([])
            goBack()
        } else {
            toast.error("Failed to place order.", { position: "top-center", autoClose: 3000 });
        }
    };


    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={goBack} className={styles.backButton}>← Back</button>
                <h1>Order Summary</h1>
            </header>
            <div className={styles.deliveryWrapper}>
                {/* <label className={styles.deliveryLabel}>Delivery Date:</label> */}
                <select
                    className={styles.deliverySelect}
                    value={deliveryDateTime?.date || ''}
                    onChange={(e) =>
                        setDeliveryDateTime((prev) => ({ ...prev, date: e.target.value }))
                    }
                >
                    <option value="">Select Date</option>
                    {[...Array(11)].map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
                        const year = date.getFullYear();
                        const displayDate = `${day}-${month}-${year}`;
                        const valueDate = `${year}-${month}-${day}`; // for ISO format conversion later

                        return (
                            <option key={i} value={valueDate}>
                                {displayDate}
                            </option>
                        );
                    })}
                </select>

                {/* <label className={styles.deliveryLabel}>Delivery Hour:</label> */}
                <select
                    className={styles.deliverySelect}
                    value={deliveryDateTime?.hour || ''}
                    onChange={(e) =>
                        setDeliveryDateTime((prev) => ({ ...prev, hour: e.target.value }))
                    }
                >
                    <option value="">Select Hour</option>
                    {[...Array(16)].map((_, i) => {
                        const hour24 = i + 7; // 7 to 22
                        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
                        const period = hour24 < 12 ? 'AM' : 'PM';
                        return (
                            <option key={hour24} value={hour24}>
                                {hour12}:00 {period}
                            </option>
                        );
                    })}
                </select>
            </div>
            <div className={styles.orderList}>
                {selectedProducts.length > 0 ? (
                    selectedProducts.map((product) => (
                        <div key={product.id} className={styles.orderItem}>
                            <img src={product.productImage} alt={product.title} className={styles.productImage} />
                            <p className={styles.productTitle}>{product.title}</p>
                            <p className={styles.quantity}>Qty: {product.quantity}</p>
                            <p className={styles.price}>Rs {product.price}</p>
                            <p className={styles.totalPrice}>Rs {(product.proTotalPrice || 0).toFixed(2)}</p>
                            <button onClick={() => handleRemove(product.id)} className={styles.removeButton}>
                                <FaTrash />
                            </button>
                        </div>
                    ))
                ) : <p>No products selected.</p>}
            </div>

            <footer className={styles.footer}>
                <div className={styles.summary}>
                    <p><strong>Total Products:</strong> {selectedProducts.length}</p>
                    <p><strong>Total Amount:</strong> Rs {totalAmount.toFixed(2)}</p>
                </div>
                <button onClick={placeOrder} className={styles.whatsappButton}>
                    <FaWhatsapp /> Place Order
                </button>
            </footer>
        </div>
    );
}
