import TopBar from '../Layout/TopBar';
import Navbar from "../Common/Navbar"

function Header() {
    return ( 
        <header className='border-b border-gray-200'>
            {/* TopBar */}
            <TopBar />
            {/* Navbar */}
            <Navbar />
            {/* Cart Drawer */}
        </header>
     );
}

export default Header;