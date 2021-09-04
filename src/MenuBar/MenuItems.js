import importIcon from './MenuIcons/import.png';
import exportIcon from './MenuIcons/export.png';
import logoIcon from './MenuIcons/logo.png';

const MenuItems = [
  {
    text: '',
    img: logoIcon,
    onClick: function(){
      return;
    },
    margin_left: '0vw',
  },
  {
    text: 'Bram Hub',
    img: '',
    onClick: function(){
      return;
    },
    margin_left: '1vw',
  },
  {
    text: 'Import',
    img: importIcon,
    onClick: importEG,
    margin_left: '7vw',
  },
  {
    text: 'Export',
    img: exportIcon,
    onClick: exportEG,
    margin_left: '3vw',
  },
]


  //Funtions for the above MenuItems
function exportEG() {
  console.log('Exporting...');
}

function importEG() {
  console.log('Importing...');
}

export default MenuItems;