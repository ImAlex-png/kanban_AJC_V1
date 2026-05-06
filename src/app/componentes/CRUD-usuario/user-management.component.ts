import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableroService } from '../../servicios/tablero-service';
import { Usuario } from '../../modelos/usuario';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user-management.component.html',
    styleUrl: './user-management.component.css'
})
export class UserManagementComponent {
    usuarios: Usuario[] = [];

    // Form model
    nuevoId: number | null = null;
    nuevoNombre: string = '';
    nuevoApellido: string = '';
    nuevoEmail: string = '';

    constructor(private tableroService: TableroService) {
        this.refreshUsuarios();
    }

    refreshUsuarios() {
        this.usuarios = this.tableroService.getUsuarios();
    }

    crearUsuario(event: Event) {
        event.preventDefault(); // Prevent default form submission

        if (!this.nuevoId || !this.nuevoNombre || !this.nuevoApellido || !this.nuevoEmail) {
            alert('Por favor complete todos los campos.');
            return;
        }

        const result = this.tableroService.createUsuario(
            this.nuevoId,
            this.nuevoNombre,
            this.nuevoApellido,
            this.nuevoEmail
        );

        if (result) {
            this.refreshUsuarios();
            this.resetForm();
        }
    }

    eliminarUsuario(id: number) {
        if (confirm('¿Seguro que desea eliminar este usuario?')) {
            this.tableroService.deleteUsuario(id);
            this.refreshUsuarios();
        }
    }

    resetForm() {
        this.nuevoId = null;
        this.nuevoNombre = '';
        this.nuevoApellido = '';
        this.nuevoEmail = '';
    }
}
