import { Injectable } from '@angular/core';
import { Tablero } from '../modelos/tablero';
import { Columna } from '../modelos/columna';
import { Tarea } from '../modelos/tarea';
import { Usuario } from '../modelos/usuario';

export const COLORS = {
  trabajo: '#1a0a0a',
  pendientes: '#b30000',
  progreso: '#d4af37',
  completadas: '#1a1a1a'
};

@Injectable({
  providedIn: 'root',
})
export class TableroService {
  private _tableros: Tablero[] = [];
  private _columnas: Columna[] = [];
  private _tareas: Tarea[] = [];

  constructor() {
    this.loadFromStorage();
    if (this._tableros.length === 0) {
      this.initData();
      this.saveToStorage();
    }
  }

  generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  private initData(): void {
    // Initial Data with static IDs for consistency on first run
    const tablero1: Tablero = { id: 1, nombre: 'Trabajo', descripcion: 'Proyectos de la empresa', fondo: COLORS.trabajo };
    this._tableros = [tablero1];

    const col1: Columna = { id: 11, nombre: 'Pendientes', color: COLORS.pendientes, tablero: tablero1 };
    const col2: Columna = { id: 12, nombre: 'En Progreso', color: COLORS.progreso, tablero: tablero1 };
    const col3: Columna = { id: 13, nombre: 'Completadas', color: COLORS.completadas, tablero: tablero1 };

    this._columnas = [col1, col2, col3];

    const usuario1: Usuario = { id: 1, nombre: 'Alejandro', apellido: 'Jimenez', email: 'alejc2006@gmail.com' };

    this._tareas = [
      { id: 101, nombre: 'Diseñar Interfaz', descripcion: 'Diseñar la interfaz del proyecto', fecha_creacion: new Date(), estimacion: 5, columna: col1, usuario: usuario1 },
      { id: 102, nombre: 'Implementar Backend Endpoints', descripcion: 'Crear los Endpoints del backend', fecha_creacion: new Date(), estimacion: 3, columna: col2, usuario: usuario1 },
      { id: 103, nombre: 'Configurar Routers', descripcion: 'Configurar los Routers', fecha_creacion: new Date(), estimacion: 2, columna: col3, usuario: usuario1 },
    ];
  }

  private saveToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('kanban_tableros', JSON.stringify(this._tableros));
      localStorage.setItem('kanban_columnas', JSON.stringify(this._columnas));
      localStorage.setItem('kanban_tareas', JSON.stringify(this._tareas));
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const t = localStorage.getItem('kanban_tableros');
      const c = localStorage.getItem('kanban_columnas');
      const tar = localStorage.getItem('kanban_tareas');

      if (t) this._tableros = JSON.parse(t);
      if (c) this._columnas = JSON.parse(c);
      if (tar) this._tareas = JSON.parse(tar);

      // Sync default colors with code constants
      const mainBoard = this._tableros.find(b => b.id === 1);
      if (mainBoard) mainBoard.fondo = COLORS.trabajo;

      this._columnas.forEach(col => {
        if (col.id === 11) col.color = COLORS.pendientes;
        if (col.id === 12) col.color = COLORS.progreso;
        if (col.id === 13) col.color = COLORS.completadas;
      });
    }
  }

  // --- Public API ---

  getTableros(): Tablero[] {
    return this._tableros;
  }

  getTableroById(id: number): Tablero | undefined {
    return this._tableros.find(t => t.id === id);
  }

  createTablero(nombre: string, descripcion: string, color: string): Tablero {
    const nuevo: Tablero = {
      id: this.generateId(),
      nombre,
      descripcion,
      fondo: color
    };
    this._tableros.push(nuevo);

    // Default columns
    this.createColumna(nuevo.id, 'Por Hacer', COLORS.pendientes);
    this.createColumna(nuevo.id, 'En Proceso', COLORS.progreso);
    this.createColumna(nuevo.id, 'Realizado', COLORS.completadas);

    this.saveToStorage();
    return nuevo;
  }

  deleteTablero(id: number): void {
    this._tableros = this._tableros.filter(t => t.id !== id);
    this._columnas = this._columnas.filter(c => c.tablero.id !== id);
    this._tareas = this._tareas.filter(tar => this._columnas.some(c => c.id === tar.columna.id));
    this.saveToStorage();
  }

  getColumnasByTableroId(tableroId: number): Columna[] {
    return this._columnas.filter(c => c.tablero.id === tableroId);
  }

  getTareasColumna(columnaId: number): Tarea[] {
    return this._tareas.filter(tarea => tarea.columna.id === columnaId);
  }

  createColumna(tableroId: number, nombre: string, color: string): Columna | undefined {
    const tablero = this.getTableroById(tableroId);
    if (!tablero) return undefined;

    const currentCols = this.getColumnasByTableroId(tableroId);
    if (currentCols.length >= 5) {
      alert('El límite de columnas por tablero es 5.');
      return undefined;
    }

    const nueva: Columna = {
      id: this.generateId(),
      nombre,
      color,
      tablero
    };
    this._columnas.push(nueva);
    this.saveToStorage();
    return nueva;
  }

  deleteColumna(id: number): void {
    this._columnas = this._columnas.filter(c => c.id !== id);
    this._tareas = this._tareas.filter(t => t.columna.id !== id);
    this.saveToStorage();
  }

  createTarea(columnaId: number, nombre: string, descripcion: string, estimacion: number, usuario: Usuario): Tarea | undefined {
    const columna = this._columnas.find(c => c.id === columnaId);
    if (!columna) return undefined;

    const nueva: Tarea = {
      id: this.generateId(),
      nombre,
      descripcion,
      fecha_creacion: new Date(),
      estimacion,
      columna,
      usuario
    };
    this._tareas.push(nueva);
    this.saveToStorage();
    return nueva;
  }

  deleteTarea(id: number): void {
    this._tareas = this._tareas.filter(t => t.id !== id);
    this.saveToStorage();
  }

  updateTareaColumna(tareaId: number, newColId: number): void {
    const tarea = this._tareas.find(t => t.id === tareaId);
    if (tarea) {
      const newCol = this._columnas.find(c => c.id === newColId);
      if (newCol) {
        tarea.columna = newCol;
        this.saveToStorage();
      }
    }
  }

  // --- Usuario CRUD ---

  private _usuarios: Usuario[] = [
    { id: 1, nombre: 'Francisco', apellido: 'Vergara', email: 'fran@example.com' },
    { id: 2, nombre: 'Maria', apellido: 'Gonzalez', email: 'maria@example.com' },
    { id: 3, nombre: 'Juan', apellido: 'Perez', email: 'juan@example.com' }
  ];

  getUsuarios(): Usuario[] {
    return this._usuarios;
  }

  createUsuario(id: number, nombre: string, apellido: string, email: string): Usuario | undefined {
    if (this._usuarios.some(u => u.id === id || u.email === email)) {
      alert('El ID o Email del usuario ya existe.');
      return undefined;
    }
    const nuevo: Usuario = { id, nombre, apellido, email };
    this._usuarios.push(nuevo);
    // Persist if using storage for users too? For now adhering to task requirement.
    return nuevo;
  }

  deleteUsuario(id: number): void {
    this._usuarios = this._usuarios.filter(u => u.id !== id);
  }
}
