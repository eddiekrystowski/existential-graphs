import "../../../main.css"; // Tawilwind stylesheet
import { NavLink, useNavigate } from 'react-router-dom' //  For navagation links
import { generateGraphID, addToLocalGraphData } from "@util";

/**
 * Component for site navagation.
 * 
 * @component
 */
export default function Navbar( props ) {
  const navigate = useNavigate();

  async function createGraphAndRedirect() {
    //if signed in
    // await axios.get(...)
    //else
    const id = generateGraphID();
    addToLocalGraphData(id, {});
    navigate(`/create/${id}`);
  }

  return (
    <nav className="w-full flex flex-row justify-around items-center">
      <button onClick={createGraphAndRedirect}
      className="inline-block text-black hover:text-slate-600 dark:text-white dark:hover:text-slate-400 text-3xl">
        Create
      </button>
      <NavLink to="/proof" 
      className="inline-block text-black hover:text-slate-600 dark:text-white dark:hover:text-slate-400 text-3xl">
        Proof
      </NavLink>
    </nav>
  );
}