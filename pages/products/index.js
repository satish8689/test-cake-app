'use client';

import { useEffect, useState } from 'react';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import styles from './products.module.scss';
import OrderSummary from '../orderSummary.js';
import { toast } from 'react-toastify';

// import item from '../data/item.json';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [icProducts, setIcProducts] = useState([]);
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [userName, setUserName] = useState('');
    const [userMobile, setUserMobile] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) {
            setShowPopup(true);
        } else {
            const userData = JSON.parse(storedUser);
            setUserName(userData.name);
            setUserMobile(userData.mobile);
        }
        getProducts();
    }, []);

    // async function getIcProducts() {
    //     let result = await fetch('/api/ic_product');
    //     let res = await result.json();
    //     if (res && res.length > 0) {
    //         setIcProducts(res);
    //         return res;
    //     }
    // }

    async function getProducts() {
        // const resultIcProduct = await getIcProducts();
        let apiresult = await fetch('/api/products');
        let { data } = await apiresult.json()
        if (data.length > 0) {
            let productObj = data.map(iterator => {
                return {
                    // productTitle:iterator,
                    // productImage: iterator,
                    ...iterator
                };
            });
            setProducts(productObj);
        }
        setIsLoading(false); // Hide loader after fetching
    }

    const handleToggleWishlist = (productId) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
        toast.success("Wishlist updated!", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    useEffect(() => {
        if (selectedProduct) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [selectedProduct]);

    const handleAddToCart = (productId, quantity) => {
        let selectPro = products.find(p => p.id === productId);
        if (!selectPro) return;

        let numericQuantity = parseFloat(quantity);
        // let quantityInKg = quantity.includes("kg") ? numericQuantity : numericQuantity / 1000;
        let totalPrice = numericQuantity * selectPro.price;

        setSelectedProducts(prev => {
            let updatedProducts = prev.map(p =>
                p.title === selectPro.productTitle
                    ? { ...p, quantity, proTotalPrice: totalPrice }
                    : p
            );

            if (!quantity) {
                updatedProducts = updatedProducts.filter(p => p.title !== selectPro.productTitle);
            } else if (!prev.some(p => p.title === selectPro.productTitle)) {
                updatedProducts.push({
                    id: selectPro.id,
                    title: selectPro.productTitle,
                    productImage: selectPro.productImage,
                    price: selectPro.price,
                    type: selectPro.type,
                    quantity,
                    proTotalPrice: totalPrice
                });
            }

            return updatedProducts;
        });
        toast.success("Product added!", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    const handleOrder = () => {
        setShowOrderSummary(true);
    };

    const handleGoBack = () => {
        setShowOrderSummary(false);
    };

    if (showOrderSummary) {
        return <OrderSummary selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts} goBack={handleGoBack} />;
    }

    const filteredProducts = products.filter(product =>
        !search || (product.productTitle && product.productTitle.toLowerCase().includes(search.toLowerCase()))
    );

    const handlePopupSubmit = () => {
        if (!userName.trim() || !userMobile.trim()) {
            alert("Please enter valid Name and Mobile Number");
            return;
        }

        if (!/^\d{10}$/.test(userMobile)) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        localStorage.setItem('userInfo', JSON.stringify({ name: userName, mobile: userMobile }));
        setShowPopup(false);
    };

    return (
        <>
            <div className={styles.header}>
                <div className={styles.shopName}>My Shop</div><br />
                <div className={styles.searchBoxCont}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchBox}
                    />
                </div>
            </div>
            <div className={styles.container}>
                {showPopup && (
                    <div className={styles.popup}>
                        <div className={styles.popupContent}>
                            <h2>Enter Your Details</h2>
                            <input
                                type="text"
                                placeholder="Enter Name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className={styles.input}
                            />
                            <input
                                type="tel"
                                placeholder="Enter Mobile Number"
                                value={userMobile}
                                onChange={(e) => setUserMobile(e.target.value)}
                                className={styles.input}
                            />
                            <button onClick={handlePopupSubmit} className={styles.submitButton}>
                                Submit
                            </button>
                        </div>
                    </div>
                )}



                {isLoading ? (
                    <div className={styles.loadercontainer}><div className={styles.loader}></div></div>
                ) : (
                    <div className={styles.productList}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => {
                                return (
                                    <div key={product.id} className={styles.productCard} onClick={() => setSelectedProduct(product)}>
                                        <div className={styles.wishlistIcon} onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleWishlist(product.id);
                                        }}>
                                            {wishlist.includes(product.id) ? <img
                                                src={'icon/redheart.png'}
                                                alt={'Add to cart'}
                                                className={styles.wishlistIconImg}
                                            /> : <img
                                                src={'icon/blackheart.png'}
                                                alt={'Add to cart'}
                                                className={styles.wishlistIconImg}
                                            />}
                                        </div>
                                        <img
                                            src={product.productImage}
                                            alt={product.productTitle}
                                            className={styles.productImage}
                                        />
                                        <div className={styles.productDetails}>
                                            <div className={styles.actions}>
                                                <span className={styles.productTitle}>{product.productTitle}</span>

                                            </div>
                                            {/* <span className={styles.productPrice}>Rs {product.price}</span> */}
                                            {/* <span className={styles.productNote}>{product.description}</span> */}
                                            {/* <span className={styles.productNote}><span>Note:</span>{product.note}</span> */}
                                        </div>
                                        <div className={styles.priceRow}>
                                            <span className={styles.productPrice}>₹{product.price}</span>
                                            <span className={styles.originalPrice}>₹899</span>
                                            <span className={styles.discount}>12% OFF</span>
                                        </div>

                                        <div className={styles.reviewRow}>
                                            <span className={styles.rating}>4.9</span>
                                            <span className={styles.star}>★</span>
                                            <span className={styles.reviewCount}>(159 Reviews)</span>
                                        </div>
                                        <button type="button" className={styles.addToCard} 
                                        onClick={(e) => {
                                            e.stopPropagation(); // ✅ Prevent click from bubbling up
                                            handleAddToCart(product.id, 1); // or your custom function
                                        }}>
                                            {/* <img
                                            src={'icon/cart.png'}
                                            alt={'Add to cart'}
                                            className={styles.addToCardImgIcon}
                                        />  */}
                                            Add To Card</button>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No products available</p>
                        )}
                    </div>
                )}

                <button onClick={handleOrder} className={styles.orderButton}>Order Summary</button>
            </div>
            {selectedProduct && (
                <div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelectedProduct(null)} className={styles.closeBtn}>×</button>
                        <div className={styles.modalContentWithButton}>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.productTitleDetails}>{selectedProduct.productTitle}</h2>
                                <div className={styles.wishlisDetailstIcon} onClick={() => handleToggleWishlist(selectedProduct.id)}>
                                    {wishlist.includes(selectedProduct.id) ? <img
                                        src={'icon/redheart.png'}
                                        alt={'Add to cart'}
                                        className={styles.wishlistIconImg}
                                    /> : <img
                                        src={'icon/blackheart.png'}
                                        alt={'Add to cart'}
                                        className={styles.wishlistIconImg}
                                    />}
                                </div>
                            </div>

                            <img src={selectedProduct.productImage} className={styles.productImageDetails} alt={selectedProduct.productTitle} />
                            <div className={styles.priceRowDetails}>
                                <span className={styles.productPriceDetails}>₹{selectedProduct.price}</span>
                                <span className={styles.originalPriceDetails}>₹899</span>
                                <span className={styles.discountDetails}>12% OFF</span>
                            </div>

                            <div className={styles.reviewRowDetails}>
                                <span className={styles.ratingDetails}>4.9</span>
                                <span className={styles.starDetails}>★</span>
                                <span className={styles.reviewCountDetails}>(159 Reviews)</span>
                            </div>
                            <p><strong>Note:</strong> {selectedProduct.note}</p>
                            <p><strong>Description:</strong> {selectedProduct.description}</p>
                            <button type="button" className={styles.addToCardDetails}>  Add To Card</button>
                        </div>
                    </div>
                </div>
            )}
        </>

    );
}
