import fs from 'fs';
import path from 'path';

const map = {
  'categories.js': 'Categorias.js',
  'clientes.js': 'Clientes.js',
  'empleados.js': 'Empleados.js',
  'inventory.js': 'Inventario.js',
  'products.js': 'Productos.js',
  'sales.js': 'Ventas.js',
  'users.js': 'Usuarios.js',
  'reviews.js': 'Resenas.js',

  'categoriesController.js': 'CategoriasController.js',
  'clientesController.js': 'ClientesController.js',
  'empleadosController.js': 'EmpleadosController.js',
  'inventoryController.js': 'InventarioController.js',
  'productsController.js': 'ProductosController.js',
  'salesController.js': 'VentasController.js',
  'usersController.js': 'UsuariosController.js',
  'reviewsController.js': 'ResenasController.js'
};

const dirs = ['models', 'controllers', 'routes'];
const basePath = process.cwd();

// 1. Rename files
for (const dir of dirs) {
  const dirPath = path.join(basePath, dir);
  if (!fs.existsSync(dirPath)) continue;
  
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (map[file]) {
      const oldPath = path.join(dirPath, file);
      const newPath = path.join(dirPath, map[file]);
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed: ${file} -> ${map[file]}`);
    }
  }
}

// 2. Update imports in all files in those directories + app.js
function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace import paths
  for (const [oldName, newName] of Object.entries(map)) {
    // Replace exact filename matches in imports
    const regex = new RegExp(`/${oldName}(["'])`, 'g');
    content = content.replace(regex, `/${newName}$1`);
    
    // Also replace without leading slash just in case
    const regex2 = new RegExp(`(?<=['"]\\./)${oldName}(?=['"])`, 'g');
    content = content.replace(regex2, newName);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in: ${filePath}`);
  }
}

for (const dir of dirs) {
  const dirPath = path.join(basePath, dir);
  if (!fs.existsSync(dirPath)) continue;
  
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    replaceInFile(path.join(dirPath, file));
  }
}

replaceInFile(path.join(basePath, 'app.js'));
console.log('Done!');
