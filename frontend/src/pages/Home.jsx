import Hero from "../components/Layout/Hero";
import FeaturedCollection from "../components/Products/FeaturedCollection";
import GenderCollectionSection from "../components/Products/GenderCollectionSection";
import NewArrivals from "../components/Products/NewArrivals";
import ProductDetails from "../components/Products/ProductDetails";
import ProductsGrid from "../components/Products/ProductsGrid";
import Features from "../components/Products/Features";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useEffect } from "react";
import { fetchProductDetails, fetchProductsByFilters } from "../redux/slices/productSlice";
import axios from "axios";

// const placeholderProducts = [
//     {
//         _id:1,
//         name: "Demo Product 1",
//         price: 123,
//         images: [{url:"https://picsum.photos/500?random=1"}]
//     },
//         {
//         _id:2,
//         name: "Demo Product 2",
//         price: 299,
//         images: [{url:"https://picsum.photos/500?random=2"}]
//     },
//         {
//         _id:3,
//         name: "Demo Product 3",
//         price: 145,
//         images: [{url:"https://picsum.photos/500?random=3"}]
//     },
//         {
//         _id:4,
//         name: "Demo Product 4",
//         price: 749.99,
//         images: [{url:"https://picsum.photos/500?random=4"}]
//     },
//     {
//         _id:5,
//         name: "Demo Product 5",
//         price: 321.19,
//         images: [{url:"https://picsum.photos/500?random=5"}]
//     },
//         {
//         _id:6,
//         name: "Demo Product 6",
//         price: 129,
//         images: [{url:"https://picsum.photos/500?random=6"}]
//     },
//         {
//         _id:7,
//         name: "Demo Product 7",
//         price: 145,
//         images: [{url:"https://picsum.photos/500?random=7"}]
//     },
//         {
//         _id:8,
//         name: "Demo Product 8",
//         price: 749.99,
//         images: [{url:"https://picsum.photos/500?random=8"}]
//     },
// ];


function Home() {
    const dispatch = useDispatch();
    const {products, loading, error} = useSelector((state) => state.products);
    const [bestSellerProduct, setBestSellerProduct] = useState(null);

    useEffect(()=> {
        //Fetch products for specific collection
        dispatch(fetchProductsByFilters({
            gender:"Women",
            category:"Bottom Wear",
            limit: 8,
        })
        );
        //fetch best seller product
        const fetchBestSeller = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`);
                setBestSellerProduct(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchBestSeller();
    }, [dispatch]);

    return ( 
        <div>
        <Hero />
        <GenderCollectionSection />
        <NewArrivals/>
        {/* Best Seller Section */}
        <h2 className="text-3xl text-center mb-4 font-bold">Best Seller</h2>
        {bestSellerProduct ? (<ProductDetails productId={bestSellerProduct._id}/>): (
            <p className="text-center">Loading Best Seller Product....</p>
        )}

        <div className="conrainer mx-auto">
            <h2 className="text-3xl text-center mb-4 font-bold">Top Wears for Women</h2>
            <ProductsGrid products={products} loading={loading} error={error} />
        </div>

        <FeaturedCollection/>
        <Features />
        </div>
     );
}

export default Home;