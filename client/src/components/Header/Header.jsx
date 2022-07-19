import "../../main.css"; // Tawilwind stylesheet
import { Link } from "react-router-dom";
import Navbar from "@components/Header/Navbar/Navbar";
import Profile from "@components/Header/Profile/Profile";
import eg_logo from "@assets/images/eg_logo.png";
/**
 * Component for Header of Existential Graphs.
 * 
 * @component
 */
export default function Header( props ) {
  return (
    <header className=" z-10 w-screen bg-slate-200 dark:bg-slate-500 flex flex-row justify-between items-center shadow-sm shadow-slate-500 dark:shadow-black font-sans font-medium text-black dark:text-white">
      <div className="flex flex-row w-full">
        <Link to="/">
          <img 
          src={eg_logo}
          alt="Existential Graphs Logo"
          className=" w-10 flex-item m-2 mr-20"
          />
        </Link>
        <Navbar />
      </div>

      <Profile />

    </header>
  );
}