import { SiLeetcode } from "react-icons/si";
import {Link} from "react-router-dom";
import {MdEmail} from "react-icons/md";
import {FaLinkedin, FaGithub} from "react-icons/fa";


function Footer() {
    return ( 
        <div className="border-t border-gray-300">
            <footer className="py-12 mx-3">
                <div className="conatiner mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 lg:px-0">
                    <div>
                        <h3 className="text-lg text-gray-800 mb-4" >Newsletter</h3>
                        <p className="text-gray-700 mb-4">
                            Be the first one to hear about new products, exclusive events and online offers.
                        </p>
                        <p className="font-medium text-sm text-gray-800 mb-3">
                            Sign Up and get 10% off on your first order!
                        </p>

                        {/* newsletter form */}
                        <form className="flex ">
                            <input type="email" placeholder="Enter your email" className="mt-3 p-3 w-full text-sm border border-gray-300 rounded focus:outline-none focus:ring:2 focus:ring-gray-500 transition-all" required></input>
                            <button type="submit" className="ms-2 bg-black text-white mt-3 px-6 py-3 text-sm rounded hover:bg-gray-800 transition-all">Subscribe</button>
                        </form>
                    </div>

                    {/* Shop Links */}

                    <div >
                        <h3 className="text-lg text-gray-800 mb-4">Shop</h3>
                        <ul className="space-y-2 text-gray-600">
                            <li>
                                <Link className="hover:text-black transition-colors" to="#">Men's Top Wear</Link>
                            </li>
                            <li>
                                <Link className="hover:text-black transition-colors" to="#">Women's Top Wear</Link>
                            </li>
                            <li>
                                <Link className="hover:text-black transition-colors" to="#">Men's Bottom Wear</Link>
                            </li>
                            <li>
                                <Link className="hover:text-black transition-colors" to="#">Women's Bottom Wear</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support Links */}

                    <div >
                        <h3 className="text-lg text-gray-800 mb-4">Support</h3>
                        <ul className="space-y-2 text-gray-600">
                            <li>
                                <Link className="hover:text-black transition-colors" to="#">Contact Us</Link>
                            </li>
                            <li>
                                <Link className="hover:text-black transition-colors" to="#">About Us</Link>
                            </li>
                            <li>
                                <Link className="hover:text-black transition-colors" to="#">FAQ's</Link>
                            </li>
                            <li>
                                <Link className="hover:text-black transition-colors" to="#">Features</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Follow Us */}

                    <div>
                        <h3 className="text-lg text-gray-800 mb-4">Follow Me</h3>
                        <div className="flex items-center space-x-4 mb-6">
                            <a href="https://www.linkedin.com/in/mohammad-wasiq-khan-a79862184/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black"><FaLinkedin className="h-6 w-6"/></a>
                            <a href="https://github.com/mdwasiqkhan1710" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black"><FaGithub className="h-6 w-6"/></a>
                            <a href="https://leetcode.com/u/mohdwasiqkhan123/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black"><SiLeetcode className="h-6 w-6"/></a>
                        </div>
                        <p className="text-gray-700 hover:text-black mb-2">Email me:</p>
                        <MdEmail className="inline-block mr-2"/>mohdwasiqkhan123@gamil.com
                    </div>

                </div>

                {/* Footer Bottom */}

                <div className=" text-center container mx-auto mt-12 px-4 lg:px-0 border-t border-gray-400 pt-6">
                    <p className="text-sm text-gray-600">&copy; 2025, Mohammad Wasiq Khan. All Rights Reserved!</p>
                </div>
            </footer>
        </div>
     );
}

export default Footer;