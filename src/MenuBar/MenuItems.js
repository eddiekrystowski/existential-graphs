import importIcon from './MenuIcons/import.png';
import exportIcon from './MenuIcons/export.png';
import logoIcon from './MenuIcons/logo.png';

const MenuItems = [
  {
    text: '',
    img: logoIcon,
    onClick: function(){
      return;
    }
  },
  {
    text: 'Import',
    img: importIcon,
    onClick: importEG,
  },
  {
    text: 'Export',
    img: exportIcon,
    onClick: exportEG,
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