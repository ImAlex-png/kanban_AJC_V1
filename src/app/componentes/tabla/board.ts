import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableroService } from '../../servicios/tablero-service';
import { Tablero } from '../../modelos/tablero';
import { Columna } from '../../modelos/columna';
import { Tarea } from '../../modelos/tarea';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board implements OnInit {
  public tablero: Tablero | undefined;
  public columnas: Columna[] = [];

  // Column form
  public showAddColModal = false;
  public colNombre = '';
  public colColor = '#6366f1';

  // Task form
  public showAddTaskModal = false;
  public taskNombre = '';
  public taskDesc = '';
  public taskEstimacion: number | null = null;
  public taskUsuarioId: number | null = null;
  public userList: import('../../modelos/usuario').Usuario[] = [];
  public selectedColId: number | null = null;

  constructor(
    private tableroService: TableroService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userList = this.tableroService.getUsuarios();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadBoard(Number(id));
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  loadBoard(id: number): void {
    this.tablero = this.tableroService.getTableroById(id);
    if (this.tablero) {
      this.refreshColumns(id);
    } else {
      this.router.navigate(['/']);
    }
  }

  refreshColumns(tableroId: number): void {
    this.columnas = this.tableroService.getColumnasByTableroId(tableroId);
  }

  getTareasColumna(columnaId: number): Tarea[] {
    return this.tableroService.getTareasColumna(columnaId);
  }

  crearColumna(): void {
    if (this.colNombre.trim().length >= 3 && this.tablero) {
      const result = this.tableroService.createColumna(this.tablero.id, this.colNombre, this.colColor);
      if (result) {
        this.refreshColumns(this.tablero.id);
        this.showAddColModal = false;
        this.colNombre = '';
      }
    } else {
      alert('El nombre de la columna debe tener al menos 3 caracteres.');
    }
  }

  eliminarColumna(id: number): void {
    if (confirm('¿Eliminar esta columna y todas sus tareas?')) {
      this.tableroService.deleteColumna(id);
      if (this.tablero) this.refreshColumns(this.tablero.id);
    }
  }

  abrirModalTarea(columnaId: number): void {
    this.selectedColId = columnaId;
    this.showAddTaskModal = true;
  }

  crearTarea(): void {
    if (this.taskNombre.trim().length >= 3 && this.selectedColId && this.taskEstimacion && this.taskUsuarioId) {
      const usuario = this.userList.find(u => u.id === Number(this.taskUsuarioId));
      if (usuario) {
        this.tableroService.createTarea(this.selectedColId, this.taskNombre, this.taskDesc, this.taskEstimacion, usuario);
        this.showAddTaskModal = false;
        this.taskNombre = '';
        this.taskDesc = '';
        this.taskEstimacion = null;
        this.taskUsuarioId = null;
        this.selectedColId = null;
      }
    } else {
      alert('Complete todos los campos de la tarea (Título min 3 car., Estimación, Usuario).');
    }
  }

  eliminarTarea(id: number): void {
    if (confirm('¿Eliminar esta tarea?')) {
      this.tableroService.deleteTarea(id);
    }
  }

  draggedTaskId: number | null = null;
  draggedFromColId: number | null = null;

  onDragStart(event: DragEvent, taskId: number, colId: number) {
    this.draggedTaskId = taskId;
    this.draggedFromColId = colId;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', taskId.toString());
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Necesario para permitir el drop
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, targetColId: number) {
    event.preventDefault();
    if (this.draggedTaskId !== null && this.draggedFromColId !== null && this.draggedFromColId !== targetColId) {
      this.tableroService.updateTareaColumna(this.draggedTaskId, targetColId);
      if (this.tablero) {
        this.refreshColumns(this.tablero.id);
      }
    }
    this.draggedTaskId = null;
    this.draggedFromColId = null;
  }
}
